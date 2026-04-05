from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register(r"profiles", views.CrewProfileViewSet, basename="crew-profile")
router.register(
    r"availability", views.CrewAvailabilityViewSet, basename="crew-availability"
)
router.register(r"assignments", views.CrewAssignmentViewSet, basename="crew-assignment")
router.register(r"equipment", views.EquipmentViewSet, basename="equipment")
router.register(
    r"equipment-checkouts",
    views.EquipmentCheckoutViewSet,
    basename="equipment-checkout",
)
router.register(r"evaluations", views.EvaluationViewSet, basename="evaluation")
router.register(r"payments", views.CrewPaymentViewSet, basename="crew-payment")

urlpatterns = [
    path("stats/", views.CrewStatsView.as_view(), name="crew-stats"),
    path("", include(router.urls)),
]
