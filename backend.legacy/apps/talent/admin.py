from django.contrib import admin
from .models import (
    TalentProfile,
    TalentPhoto,
    Booking,
    PerformanceRecord,
    TalentTimeLog,
    TalentPayment,
)


class TalentPhotoInline(admin.TabularInline):
    model = TalentPhoto
    extra = 0


@admin.register(TalentProfile)
class TalentProfileAdmin(admin.ModelAdmin):
    list_display = ["user", "talent_type", "hourly_rate", "availability", "approval_status"]
    list_filter = ["talent_type", "availability", "approval_status"]
    inlines = [TalentPhotoInline]


@admin.register(Booking)
class BookingAdmin(admin.ModelAdmin):
    list_display = ["talent", "shoot", "status", "created_at"]
    list_filter = ["status"]


@admin.register(PerformanceRecord)
class PerformanceRecordAdmin(admin.ModelAdmin):
    list_display = ["talent", "record_type", "title", "date"]
    list_filter = ["record_type"]


@admin.register(TalentTimeLog)
class TalentTimeLogAdmin(admin.ModelAdmin):
    list_display = ["talent", "project", "date", "hours_worked", "amount", "log_status", "notified"]
    list_filter = ["date", "log_status"]


@admin.register(TalentPayment)
class TalentPaymentAdmin(admin.ModelAdmin):
    list_display = ["talent", "source_time_log", "period_month", "period_year", "total_amount", "status"]
    list_filter = ["status", "period_year"]
