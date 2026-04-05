import logging
from apps.utils.email import safe_send

logger = logging.getLogger(__name__)

PORTAL_NAMES = {
    "production_admin": "Production Portal",
    "production": "Production Portal",
    "client": "Client Portal",
    "talent": "Talent Portal",
    "crew": "Crew Portal",
}


def send_welcome_email(user):
    portal_name = PORTAL_NAMES.get(user.role, "Studio Portal")
    safe_send(
        subject=f"Welcome to HXVP — {portal_name}",
        message=(
            f"Hi {user.first_name},\n\n"
            f"Your {portal_name} account has been created successfully.\n\n"
            f"You can log in at any time from the HXVP Studio portal.\n\n"
            f"If you did not create this account, please contact us immediately.\n\n"
            f"— HXVP Studio"
        ),
        recipient_list=[user.email],
    )


def send_password_reset_email(user, reset_url, portal):
    portal_name = PORTAL_NAMES.get(portal, "Studio Portal")
    safe_send(
        subject="Reset your HXVP password",
        message=(
            f"Hi {user.first_name},\n\n"
            f"We received a request to reset the password for your {portal_name} account.\n\n"
            f"Click the link below to set a new password. This link expires in 1 hour:\n\n"
            f"{reset_url}\n\n"
            f"If you did not request a password reset, you can safely ignore this email.\n\n"
            f"— HXVP Studio"
        ),
        recipient_list=[user.email],
    )


def send_email_verification(user, verify_url):
    safe_send(
        subject="Verify your email – HXVP Studio",
        message=(
            f"Hi {user.first_name},\n\n"
            f"Thanks for signing up! Please verify your email address by clicking the link below.\n\n"
            f"This link expires in 24 hours:\n\n"
            f"{verify_url}\n\n"
            f"If you did not create an account, you can safely ignore this email.\n\n"
            f"— HXVP Studio"
        ),
        recipient_list=[user.email],
    )
