import logging
from django.conf import settings
from django.core.mail import send_mail

logger = logging.getLogger(__name__)


def _safe_send(subject, message, recipient_list, **kwargs):
    try:
        send_mail(
            subject,
            message,
            settings.DEFAULT_FROM_EMAIL,
            recipient_list,
            fail_silently=True,
            **kwargs,
        )
    except Exception as e:
        logger.warning("Email send failed: %s", e)


TYPE_LABELS = {
    "talent": "Talent Agreement",
    "crew": "Crew Agreement",
    "client": "Client Agreement",
    "location_agreement": "Location Agreement",
    "budget_template": "Budget Template",
    "production_schedule": "Production Schedule",
    "nda": "NDA",
    "other": "Document",
}


def send_document_to_recipient(contract, request=None):
    """Email the contract recipient with portal access instructions."""
    recipient = contract.user
    type_label = TYPE_LABELS.get(contract.contract_type, "Document")
    project_name = contract.project.name
    title = contract.title or type_label

    role_portal_map = {
        "talent": "talent",
        "crew": "crew",
        "client": "client",
    }
    portal = role_portal_map.get(recipient.role, "portal")

    # Build file link if available
    file_line = ""
    if contract.file_url and request:
        abs_url = request.build_absolute_uri(contract.file_url.url)
        file_line = f"\nDocument link: {abs_url}\n"

    _safe_send(
        subject=f"Document Ready for Review: {title}",
        message=(
            f"Hi {recipient.first_name},\n\n"
            f"A {type_label} has been prepared for you in connection with the "
            f'production "{project_name}".\n'
            f"{file_line}\n"
            f"Please log in to your {portal} portal to review the document.\n\n"
            f"– Studio Portal"
        ),
        recipient_list=[recipient.email],
    )

    # Notify admins as well
    from apps.accounts.models import User
    admin_emails = list(
        User.objects.filter(role="production_admin", is_active=True)
        .values_list("email", flat=True)[:5]
    )
    if admin_emails:
        _safe_send(
            subject=f"Document Sent: {title} ({project_name})",
            message=(
                f"A {type_label} was sent to {recipient.get_full_name()} "
                f"({recipient.email}) for project \"{project_name}\"."
            ),
            recipient_list=admin_emails,
        )
