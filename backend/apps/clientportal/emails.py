import logging
from django.conf import settings
from django.core.mail import send_mail

logger = logging.getLogger(__name__)

ADMIN_EMAIL = getattr(settings, "ADMIN_NOTIFICATION_EMAIL", None)


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


def get_admin_emails():
    from apps.accounts.models import User

    if ADMIN_EMAIL:
        return [ADMIN_EMAIL]
    admins = User.objects.filter(role="production_admin", is_active=True)
    return list(admins.values_list("email", flat=True)[:5])


def send_project_submitted_email(project_request):
    _safe_send(
        subject=f"New Project Request: {project_request.title}",
        message=(
            f"Client {project_request.client.get_full_name()} submitted a new "
            f"{project_request.get_project_type_display()} project request.\n\n"
            f"Title: {project_request.title}\n"
            f"Budget: ${project_request.budget}\n"
            f"Description: {project_request.description}\n"
            f"Model Requests: {project_request.model_requests}"
        ),
        recipient_list=get_admin_emails(),
    )


def send_contract_sent_email(contract):
    client = contract.request.client
    _safe_send(
        subject=f"Contract Ready for Review: {contract.request.title}",
        message=(
            f"Hi {client.first_name},\n\n"
            f"A contract has been prepared for your project request "
            f'"{contract.request.title}". Please log in to review and sign.\n\n'
            f"– Studio Portal"
        ),
        recipient_list=[client.email],
    )


def send_contract_signed_email(contract):
    _safe_send(
        subject=f"Contract Signed: {contract.request.title}",
        message=(
            f"Client {contract.request.client.get_full_name()} has signed the "
            f'contract for "{contract.request.title}".\n\n'
            f"You can now create the project from this request."
        ),
        recipient_list=get_admin_emails(),
    )


def send_deliverable_uploaded_email(deliverable):
    client = deliverable.project.client
    if not client:
        return
    _safe_send(
        subject=f"New Deliverable: {deliverable.name}",
        message=(
            f"Hi {client.first_name},\n\n"
            f'A new deliverable "{deliverable.name}" has been uploaded for '
            f'project "{deliverable.project.name}". Please log in to review.\n\n'
            f"– Studio Portal"
        ),
        recipient_list=[client.email],
    )


def send_message_notification_email(message):
    if message.is_from_client:
        recipients = get_admin_emails()
    else:
        project = message.project
        if project and project.client:
            recipients = [project.client.email]
        elif message.parent and message.parent.sender:
            recipients = [message.parent.sender.email]
        else:
            return

    _safe_send(
        subject=f"New Message: {message.subject}",
        message=(
            f"From: {message.sender.get_full_name()}\n"
            f"Subject: {message.subject}\n\n"
            f"{message.body}\n\n"
            f"Log in to Studio Portal to reply."
        ),
        recipient_list=recipients,
    )


def send_talent_roster_email(share):
    """Notify a client that production has shared a talent selection with them."""
    from apps.talent.models import TalentProfile
    client = share.client
    profiles = TalentProfile.objects.filter(id__in=share.talent_ids).select_related("user")
    talent_lines = "\n".join(
        f"  - {p.user.get_full_name()} ({p.talent_type.capitalize()})"
        for p in profiles
    )

    body = (
        f"Hi {client.first_name},\n\n"
        f"Our production team has put together a talent selection for you:\n\n"
        f"{talent_lines}\n\n"
    )
    if share.message:
        body += f"Message from our team:\n{share.message}\n\n"
    body += "Please log in to the Client Portal to view their full profiles.\n\n\u2013 Studio Team"

    _safe_send(
        subject="Talent Selection Ready for Your Review",
        message=body,
        recipient_list=[client.email],
    )