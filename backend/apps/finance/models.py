from django.db import models
from django.conf import settings


class Expense(models.Model):
    class Category(models.TextChoices):
        TALENT = "talent", "Talent"
        CREW = "crew", "Crew"
        PROPS = "props", "Props"
        EQUIPMENT = "equipment", "Equipment"
        EQUIPMENT_RENTAL = "equipment_rental", "Equipment Rental"
        LOCATION = "location", "Location"
        CATERING = "catering", "Catering"
        TRAVEL = "travel", "Travel"
        GAS = "gas", "Gas"
        POST_PRODUCTION = "post_production", "Post Production"
        MISCELLANEOUS = "miscellaneous", "Miscellaneous"
        OTHER = "other", "Other"

    project = models.ForeignKey(
        "projects.Project", on_delete=models.CASCADE, related_name="expenses"
    )
    category = models.CharField(max_length=20, choices=Category.choices)
    amount = models.DecimalField(max_digits=12, decimal_places=2)
    description = models.CharField(max_length=255)
    date = models.DateField()
    submitted_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="submitted_expenses",
    )
    receipt = models.FileField(upload_to='expense_receipts/', blank=True, null=True)
    reimbursed = models.BooleanField(default=False)
    reimbursement_proof = models.FileField(upload_to='reimbursement_proofs/', blank=True, null=True)
    reimbursed_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-date"]

    def __str__(self):
        return f"{self.description} – ${self.amount}"


class BudgetAllocation(models.Model):
    """Planned budget per category for a project."""
    project = models.ForeignKey(
        "projects.Project", on_delete=models.CASCADE, related_name="budget_allocations"
    )
    category = models.CharField(max_length=20, choices=Expense.Category.choices)
    amount = models.DecimalField(max_digits=12, decimal_places=2, default=0)

    class Meta:
        unique_together = [("project", "category")]
        ordering = ["category"]

    def __str__(self):
        return f"{self.project.name} – {self.category} – ${self.amount}"


class Earning(models.Model):
    class Status(models.TextChoices):
        PENDING = "pending", "Pending"
        PAID = "paid", "Paid"

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="earnings",
    )
    project = models.ForeignKey(
        "projects.Project", on_delete=models.CASCADE, related_name="earnings"
    )
    amount = models.DecimalField(max_digits=12, decimal_places=2)
    description = models.CharField(max_length=255, blank=True)
    date = models.DateField()
    status = models.CharField(
        max_length=20, choices=Status.choices, default=Status.PENDING
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-date"]

    def __str__(self):
        return f"{self.user.get_full_name()} – ${self.amount}"
