from django.db import models
from django.conf import settings


class Deliverable(models.Model):
    class Type(models.TextChoices):
        PHOTO = "photo", "Photo"
        VIDEO = "video", "Video"
        AUDIO = "audio", "Audio"
        DOCUMENT = "document", "Document"
        OTHER = "other", "Other"

    class Status(models.TextChoices):
        PENDING = "pending", "Pending"
        IN_PROGRESS = "in_progress", "In Progress"
        REVIEW = "review", "In Review"
        APPROVED = "approved", "Approved"
        DELIVERED = "delivered", "Delivered"

    project = models.ForeignKey(
        "projects.Project", on_delete=models.CASCADE, related_name="deliverables"
    )
    name = models.CharField(max_length=255)
    deliverable_type = models.CharField(
        max_length=20, choices=Type.choices, default=Type.PHOTO
    )
    status = models.CharField(
        max_length=20, choices=Status.choices, default=Status.PENDING
    )
    deadline = models.DateField(null=True, blank=True)
    file = models.FileField(upload_to="deliverables/", blank=True, null=True)
    source_url = models.URLField(
        max_length=500,
        blank=True,
        help_text="Optional cloud link for this asset/deliverable",
    )
    thumbnail = models.ImageField(upload_to="deliverables/thumbs/", blank=True, null=True)
    description = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.name} ({self.project.name})"


class Contract(models.Model):
    class ContractType(models.TextChoices):
        TALENT = "talent", "Talent Agreement"
        CREW = "crew", "Crew Agreement"
        CLIENT = "client", "Client Agreement"
        LOCATION = "location_agreement", "Location Agreement"
        BUDGET = "budget_template", "Budget Template"
        PRODUCTION_SCHEDULE = "production_schedule", "Production Schedule"
        NDA = "nda", "NDA"
        OTHER = "other", "Other"

    class Status(models.TextChoices):
        DRAFT = "draft", "Draft"
        SENT = "sent", "Sent"
        SIGNED = "signed", "Signed"
        EXPIRED = "expired", "Expired"

    project = models.ForeignKey(
        "projects.Project", on_delete=models.CASCADE, related_name="contracts"
    )
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="contracts",
    )
    contract_type = models.CharField(
        max_length=25, choices=ContractType.choices
    )
    status = models.CharField(
        max_length=20, choices=Status.choices, default=Status.DRAFT
    )
    file_url = models.FileField(upload_to="contracts/", blank=True, null=True)
    title = models.CharField(max_length=255, blank=True)
    notes = models.TextField(blank=True)
    sent_at = models.DateTimeField(null=True, blank=True)
    signed_at = models.DateTimeField(null=True, blank=True)
    signature_image = models.ImageField(upload_to="contract_signatures/", blank=True, null=True)
    draft_html = models.TextField(blank=True, default='')
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.title or self.contract_type} – {self.project.name}"
