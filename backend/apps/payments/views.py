from django.utils import timezone
from rest_framework import viewsets, permissions, parsers, status
from rest_framework.decorators import action
from rest_framework.exceptions import ValidationError
from rest_framework.response import Response

from .models import Invoice, InvoiceItem, ProjectPayment
from .serializers import (
    InvoiceListSerializer,
    InvoiceDetailSerializer,
    InvoiceItemSerializer,
    ProjectPaymentSerializer,
)
from . import emails


class InvoiceViewSet(viewsets.ModelViewSet):
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        qs = Invoice.objects.select_related("project", "client").prefetch_related(
            "items", "payments"
        )
        user = self.request.user
        if user.role == "client":
            qs = qs.filter(client=user).exclude(status="draft")
        project = self.request.query_params.get("project")
        if project:
            qs = qs.filter(project_id=project)
        client_filter = self.request.query_params.get("client")
        if client_filter:
            qs = qs.filter(client_id=client_filter)
        status_filter = self.request.query_params.get("status")
        if status_filter:
            qs = qs.filter(status=status_filter)
        return qs

    def get_serializer_class(self):
        if self.action == "retrieve":
            return InvoiceDetailSerializer
        return InvoiceListSerializer

    def get_serializer_context(self):
        ctx = super().get_serializer_context()
        ctx["request"] = self.request
        return ctx

    def perform_create(self, serializer):
        serializer.save()

    @action(detail=True, methods=["post"])
    def add_item(self, request, pk=None):
        invoice = self.get_object()
        ser = InvoiceItemSerializer(data=request.data)
        ser.is_valid(raise_exception=True)
        item = InvoiceItem(
            invoice=invoice,
            description=ser.validated_data["description"],
            quantity=ser.validated_data.get("quantity", 1),
            rate=ser.validated_data["rate"],
            amount=0,
        )
        item.save()
        # Re-fetch BEFORE recalculate so the fresh prefetch cache includes the new item
        invoice = self.get_queryset().get(pk=invoice.pk)
        invoice.recalculate()
        return Response(
            InvoiceDetailSerializer(invoice, context={"request": request}).data
        )

    @action(detail=True, methods=["delete"], url_path="items/(?P<item_id>[^/.]+)")
    def remove_item(self, request, pk=None, item_id=None):
        invoice = self.get_object()
        try:
            item = invoice.items.get(id=item_id)
            item.delete()
        except InvoiceItem.DoesNotExist:
            pass
        # Re-fetch BEFORE recalculate so the fresh prefetch cache excludes the deleted item
        invoice = self.get_queryset().get(pk=invoice.pk)
        invoice.recalculate()
        return Response(
            InvoiceDetailSerializer(invoice, context={"request": request}).data
        )

    @action(detail=True, methods=["post"])
    def send_invoice(self, request, pk=None):
        invoice = self.get_object()
        invoice.status = Invoice.Status.SENT
        invoice.sent_at = timezone.now()
        invoice.save()
        emails.send_invoice_email(invoice)
        return Response(
            InvoiceDetailSerializer(invoice, context={"request": request}).data
        )

    @action(detail=True, methods=["post"])
    def mark_paid(self, request, pk=None):
        invoice = self.get_object()
        invoice.status = Invoice.Status.PAID
        invoice.save()
        return Response(
            InvoiceDetailSerializer(invoice, context={"request": request}).data
        )


class ProjectPaymentViewSet(viewsets.ModelViewSet):
    serializer_class = ProjectPaymentSerializer
    permission_classes = [permissions.IsAuthenticated]
    parser_classes = [parsers.MultiPartParser, parsers.FormParser, parsers.JSONParser]

    def get_queryset(self):
        qs = ProjectPayment.objects.select_related(
            "invoice__project", "client", "verified_by"
        )
        user = self.request.user
        if user.role == "client":
            qs = qs.filter(client=user)
        client_filter = self.request.query_params.get("client")
        if client_filter:
            qs = qs.filter(client_id=client_filter)
        invoice_filter = self.request.query_params.get("invoice")
        if invoice_filter:
            qs = qs.filter(invoice_id=invoice_filter)
        status_filter = self.request.query_params.get("status")
        if status_filter:
            qs = qs.filter(status=status_filter)
        date_from = self.request.query_params.get("date_from")
        if date_from:
            qs = qs.filter(payment_date__gte=date_from)
        date_to = self.request.query_params.get("date_to")
        if date_to:
            qs = qs.filter(payment_date__lte=date_to)
        return qs

    def get_serializer_context(self):
        ctx = super().get_serializer_context()
        ctx["request"] = self.request
        return ctx

    def perform_create(self, serializer):
        invoice = serializer.validated_data.get("invoice")
        user = self.request.user
        if invoice is None:
            raise ValidationError({"invoice": "This field is required."})

        if user.role == "client":
            if invoice.client_id != user.id:
                raise ValidationError({"invoice": "You can only submit payments for your own invoices."})
            payment_client = user
        else:
            payment_client = invoice.client

        payment = serializer.save(
            client=payment_client,
            status=ProjectPayment.Status.PENDING,
        )
        emails.send_payment_submitted_email(payment)

    @action(detail=True, methods=["post"])
    def verify(self, request, pk=None):
        payment = self.get_object()
        payment.status = ProjectPayment.Status.VERIFIED
        payment.verified_at = timezone.now()
        payment.verified_by = request.user
        payment.admin_notes = request.data.get("admin_notes", "")
        payment.save()
        # Mark the invoice as paid
        invoice = payment.invoice
        invoice.status = Invoice.Status.PAID
        invoice.save()
        emails.send_payment_verified_email(payment)
        return Response(ProjectPaymentSerializer(payment, context={"request": request}).data)

    @action(detail=True, methods=["post"])
    def reject(self, request, pk=None):
        payment = self.get_object()
        payment.status = ProjectPayment.Status.REJECTED
        payment.admin_notes = request.data.get("admin_notes", "")
        payment.save()
        return Response(ProjectPaymentSerializer(payment, context={"request": request}).data)
