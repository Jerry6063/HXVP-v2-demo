import stripe
from django.conf import settings
from django.core.management.base import BaseCommand, CommandError

from apps.talent.models import TalentProfile
from apps.crew.models import CrewProfile


class Command(BaseCommand):
    help = "Create Stripe Express accounts for all test talent/crew and print onboarding URLs"

    def add_arguments(self, parser):
        parser.add_argument(
            "--base-url",
            default="http://localhost:5173",
            help="Base URL for onboarding refresh/return redirects (default: http://localhost:5173)",
        )
        parser.add_argument(
            "--force",
            action="store_true",
            help="Re-generate onboarding links even if stripe_account_id already set",
        )

    def handle(self, *args, **options):
        secret_key = settings.STRIPE_SECRET_KEY
        if not secret_key:
            raise CommandError(
                "STRIPE_SECRET_KEY is not set. Export it or add it to your .env before running this command."
            )

        stripe.api_key = secret_key
        base_url = options["base_url"].rstrip("/")
        force = options["force"]

        talent_profiles = TalentProfile.objects.select_related("user").all()
        crew_profiles = CrewProfile.objects.select_related("user").all()

        created = 0
        linked = 0
        errors = 0

        self.stdout.write(self.style.MIGRATE_HEADING("\n=== Talent Profiles ==="))
        for profile in talent_profiles:
            result = self._process_profile(
                profile=profile,
                account_type="talent",
                base_url=base_url,
                force=force,
            )
            if result == "created":
                created += 1
                linked += 1
            elif result == "linked":
                linked += 1
            elif result == "error":
                errors += 1

        self.stdout.write(self.style.MIGRATE_HEADING("\n=== Crew Profiles ==="))
        for profile in crew_profiles:
            result = self._process_profile(
                profile=profile,
                account_type="crew",
                base_url=base_url,
                force=force,
            )
            if result == "created":
                created += 1
                linked += 1
            elif result == "linked":
                linked += 1
            elif result == "error":
                errors += 1

        self.stdout.write("")
        self.stdout.write(
            self.style.SUCCESS(
                f"Done. {created} new Stripe account(s) created, {linked} onboarding link(s) generated, {errors} error(s)."
            )
        )

    def _process_profile(self, profile, account_type, base_url, force):
        name = getattr(profile, "full_name", None) or str(profile.user)
        email = profile.user.email

        try:
            # Create Stripe account if needed
            if not profile.stripe_account_id:
                account = stripe.Account.create(
                    type="express",
                    country="US",
                    email=email,
                    capabilities={"transfers": {"requested": True}},
                )
                profile.stripe_account_id = account["id"]
                profile.stripe_onboarding_complete = False
                profile.save(update_fields=["stripe_account_id", "stripe_onboarding_complete"])
                was_created = True
            else:
                was_created = False

            if not force and profile.stripe_onboarding_complete:
                self.stdout.write(
                    f"  {self.style.SUCCESS('✓')} {name} ({email}) — already onboarded, skipping link"
                )
                return "linked"

            # Generate onboarding link
            account_link = stripe.AccountLink.create(
                account=profile.stripe_account_id,
                refresh_url=f"{base_url}/{account_type}/payments?tab=payout&refresh=1",
                return_url=f"{base_url}/{account_type}/payments?tab=payout&success=1",
                type="account_onboarding",
            )

            status = "NEW  " if was_created else "LINK "
            self.stdout.write(
                f"  [{self.style.WARNING(status)}] {name} ({email})\n"
                f"           Stripe ID : {profile.stripe_account_id}\n"
                f"           Onboard   : {account_link['url']}\n"
            )
            return "created" if was_created else "linked"

        except stripe.error.StripeError as exc:
            self.stderr.write(
                self.style.ERROR(f"  [ERROR] {name} ({email}): {exc.user_message or str(exc)}")
            )
            return "error"
