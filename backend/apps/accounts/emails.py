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
    return safe_send(
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
    return safe_send(
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
    return safe_send(
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


def send_portal_invitation_email(user, verify_url, portal):
    portal_name = PORTAL_NAMES.get(portal, "Studio Portal")
    role_label = "talent profile" if portal == "talent" else "crew profile"
    return safe_send(
        subject=f"Complete your {portal_name} registration",
        message=(
            f"Hi {user.first_name},\n\n"
            f"HXVP Studio production has created your {role_label} and invited you to join the {portal_name}.\n\n"
            f"Complete your registration by setting your password using the link below. This invite expires in 24 hours:\n\n"
            f"{verify_url}\n\n"
            f"After registration, you can sign in with {user.email}.\n\n"
            f"If you were not expecting this invitation, you can ignore this email.\n\n"
            f"— HXVP Studio"
        ),
        recipient_list=[user.email],
    )


def send_calendar_update_reminder(user, portal, calendar_url, month_label):
    portal_name = PORTAL_NAMES.get(portal, "Studio Portal")
    return safe_send(
        subject=f"Monthly Reminder: Update Your Availability Calendar for {month_label}",
        message=(
            f"Hi {user.first_name},\n\n"
            f"This is your monthly reminder from HXVP Studio to review and update your availability in the {portal_name}.\n\n"
            f"Keeping your calendar current helps production plan projects and reach out to you faster for new opportunities.\n\n"
            f"Update your availability here:\n"
            f"{calendar_url}\n\n"
            f"If your availability has not changed, no further action is needed.\n\n"
            f"— HXVP Studio"
        ),
        recipient_list=[user.email],
    )
