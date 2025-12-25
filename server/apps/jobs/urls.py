"""
URL Configuration for jobs app
"""
from django.urls import path, include
from rest_framework.routers import DefaultRouter

from .views import (
    JobViewSet,
    JobEligibilityAnalysisViewSet,
)

app_name = 'jobs'

# Create separate routers to avoid URL pattern conflicts
jobs_router = DefaultRouter()
jobs_router.register(r'', JobViewSet, basename='job')

analyses_router = DefaultRouter()
analyses_router.register(r'', JobEligibilityAnalysisViewSet, basename='analysis')

urlpatterns = [
    # Analyses must come BEFORE jobs to avoid pattern matching conflicts
    path('analyses/', include(analyses_router.urls)),
    path('', include(jobs_router.urls)),
]
