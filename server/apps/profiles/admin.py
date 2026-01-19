"""
Admin configuration for Profiles app
"""
from django.contrib import admin
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


class EducationInline(admin.TabularInline):
    """
    Inline admin for education records
    """
    model = Education
    extra = 0
    fields = ['institution', 'degree', 'degree_level', 'field_of_study', 'start_date', 'end_date', 'is_current']


class WorkExperienceInline(admin.TabularInline):
    """
    Inline admin for work experience records
    """
    model = WorkExperience
    extra = 0
    fields = ['job_title', 'company', 'employment_type', 'start_date', 'end_date', 'is_current', 'is_remote']


class ProjectInline(admin.TabularInline):
    """
    Inline admin for projects
    """
    model = Project
    extra = 0
    fields = ['title', 'project_type', 'start_date', 'end_date', 'is_ongoing']


class CertificationInline(admin.TabularInline):
    """
    Inline admin for certifications
    """
    model = Certification
    extra = 0
    fields = ['name', 'issuing_organization', 'issue_date', 'expiry_date', 'does_not_expire']


@admin.register(UserProfile)
class UserProfileAdmin(admin.ModelAdmin):
    """
    Admin interface for UserProfile model
    """
    list_display = [
        'user',
        'current_title',
        'current_company',
        'years_of_experience',
        'industry',
        'created_at',
    ]
    list_filter = [
        'industry',
        'created_at',
    ]
    search_fields = [
        'user__email',
        'user__first_name',
        'user__last_name',
        'current_title',
        'current_company',
        'bio',
    ]
    readonly_fields = ['created_at', 'updated_at']
    fieldsets = (
        ('User', {
            'fields': ('user',)
        }),
        ('Basic Information', {
            'fields': (
                'bio',
                'current_title',
                'current_company',
                'years_of_experience',
            )
        }),
        ('Social Links', {
            'fields': (
                'linkedin_url',
                'github_url',
                'portfolio_url',
                'twitter_url',
            )
        }),
        ('Resume', {
            'fields': (
                'resume',
                'resume_text',
                'resume_parsed_data',
            ),
            'classes': ('collapse',)
        }),
        ('Career Goals', {
            'fields': (
                'career_goal',
                'target_roles',
            )
        }),
        ('Industry & Domain', {
            'fields': (
                'industry',
                'domain_expertise',
            )
        }),
        ('Timestamps', {
            'fields': (
                'created_at',
                'updated_at',
            )
        }),
    )
    inlines = [EducationInline, WorkExperienceInline, ProjectInline, CertificationInline]
    ordering = ['-created_at']


@admin.register(Education)
class EducationAdmin(admin.ModelAdmin):
    """
    Admin interface for Education model
    """
    list_display = [
        'get_user',
        'institution',
        'degree',
        'degree_level',
        'field_of_study',
        'start_date',
        'end_date',
        'is_current',
    ]
    list_filter = [
        'degree_level',
        'is_current',
        'start_date',
    ]
    search_fields = [
        'profile__user__email',
        'institution',
        'degree',
        'field_of_study',
    ]
    readonly_fields = ['created_at', 'updated_at']
    ordering = ['-start_date']

    def get_user(self, obj):
        return obj.profile.user.email
    get_user.short_description = 'User'


@admin.register(WorkExperience)
class WorkExperienceAdmin(admin.ModelAdmin):
    """
    Admin interface for WorkExperience model
    """
    list_display = [
        'get_user',
        'job_title',
        'company',
        'employment_type',
        'start_date',
        'end_date',
        'is_current',
        'is_remote',
    ]
    list_filter = [
        'employment_type',
        'is_current',
        'is_remote',
        'start_date',
    ]
    search_fields = [
        'profile__user__email',
        'job_title',
        'company',
        'description',
    ]
    readonly_fields = ['created_at', 'updated_at']
    filter_horizontal = ['skills_used']
    ordering = ['-start_date']

    def get_user(self, obj):
        return obj.profile.user.email
    get_user.short_description = 'User'


@admin.register(Project)
class ProjectAdmin(admin.ModelAdmin):
    """
    Admin interface for Project model
    """
    list_display = [
        'get_user',
        'title',
        'project_type',
        'start_date',
        'end_date',
        'is_ongoing',
    ]
    list_filter = [
        'project_type',
        'is_ongoing',
        'start_date',
    ]
    search_fields = [
        'profile__user__email',
        'title',
        'description',
    ]
    readonly_fields = ['created_at', 'updated_at']
    filter_horizontal = ['skills_demonstrated']
    ordering = ['-start_date']

    def get_user(self, obj):
        return obj.profile.user.email
    get_user.short_description = 'User'


@admin.register(Certification)
class CertificationAdmin(admin.ModelAdmin):
    """
    Admin interface for Certification model
    """
    list_display = [
        'get_user',
        'name',
        'issuing_organization',
        'issue_date',
        'expiry_date',
        'does_not_expire',
    ]
    list_filter = [
        'does_not_expire',
        'issue_date',
        'issuing_organization',
    ]
    search_fields = [
        'profile__user__email',
        'name',
        'issuing_organization',
        'credential_id',
    ]
    readonly_fields = ['created_at', 'updated_at']
    filter_horizontal = ['skills_validated']
    ordering = ['-issue_date']

    def get_user(self, obj):
        return obj.profile.user.email
    get_user.short_description = 'User'


@admin.register(SkillCategory)
class SkillCategoryAdmin(admin.ModelAdmin):
    """
    Admin interface for SkillCategory model
    """
    list_display = ['name', 'parent_category', 'created_at']
    list_filter = ['parent_category', 'created_at']
    search_fields = ['name', 'description']
    readonly_fields = ['created_at', 'updated_at']
    ordering = ['name']


@admin.register(Skill)
class SkillAdmin(admin.ModelAdmin):
    """
    Admin interface for Skill model
    """
    list_display = ['name', 'category', 'skill_type', 'is_verified', 'usage_count', 'created_at']
    list_filter = ['skill_type', 'is_verified', 'category', 'created_at']
    search_fields = ['name', 'description']
    readonly_fields = ['created_at', 'updated_at', 'usage_count']
    ordering = ['name']


@admin.register(UserSkill)
class UserSkillAdmin(admin.ModelAdmin):
    """
    Admin interface for UserSkill model
    """
    list_display = [
        'get_user',
        'skill',
        'proficiency_level',
        'years_of_experience',
        'is_verified',
        'created_at',
    ]
    list_filter = [
        'proficiency_level',
        'is_verified',
        'created_at',
    ]
    search_fields = [
        'profile__user__email',
        'profile__user__first_name',
        'profile__user__last_name',
        'skill__name',
    ]
    readonly_fields = ['created_at', 'updated_at']
    ordering = ['-created_at']

    def get_user(self, obj):
        return obj.profile.user.email
    get_user.short_description = 'User'


@admin.register(AssessmentQuestion)
class AssessmentQuestionAdmin(admin.ModelAdmin):
    """
    Admin interface for AssessmentQuestion model
    """
    list_display = [
        'skill',
        'level',
        'question_type',
        'points',
        'time_limit_seconds',
        'is_active',
        'created_at',
    ]
    list_filter = [
        'skill',
        'level',
        'question_type',
        'is_active',
        'created_at',
    ]
    search_fields = [
        'skill__name',
        'question_text',
        'explanation',
    ]
    readonly_fields = ['created_at', 'updated_at']
    ordering = ['skill', 'level', '-created_at']
    fieldsets = (
        ('Question Details', {
            'fields': (
                'skill',
                'level',
                'question_type',
                'is_active',
            )
        }),
        ('Content', {
            'fields': (
                'question_text',
                'code_snippet',
                'options',
                'correct_answer',
                'explanation',
            )
        }),
        ('Settings', {
            'fields': (
                'points',
                'time_limit_seconds',
            )
        }),
        ('Timestamps', {
            'fields': (
                'created_at',
                'updated_at',
            )
        }),
    )


@admin.register(SkillAssessment)
class SkillAssessmentAdmin(admin.ModelAdmin):
    """
    Admin interface for SkillAssessment model
    """
    list_display = [
        'get_user',
        'skill',
        'level',
        'status',
        'percentage_score',
        'questions_answered',
        'total_questions',
        'attempt_number',
        'started_at',
    ]
    list_filter = [
        'status',
        'level',
        'started_at',
        'completed_at',
    ]
    search_fields = [
        'user__email',
        'user__first_name',
        'user__last_name',
        'skill__name',
    ]
    readonly_fields = [
        'started_at',
        'created_at',
        'updated_at',
        'percentage_score',
        'points_earned',
        'total_points',
    ]
    ordering = ['-started_at']
    fieldsets = (
        ('Assessment Info', {
            'fields': (
                'user',
                'skill',
                'level',
                'status',
                'attempt_number',
                'previous_assessment',
            )
        }),
        ('Timing', {
            'fields': (
                'started_at',
                'completed_at',
                'expires_at',
                'time_spent_seconds',
            )
        }),
        ('Scoring', {
            'fields': (
                'total_questions',
                'questions_answered',
                'total_points',
                'points_earned',
                'percentage_score',
                'passing_score',
            )
        }),
        ('Timestamps', {
            'fields': (
                'created_at',
                'updated_at',
            )
        }),
    )

    def get_user(self, obj):
        return obj.user.email
    get_user.short_description = 'User'


@admin.register(AssessmentAnswer)
class AssessmentAnswerAdmin(admin.ModelAdmin):
    """
    Admin interface for AssessmentAnswer model
    """
    list_display = [
        'get_user',
        'get_skill',
        'question',
        'is_correct',
        'points_earned',
        'time_taken_seconds',
        'answered_at',
    ]
    list_filter = [
        'is_correct',
        'answered_at',
    ]
    search_fields = [
        'assessment__user__email',
        'assessment__skill__name',
        'question__question_text',
    ]
    readonly_fields = ['answered_at']
    ordering = ['-answered_at']

    def get_user(self, obj):
        return obj.assessment.user.email
    get_user.short_description = 'User'

    def get_skill(self, obj):
        return obj.assessment.skill.name
    get_skill.short_description = 'Skill'


@admin.register(SkillLevelCertificate)
class SkillLevelCertificateAdmin(admin.ModelAdmin):
    """
    Admin interface for SkillLevelCertificate model
    """
    list_display = [
        'get_user',
        'skill',
        'level',
        'certificate_id',
        'score_achieved',
        'is_active',
        'issued_at',
    ]
    list_filter = [
        'level',
        'is_active',
        'issued_at',
    ]
    search_fields = [
        'user__email',
        'user__first_name',
        'user__last_name',
        'skill__name',
        'certificate_id',
    ]
    readonly_fields = [
        'certificate_id',
        'issued_at',
        'created_at',
        'updated_at',
    ]
    ordering = ['-issued_at']
    fieldsets = (
        ('Certificate Info', {
            'fields': (
                'user',
                'skill',
                'level',
                'assessment',
                'certificate_id',
            )
        }),
        ('Score', {
            'fields': (
                'score_achieved',
            )
        }),
        ('Validity', {
            'fields': (
                'is_active',
                'issued_at',
                'expires_at',
            )
        }),
        ('Timestamps', {
            'fields': (
                'created_at',
                'updated_at',
            )
        }),
    )

    def get_user(self, obj):
        return obj.user.email
    get_user.short_description = 'User'
