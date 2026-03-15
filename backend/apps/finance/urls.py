from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register(r"expenses", views.ExpenseViewSet, basename="expense")
router.register(r"earnings", views.EarningViewSet, basename="earning")
router.register(r"budget-allocations", views.BudgetAllocationViewSet, basename="budget-allocation")

urlpatterns = [
    path(
        "project/<int:project_id>/",
        views.ProjectFinancialsView.as_view(),
        name="project-financials",
    ),
    path(
        "revenue-analysis/",
        views.RevenueAnalysisView.as_view(),
        name="revenue-analysis",
    ),
    path("", include(router.urls)),
]
