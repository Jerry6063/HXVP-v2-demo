from django.contrib import admin
from .models import Deliverable, Contract


@admin.register(Deliverable)
class DeliverableAdmin(admin.ModelAdmin):
    list_display = ["name", "project", "deliverable_type", "status", "deadline"]
    list_filter = ["status", "deliverable_type"]


@admin.register(Contract)
class ContractAdmin(admin.ModelAdmin):
    list_display = ["title", "project", "user", "contract_type", "status"]
    list_filter = ["contract_type", "status"]
