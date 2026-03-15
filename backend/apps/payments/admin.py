from django.contrib import admin
from .models import Invoice, InvoiceItem, ProjectPayment


class InvoiceItemInline(admin.TabularInline):
    model = InvoiceItem
    extra = 1


@admin.register(Invoice)
class InvoiceAdmin(admin.ModelAdmin):
    list_display = ["reference_number", "project", "client", "status", "total", "due_date"]
    list_filter = ["status"]
    inlines = [InvoiceItemInline]


@admin.register(ProjectPayment)
class ProjectPaymentAdmin(admin.ModelAdmin):
    list_display = ["invoice", "client", "amount", "status", "payment_date", "verified_at"]
    list_filter = ["status"]
