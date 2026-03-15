from rest_framework import serializers
from .models import Invoice, InvoiceItem, ProjectPayment


def _derived_invoice_status(obj):
    if obj.status in (Invoice.Status.DRAFT, Invoice.Status.CANCELLED, Invoice.Status.OVERDUE):
        return obj.status

    verified_exists = obj.payments.filter(status=ProjectPayment.Status.VERIFIED).exists()
    if verified_exists:
        return Invoice.Status.PAID

    pending_exists = obj.payments.filter(status=ProjectPayment.Status.PENDING).exists()
    if pending_exists:
        return ProjectPayment.Status.PENDING

    if obj.status == Invoice.Status.SENT:
        return "unpaid"

    return obj.status


class InvoiceItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = InvoiceItem
        fields = "__all__"
        read_only_fields = ["invoice", "amount"]


class InvoiceListSerializer(serializers.ModelSerializer):
    client_name = serializers.SerializerMethodField()
    project_name = serializers.CharField(source="project.name", read_only=True)
    status = serializers.SerializerMethodField()
    payment_status = serializers.SerializerMethodField()

    class Meta:
        model = Invoice
        fields = [
            "id", "reference_number", "project", "project_name",
            "client", "client_name", "status", "invoice_date",
            "due_date", "subtotal", "tax_rate", "tax_amount",
            "total", "payment_status", "payment_instructions",
            "sent_at", "created_at",
        ]

    def get_client_name(self, obj):
        return obj.client.get_full_name()

    def get_status(self, obj):
        return _derived_invoice_status(obj)

    def get_payment_status(self, obj):
        return _derived_invoice_status(obj)


class InvoiceDetailSerializer(serializers.ModelSerializer):
    client_name = serializers.SerializerMethodField()
    client_email = serializers.CharField(source="client.email", read_only=True)
    project_name = serializers.CharField(source="project.name", read_only=True)
    status = serializers.SerializerMethodField()
    payment_status = serializers.SerializerMethodField()
    items = InvoiceItemSerializer(many=True, read_only=True)
    payments = serializers.SerializerMethodField()

    class Meta:
        model = Invoice
        fields = "__all__"

    def get_client_name(self, obj):
        return obj.client.get_full_name()

    def get_status(self, obj):
        return _derived_invoice_status(obj)

    def get_payment_status(self, obj):
        return _derived_invoice_status(obj)

    def get_payments(self, obj):
        return ProjectPaymentSerializer(
            obj.payments.all(), many=True, context=self.context
        ).data


class ProjectPaymentSerializer(serializers.ModelSerializer):
    client_name = serializers.SerializerMethodField()
    invoice_ref = serializers.CharField(source="invoice.reference_number", read_only=True)
    project_name = serializers.SerializerMethodField()
    proof_url = serializers.SerializerMethodField()

    class Meta:
        model = ProjectPayment
        fields = "__all__"
        read_only_fields = ["client", "verified_at", "verified_by"]

    def get_client_name(self, obj):
        return obj.client.get_full_name()

    def get_project_name(self, obj):
        return obj.invoice.project.name if obj.invoice and obj.invoice.project else None

    def get_proof_url(self, obj):
        if obj.payment_proof:
            req = self.context.get("request")
            if req:
                return req.build_absolute_uri(obj.payment_proof.url)
            return obj.payment_proof.url
        return None
