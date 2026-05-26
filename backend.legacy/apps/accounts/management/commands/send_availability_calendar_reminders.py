from calendar import month_name

from django.conf import settings
from django.core.management.base import BaseCommand
from django.utils import timezone

from apps.accounts.emails import send_calendar_update_reminder
from apps.crew.models import CrewProfile
from apps.talent.models import TalentProfile


class Command(BaseCommand):
    help = "Send monthly talent and crew reminders to update their availability calendars."

    def add_arguments(self, parser):
        parser.add_argument(
            "--dry-run",
            action="store_true",
            help="Show how many reminders would be sent without sending email.",
        )

    def handle(self, *args, **options):
        dry_run = options["dry_run"]
        frontend_url = getattr(settings, "FRONTEND_URL", "").rstrip("/")
        now = timezone.now()
        month_label = f"{month_name[now.month]} {now.year}"

        talent_profiles = (
            TalentProfile.objects.select_related("user")
            .filter(
                approval_status=TalentProfile.ApprovalStatus.APPROVED,
                user__is_active=True,
            )
            .exclude(user__email="")
            .order_by("user__email")
        )
        crew_profiles = (
            CrewProfile.objects.select_related("user")
            .filter(user__is_active=True)
            .exclude(user__email="")
            .order_by("user__email")
        )

        if dry_run:
            self.stdout.write(
                self.style.WARNING(
                    f"Dry run: would send {talent_profiles.count()} talent reminder(s) and {crew_profiles.count()} crew reminder(s) for {month_label}."
                )
            )
            return

        talent_sent = 0
        talent_failed = 0
        crew_sent = 0
        crew_failed = 0

        for profile in talent_profiles:
            if send_calendar_update_reminder(
                user=profile.user,
                portal="talent",
                calendar_url=f"{frontend_url}/talent/calendar",
                month_label=month_label,
            ):
                talent_sent += 1
            else:
                talent_failed += 1

        for profile in crew_profiles:
            if send_calendar_update_reminder(
                user=profile.user,
                portal="crew",
                calendar_url=f"{frontend_url}/crew/calendar",
                month_label=month_label,
            ):
                crew_sent += 1
            else:
                crew_failed += 1

        self.stdout.write(
            self.style.SUCCESS(
                "Monthly availability reminders finished: "
                f"talent sent={talent_sent}, talent failed={talent_failed}, "
                f"crew sent={crew_sent}, crew failed={crew_failed}."
            )
        )