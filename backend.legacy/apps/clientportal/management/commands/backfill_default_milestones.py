from django.core.management.base import BaseCommand
from django.db import transaction

from apps.clientportal.models import ProjectMilestone
from apps.projects.models import Project


DEFAULT_MILESTONES = [
    ("pre_production", "1 - Pre-production phase"),
    ("pre_production", "Location"),
    ("pre_production", "Talent"),
    ("pre_production", "Crew"),
    ("pre_production", "Art / Props"),
    ("shooting", "2 - Production phase"),
    ("shooting", "Call sheet"),
    ("shooting", "Equipment / Props Checklist"),
    ("post_production", "3 - Post-production"),
    ("post_production", "Rough"),
    ("post_production", "Edit"),
    ("post_production", "Color"),
    ("post_production", "Revision"),
    ("post_production", "Deliver"),
]


class Command(BaseCommand):
    help = (
        "Backfill default Project Milestones for active projects that currently "
        "have no milestones."
    )

    def add_arguments(self, parser):
        parser.add_argument(
            "--dry-run",
            action="store_true",
            help="Show how many projects would be updated without writing data.",
        )

    def handle(self, *args, **options):
        dry_run = options["dry_run"]

        target_projects = (
            Project.objects.filter(status=Project.Status.ACTIVE)
            .filter(milestones__isnull=True)
            .distinct()
            .order_by("id")
        )

        project_count = target_projects.count()

        if project_count == 0:
            self.stdout.write(self.style.SUCCESS("No active projects needed backfill."))
            return

        if dry_run:
            self.stdout.write(
                self.style.WARNING(
                    f"Dry run: {project_count} active project(s) would be backfilled."
                )
            )
            return

        created_rows = 0

        with transaction.atomic():
            for project in target_projects:
                for order, (phase, title) in enumerate(DEFAULT_MILESTONES):
                    ProjectMilestone.objects.create(
                        project=project,
                        phase=phase,
                        title=title,
                        order=order,
                    )
                    created_rows += 1

        self.stdout.write(
            self.style.SUCCESS(
                f"Backfill completed: {project_count} project(s), {created_rows} milestone(s) created."
            )
        )
