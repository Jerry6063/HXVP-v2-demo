"""
Management command: ensure_admin

Creates (or updates) the production admin account from environment variables.
Safe to run on every deploy — uses get_or_create so it is idempotent.

Required env vars:
  ADMIN_EMAIL     — login email for the production portal admin
  ADMIN_PASSWORD  — password (set this only in Render env, never commit it)

Optional env vars:
  ADMIN_FIRST_NAME  (default: "Admin")
  ADMIN_LAST_NAME   (default: "")
"""
import os
from django.core.management.base import BaseCommand, CommandError
from apps.accounts.models import User


class Command(BaseCommand):
    help = "Ensure the production admin account exists with the configured credentials."

    def handle(self, *args, **options):
        email = os.environ.get("ADMIN_EMAIL", "").strip()
        password = os.environ.get("ADMIN_PASSWORD", "").strip()

        if not email or not password:
            raise CommandError(
                "ADMIN_EMAIL and ADMIN_PASSWORD environment variables must both be set."
            )

        first_name = os.environ.get("ADMIN_FIRST_NAME", "Admin").strip()
        last_name = os.environ.get("ADMIN_LAST_NAME", "").strip()

        user, created = User.objects.get_or_create(
            email=email,
            defaults={
                "first_name": first_name,
                "last_name": last_name,
                "role": User.Role.PRODUCTION_ADMIN,
                "is_active": True,
            },
        )

        if created:
            user.first_name = first_name
            user.last_name = last_name
            user.role = User.Role.PRODUCTION_ADMIN
            user.is_active = True

        # Always sync the password so rotating ADMIN_PASSWORD takes effect on next deploy.
        user.set_password(password)
        user.save()

        action = "Created" if created else "Updated"
        self.stdout.write(self.style.SUCCESS(f"{action} admin account: {email}"))
