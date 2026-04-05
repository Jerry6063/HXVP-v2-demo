from django.db import models
from django.conf import settings


class CrewProfile(models.Model):
    class CrewRole(models.TextChoices):
        DIRECTOR = "director", "Director"
        PHOTOGRAPHER = "photographer", "Photographer"
        DIRECTOR_OF_PHOTOGRAPHY = "dop", "Director of Photography"
        VIDEOGRAPHER = "videographer", "Videographer"
        FIRST_AC = "first_ac", "1st Assistant Camera"
        SECOND_AC = "second_ac", "2nd Assistant Camera"
        GAFFER = "gaffer", "Gaffer"
        GRIP = "grip", "Grip"
        ELECTRIC = "electric", "Electric"
        WARDROBE = "wardrobe", "Wardrobe"
        SET_DESIGN = "set_design", "Set Design"
        BTS = "bts", "Behind-the-Scene"
        PRODUCTION_ASSISTANT = "pa", "Production Assistant"
        ASSISTANT_CAMERA = "ac", "Assistant Camera"
        AUDIO = "audio", "Audio"
        LIGHTING = "lighting", "Lighting"
        HAIR_MAKEUP = "hair_makeup", "Hair & Makeup"
        STYLIST = "stylist", "Stylist"
        CRAFTY = "crafty", "Crafty"
        OTHER = "other", "Other"

    class Availability(models.TextChoices):
        AVAILABLE = "available", "Available"
        BOOKED = "booked", "Booked"
        UNAVAILABLE = "unavailable", "Unavailable"

    user = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="crew_profile",
        limit_choices_to={"role": "crew"},
    )
    crew_role = models.CharField(
        max_length=30, choices=CrewRole.choices, default=CrewRole.PHOTOGRAPHER
    )
    hourly_rate = models.DecimalField(max_digits=8, decimal_places=2, default=0)
    day_rate = models.DecimalField(max_digits=8, decimal_places=2, default=0)
    availability = models.CharField(
        max_length=20, choices=Availability.choices, default=Availability.AVAILABLE
    )
    bio = models.TextField(blank=True)
    skills = models.TextField(
        blank=True,
        help_text="Technical skills and specializations",
    )
    equipment_owned = models.TextField(
        blank=True,
        help_text="Personal equipment the crew member can bring",
    )
    years_experience = models.PositiveIntegerField(null=True, blank=True)
    profile_photo = models.ImageField(upload_to="crew_photos/", blank=True, null=True)
    stripe_account_id = models.CharField(max_length=100, blank=True)
    stripe_onboarding_complete = models.BooleanField(default=False)

    def __str__(self):
        return f"{self.user.get_full_name()} ({self.get_crew_role_display()})"


class CrewAvailability(models.Model):
    """Per half-day availability entries for the crew calendar."""

    class DayStatus(models.TextChoices):
        AVAILABLE = "available", "Available"
        UNAVAILABLE = "unavailable", "Unavailable"
        TENTATIVE = "tentative", "Tentative"

    class Period(models.TextChoices):
        AM = "am", "AM (Morning)"
        PM = "pm", "PM (Afternoon)"
        FULL = "full", "Full Day"

    crew = models.ForeignKey(
        CrewProfile, on_delete=models.CASCADE, related_name="availability_entries"
    )
    date = models.DateField()
    period = models.CharField(
        max_length=4, choices=Period.choices, default=Period.FULL
    )
    status = models.CharField(
        max_length=20, choices=DayStatus.choices, default=DayStatus.AVAILABLE
    )
    note = models.CharField(max_length=255, blank=True)

    class Meta:
        ordering = ["date", "period"]
        unique_together = ["crew", "date", "period"]
        verbose_name_plural = "Crew availabilities"

    def __str__(self):
        return f"{self.crew.user.get_full_name()} – {self.date} {self.period} ({self.status})"


class CrewAssignment(models.Model):
    class Status(models.TextChoices):
        PENDING = "pending", "Pending"
        ACCEPTED = "accepted", "Accepted"
        DECLINED = "declined", "Declined"

    shoot = models.ForeignKey(
        "projects.Shoot", on_delete=models.CASCADE, related_name="crew_assignments"
    )
    crew = models.ForeignKey(
        CrewProfile, on_delete=models.CASCADE, related_name="assignments"
    )
    role_on_shoot = models.CharField(
        max_length=30,
        choices=CrewProfile.CrewRole.choices,
        blank=True,
    )
    status = models.CharField(
        max_length=20, choices=Status.choices, default=Status.PENDING
    )
    special_instructions = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ["shoot", "crew"]

    def __str__(self):
        return f"{self.crew} – {self.shoot}"


class Equipment(models.Model):
    class Type(models.TextChoices):
        CAMERA = "camera", "Camera"
        LENS = "lens", "Lens"
        LIGHTING = "lighting", "Lighting"
        AUDIO = "audio", "Audio"
        GRIP = "grip", "Grip"
        OTHER = "other", "Other"

    class Status(models.TextChoices):
        AVAILABLE = "available", "Available"
        CHECKED_OUT = "checked_out", "Checked Out"
        MAINTENANCE = "maintenance", "Maintenance"

    name = models.CharField(max_length=255)
    equipment_type = models.CharField(
        max_length=20, choices=Type.choices, default=Type.CAMERA
    )
    status = models.CharField(
        max_length=20, choices=Status.choices, default=Status.AVAILABLE
    )
    serial_number = models.CharField(max_length=100, blank=True)

    def __str__(self):
        return self.name


class EquipmentCheckout(models.Model):
    equipment = models.ForeignKey(
        Equipment, on_delete=models.CASCADE, related_name="checkouts"
    )
    crew = models.ForeignKey(
        CrewProfile, on_delete=models.CASCADE, related_name="equipment_checkouts"
    )
    shoot = models.ForeignKey(
        "projects.Shoot",
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="equipment_checkouts",
    )
    checkout_date = models.DateField()
    return_date = models.DateField(null=True, blank=True)

    def __str__(self):
        return f"{self.equipment} → {self.crew}"


class Evaluation(models.Model):
    """Admin evaluations for talent and crew members."""

    class SubjectType(models.TextChoices):
        TALENT = "talent", "Talent"
        CREW = "crew", "Crew"

    class Rating(models.IntegerChoices):
        POOR = 1, "Poor"
        FAIR = 2, "Fair"
        GOOD = 3, "Good"
        VERY_GOOD = 4, "Very Good"
        EXCELLENT = 5, "Excellent"

    subject_type = models.CharField(max_length=10, choices=SubjectType.choices)
    subject_user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="evaluations",
    )
    project = models.ForeignKey(
        "projects.Project",
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="evaluations",
    )
    evaluator = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        related_name="evaluations_given",
    )
    rating = models.IntegerField(choices=Rating.choices)
    professionalism = models.IntegerField(
        choices=Rating.choices, null=True, blank=True
    )
    skill_level = models.IntegerField(
        choices=Rating.choices, null=True, blank=True
    )
    reliability = models.IntegerField(
        choices=Rating.choices, null=True, blank=True
    )
    comments = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return (
            f"Eval: {self.subject_user.get_full_name()} "
            f"({self.subject_type}) – {self.rating}/5"
        )


class CrewPayment(models.Model):
    """Per-production payment record for a crew member."""

    class Status(models.TextChoices):
        PENDING = "pending", "Pending"
        PAID = "paid", "Paid"

    crew = models.ForeignKey(
        CrewProfile, on_delete=models.CASCADE, related_name="payments"
    )
    project = models.ForeignKey(
        "projects.Project",
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="crew_payments",
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
        unique_together = ["crew", "project", "period_month", "period_year"]

    def __str__(self):
        return f"{self.crew.user.get_full_name()} – {self.period_year}/{self.period_month}"
