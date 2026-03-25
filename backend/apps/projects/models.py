from django.db import models
from django.conf import settings


class Project(models.Model):
    class Status(models.TextChoices):
        ACTIVE = "active", "Active"
        COMPLETED = "completed", "Completed"
        ARCHIVED = "archived", "Archived"
        ON_HOLD = "on_hold", "On Hold"

    name = models.CharField(max_length=255)
    client = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        related_name="client_projects",
        limit_choices_to={"role": "client"},
    )
    status = models.CharField(
        max_length=20, choices=Status.choices, default=Status.ACTIVE
    )
    budget = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    start_date = models.DateField(null=True, blank=True)
    deadline = models.DateField(null=True, blank=True)
    description = models.TextField(blank=True)
    location = models.CharField(
        max_length=255, blank=True,
        help_text="Primary location / venue for this production"
    )
    model_requirements = models.TextField(
        blank=True,
        help_text="Talent / model count, look, measurements, experience, etc."
    )
    crew_requirements = models.TextField(
        blank=True,
        help_text="Required crew roles, skills and headcount"
    )
    other_requirements = models.TextField(
        blank=True,
        help_text="Any other specific production requirements"
    )
    raw_material_url = models.URLField(
        max_length=500, blank=True, help_text="Google Drive link for raw materials"
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return self.name


class Shoot(models.Model):
    class Status(models.TextChoices):
        SCHEDULED = "scheduled", "Scheduled"
        IN_PROGRESS = "in_progress", "In Progress"
        COMPLETED = "completed", "Completed"
        CANCELLED = "cancelled", "Cancelled"

    project = models.ForeignKey(Project, on_delete=models.CASCADE, related_name="shoots")
    shoot_date = models.DateField()
    call_time = models.TimeField()
    est_wrap_time = models.TimeField(null=True, blank=True)
    location = models.CharField(max_length=255)
    address = models.TextField(blank=True)
    description = models.TextField(blank=True)
    wardrobe_instructions = models.TextField(blank=True)
    hair_makeup_notes = models.TextField(blank=True)
    comments = models.TextField(blank=True)
    status = models.CharField(
        max_length=20, choices=Status.choices, default=Status.SCHEDULED
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["shoot_date", "call_time"]

    def __str__(self):
        return f"{self.project.name} – {self.shoot_date}"


class ActivityLog(models.Model):
    project = models.ForeignKey(
        Project, on_delete=models.CASCADE, related_name="activity_logs"
    )
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True
    )
    action = models.CharField(max_length=255)
    details = models.TextField(blank=True)
    timestamp = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-timestamp"]

    def __str__(self):
        return f"{self.project.name}: {self.action}"


# ── Document Generator Models ──


class CallSheet(models.Model):
    project = models.ForeignKey(
        Project, on_delete=models.CASCADE, related_name="call_sheets"
    )
    shoot = models.ForeignKey(
        Shoot, on_delete=models.CASCADE, related_name="call_sheets",
        null=True, blank=True,
    )
    title = models.CharField(max_length=255)
    shoot_date = models.DateField()
    call_time = models.TimeField()
    est_wrap_time = models.TimeField(null=True, blank=True)
    location = models.CharField(max_length=255)
    address = models.TextField(blank=True)
    parking_info = models.TextField(blank=True)
    weather_notes = models.CharField(max_length=255, blank=True)
    wardrobe_instructions = models.TextField(blank=True)
    hair_makeup_notes = models.TextField(blank=True)
    production_notes = models.TextField(blank=True)
    emergency_contact = models.CharField(max_length=255, blank=True)
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True,
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-shoot_date"]

    def __str__(self):
        return f"Call Sheet: {self.title} – {self.shoot_date}"


class CallSheetEntry(models.Model):
    """Individual person entry on a call sheet (talent or crew)."""

    class PersonType(models.TextChoices):
        TALENT = "talent", "Talent"
        CREW = "crew", "Crew"

    call_sheet = models.ForeignKey(
        CallSheet, on_delete=models.CASCADE, related_name="entries"
    )
    person_type = models.CharField(max_length=10, choices=PersonType.choices)
    name = models.CharField(max_length=255)
    role = models.CharField(max_length=100)
    call_time = models.TimeField(null=True, blank=True)
    notes = models.CharField(max_length=500, blank=True)
    order = models.PositiveIntegerField(default=0)

    class Meta:
        ordering = ["person_type", "order"]

    def __str__(self):
        return f"{self.name} ({self.role})"


class Checklist(models.Model):
    class Category(models.TextChoices):
        PRE_PRODUCTION = "pre_production", "Pre-Production"
        PRODUCTION = "production", "Production Day"
        POST_PRODUCTION = "post_production", "Post-Production"
        EQUIPMENT = "equipment", "Equipment"
        GENERAL = "general", "General"

    project = models.ForeignKey(
        Project, on_delete=models.CASCADE, related_name="checklists"
    )
    title = models.CharField(max_length=255)
    category = models.CharField(
        max_length=20, choices=Category.choices, default=Category.GENERAL
    )
    description = models.TextField(blank=True)
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True,
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return f"Checklist: {self.title}"


class ChecklistItem(models.Model):
    checklist = models.ForeignKey(
        Checklist, on_delete=models.CASCADE, related_name="items"
    )
    text = models.CharField(max_length=500)
    is_completed = models.BooleanField(default=False)
    completed_by = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.SET_NULL,
        null=True, blank=True,
    )
    completed_at = models.DateTimeField(null=True, blank=True)
    order = models.PositiveIntegerField(default=0)

    class Meta:
        ordering = ["order"]

    def __str__(self):
        done = "✓" if self.is_completed else "○"
        return f"{done} {self.text}"


class ProductionLog(models.Model):
    class LogType(models.TextChoices):
        NOTE = "note", "Note"
        ISSUE = "issue", "Issue"
        DECISION = "decision", "Decision"
        CHANGE = "change", "Change Order"
        MILESTONE = "milestone", "Milestone"

    project = models.ForeignKey(
        Project, on_delete=models.CASCADE, related_name="production_logs"
    )
    log_type = models.CharField(
        max_length=20, choices=LogType.choices, default=LogType.NOTE
    )
    title = models.CharField(max_length=255)
    content = models.TextField()
    author = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True,
    )
    shoot = models.ForeignKey(
        Shoot, on_delete=models.SET_NULL, null=True, blank=True,
        related_name="production_logs",
    )
    logged_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-logged_at"]

    def __str__(self):
        return f"[{self.log_type}] {self.title}"


class TalentConsideration(models.Model):
    """Talent added to a production as a potential/backup candidate (not tied to a shoot)."""
    project = models.ForeignKey(
        Project, on_delete=models.CASCADE, related_name="talent_considerations"
    )
    talent = models.ForeignKey(
        "talent.TalentProfile", on_delete=models.CASCADE, related_name="project_considerations"
    )
    notes = models.TextField(blank=True)
    added_by = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True
    )
    added_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ("project", "talent")
        ordering = ["-added_at"]

    def __str__(self):
        return f"{self.talent} → {self.project}"


class CrewConsideration(models.Model):
    """Crew member added to a production as a potential/backup candidate (not tied to a shoot)."""
    project = models.ForeignKey(
        Project, on_delete=models.CASCADE, related_name="crew_considerations"
    )
    crew = models.ForeignKey(
        "crew.CrewProfile", on_delete=models.CASCADE, related_name="project_considerations"
    )
    notes = models.TextField(blank=True)
    added_by = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True
    )
    added_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ("project", "crew")
        ordering = ["-added_at"]

    def __str__(self):
        return f"{self.crew} → {self.project}"
