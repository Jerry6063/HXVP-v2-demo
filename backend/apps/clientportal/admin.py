from django.contrib import admin
from .models import (
    ProjectRequest,
    RequestContract,
    ProjectMilestone,
    DeliverableReview,
    CommunicationMessage,
)


@admin.register(ProjectRequest)
class ProjectRequestAdmin(admin.ModelAdmin):
    list_display = ["title", "client", "project_type", "status", "budget", "created_at"]
    list_filter = ["status", "project_type"]


@admin.register(RequestContract)
class RequestContractAdmin(admin.ModelAdmin):
    list_display = ["request", "status", "agreed_at", "created_at"]
    list_filter = ["status"]


@admin.register(ProjectMilestone)
class ProjectMilestoneAdmin(admin.ModelAdmin):
    list_display = ["project", "phase", "title", "is_completed", "order"]
    list_filter = ["phase", "is_completed"]


@admin.register(DeliverableReview)
class DeliverableReviewAdmin(admin.ModelAdmin):
    list_display = ["deliverable", "author", "action", "created_at"]
    list_filter = ["action"]


@admin.register(CommunicationMessage)
class CommunicationMessageAdmin(admin.ModelAdmin):
    list_display = ["subject", "sender", "is_from_client", "created_at"]
    list_filter = ["is_from_client"]
