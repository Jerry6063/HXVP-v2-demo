from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register(r"shoots", views.ShootViewSet, basename="shoot")
router.register(r"call-sheets", views.CallSheetViewSet, basename="call-sheet")
router.register(r"checklists", views.ChecklistViewSet, basename="checklist")
router.register(r"logs", views.ProductionLogViewSet, basename="production-log")
router.register(r"talent-considerations", views.TalentConsiderationViewSet, basename="talent-consideration")
router.register(r"crew-considerations", views.CrewConsiderationViewSet, basename="crew-consideration")
router.register(r"talent-requirements", views.TalentRequirementViewSet, basename="talent-requirement")
router.register(r"crew-requirements", views.CrewRequirementViewSet, basename="crew-requirement")
router.register(r"", views.ProjectViewSet, basename="project")

urlpatterns = [
    path("stats/", views.ProductionStatsView.as_view(), name="production-stats"),
    path("", include(router.urls)),
]
