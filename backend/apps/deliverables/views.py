from rest_framework import viewsets, permissions, parsers
from rest_framework.decorators import action
from rest_framework.response import Response

from .models import Deliverable, Contract
from .serializers import DeliverableSerializer, ContractSerializer


def _client_has_paid_for_project(client, project_id):
    """Return True if there is at least one verified payment for this project."""
    from apps.payments.models import ProjectPayment, Invoice
    return ProjectPayment.objects.filter(
        client=client,
        status=ProjectPayment.Status.VERIFIED,
        invoice__project_id=project_id,
    ).exists()


class DeliverableViewSet(viewsets.ModelViewSet):
    serializer_class = DeliverableSerializer
    permission_classes = [permissions.IsAuthenticated]
    parser_classes = [parsers.MultiPartParser, parsers.FormParser, parsers.JSONParser]

    def get_queryset(self):
        qs = Deliverable.objects.select_related("project")
        user = self.request.user
        if user.role == "client":
            qs = qs.filter(project__client=user)
            paid_project_ids = list(
                qs.values_list("project_id", flat=True).distinct()
            )
            accessible_ids = [
                pid for pid in paid_project_ids
                if _client_has_paid_for_project(user, pid)
            ]
            qs = qs.filter(project_id__in=accessible_ids)
        project = self.request.query_params.get("project")
        if project:
            qs = qs.filter(project_id=project)
        status_filter = self.request.query_params.get("status")
        if status_filter:
            qs = qs.filter(status=status_filter)
        return qs

    def get_serializer_context(self):
        ctx = super().get_serializer_context()
        ctx["request"] = self.request
        return ctx

    @action(detail=True, methods=["post"])
    def approve(self, request, pk=None):
        deliverable = self.get_object()
        deliverable.status = Deliverable.Status.APPROVED
        deliverable.save()
        return Response(DeliverableSerializer(deliverable, context={"request": request}).data)

    @action(
        detail=True,
        methods=["post"],
        parser_classes=[parsers.MultiPartParser, parsers.FormParser],
    )
    def upload(self, request, pk=None):
        deliverable = self.get_object()
        file = request.FILES.get("file")
        if not file:
            return Response({"detail": "No file provided"}, status=400)

        deliverable.file = file
        deliverable.status = Deliverable.Status.REVIEW
        deliverable.save()
        return Response(DeliverableSerializer(deliverable, context={"request": request}).data)


class ContractViewSet(viewsets.ModelViewSet):
    serializer_class = ContractSerializer
    permission_classes = [permissions.IsAuthenticated]
    parser_classes = [parsers.MultiPartParser, parsers.FormParser, parsers.JSONParser]

    def get_queryset(self):
        qs = Contract.objects.select_related("project", "user")
        user = self.request.user
        if user.role in ("talent", "crew", "client"):
            qs = qs.filter(user=user)
        project = self.request.query_params.get("project")
        if project:
            qs = qs.filter(project_id=project)
        contract_type = self.request.query_params.get("contract_type")
        if contract_type:
            qs = qs.filter(contract_type=contract_type)
        return qs

    def get_serializer_context(self):
        ctx = super().get_serializer_context()
        ctx["request"] = self.request
        return ctx

    @action(detail=True, methods=["post"])
    def send(self, request, pk=None):
        """Mark contract as sent, email the recipient, and notify admin."""
        from datetime import datetime
        from . import emails as doc_emails

        contract = self.get_object()
        contract.status = Contract.Status.SENT
        contract.sent_at = datetime.now()
        contract.save()
        doc_emails.send_document_to_recipient(contract, request)
        return Response(
            ContractSerializer(contract, context={"request": request}).data
        )
