from django.db import models
from django.conf import settings


class TalentRosterShare(models.Model):
    """Records when production shares a selection of talent with a client."""

    project = models.ForeignKey(
        "projects.Project",
        on_delete=models.CASCADE,
        related_name="talent_roster_shares",
        null=True,
        blank=True,
    )
    client = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="received_talent_rosters",
        limit_choices_to={"role": "client"},
    )
    talent_ids = models.JSONField(default=list, help_text="List of TalentProfile PKs")
    message = models.TextField(blank=True)
    pdf_file = models.FileField(upload_to="talent_shortlists/", blank=True, null=True)
    shared_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="sent_talent_rosters",
    )
    shared_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-shared_at"]

    def __str__(self):
        if self.project_id:
            return f"Roster share → {self.project.name} ({self.shared_at.date()})"
        return f"Roster share → {self.client.get_full_name()} ({self.shared_at.date()})"


class TalentRosterShareItem(models.Model):
    share = models.ForeignKey(
        TalentRosterShare,
        on_delete=models.CASCADE,
        related_name="items",
    )
    talent = models.ForeignKey(
        "talent.TalentProfile",
        on_delete=models.CASCADE,
        related_name="talent_roster_items",
    )
    notes = models.TextField(blank=True)
    sort_order = models.PositiveIntegerField(default=0)
    client_favorite = models.BooleanField(default=False)
    client_note = models.TextField(blank=True)

    class Meta:
        ordering = ["sort_order", "id"]
        unique_together = ("share", "talent")

    def __str__(self):
        return f"{self.talent.user.get_full_name()} in {self.share}"


class ProjectRequest(models.Model):
    class ProjectType(models.TextChoices):
        PRODUCTION = "production", "Production"
        LIVESTREAM = "livestream", "Livestream"

    class Status(models.TextChoices):
        SUBMITTED = "submitted", "Submitted"
        UNDER_REVIEW = "under_review", "Under Review"
        CONTRACT_SENT = "contract_sent", "Contract Sent"
        CONTRACT_SIGNED = "contract_signed", "Contract Signed"
        IN_PRODUCTION = "in_production", "In Production"
        REJECTED = "rejected", "Rejected"

    client = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="project_requests",
    )
    project_type = models.CharField(max_length=20, choices=ProjectType.choices)
    title = models.CharField(max_length=255)
    budget = models.DecimalField(max_digits=12, decimal_places=2)
    model_requests = models.TextField(blank=True)
    description = models.TextField(blank=True)
    status = models.CharField(
        max_length=20, choices=Status.choices, default=Status.SUBMITTED
    )
    project = models.OneToOneField(
        "projects.Project",
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
        related_name="source_request",
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.title} ({self.get_status_display()})"


class RequestContract(models.Model):
    class Status(models.TextChoices):
        DRAFT = "draft", "Draft"
        SENT = "sent", "Sent to Client"
        CLIENT_COMMENTED = "client_commented", "Client Commented"
        REVISED = "revised", "Revised"
        SIGNED = "signed", "Signed"

    request = models.ForeignKey(
        ProjectRequest, on_delete=models.CASCADE, related_name="contracts"
    )
    file = models.FileField(upload_to="request_contracts/")
    status = models.CharField(
        max_length=20, choices=Status.choices, default=Status.DRAFT
    )
    client_comment = models.TextField(blank=True)
    signature_image = models.ImageField(
        upload_to="signatures/", blank=True, null=True
    )
    agreed_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return f"Contract for {self.request.title} ({self.get_status_display()})"


class ProjectMilestone(models.Model):
    class Phase(models.TextChoices):
        PREPARING = "preparing", "Preparing"
        PRE_PRODUCTION = "pre_production", "Pre-Production"
        SHOOTING = "shooting", "Shooting"
        POST_PRODUCTION = "post_production", "Post-Production"
        REVIEW = "review", "Client Review"
        DELIVERED = "delivered", "Delivered"

    project = models.ForeignKey(
        "projects.Project", on_delete=models.CASCADE, related_name="milestones"
    )
    phase = models.CharField(max_length=20, choices=Phase.choices)
    title = models.CharField(max_length=255)
    is_completed = models.BooleanField(default=False)
    completed_at = models.DateTimeField(null=True, blank=True)
    order = models.PositiveIntegerField(default=0)

    class Meta:
        ordering = ["order"]

    def __str__(self):
        return f"{self.project.name} – {self.title}"


class DeliverableReview(models.Model):
    class Action(models.TextChoices):
        REVISION_REQUESTED = "revision_requested", "Revision Requested"
        APPROVED = "approved", "Approved"
        COMMENT = "comment", "Comment"

    deliverable = models.ForeignKey(
        "deliverables.Deliverable",
        on_delete=models.CASCADE,
        related_name="reviews",
    )
    author = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE
    )
    feedback = models.TextField()
    action = models.CharField(max_length=20, choices=Action.choices)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return f"Review on {self.deliverable.name} – {self.get_action_display()}"


class CommunicationMessage(models.Model):
    project = models.ForeignKey(
        "projects.Project",
        on_delete=models.CASCADE,
        related_name="messages",
        null=True,
        blank=True,
    )
    sender = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="sent_messages",
    )
    subject = models.CharField(max_length=255)
    body = models.TextField()
    is_from_client = models.BooleanField(default=True)
    parent = models.ForeignKey(
        "self",
        null=True,
        blank=True,
        on_delete=models.CASCADE,
        related_name="replies",
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.subject} – {self.sender.get_full_name()}"
