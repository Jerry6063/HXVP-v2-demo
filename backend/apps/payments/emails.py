import logging
from django.conf import settings
from django.core.mail import send_mail

logger = logging.getLogger(__name__)


def _safe_send(subject, message, recipient_list, **kwargs):
    try:
        send_mail(
            subject, message, settings.DEFAULT_FROM_EMAIL,
            recipient_list, fail_silently=False, **kwargs,
        )
        return True
    except Exception as e:
        logger.warning("Email send failed to %s: %s", recipient_list, e)
        return False


def get_admin_emails():
    from apps.accounts.models import User
    admin_email = getattr(settings, "ADMIN_NOTIFICATION_EMAIL", "")
    if admin_email:
        return [admin_email]
    return list(
        User.objects.filter(role="production_admin", is_active=True)
        .values_list("email", flat=True)[:5]
    )


def send_invoice_email(invoice):
    client = invoice.client
    items_text = ""
    for item in invoice.items.all():
        items_text += f"  - {item.description}: {item.quantity} x ${item.rate} = ${item.amount}\n"

    return _safe_send(
        subject=f"Invoice {invoice.reference_number} – {invoice.project.name}",
        message=(
            f"Hi {client.first_name},\n\n"
            f"An invoice has been generated for your project \"{invoice.project.name}\".\n\n"
            f"Invoice: {invoice.reference_number}\n"
            f"Date: {invoice.invoice_date}\n"
            f"Due Date: {invoice.due_date}\n\n"
            f"Items:\n{items_text}\n"
            f"Subtotal: ${invoice.subtotal}\n"
            f"Tax ({invoice.tax_rate}%): ${invoice.tax_amount}\n"
            f"Total Due: ${invoice.total}\n\n"
            f"Payment Instructions:\n{invoice.payment_instructions}\n\n"
            f"Please log in to the Client Portal to view details and submit payment.\n\n"
            f"– HXVP Marketing Group"
        ),
        recipient_list=[client.email],
    )


def send_payment_submitted_email(payment):
    _safe_send(
        subject=f"Payment Submitted: {payment.invoice.reference_number}",
        message=(
            f"Client {payment.client.get_full_name()} has submitted payment proof "
            f"for invoice {payment.invoice.reference_number}.\n\n"
            f"Amount: ${payment.amount}\n"
            f"Method: {payment.payment_method}\n"
            f"Date: {payment.payment_date}\n"
            f"Reference: {payment.reference_note}\n\n"
            f"Please log in to verify the payment."
        ),
        recipient_list=get_admin_emails(),
    )


def send_payment_verified_email(payment):
    client = payment.client
    _safe_send(
        subject=f"Payment Confirmed: {payment.invoice.reference_number}",
        message=(
            f"Hi {client.first_name},\n\n"
            f"Your payment for invoice {payment.invoice.reference_number} "
            f"(project: \"{payment.invoice.project.name}\") has been confirmed.\n\n"
            f"Amount: ${payment.amount}\n\n"
            f"You now have full access to the project deliverables. "
            f"Log in to the Client Portal to view and download them.\n\n"
            f"Thank you for your business!\n\n"
            f"– HXVP Marketing Group"
        ),
        recipient_list=[client.email],
    )
