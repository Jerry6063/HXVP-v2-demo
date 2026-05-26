from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register(r"requests", views.ProjectRequestViewSet, basename="project-request")
router.register(r"milestones", views.ProjectMilestoneViewSet, basename="milestone")
router.register(r"reviews", views.DeliverableReviewViewSet, basename="deliverable-review")
router.register(r"messages", views.CommunicationMessageViewSet, basename="message")
router.register(r"talent-roster-shares", views.TalentRosterShareViewSet, basename="talent-roster-share")

urlpatterns = [
    path("", include(router.urls)),
]
