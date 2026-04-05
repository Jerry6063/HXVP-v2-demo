from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from django.http import JsonResponse


def health(request):
    return JsonResponse({"status": "ok"})


urlpatterns = [
    path("", health),
    path("admin/", admin.site.urls),
    # Stripe webhook — AllowAny + signature verification; must come before auth-protected paths
    path("api/stripe/webhook/", include("apps.talent.urls_webhook")),
    path("api/auth/", include("apps.accounts.urls")),
    path("api/projects/", include("apps.projects.urls")),
    path("api/talent/", include("apps.talent.urls")),
    path("api/crew/", include("apps.crew.urls")),
    path("api/deliverables/", include("apps.deliverables.urls")),
    path("api/finance/", include("apps.finance.urls")),
    path("api/clientportal/", include("apps.clientportal.urls")),
    path("api/payments/", include("apps.payments.urls")),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
