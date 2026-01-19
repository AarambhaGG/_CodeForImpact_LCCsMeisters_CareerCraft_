"""
URL Configuration for profiles app
"""
from django.urls import path, include
from rest_framework.routers import DefaultRouter

from .views import (
    UserProfileViewSet,
    EducationViewSet,
    WorkExperienceViewSet,
    ProjectViewSet,
    CertificationViewSet,
    SkillAssessmentViewSet,
    SkillLevelCertificateViewSet,
)

app_name = 'profiles'

router = DefaultRouter()
router.register(r'profile', UserProfileViewSet, basename='profile')
router.register(r'education', EducationViewSet, basename='education')
router.register(r'work-experience', WorkExperienceViewSet, basename='work-experience')
router.register(r'projects', ProjectViewSet, basename='project')
router.register(r'certifications', CertificationViewSet, basename='certification')
router.register(r'assessments', SkillAssessmentViewSet, basename='assessment')
router.register(r'certificates', SkillLevelCertificateViewSet, basename='certificate')

urlpatterns = [
    path('', include(router.urls)),
]
