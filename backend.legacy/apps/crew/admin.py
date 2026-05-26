from django.contrib import admin
from .models import (
    CrewProfile,
    CrewAvailability,
    CrewAssignment,
    CrewTimeLog,
    Equipment,
    EquipmentCheckout,
    Evaluation,
    CrewPayment,
)


@admin.register(CrewProfile)
class CrewProfileAdmin(admin.ModelAdmin):
    list_display = [
        "user", "crew_role", "hourly_rate", "day_rate",
        "availability", "years_experience",
    ]
    list_filter = ["crew_role", "availability"]


@admin.register(CrewAvailability)
class CrewAvailabilityAdmin(admin.ModelAdmin):
    list_display = ["crew", "date", "status", "note"]
    list_filter = ["status", "date"]


@admin.register(CrewAssignment)
class CrewAssignmentAdmin(admin.ModelAdmin):
    list_display = ["crew", "shoot", "role_on_shoot", "status"]
    list_filter = ["status"]


@admin.register(CrewTimeLog)
class CrewTimeLogAdmin(admin.ModelAdmin):
    list_display = ["crew", "project", "date", "hours_worked", "amount", "log_status", "notified"]
    list_filter = ["date", "log_status"]


@admin.register(Equipment)
class EquipmentAdmin(admin.ModelAdmin):
    list_display = ["name", "equipment_type", "status"]
    list_filter = ["equipment_type", "status"]


@admin.register(EquipmentCheckout)
class EquipmentCheckoutAdmin(admin.ModelAdmin):
    list_display = ["equipment", "crew", "checkout_date", "return_date"]


@admin.register(Evaluation)
class EvaluationAdmin(admin.ModelAdmin):
    list_display = [
        "subject_user", "subject_type", "project", "rating",
        "evaluator", "created_at",
    ]
    list_filter = ["subject_type", "rating"]


@admin.register(CrewPayment)
class CrewPaymentAdmin(admin.ModelAdmin):
    list_display = ["crew", "source_time_log", "period_month", "period_year", "total_amount", "status"]
    list_filter = ["status", "period_year"]
