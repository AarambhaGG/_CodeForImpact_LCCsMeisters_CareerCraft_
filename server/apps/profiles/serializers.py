"""
Serializers for Profiles app
"""
from rest_framework import serializers
from django.contrib.auth import get_user_model

from .models import (
    UserProfile,
    Education,
    WorkExperience,
    Project,
    Certification,
    Skill,
    SkillCategory,
    UserSkill,
    AssessmentQuestion,
    SkillAssessment,
    AssessmentAnswer,
    SkillLevelCertificate,
)

User = get_user_model()


class SkillCategorySerializer(serializers.ModelSerializer):
    """
    Serializer for SkillCategory model
    """
    class Meta:
        model = SkillCategory
        fields = ['id', 'name', 'description', 'parent_category', 'created_at', 'updated_at']
        read_only_fields = ['id', 'created_at', 'updated_at']


class SkillSerializer(serializers.ModelSerializer):
    """
    Serializer for Skill model
    """
    category_name = serializers.CharField(source='category.name', read_only=True)
    skill_type_display = serializers.CharField(source='get_skill_type_display', read_only=True)

    class Meta:
        model = Skill
        fields = [
            'id',
            'name',
            'category',
            'category_name',
            'skill_type',
            'skill_type_display',
            'description',
            'is_verified',
            'usage_count',
            'created_at',
            'updated_at',
        ]
        read_only_fields = ['id', 'usage_count', 'created_at', 'updated_at']


class UserSkillSerializer(serializers.ModelSerializer):
    """
    Serializer for UserSkill model
    """
    skill_name = serializers.CharField(source='skill.name', read_only=True)
    skill_details = SkillSerializer(source='skill', read_only=True)
    proficiency_level_display = serializers.CharField(source='get_proficiency_level_display', read_only=True)

    class Meta:
        model = UserSkill
        fields = [
            'id',
            'profile',
            'skill',
            'skill_name',
            'skill_details',
            'proficiency_level',
            'proficiency_level_display',
            'years_of_experience',
            'is_verified',
            'verified_by',
            'last_used',
            'notes',
            'created_at',
            'updated_at',
        ]
        read_only_fields = ['id', 'profile', 'created_at', 'updated_at']


class UserProfileSerializer(serializers.ModelSerializer):
    """
    Serializer for UserProfile model
    """
    user_email = serializers.EmailField(source='user.email', read_only=True)
    user_name = serializers.SerializerMethodField()

    class Meta:
        model = UserProfile
        fields = [
            'id',
            'user',
            'user_email',
            'user_name',
            'bio',
            'current_title',
            'current_company',
            'years_of_experience',
            'linkedin_url',
            'github_url',
            'portfolio_url',
            'twitter_url',
            'resume',
            'resume_text',
            'resume_parsed_data',
            'career_goal',
            'target_roles',
            'industry',
            'domain_expertise',
            'created_at',
            'updated_at',
        ]
        read_only_fields = ['id', 'user', 'created_at', 'updated_at']

    def get_user_name(self, obj):
        return f"{obj.user.first_name} {obj.user.last_name}".strip() or obj.user.username


class EducationSerializer(serializers.ModelSerializer):
    """
    Serializer for Education model
    """
    degree_level_display = serializers.CharField(source='get_degree_level_display', read_only=True)

    class Meta:
        model = Education
        fields = [
            'id',
            'profile',
            'institution',
            'degree',
            'degree_level',
            'degree_level_display',
            'field_of_study',
            'start_date',
            'end_date',
            'is_current',
            'grade',
            'description',
            'created_at',
            'updated_at',
        ]
        read_only_fields = ['id', 'profile', 'created_at', 'updated_at']

    def validate(self, data):
        """Validate that end_date is after start_date"""
        if data.get('end_date') and data.get('start_date'):
            if data['end_date'] < data['start_date']:
                raise serializers.ValidationError(
                    {'end_date': 'End date must be after start date.'}
                )
        return data


class WorkExperienceSerializer(serializers.ModelSerializer):
    """
    Serializer for WorkExperience model
    """
    employment_type_display = serializers.CharField(source='get_employment_type_display', read_only=True)
    skills_used_details = serializers.SerializerMethodField()

    class Meta:
        model = WorkExperience
        fields = [
            'id',
            'profile',
            'job_title',
            'company',
            'employment_type',
            'employment_type_display',
            'location',
            'is_remote',
            'start_date',
            'end_date',
            'is_current',
            'description',
            'responsibilities',
            'achievements',
            'skills_used',
            'skills_used_details',
            'created_at',
            'updated_at',
        ]
        read_only_fields = ['id', 'profile', 'created_at', 'updated_at']

    def get_skills_used_details(self, obj):
        """Get detailed info about skills used"""
        return [
            {
                'id': skill.id,
                'name': skill.name,
                'skill_type': skill.skill_type,
            }
            for skill in obj.skills_used.all()
        ]

    def validate(self, data):
        """Validate that end_date is after start_date"""
        if data.get('end_date') and data.get('start_date'):
            if data['end_date'] < data['start_date']:
                raise serializers.ValidationError(
                    {'end_date': 'End date must be after start date.'}
                )

        # If is_current, end_date should be None
        if data.get('is_current') and data.get('end_date'):
            raise serializers.ValidationError(
                {'end_date': 'End date should be empty for current positions.'}
            )

        return data


class ProjectSerializer(serializers.ModelSerializer):
    """
    Serializer for Project model
    """
    project_type_display = serializers.CharField(source='get_project_type_display', read_only=True)
    skills_demonstrated_details = serializers.SerializerMethodField()

    class Meta:
        model = Project
        fields = [
            'id',
            'profile',
            'title',
            'project_type',
            'project_type_display',
            'description',
            'technologies_used',
            'project_url',
            'github_url',
            'demo_url',
            'start_date',
            'end_date',
            'is_ongoing',
            'skills_demonstrated',
            'skills_demonstrated_details',
            'created_at',
            'updated_at',
        ]
        read_only_fields = ['id', 'profile', 'created_at', 'updated_at']

    def get_skills_demonstrated_details(self, obj):
        """Get detailed info about skills demonstrated"""
        return [
            {
                'id': skill.id,
                'name': skill.name,
                'skill_type': skill.skill_type,
            }
            for skill in obj.skills_demonstrated.all()
        ]

    def validate(self, data):
        """Validate dates"""
        if data.get('end_date') and data.get('start_date'):
            if data['end_date'] < data['start_date']:
                raise serializers.ValidationError(
                    {'end_date': 'End date must be after start date.'}
                )

        # If is_ongoing, end_date should be None
        if data.get('is_ongoing') and data.get('end_date'):
            raise serializers.ValidationError(
                {'end_date': 'End date should be empty for ongoing projects.'}
            )

        return data


class CertificationSerializer(serializers.ModelSerializer):
    """
    Serializer for Certification model
    """
    skills_validated_details = serializers.SerializerMethodField()
    is_expired = serializers.SerializerMethodField()

    class Meta:
        model = Certification
        fields = [
            'id',
            'profile',
            'name',
            'issuing_organization',
            'credential_id',
            'credential_url',
            'issue_date',
            'expiry_date',
            'does_not_expire',
            'is_expired',
            'skills_validated',
            'skills_validated_details',
            'created_at',
            'updated_at',
        ]
        read_only_fields = ['id', 'profile', 'created_at', 'updated_at']

    def get_skills_validated_details(self, obj):
        """Get detailed info about skills validated"""
        return [
            {
                'id': skill.id,
                'name': skill.name,
                'skill_type': skill.skill_type,
            }
            for skill in obj.skills_validated.all()
        ]

    def get_is_expired(self, obj):
        """Check if certification is expired"""
        if obj.does_not_expire:
            return False
        if obj.expiry_date:
            from datetime import date
            return obj.expiry_date < date.today()
        return False

    def validate(self, data):
        """Validate dates"""
        if data.get('expiry_date') and data.get('issue_date'):
            if data['expiry_date'] < data['issue_date']:
                raise serializers.ValidationError(
                    {'expiry_date': 'Expiry date must be after issue date.'}
                )

        # If does_not_expire, expiry_date should be None
        if data.get('does_not_expire') and data.get('expiry_date'):
            raise serializers.ValidationError(
                {'expiry_date': 'Expiry date should be empty if certification does not expire.'}
            )

        return data


class CompleteProfileSerializer(serializers.ModelSerializer):
    """
    Complete profile serializer with all related data
    """
    user_email = serializers.EmailField(source='user.email', read_only=True)
    user_name = serializers.SerializerMethodField()
    education_records = EducationSerializer(many=True, read_only=True)
    work_experiences = WorkExperienceSerializer(many=True, read_only=True)
    projects = ProjectSerializer(many=True, read_only=True)
    certifications = CertificationSerializer(many=True, read_only=True)
    user_skills = UserSkillSerializer(many=True, read_only=True)

    # Stats
    total_certifications = serializers.IntegerField(source='certifications.count', read_only=True)
    total_work_experiences = serializers.IntegerField(source='work_experiences.count', read_only=True)
    total_projects = serializers.IntegerField(source='projects.count', read_only=True)
    total_education = serializers.IntegerField(source='education_records.count', read_only=True)
    total_skills = serializers.IntegerField(source='user_skills.count', read_only=True)

    class Meta:
        model = UserProfile
        fields = [
            'id',
            'user',
            'user_email',
            'user_name',
            'bio',
            'current_title',
            'current_company',
            'years_of_experience',
            'linkedin_url',
            'github_url',
            'portfolio_url',
            'twitter_url',
            'career_goal',
            'target_roles',
            'industry',
            'domain_expertise',
            'education_records',
            'work_experiences',
            'projects',
            'certifications',
            'user_skills',
            'total_education',
            'total_work_experiences',
            'total_projects',
            'total_certifications',
            'total_skills',
            'created_at',
            'updated_at',
        ]
        read_only_fields = ['id', 'user', 'created_at', 'updated_at']

    def get_user_name(self, obj):
        return f"{obj.user.first_name} {obj.user.last_name}".strip() or obj.user.username


# ============================================================================
# Assessment Serializers
# ============================================================================


class AssessmentQuestionSerializer(serializers.ModelSerializer):
    """
    Serializer for AssessmentQuestion model
    NOTE: Does not expose correct_answer for security
    """
    skill_name = serializers.CharField(source='skill.name', read_only=True)
    level_display = serializers.CharField(source='get_level_display', read_only=True)
    question_type_display = serializers.CharField(source='get_question_type_display', read_only=True)

    class Meta:
        model = AssessmentQuestion
        fields = [
            'id',
            'skill',
            'skill_name',
            'level',
            'level_display',
            'question_type',
            'question_type_display',
            'question_text',
            'code_snippet',
            'options',
            'points',
            'time_limit_seconds',
            # Note: correct_answer and explanation excluded for security
        ]
        read_only_fields = ['id']


class AssessmentAnswerSerializer(serializers.ModelSerializer):
    """
    Serializer for AssessmentAnswer model
    """
    question_text = serializers.CharField(source='question.question_text', read_only=True)
    question_details = AssessmentQuestionSerializer(source='question', read_only=True)

    class Meta:
        model = AssessmentAnswer
        fields = [
            'id',
            'assessment',
            'question',
            'question_text',
            'question_details',
            'user_answer',
            'is_correct',
            'points_earned',
            'time_taken_seconds',
            'answered_at',
        ]
        read_only_fields = ['id', 'is_correct', 'points_earned', 'answered_at']


class SkillLevelCertificateSerializer(serializers.ModelSerializer):
    """
    Serializer for SkillLevelCertificate model
    """
    user_email = serializers.EmailField(source='user.email', read_only=True)
    skill_name = serializers.CharField(source='skill.name', read_only=True)
    level_display = serializers.CharField(source='get_level_display', read_only=True)

    class Meta:
        model = SkillLevelCertificate
        fields = [
            'id',
            'user',
            'user_email',
            'skill',
            'skill_name',
            'level',
            'level_display',
            'assessment',
            'certificate_id',
            'score_achieved',
            'issued_at',
            'is_active',
            'expires_at',
            'created_at',
            'updated_at',
        ]
        read_only_fields = ['id', 'user', 'certificate_id', 'issued_at', 'created_at', 'updated_at']


class SkillAssessmentSerializer(serializers.ModelSerializer):
    """
    Serializer for SkillAssessment model
    """
    user_email = serializers.EmailField(source='user.email', read_only=True)
    skill_name = serializers.CharField(source='skill.name', read_only=True)
    level_display = serializers.CharField(source='get_level_display', read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    answers = AssessmentAnswerSerializer(many=True, read_only=True)
    certificate = serializers.SerializerMethodField()

    class Meta:
        model = SkillAssessment
        fields = [
            'id',
            'user',
            'user_email',
            'skill',
            'skill_name',
            'level',
            'level_display',
            'status',
            'status_display',
            'started_at',
            'completed_at',
            'expires_at',
            'total_questions',
            'questions_answered',
            'total_points',
            'points_earned',
            'percentage_score',
            'passing_score',
            'time_spent_seconds',
            'attempt_number',
            'previous_assessment',
            'answers',
            'certificate',
            'created_at',
            'updated_at',
        ]
        read_only_fields = [
            'id',
            'user',
            'started_at',
            'created_at',
            'updated_at',
            'total_questions',
            'questions_answered',
            'total_points',
            'points_earned',
            'percentage_score',
            'time_spent_seconds',
        ]

    def get_certificate(self, obj):
        """Get certificate if assessment was passed"""
        if hasattr(obj, 'certificate'):
            return SkillLevelCertificateSerializer(obj.certificate).data
        return None
