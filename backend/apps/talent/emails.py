import logging
from apps.utils.email import safe_send

logger = logging.getLogger(__name__)


def send_booking_notification(booking):
    talent = booking.talent.user
    shoot = booking.shoot
    safe_send(
        subject=f"New Booking: {shoot.project.name} – {shoot.shoot_date}",
        message=(
            f"Hi {talent.first_name},\n\n"
            f'You have been assigned to "{shoot.project.name}".\n\n'
            f"Date: {shoot.shoot_date}\n"
            f"Call Time: {shoot.call_time}\n"
            f"Location: {shoot.location}\n"
            f"Address: {shoot.address}\n"
            f"Attire: {booking.attire_requirements or 'See call sheet'}\n\n"
            f"Please log in to accept or decline.\n\n"
            f"– Studio Portal"
        ),
        recipient_list=[talent.email],
    )


def send_time_logged_notification(time_log):
    talent = time_log.talent.user
    safe_send(
        subject=f"Time Logged: {time_log.hours_worked}h – ${time_log.amount}",
        message=(
            f"Hi {talent.first_name},\n\n"
            f"Time has been logged for your work on {time_log.date}:\n\n"
            f"Project: {time_log.project.name}\n"
            f"Hours: {time_log.hours_worked}\n"
            f"Rate: ${time_log.rate_applied}/hr\n"
            f"Amount: ${time_log.amount}\n\n"
            f"– Studio Portal"
        ),
        recipient_list=[talent.email],
    )


def send_payment_confirmation(payment):
    talent = payment.talent.user
    import calendar
    month_name = calendar.month_name[payment.period_month]
    safe_send(
        subject=f"Payment Confirmed: {month_name} {payment.period_year} – ${payment.total_amount}",
        message=(
            f"Hi {talent.first_name},\n\n"
            f"Your payment for {month_name} {payment.period_year} has been processed.\n\n"
            f"Total Hours: {payment.total_hours}\n"
            f"Total Amount: ${payment.total_amount}\n"
            f"Reference: {payment.payment_reference}\n\n"
            f"– Studio Portal"
        ),
        recipient_list=[talent.email],
    )


def send_profile_approved_notification(profile):
    user = profile.user
    safe_send(
        subject="Your Talent Profile Has Been Approved",
        message=(
            f"Hi {user.first_name},\n\n"
            f"Your talent profile has been reviewed and approved. "
            f"Your profile is now visible to clients.\n\n"
            f"– Studio Portal"
        ),
        recipient_list=[user.email],
    )
