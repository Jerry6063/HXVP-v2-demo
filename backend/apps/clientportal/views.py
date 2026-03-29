from datetime import datetime
from django.db.models import Q
from rest_framework import viewsets, generics, permissions, parsers, status
from rest_framework.decorators import action
from rest_framework.response import Response

from apps.accounts.permissions import IsProductionAdmin, IsClient
from apps.projects.models import Project
from apps.deliverables.models import Deliverable
from .models import (
    ProjectRequest,
    RequestContract,
    ProjectMilestone,
    DeliverableReview,
    CommunicationMessage,
    TalentRosterShare,
)
from .serializers import (
    ProjectRequestListSerializer,
    ProjectRequestDetailSerializer,
    RequestContractSerializer,
    ProjectMilestoneSerializer,
    DeliverableReviewSerializer,
    CommunicationMessageSerializer,
    MessageThreadSerializer,
    TalentRosterShareSerializer,
)
from . import emails


class ProjectRequestViewSet(viewsets.ModelViewSet):
    permission_classes = [permissions.IsAuthenticated]
    parser_classes = [parsers.MultiPartParser, parsers.FormParser, parsers.JSONParser]

    def get_queryset(self):
        qs = ProjectRequest.objects.select_related("client", "project")
        if self.request.user.role == "client":
            qs = qs.filter(client=self.request.user)
        return qs

    def get_serializer_class(self):
        if self.action == "retrieve":
            return ProjectRequestDetailSerializer
        return ProjectRequestListSerializer

    def get_serializer_context(self):
        ctx = super().get_serializer_context()
        ctx["request"] = self.request
        return ctx

    def perform_create(self, serializer):
        user = self.request.user
        if user.role == "client":
            pr = serializer.save(client=user)
        else:
            # Production admins must supply a client in the payload;
            # the serializer already validates it's a client-role user.
            if 'client' not in serializer.validated_data:
                from rest_framework.exceptions import ValidationError
                raise ValidationError({"client": "A client must be specified."})
            pr = serializer.save()
        emails.send_project_submitted_email(pr)

    @action(detail=True, methods=["post"], parser_classes=[parsers.MultiPartParser, parsers.FormParser])
    def upload_contract(self, request, pk=None):
        """Admin uploads a contract PDF for this request."""
        proj_request = self.get_object()
        file = request.FILES.get("file")
        if not file:
            return Response({"detail": "No file provided"}, status=status.HTTP_400_BAD_REQUEST)
        contract = RequestContract.objects.create(
            request=proj_request, file=file, status=RequestContract.Status.SENT
        )
        proj_request.status = ProjectRequest.Status.CONTRACT_SENT
        proj_request.save()
        emails.send_contract_sent_email(contract)
        return Response(
            RequestContractSerializer(contract, context={"request": request}).data,
            status=status.HTTP_201_CREATED,
        )

    @action(detail=True, methods=["post"], url_path="contracts/(?P<contract_id>[^/.]+)/comment")
    def comment_contract(self, request, pk=None, contract_id=None):
        """Client comments on a contract for changes."""
        contract = RequestContract.objects.get(id=contract_id, request_id=pk)
        comment = request.data.get("comment", "")
        contract.client_comment = comment
        contract.status = RequestContract.Status.CLIENT_COMMENTED
        contract.save()
        proj_request = contract.request
        proj_request.status = ProjectRequest.Status.UNDER_REVIEW
        proj_request.save()
        return Response(RequestContractSerializer(contract, context={"request": request}).data)

    @action(
        detail=True,
        methods=["post"],
        url_path="contracts/(?P<contract_id>[^/.]+)/sign",
        parser_classes=[parsers.MultiPartParser, parsers.FormParser],
    )
    def sign_contract(self, request, pk=None, contract_id=None):
        """Client signs the contract with a signature image."""
        contract = RequestContract.objects.get(id=contract_id, request_id=pk)
        sig = request.FILES.get("signature")
        if not sig:
            return Response({"detail": "No signature provided"}, status=status.HTTP_400_BAD_REQUEST)
        contract.signature_image = sig
        contract.status = RequestContract.Status.SIGNED
        contract.agreed_at = datetime.now()
        contract.save()
        proj_request = contract.request
        proj_request.status = ProjectRequest.Status.CONTRACT_SIGNED
        proj_request.save()
        emails.send_contract_signed_email(contract)
        return Response(RequestContractSerializer(contract, context={"request": request}).data)

    @action(detail=True, methods=["post"], url_path="create-project")
    def create_project(self, request, pk=None):
        """Admin creates a real Project from a signed request."""
        proj_request = self.get_object()
        if proj_request.status not in (
            ProjectRequest.Status.CONTRACT_SIGNED,
            ProjectRequest.Status.IN_PRODUCTION,
        ):
            return Response(
                {"detail": "Contract must be signed first"},
                status=status.HTTP_400_BAD_REQUEST,
            )
        project = Project.objects.create(
            name=proj_request.title,
            client=proj_request.client,
            status=Project.Status.ACTIVE,
            budget=proj_request.budget,
            description=proj_request.description,
        )
        proj_request.project = project
        proj_request.status = ProjectRequest.Status.IN_PRODUCTION
        proj_request.save()
        # Create default milestones for production workflow.
        for i, (phase, title) in enumerate([
            ("pre_production", "1 - Pre-production phase"),
            ("pre_production", "Location"),
            ("pre_production", "Talent"),
            ("pre_production", "Crew"),
            ("pre_production", "Art / Props"),
            ("shooting", "2 - Production phase"),
            ("shooting", "Call sheet"),
            ("shooting", "Equipment / Props Checklist"),
            ("post_production", "3 - Post-production"),
            ("post_production", "Rough"),
            ("post_production", "Edit"),
            ("post_production", "Color"),
            ("post_production", "Revision"),
            ("post_production", "Deliver"),
        ]):
            ProjectMilestone.objects.create(
                project=project, phase=phase, title=title, order=i
            )
        return Response(
            ProjectRequestListSerializer(proj_request, context={"request": request}).data
        )


class ProjectMilestoneViewSet(viewsets.ModelViewSet):
    serializer_class = ProjectMilestoneSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        qs = ProjectMilestone.objects.select_related("project")
        project = self.request.query_params.get("project")
        if project:
            qs = qs.filter(project_id=project)
        if self.request.user.role == "client":
            qs = qs.filter(project__client=self.request.user)
        return qs

    def perform_update(self, serializer):
        instance = serializer.save()
        if instance.is_completed and not instance.completed_at:
            instance.completed_at = datetime.now()
            instance.save()
        elif not instance.is_completed and instance.completed_at:
            instance.completed_at = None
            instance.save()


class DeliverableReviewViewSet(viewsets.ModelViewSet):
    serializer_class = DeliverableReviewSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        qs = DeliverableReview.objects.select_related("deliverable", "author")
        deliverable = self.request.query_params.get("deliverable")
        if deliverable:
            qs = qs.filter(deliverable_id=deliverable)
        project = self.request.query_params.get("project")
        if project:
            qs = qs.filter(deliverable__project_id=project)
        return qs

    def perform_create(self, serializer):
        review = serializer.save(author=self.request.user)
        deliverable = review.deliverable
        if review.action == "approved":
            deliverable.status = Deliverable.Status.APPROVED
            deliverable.save()
        elif review.action == "revision_requested":
            deliverable.status = Deliverable.Status.IN_PROGRESS
            deliverable.save()


class CommunicationMessageViewSet(viewsets.ModelViewSet):
    serializer_class = CommunicationMessageSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        qs = CommunicationMessage.objects.select_related("sender", "project").filter(
            parent__isnull=True
        )
        if self.request.user.role == "client":
            qs = qs.filter(
                Q(sender=self.request.user)
                | Q(project__client=self.request.user)
                | Q(replies__sender=self.request.user)
            ).distinct()
        return qs

    def get_serializer_class(self):
        if self.action == "retrieve":
            return MessageThreadSerializer
        return CommunicationMessageSerializer

    def perform_create(self, serializer):
        msg = serializer.save(
            sender=self.request.user,
            is_from_client=(self.request.user.role == "client"),
        )
        emails.send_message_notification_email(msg)

    @action(detail=True, methods=["post"])
    def reply(self, request, pk=None):
        parent = self.get_object()
        body = request.data.get("body", "")
        if not body:
            return Response({"detail": "Body is required"}, status=status.HTTP_400_BAD_REQUEST)
        reply = CommunicationMessage.objects.create(
            sender=request.user,
            subject=f"Re: {parent.subject}",
            body=body,
            is_from_client=(request.user.role == "client"),
            parent=parent,
            project=parent.project,
        )
        emails.send_message_notification_email(reply)
        return Response(
            CommunicationMessageSerializer(reply, context={"request": request}).data,
            status=status.HTTP_201_CREATED,
        )


class TalentRosterShareViewSet(viewsets.ModelViewSet):
    """Production creates roster shares; client can list their own."""
    serializer_class = TalentRosterShareSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.role == "client":
            return TalentRosterShare.objects.filter(client=user)
        return TalentRosterShare.objects.all().select_related("client", "shared_by")

    def perform_create(self, serializer):
        share = serializer.save(shared_by=self.request.user)
        email_sent = emails.send_talent_roster_email(share)
        # Store on the instance so create() can access it
        share._email_sent = email_sent

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)
        data = serializer.data
        data["email_sent"] = bool(getattr(serializer.instance, "_email_sent", False))
        return Response(data, status=201)
