from django.contrib import admin
from .models import Expense, Earning


@admin.register(Expense)
class ExpenseAdmin(admin.ModelAdmin):
    list_display = ["description", "project", "category", "amount", "date"]
    list_filter = ["category"]


@admin.register(Earning)
class EarningAdmin(admin.ModelAdmin):
    list_display = ["user", "project", "amount", "date", "status"]
    list_filter = ["status"]
