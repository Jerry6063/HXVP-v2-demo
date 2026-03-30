import logging
from django.conf import settings
from django.core.mail import send_mail

logger = logging.getLogger(__name__)


def send_email(subject, message, recipient_list, from_email=None):
    """
    Send an email via Django's SMTP backend.

    Returns dict: {"success": bool, "id": str|None, "error": str|None}
    """
    sender = from_email or settings.DEFAULT_FROM_EMAIL

    try:
        send_mail(
            subject=subject,
            message=message,
            from_email=sender,
            recipient_list=recipient_list if isinstance(recipient_list, list) else [recipient_list],
            fail_silently=False,
        )
        logger.info("Email sent to %s: %s", recipient_list, subject)
        return {"success": True, "id": None, "error": None}
    except Exception as exc:
        logger.error("Email send failed to %s: %s", recipient_list, exc)
        return {"success": False, "id": None, "error": str(exc)}


def safe_send(subject, message, recipient_list, **kwargs):
    """
    Drop-in boolean wrapper around send_email().
    Returns True on success, False on failure. Never raises.
    """
    result = send_email(subject, message, recipient_list, **kwargs)
    return result["success"]
