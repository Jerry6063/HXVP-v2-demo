from django.db import models
from django.conf import settings


class TalentProfile(models.Model):
    class TalentType(models.TextChoices):
        MODEL = "model", "Model"
        ACTOR = "actor", "Actor"
        VOICEOVER = "voiceover", "Voiceover"
        DANCER = "dancer", "Dancer"
        LIVESTREAM = "livestream", "Livestream Host"
        OTHER = "other", "Other"

    class Availability(models.TextChoices):
        AVAILABLE = "available", "Available"
        BOOKED = "booked", "Booked"
        UNAVAILABLE = "unavailable", "Unavailable"

    class ApprovalStatus(models.TextChoices):
        DRAFT = "draft", "Draft"
        PENDING = "pending", "Pending Review"
        APPROVED = "approved", "Approved"
        REJECTED = "rejected", "Rejected"

    class PerformanceCapability(models.TextChoices):
        MODEL_ONLY = "model_only", "Model Only (No Dialogue)"
        WITH_DIALOGUE = "with_dialogue", "Can Perform with Dialogue"
        BOTH = "both", "Both Model & Dialogue"

    class Gender(models.TextChoices):
        MALE = "male", "Male"
        FEMALE = "female", "Female"
        NON_BINARY = "non_binary", "Non-Binary"
        OTHER = "other", "Other"
        PREFER_NOT_TO_SAY = "prefer_not_to_say", "Prefer Not to Say"

    user = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="talent_profile",
        limit_choices_to={"role": "talent"},
    )
    talent_type = models.CharField(
        max_length=20, choices=TalentType.choices, default=TalentType.MODEL
    )
    hourly_rate = models.DecimalField(max_digits=8, decimal_places=2, default=0)
    availability = models.CharField(
        max_length=20, choices=Availability.choices, default=Availability.AVAILABLE
    )
    bio = models.TextField(blank=True)
    portfolio_url = models.URLField(blank=True)
    height = models.CharField(max_length=20, blank=True)
    measurements = models.CharField(max_length=50, blank=True)
    age = models.PositiveIntegerField(null=True, blank=True)
    skin_tone = models.CharField(
        max_length=50, blank=True,
        choices=[
            ("very_fair", "Very Fair"), ("fair", "Fair"), ("light", "Light"),
            ("medium", "Medium"), ("olive", "Olive"), ("tan", "Tan"),
            ("brown", "Brown"), ("dark", "Dark"), ("deep", "Deep"),
        ],
    )
    race_ethnicity = models.CharField(
        max_length=50, blank=True,
        choices=[
            ("asian", "Asian"), ("black_african", "Black / African"),
            ("east_asian", "East Asian"), ("hispanic_latino", "Hispanic / Latino"),
            ("middle_eastern", "Middle Eastern"), ("mixed", "Mixed / Multiracial"),
            ("native_american", "Native American / Indigenous"),
            ("pacific_islander", "Pacific Islander"), ("south_asian", "South Asian"),
            ("southeast_asian", "Southeast Asian"), ("white_caucasian", "White / Caucasian"),
            ("other", "Other"), ("prefer_not_to_say", "Prefer Not to Say"),
        ],
    )
    gender = models.CharField(
        max_length=20, choices=Gender.choices, blank=True
    )
    performance_capability = models.CharField(
        max_length=20,
        choices=PerformanceCapability.choices,
        default=PerformanceCapability.MODEL_ONLY,
    )
    specializations = models.TextField(
        blank=True, help_text="Special skills, e.g. 'Can ride a bike, swim, martial arts'"
    )
    approval_status = models.CharField(
        max_length=20, choices=ApprovalStatus.choices, default=ApprovalStatus.DRAFT
    )
    admin_notes = models.TextField(blank=True)
    profile_submitted_at = models.DateTimeField(null=True, blank=True)
    approved_at = models.DateTimeField(null=True, blank=True)
    stripe_account_id = models.CharField(max_length=100, blank=True)
    stripe_onboarding_complete = models.BooleanField(default=False)

    def __str__(self):
        return f"{self.user.get_full_name()} ({self.talent_type})"


class TalentPhoto(models.Model):
    profile = models.ForeignKey(
        TalentProfile, on_delete=models.CASCADE, related_name="photos"
    )
    image = models.ImageField(upload_to="talent_photos/")
    caption = models.CharField(max_length=255, blank=True)
    is_primary = models.BooleanField(default=False)
    uploaded_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-is_primary", "-uploaded_at"]

    def __str__(self):
        return f"Photo for {self.profile.user.get_full_name()}"


class Booking(models.Model):
    class Status(models.TextChoices):
        PENDING = "pending", "Pending"
        ACCEPTED = "accepted", "Accepted"
        DECLINED = "declined", "Declined"

    shoot = models.ForeignKey(
        "projects.Shoot", on_delete=models.CASCADE, related_name="bookings"
    )
    talent = models.ForeignKey(
        TalentProfile, on_delete=models.CASCADE, related_name="bookings"
    )
    status = models.CharField(
        max_length=20, choices=Status.choices, default=Status.PENDING
    )
    notes = models.TextField(blank=True)
    attire_requirements = models.TextField(blank=True)
    special_instructions = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ["shoot", "talent"]

    def __str__(self):
        return f"{self.talent} – {self.shoot}"


class PerformanceRecord(models.Model):
    class RecordType(models.TextChoices):
        ACTING = "acting", "Acting Performance"
        LIVESTREAM = "livestream", "Livestream Campaign"
        COMMERCIAL = "commercial", "Commercial"
        PRINT = "print", "Print Campaign"
        OTHER = "other", "Other"

    talent = models.ForeignKey(
        TalentProfile, on_delete=models.CASCADE, related_name="performance_records"
    )
    project = models.ForeignKey(
        "projects.Project", on_delete=models.SET_NULL, null=True, blank=True
    )
    record_type = models.CharField(max_length=20, choices=RecordType.choices)
    title = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    client_name = models.CharField(max_length=255, blank=True)
    date = models.DateField()
    duration_hours = models.DecimalField(max_digits=6, decimal_places=2, default=0)
    notes = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-date"]

    def __str__(self):
        return f"{self.talent.user.get_full_name()} – {self.title}"


class TalentTimeLog(models.Model):
    """Hours worked by talent — submitted by talent or logged by admin."""

    class LogStatus(models.TextChoices):
        PENDING = "pending", "Pending"
        APPROVED = "approved", "Approved"
        REJECTED = "rejected", "Rejected"

    talent = models.ForeignKey(
        TalentProfile, on_delete=models.CASCADE, related_name="time_logs"
    )
    booking = models.ForeignKey(
        "talent.Booking", on_delete=models.SET_NULL, null=True, blank=True,
        related_name="time_logs",
    )
    shoot = models.ForeignKey(
        "projects.Shoot", on_delete=models.SET_NULL, null=True, blank=True
    )
    project = models.ForeignKey(
        "projects.Project", on_delete=models.CASCADE, related_name="talent_time_logs"
    )
    date = models.DateField()
    hours_worked = models.DecimalField(max_digits=6, decimal_places=2)
    rate_applied = models.DecimalField(max_digits=8, decimal_places=2)
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    log_status = models.CharField(
        max_length=20, choices=LogStatus.choices, default=LogStatus.APPROVED,
    )
    notes = models.TextField(blank=True)
    notified = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-date"]

    def save(self, *args, **kwargs):
        if not self.rate_applied:
            self.rate_applied = self.talent.hourly_rate
        if not self.amount:
            self.amount = self.hours_worked * self.rate_applied
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.talent.user.get_full_name()} – {self.hours_worked}h on {self.date}"


class TalentAvailability(models.Model):
    """Per half-day availability entries for the talent calendar."""

    class DayStatus(models.TextChoices):
        AVAILABLE = "available", "Available"
        UNAVAILABLE = "unavailable", "Unavailable"
        TENTATIVE = "tentative", "Tentative"

    class Period(models.TextChoices):
        AM = "am", "AM (Morning)"
        PM = "pm", "PM (Afternoon)"
        FULL = "full", "Full Day"

    talent = models.ForeignKey(
        TalentProfile, on_delete=models.CASCADE, related_name="availability_entries"
    )
    date = models.DateField()
    period = models.CharField(
        max_length=4, choices=Period.choices, default=Period.FULL
    )
    status = models.CharField(
        max_length=20, choices=DayStatus.choices, default=DayStatus.AVAILABLE
    )
    note = models.CharField(max_length=255, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["date", "period"]
        unique_together = [["talent", "date", "period"]]

    def __str__(self):
        return f"{self.talent.user.get_full_name()} – {self.date} {self.period} ({self.status})"


class TalentPayment(models.Model):
    """Payment record for talent, optionally linked to a source time log."""

    class Status(models.TextChoices):
        PENDING = "pending", "Pending"
        PAID = "paid", "Paid"

    talent = models.ForeignKey(
        TalentProfile, on_delete=models.CASCADE, related_name="payments"
    )
    source_time_log = models.OneToOneField(
        "talent.TalentTimeLog",
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="payment",
    )
    project = models.ForeignKey(
        "projects.Project", on_delete=models.SET_NULL, null=True, blank=True,
        related_name="talent_payments",
    )
    period_month = models.PositiveIntegerField()
    period_year = models.PositiveIntegerField()
    total_hours = models.DecimalField(max_digits=8, decimal_places=2, default=0)
    total_amount = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    status = models.CharField(
        max_length=20, choices=Status.choices, default=Status.PENDING
    )
    paid_at = models.DateTimeField(null=True, blank=True)
    payment_reference = models.CharField(max_length=255, blank=True)
    stripe_transfer_id = models.CharField(max_length=100, blank=True)
    stripe_payout_status = models.CharField(max_length=50, blank=True)
    notes = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-period_year", "-period_month"]

    def __str__(self):
        return f"{self.talent.user.get_full_name()} – {self.period_year}/{self.period_month}"
