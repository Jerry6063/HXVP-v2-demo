from django.contrib import admin
from .models import (
    Project, Shoot, ActivityLog,
    CallSheet, CallSheetEntry, Checklist, ChecklistItem, ProductionLog,
    TalentConsideration, CrewConsideration,
)


@admin.register(Project)
class ProjectAdmin(admin.ModelAdmin):
    list_display = ["name", "client", "status", "budget", "deadline"]
    list_filter = ["status"]
    search_fields = ["name"]


@admin.register(Shoot)
class ShootAdmin(admin.ModelAdmin):
    list_display = ["project", "shoot_date", "call_time", "location", "status"]
    list_filter = ["status", "shoot_date"]


@admin.register(ActivityLog)
class ActivityLogAdmin(admin.ModelAdmin):
    list_display = ["project", "user", "action", "timestamp"]


class CallSheetEntryInline(admin.TabularInline):
    model = CallSheetEntry
    extra = 1


@admin.register(CallSheet)
class CallSheetAdmin(admin.ModelAdmin):
    list_display = ["title", "project", "shoot_date", "location", "created_by"]
    list_filter = ["shoot_date"]
    inlines = [CallSheetEntryInline]


class ChecklistItemInline(admin.TabularInline):
    model = ChecklistItem
    extra = 1


@admin.register(Checklist)
class ChecklistAdmin(admin.ModelAdmin):
    list_display = ["title", "project", "category", "created_by", "created_at"]
    list_filter = ["category"]
    inlines = [ChecklistItemInline]


@admin.register(ProductionLog)
class ProductionLogAdmin(admin.ModelAdmin):
    list_display = ["title", "project", "log_type", "author", "logged_at"]
    list_filter = ["log_type"]


@admin.register(TalentConsideration)
class TalentConsiderationAdmin(admin.ModelAdmin):
    list_display = ["talent", "project", "added_by", "added_at"]


@admin.register(CrewConsideration)
class CrewConsiderationAdmin(admin.ModelAdmin):
    list_display = ["crew", "project", "added_by", "added_at"]
