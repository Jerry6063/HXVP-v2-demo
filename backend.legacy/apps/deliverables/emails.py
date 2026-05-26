import logging
from django.conf import settings as django_settings
from apps.utils.email import safe_send

logger = logging.getLogger(__name__)


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
    project_name = contract.project.name if contract.project_id else "Pre-production"
    title = contract.title or type_label

    role_portal_map = {
        "talent": "talent",
        "crew": "crew",
        "client": "client",
    }
    portal = role_portal_map.get(recipient.role, "portal")

    # Build direct portal link (talent/crew roles have a /documents page)
    frontend_url = getattr(django_settings, "FRONTEND_URL", "").rstrip("/")
    if portal in ("talent", "crew"):
        docs_url = f"{frontend_url}/{portal}/documents"
        portal_line = (
            f"Please log in to your {portal} portal to review and sign the document:\n"
            f"{docs_url}"
        )
    else:
        portal_line = f"Please log in to your {portal} portal to review the document."

    # Build file link if available
    file_line = ""
    if contract.file_url and request:
        abs_url = request.build_absolute_uri(contract.file_url.url)
        file_line = f"\nDocument file: {abs_url}\n"

    result = safe_send(
        subject=f"Document Ready for Review: {title}",
        message=(
            f"Hi {recipient.first_name},\n\n"
            f"A {type_label} has been prepared for you in connection with the "
            f'production "{project_name}".\n'
            f"{file_line}\n"
            f"{portal_line}\n\n"
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
        safe_send(
            subject=f"Document Sent: {title} ({project_name})",
            message=(
                f"A {type_label} was sent to {recipient.get_full_name()} "
                f"({recipient.email}) for project \"{project_name}\"."
            ),
            recipient_list=admin_emails,
        )

    return result
