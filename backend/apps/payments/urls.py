from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register(r"invoices", views.InvoiceViewSet, basename="invoice")
router.register(r"payments", views.ProjectPaymentViewSet, basename="project-payment")

urlpatterns = [
    path("", include(router.urls)),
]
