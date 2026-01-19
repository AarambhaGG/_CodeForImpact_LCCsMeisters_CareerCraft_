"""
Serializers for Jobs app
"""
from rest_framework import serializers
from django.contrib.auth import get_user_model

from .models import (
    Job,
    JobSkillRequirement,
    JobEligibilityAnalysis,
)
from apps.profiles.models import Skill

User = get_user_model()


class JobSkillRequirementSerializer(serializers.ModelSerializer):
    """
    Serializer for JobSkillRequirement model
    """
    skill_name = serializers.CharField(source='skill.name', read_only=True)
    skill_slug = serializers.CharField(source='skill.slug', read_only=True)

    class Meta:
        model = JobSkillRequirement
        fields = [
            'id',
            'skill',
            'skill_name',
            'skill_slug',
            'requirement_type',
            'minimum_proficiency',
            'years_required',
            'weight',
            'created_at',
        ]
        read_only_fields = ['id', 'created_at']


class JobListSerializer(serializers.ModelSerializer):
    """
    List serializer for Job model (minimal fields)
    """
    class Meta:
        model = Job
        fields = [
            'id',
            'title',
            'company_name',
            'location',
            'is_remote',
            'remote_policy',
            'job_type',
            'experience_level',
            'salary_min',
            'salary_max',
            'salary_currency',
            'status',
            'posted_date',
            'created_at',
        ]


class JobDetailSerializer(serializers.ModelSerializer):
    """
    Detailed serializer for Job model
    """
    skill_requirements = JobSkillRequirementSerializer(many=True, read_only=True)
    required_skills_count = serializers.IntegerField(
        source='skill_requirements.count',
        read_only=True
    )

    class Meta:
        model = Job
        fields = [
            'id',
            'title',
            'company_name',
            'company_description',
            'description',
            'responsibilities',
            'requirements',
            'nice_to_have',
            'job_type',
            'experience_level',
            'location',
            'is_remote',
            'remote_policy',
            'salary_min',
            'salary_max',
            'salary_currency',
            'salary_period',
            'skill_requirements',
            'required_skills_count',
            'parsed_skills',
            'parsed_requirements',
            'source_url',
            'source_platform',
            'posted_date',
            'application_deadline',
            'status',
            'view_count',
            'application_count',
            'is_scraped',
            'created_at',
            'updated_at',
        ]
        read_only_fields = ['id', 'created_at', 'updated_at', 'view_count', 'application_count']


class JobEligibilityAnalysisSerializer(serializers.ModelSerializer):
    """
    Serializer for JobEligibilityAnalysis model
    """
    job_title = serializers.CharField(source='job.title', read_only=True)
    job_company = serializers.CharField(source='job.company_name', read_only=True)
    user_email = serializers.EmailField(source='user.email', read_only=True)
    user_name = serializers.SerializerMethodField()

    class Meta:
        model = JobEligibilityAnalysis
        fields = [
            'id',
            'user',
            'user_email',
            'user_name',
            'job',
            'job_title',
            'job_company',
            'additional_context',
            'eligibility_level',
            'match_score',
            'analysis_summary',
            'strengths',
            'gaps',
            'recommendations',
            'matching_skills',
            'missing_skills',
            'skill_gaps',
            # Detailed Match Metrics
            'skills_match_score',
            'experience_match_score',
            'education_match_score',
            'culture_fit_score',
            'location_match_score',
            'salary_match_score',
            # Categorized Scores
            'technical_skills_score',
            'soft_skills_score',
            'domain_knowledge_score',
            # Experience Details
            'experience_match',
            'experience_gap_years',
            'years_of_experience_required',
            'years_of_experience_user',
            # Readiness Metrics
            'readiness_percentage',
            'estimated_preparation_time',
            'confidence_level',
            # Next Steps
            'next_steps',
            'priority_improvements',
            'learning_resources',
            # Interview Preparation
            'interview_questions',
            'analyzed_at',
            'llm_model',
        ]
        read_only_fields = [
            'id',
            'user',
            'eligibility_level',
            'match_score',
            'analysis_summary',
            'strengths',
            'gaps',
            'recommendations',
            'matching_skills',
            'missing_skills',
            'skill_gaps',
            'skills_match_score',
            'experience_match_score',
            'education_match_score',
            'culture_fit_score',
            'location_match_score',
            'salary_match_score',
            'technical_skills_score',
            'soft_skills_score',
            'domain_knowledge_score',
            'experience_match',
            'experience_gap_years',
            'years_of_experience_required',
            'years_of_experience_user',
            'readiness_percentage',
            'estimated_preparation_time',
            'confidence_level',
            'next_steps',
            'priority_improvements',
            'learning_resources',
            'interview_questions',
            'analyzed_at',
            'llm_model',
        ]

    def get_user_name(self, obj):
        return f"{obj.user.first_name} {obj.user.last_name}".strip() or obj.user.username


class JobEligibilityAnalysisDetailSerializer(JobEligibilityAnalysisSerializer):
    """
    Detailed serializer including full analysis
    """
    class Meta(JobEligibilityAnalysisSerializer.Meta):
        fields = JobEligibilityAnalysisSerializer.Meta.fields + ['full_analysis', 'token_usage']
        read_only_fields = JobEligibilityAnalysisSerializer.Meta.read_only_fields + ['full_analysis', 'token_usage']


class AnalyzeJobEligibilitySerializer(serializers.Serializer):
    """
    Serializer for job eligibility analysis request
    """
    job_id = serializers.IntegerField(required=True)
    additional_context = serializers.CharField(
        required=False,
        allow_blank=True,
        help_text="Additional context about your background or specific aspects you'd like analyzed"
    )

    def validate_job_id(self, value):
        """Validate that job exists and is active"""
        try:
            job = Job.objects.get(id=value)
            if job.status != 'ACTIVE':
                raise serializers.ValidationError("This job is no longer active.")
            return value
        except Job.DoesNotExist:
            raise serializers.ValidationError("Job not found.")


class ReanalyzeJobEligibilitySerializer(serializers.Serializer):
    """
    Serializer for re-analyzing with additional context
    """
    analysis_id = serializers.IntegerField(required=True)
    additional_context = serializers.CharField(
        required=True,
        help_text="Additional context to add to the analysis"
    )

    def validate_analysis_id(self, value):
        """Validate that analysis exists"""
        try:
            JobEligibilityAnalysis.objects.get(id=value)
            return value
        except JobEligibilityAnalysis.DoesNotExist:
            raise serializers.ValidationError("Analysis not found.")
