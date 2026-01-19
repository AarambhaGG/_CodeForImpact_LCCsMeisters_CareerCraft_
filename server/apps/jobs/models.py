"""
Jobs models for SkillSetz platform
"""

from django.db import models
from django.utils.translation import gettext_lazy as _
from apps.users.models import User


class Job(models.Model):
    """
    Job postings (both scraped and user-submitted)
    """

    class JobType(models.TextChoices):
        FULL_TIME = "FULL_TIME", _("Full-time")
        PART_TIME = "PART_TIME", _("Part-time")
        CONTRACT = "CONTRACT", _("Contract")
        FREELANCE = "FREELANCE", _("Freelance")
        INTERNSHIP = "INTERNSHIP", _("Internship")

    class ExperienceLevel(models.TextChoices):
        ENTRY = "ENTRY", _("Entry Level")
        JUNIOR = "JUNIOR", _("Junior")
        MID = "MID", _("Mid Level")
        SENIOR = "SENIOR", _("Senior")
        LEAD = "LEAD", _("Lead")
        MANAGER = "MANAGER", _("Manager")
        DIRECTOR = "DIRECTOR", _("Director")
        EXECUTIVE = "EXECUTIVE", _("Executive")

    class JobStatus(models.TextChoices):
        ACTIVE = "ACTIVE", _("Active")
        CLOSED = "CLOSED", _("Closed")
        FILLED = "FILLED", _("Filled")
        ON_HOLD = "ON_HOLD", _("On Hold")

    # Basic Info
    title = models.CharField(max_length=255, db_index=True)
    company_name = models.CharField(max_length=255)
    company_description = models.TextField()

    # Job Details
    description = models.TextField()
    responsibilities = models.TextField(blank=True)
    requirements = models.TextField(blank=True)
    nice_to_have = models.TextField(blank=True)

    job_type = models.CharField(
        max_length=20, choices=JobType.choices, default=JobType.FULL_TIME
    )
    experience_level = models.CharField(
        max_length=20, choices=ExperienceLevel.choices, default=ExperienceLevel.MID
    )

    # Location
    location = models.CharField(max_length=255)
    is_remote = models.BooleanField(default=False)
    remote_policy = models.CharField(
        max_length=20,
        choices=[
            ("REMOTE", "Fully Remote"),
            ("HYBRID", "Hybrid"),
            ("ONSITE", "On-site"),
        ],
        default="ONSITE",
    )

    # Salary
    salary_min = models.IntegerField(null=True, blank=True)
    salary_max = models.IntegerField(null=True, blank=True)
    salary_currency = models.CharField(max_length=3, default="USD")
    salary_period = models.CharField(
        max_length=20,
        choices=[
            ("HOURLY", "Hourly"),
            ("MONTHLY", "Monthly"),
            ("YEARLY", "Yearly"),
        ],
        default="YEARLY",
    )

    # Skills Required
    required_skills = models.ManyToManyField(
        "profiles.Skill", related_name="jobs_required", through="JobSkillRequirement"
    )

    # Parsed data from job description
    parsed_skills = models.JSONField(default=list, blank=True)
    parsed_requirements = models.JSONField(default=dict, blank=True)

    # Source
    source_url = models.URLField(unique=True)
    source_platform = models.CharField(
        max_length=100, blank=True
    )  # LinkedIn, Indeed, etc.

    # Metadata
    posted_date = models.DateField(null=True, blank=True)
    application_deadline = models.DateField(null=True, blank=True)

    status = models.CharField(
        max_length=20, choices=JobStatus.choices, default=JobStatus.ACTIVE
    )

    # Analytics
    view_count = models.IntegerField(default=0)
    application_count = models.IntegerField(default=0)

    # Added by user or scraped
    added_by = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="jobs_added",
    )

    is_scraped = models.BooleanField(default=False)
    last_scraped_at = models.DateTimeField(null=True, blank=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "jobs"
        verbose_name = _("Job")
        verbose_name_plural = _("Jobs")
        ordering = ["-created_at"]
        indexes = [
            models.Index(fields=["title", "company_name"]),
            models.Index(fields=["status", "-created_at"]),
            models.Index(fields=["experience_level"]),
        ]

    def __str__(self):
        return f"{self.title} at {self.company_name}"


class JobSkillRequirement(models.Model):
    """
    Through model for Job-Skill relationship with additional fields
    """

    class RequirementType(models.TextChoices):
        MUST_HAVE = "MUST_HAVE", _("Must Have")
        NICE_TO_HAVE = "NICE_TO_HAVE", _("Nice to Have")
        PREFERRED = "PREFERRED", _("Preferred")

    job = models.ForeignKey(
        Job, on_delete=models.CASCADE, related_name="skill_requirements"
    )
    skill = models.ForeignKey(
        "profiles.Skill", on_delete=models.CASCADE, related_name="job_requirements"
    )

    requirement_type = models.CharField(
        max_length=20,
        choices=RequirementType.choices,
        default=RequirementType.MUST_HAVE,
    )

    minimum_proficiency = models.CharField(
        max_length=20,
        choices=[
            ("BEGINNER", "Beginner"),
            ("INTERMEDIATE", "Intermediate"),
            ("ADVANCED", "Advanced"),
            ("EXPERT", "Expert"),
        ],
        default="INTERMEDIATE",
    )

    years_required = models.IntegerField(default=0)

    weight = models.IntegerField(default=1)  # Importance weight for matching

    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "job_skill_requirements"
        verbose_name = _("Job Skill Requirement")
        verbose_name_plural = _("Job Skill Requirements")
        unique_together = ["job", "skill"]

    def __str__(self):
        return f"{self.job.title} requires {self.skill.name} ({self.requirement_type})"


class JobEligibilityAnalysis(models.Model):
    """
    AI-powered job eligibility analysis for users
    """

    class EligibilityLevel(models.TextChoices):
        EXCELLENT = "EXCELLENT", _("Excellent Match")
        GOOD = "GOOD", _("Good Match")
        FAIR = "FAIR", _("Fair Match")
        POOR = "POOR", _("Poor Match")

    user = models.ForeignKey(
        User, on_delete=models.CASCADE, related_name="job_analyses"
    )
    job = models.ForeignKey(
        Job, on_delete=models.CASCADE, related_name="eligibility_analyses"
    )

    # Analysis Input
    additional_context = models.TextField(
        blank=True, help_text="Additional context provided by user"
    )

    # Analysis Results
    eligibility_level = models.CharField(
        max_length=20, choices=EligibilityLevel.choices
    )
    match_score = models.IntegerField(
        help_text="Overall match score (0-100)"
    )

    # Detailed Analysis
    analysis_summary = models.TextField(
        help_text="Overall summary of eligibility analysis"
    )
    strengths = models.JSONField(
        default=list, help_text="User's strengths for this job"
    )
    gaps = models.JSONField(
        default=list, help_text="Skill/experience gaps identified"
    )
    recommendations = models.JSONField(
        default=list, help_text="Recommendations for improving candidacy"
    )

    # Skills Analysis
    matching_skills = models.JSONField(
        default=list, help_text="Skills that match job requirements"
    )
    missing_skills = models.JSONField(
        default=list, help_text="Required skills user doesn't have"
    )
    skill_gaps = models.JSONField(
        default=list, help_text="Detailed skill gap analysis with severity and priority"
    )

    # Detailed Match Metrics (0-100 scores)
    skills_match_score = models.IntegerField(
        default=0, help_text="How well user's skills match job requirements (0-100)"
    )
    experience_match_score = models.IntegerField(
        default=0, help_text="How well user's experience matches job requirements (0-100)"
    )
    education_match_score = models.IntegerField(
        default=0, help_text="How well user's education matches job requirements (0-100)"
    )
    culture_fit_score = models.IntegerField(
        default=0, help_text="Estimated culture/values fit score (0-100)"
    )
    location_match_score = models.IntegerField(
        default=0, help_text="Location/remote preference match score (0-100)"
    )
    salary_match_score = models.IntegerField(
        default=0, help_text="Salary expectation vs offering match score (0-100)"
    )

    # Categorized Scores
    technical_skills_score = models.IntegerField(
        default=0, help_text="Technical skills match (0-100)"
    )
    soft_skills_score = models.IntegerField(
        default=0, help_text="Soft skills match (0-100)"
    )
    domain_knowledge_score = models.IntegerField(
        default=0, help_text="Domain/industry knowledge match (0-100)"
    )

    # Experience Analysis
    experience_match = models.TextField(
        blank=True, help_text="How user's experience matches job requirements"
    )
    experience_gap_years = models.DecimalField(
        max_digits=4, decimal_places=1, null=True, blank=True,
        help_text="Years of experience gap (if any)"
    )
    years_of_experience_required = models.DecimalField(
        max_digits=4, decimal_places=1, null=True, blank=True,
        help_text="Years of experience required by job"
    )
    years_of_experience_user = models.DecimalField(
        max_digits=4, decimal_places=1, null=True, blank=True,
        help_text="Years of experience user has"
    )

    # Readiness Metrics
    readiness_percentage = models.IntegerField(
        default=0, help_text="Overall readiness percentage (0-100)"
    )
    estimated_preparation_time = models.CharField(
        max_length=100, blank=True, help_text="Estimated time to become job-ready"
    )
    confidence_level = models.CharField(
        max_length=20,
        choices=[
            ("VERY_HIGH", "Very High"),
            ("HIGH", "High"),
            ("MEDIUM", "Medium"),
            ("LOW", "Low"),
            ("VERY_LOW", "Very Low"),
        ],
        default="MEDIUM",
        help_text="Confidence level for this match"
    )

    # Next Steps & Actionability
    next_steps = models.JSONField(
        default=list, help_text="Concrete next steps to improve candidacy"
    )
    priority_improvements = models.JSONField(
        default=list, help_text="Top 3-5 priority improvements ranked by impact"
    )
    learning_resources = models.JSONField(
        default=list, help_text="Recommended courses, certifications, or resources"
    )

    # Interview Preparation
    interview_questions = models.JSONField(
        default=list, help_text="Technical interview questions tailored to this job with detailed answers"
    )

    # Full AI Response
    full_analysis = models.TextField(
        help_text="Complete AI-generated analysis"
    )

    # Metadata
    analyzed_at = models.DateTimeField(auto_now_add=True)
    llm_model = models.CharField(
        max_length=100, default="gpt-4", help_text="LLM model used for analysis"
    )
    token_usage = models.IntegerField(
        default=0, help_text="Tokens used for this analysis"
    )

    class Meta:
        db_table = "job_eligibility_analyses"
        verbose_name = _("Job Eligibility Analysis")
        verbose_name_plural = _("Job Eligibility Analyses")
        ordering = ["-analyzed_at"]
        indexes = [
            models.Index(fields=["user", "-analyzed_at"]),
            models.Index(fields=["job", "-analyzed_at"]),
            models.Index(fields=["eligibility_level"]),
        ]
        unique_together = []  # Allow multiple analyses per user-job pair

    def __str__(self):
        return f"{self.user.email} - {self.job.title} ({self.eligibility_level})"