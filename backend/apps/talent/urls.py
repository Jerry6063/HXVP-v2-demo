from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register(r"profiles", views.TalentProfileViewSet, basename="talent-profile")
router.register(r"availability-inquiries", views.TalentAvailabilityInquiryViewSet, basename="talent-availability-inquiry")
router.register(r"bookings", views.BookingViewSet, basename="booking")
router.register(r"performances", views.PerformanceRecordViewSet, basename="performance-record")
router.register(r"timelogs", views.TalentTimeLogViewSet, basename="talent-timelog")
router.register(r"payments", views.TalentPaymentViewSet, basename="talent-payment")
router.register(r"availability", views.TalentAvailabilityViewSet, basename="talent-availability")

urlpatterns = [
    path("", include(router.urls)),
]
