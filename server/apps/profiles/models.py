"""
Profile models for SkillSetz platform
"""

from django.db import models
from django.utils.translation import gettext_lazy as _
from apps.users.models import User


class UserProfile(models.Model):
    """
    Detailed user profile information
    """

    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name="profile")

    # Basic Info
    bio = models.TextField(blank=True)
    current_title = models.CharField(max_length=255, blank=True)
    current_company = models.CharField(max_length=255, blank=True)
    years_of_experience = models.DecimalField(max_digits=4, decimal_places=1, default=0)

    # Social Links
    linkedin_url = models.URLField(blank=True, default="")
    github_url = models.URLField(blank=True, default="")
    portfolio_url = models.URLField(blank=True, default="")
    twitter_url = models.URLField(blank=True, default="")

    # Documents
    resume = models.FileField(upload_to="resumes/", null=True, blank=True)
    resume_text = models.TextField(blank=True)  # Extracted text from resume
    resume_parsed_data = models.JSONField(default=dict, blank=True)

    # Career Goals
    career_goal = models.TextField(blank=True)
    target_roles = models.JSONField(default=list, blank=True)

    # Industry & Domain
    industry = models.CharField(max_length=100, blank=True)
    domain_expertise = models.JSONField(default=list, blank=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "user_profiles"
        verbose_name = _("User Profile")
        verbose_name_plural = _("User Profiles")

    def __str__(self):
        return f"Profile of {self.user.email}"


class Education(models.Model):
    """
    Education records for users
    """

    class DegreeLevel(models.TextChoices):
        HIGH_SCHOOL = "HIGH_SCHOOL", _("High School")
        ASSOCIATE = "ASSOCIATE", _("Associate Degree")
        BACHELOR = "BACHELOR", _("Bachelor's Degree")
        MASTER = "MASTER", _("Master's Degree")
        PHD = "PHD", _("PhD")
        CERTIFICATE = "CERTIFICATE", _("Certificate")
        BOOTCAMP = "BOOTCAMP", _("Bootcamp")

    profile = models.ForeignKey(
        UserProfile, on_delete=models.CASCADE, related_name="education_records"
    )

    institution = models.CharField(max_length=255)
    degree = models.CharField(max_length=255)
    degree_level = models.CharField(max_length=20, choices=DegreeLevel.choices)
    field_of_study = models.CharField(max_length=255, blank=True, default="")

    start_date = models.DateField()
    end_date = models.DateField(null=True, blank=True)
    is_current = models.BooleanField(default=False)

    grade = models.CharField(max_length=50, blank=True)  # GPA or percentage
    description = models.TextField(blank=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "education"
        verbose_name = _("Education")
        verbose_name_plural = _("Education Records")
        ordering = ["-start_date"]

    def __str__(self):
        return f"{self.degree} from {self.institution}"


class WorkExperience(models.Model):
    """
    Work experience records for users
    """

    class EmploymentType(models.TextChoices):
        FULL_TIME = "FULL_TIME", _("Full-time")
        PART_TIME = "PART_TIME", _("Part-time")
        CONTRACT = "CONTRACT", _("Contract")
        FREELANCE = "FREELANCE", _("Freelance")
        INTERNSHIP = "INTERNSHIP", _("Internship")

    profile = models.ForeignKey(
        UserProfile, on_delete=models.CASCADE, related_name="work_experiences"
    )

    job_title = models.CharField(max_length=255)
    company = models.CharField(max_length=255)
    employment_type = models.CharField(
        max_length=20, choices=EmploymentType.choices, default=EmploymentType.FULL_TIME
    )

    location = models.CharField(max_length=255, blank=True, default="")
    is_remote = models.BooleanField(default=False)

    start_date = models.DateField()
    end_date = models.DateField(null=True, blank=True)
    is_current = models.BooleanField(default=False)

    description = models.TextField(blank=True, default="")
    responsibilities = models.JSONField(default=list, blank=True)
    achievements = models.JSONField(default=list, blank=True)

    # Skills used in this role
    skills_used = models.ManyToManyField(
        "Skill", related_name="work_experiences", blank=True
    )

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "work_experiences"
        verbose_name = _("Work Experience")
        verbose_name_plural = _("Work Experiences")
        ordering = ["-start_date"]

    def __str__(self):
        return f"{self.job_title} at {self.company}"


class Project(models.Model):
    """
    User projects (personal, work, or academic)
    """

    class ProjectType(models.TextChoices):
        PERSONAL = "PERSONAL", _("Personal")
        WORK = "WORK", _("Work")
        ACADEMIC = "ACADEMIC", _("Academic")
        OPEN_SOURCE = "OPEN_SOURCE", _("Open Source")

    profile = models.ForeignKey(
        UserProfile, on_delete=models.CASCADE, related_name="projects"
    )

    title = models.CharField(max_length=255)
    project_type = models.CharField(
        max_length=20, choices=ProjectType.choices, default=ProjectType.PERSONAL
    )

    description = models.TextField(blank=True, default="")
    technologies_used = models.JSONField(default=list, blank=True)

    project_url = models.URLField(blank=True, default="")
    github_url = models.URLField(blank=True, default="")
    demo_url = models.URLField(blank=True, default="")

    start_date = models.DateField()
    end_date = models.DateField(null=True, blank=True)
    is_ongoing = models.BooleanField(default=False)

    # Skills demonstrated in this project
    skills_demonstrated = models.ManyToManyField(
        "Skill", related_name="projects", blank=True
    )

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "projects"
        verbose_name = _("Project")
        verbose_name_plural = _("Projects")
        ordering = ["-start_date"]

    def __str__(self):
        return self.title


class Certification(models.Model):
    """
    Professional certifications
    """

    profile = models.ForeignKey(
        UserProfile, on_delete=models.CASCADE, related_name="certifications"
    )

    name = models.CharField(max_length=255)
    issuing_organization = models.CharField(max_length=255)
    credential_id = models.CharField(max_length=255, blank=True)
    credential_url = models.URLField(blank=True)

    issue_date = models.DateField()
    expiry_date = models.DateField(null=True, blank=True)
    does_not_expire = models.BooleanField(default=False)

    # Skills validated by this certification
    skills_validated = models.ManyToManyField(
        "Skill", related_name="certifications", blank=True
    )

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "certifications"
        verbose_name = _("Certification")
        verbose_name_plural = _("Certifications")
        ordering = ["-issue_date"]

    def __str__(self):
        return f"{self.name} from {self.issuing_organization}"


class SkillCategory(models.Model):
    """
    Categories for organizing skills
    """

    name = models.CharField(max_length=100, unique=True)
    description = models.TextField(blank=True)
    parent_category = models.ForeignKey(
        "self", on_delete=models.SET_NULL, null=True, blank=True, related_name="subcategories"
    )

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "skill_categories"
        verbose_name = _("Skill Category")
        verbose_name_plural = _("Skill Categories")
        ordering = ["name"]

    def __str__(self):
        return self.name


class Skill(models.Model):
    """
    Master skills database
    """

    class SkillType(models.TextChoices):
        TECHNICAL = "TECHNICAL", _("Technical Skill")
        SOFT = "SOFT", _("Soft Skill")
        LANGUAGE = "LANGUAGE", _("Language")
        TOOL = "TOOL", _("Tool/Software")
        FRAMEWORK = "FRAMEWORK", _("Framework/Library")
        DOMAIN = "DOMAIN", _("Domain Knowledge")

    name = models.CharField(max_length=255, unique=True, db_index=True)
    category = models.ForeignKey(
        SkillCategory, on_delete=models.SET_NULL, null=True, blank=True, related_name="skills"
    )
    skill_type = models.CharField(
        max_length=20, choices=SkillType.choices, default=SkillType.TECHNICAL
    )
    description = models.TextField(blank=True)

    # Metadata
    is_verified = models.BooleanField(default=False)
    usage_count = models.IntegerField(default=0)  # Track how many users have this skill

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "skills"
        verbose_name = _("Skill")
        verbose_name_plural = _("Skills")
        ordering = ["name"]

    def __str__(self):
        return self.name


class UserSkill(models.Model):
    """
    User's skills with proficiency levels
    """

    class ProficiencyLevel(models.TextChoices):
        BEGINNER = "BEGINNER", _("Beginner")
        INTERMEDIATE = "INTERMEDIATE", _("Intermediate")
        ADVANCED = "ADVANCED", _("Advanced")
        EXPERT = "EXPERT", _("Expert")

    profile = models.ForeignKey(
        UserProfile, on_delete=models.CASCADE, related_name="user_skills"
    )
    skill = models.ForeignKey(Skill, on_delete=models.CASCADE, related_name="user_skills")

    proficiency_level = models.CharField(
        max_length=20, choices=ProficiencyLevel.choices, default=ProficiencyLevel.INTERMEDIATE
    )
    years_of_experience = models.DecimalField(max_digits=4, decimal_places=1, default=0)

    # Validation
    is_verified = models.BooleanField(default=False)
    verified_by = models.CharField(max_length=255, blank=True)  # Certification, endorsement, etc.

    # Metadata
    last_used = models.DateField(null=True, blank=True)
    notes = models.TextField(blank=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "user_skills"
        verbose_name = _("User Skill")
        verbose_name_plural = _("User Skills")
        unique_together = ["profile", "skill"]
        ordering = ["-proficiency_level", "-years_of_experience"]

    def __str__(self):
        return f"{self.skill.name} ({self.proficiency_level})"


class AssessmentQuestion(models.Model):
    """
    Pre-built questions for skill assessments
    """

    class QuestionType(models.TextChoices):
        MULTIPLE_CHOICE = "MULTIPLE_CHOICE", _("Multiple Choice")
        TRUE_FALSE = "TRUE_FALSE", _("True/False")
        CODE_SNIPPET = "CODE_SNIPPET", _("Code Snippet")
        SCENARIO = "SCENARIO", _("Scenario-based")

    class DifficultyLevel(models.TextChoices):
        LEVEL_1 = "LEVEL_1", _("Level 1 - Beginner")
        LEVEL_2 = "LEVEL_2", _("Level 2 - Intermediate")
        LEVEL_3 = "LEVEL_3", _("Level 3 - Advanced")
        LEVEL_4 = "LEVEL_4", _("Level 4 - Expert")
        LEVEL_5 = "LEVEL_5", _("Level 5 - Master")

    skill = models.ForeignKey(
        Skill, on_delete=models.CASCADE, related_name="assessment_questions"
    )
    level = models.CharField(max_length=20, choices=DifficultyLevel.choices)
    question_type = models.CharField(max_length=20, choices=QuestionType.choices)

    # Question content
    question_text = models.TextField()
    code_snippet = models.TextField(blank=True)  # For code-based questions
    options = models.JSONField(default=list)  # List of answer options
    correct_answer = models.TextField()  # Correct answer or answer key
    explanation = models.TextField(blank=True)  # Explanation shown after answering

    # Metadata
    points = models.IntegerField(default=10)  # Points for this question
    time_limit_seconds = models.IntegerField(default=120)  # Time limit per question
    is_active = models.BooleanField(default=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "assessment_questions"
        verbose_name = _("Assessment Question")
        verbose_name_plural = _("Assessment Questions")
        indexes = [
            models.Index(fields=["skill", "level"]),
            models.Index(fields=["is_active"]),
        ]

    def __str__(self):
        return f"{self.skill.name} - {self.level} - {self.question_type}"


class SkillAssessment(models.Model):
    """
    User's assessment attempts for a specific skill level
    """

    class AssessmentStatus(models.TextChoices):
        IN_PROGRESS = "IN_PROGRESS", _("In Progress")
        COMPLETED = "COMPLETED", _("Completed")
        PASSED = "PASSED", _("Passed")
        FAILED = "FAILED", _("Failed")
        EXPIRED = "EXPIRED", _("Expired")

    user = models.ForeignKey(
        User, on_delete=models.CASCADE, related_name="skill_assessments"
    )
    skill = models.ForeignKey(
        Skill, on_delete=models.CASCADE, related_name="assessments"
    )
    level = models.CharField(
        max_length=20, choices=AssessmentQuestion.DifficultyLevel.choices
    )

    # Assessment metadata
    status = models.CharField(
        max_length=20,
        choices=AssessmentStatus.choices,
        default=AssessmentStatus.IN_PROGRESS,
    )
    started_at = models.DateTimeField(auto_now_add=True)
    completed_at = models.DateTimeField(null=True, blank=True)
    expires_at = models.DateTimeField(
        null=True, blank=True
    )  # Time limit for completion

    # Scoring
    total_questions = models.IntegerField(default=0)
    questions_answered = models.IntegerField(default=0)
    total_points = models.IntegerField(default=0)
    points_earned = models.IntegerField(default=0)
    percentage_score = models.DecimalField(
        max_digits=5, decimal_places=2, default=0
    )
    passing_score = models.DecimalField(
        max_digits=5, decimal_places=2, default=70.00
    )  # 70% to pass

    # Time tracking
    time_spent_seconds = models.IntegerField(default=0)

    # Retake tracking
    attempt_number = models.IntegerField(default=1)
    previous_assessment = models.ForeignKey(
        "self",
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="retakes",
    )

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "skill_assessments"
        verbose_name = _("Skill Assessment")
        verbose_name_plural = _("Skill Assessments")
        ordering = ["-started_at"]
        indexes = [
            models.Index(fields=["user", "skill", "level"]),
            models.Index(fields=["status"]),
        ]

    def __str__(self):
        return f"{self.user.email} - {self.skill.name} ({self.level}) - {self.status}"


class AssessmentAnswer(models.Model):
    """
    User's answers for assessment questions
    """

    assessment = models.ForeignKey(
        SkillAssessment, on_delete=models.CASCADE, related_name="answers"
    )
    question = models.ForeignKey(
        AssessmentQuestion, on_delete=models.CASCADE, related_name="user_answers"
    )

    # Answer data
    user_answer = models.TextField()
    is_correct = models.BooleanField(default=False)
    points_earned = models.IntegerField(default=0)

    # Timing
    time_taken_seconds = models.IntegerField(default=0)
    answered_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "assessment_answers"
        verbose_name = _("Assessment Answer")
        verbose_name_plural = _("Assessment Answers")
        unique_together = ["assessment", "question"]

    def __str__(self):
        return f"{self.assessment.user.email} - Q{self.question.id} - {'✓' if self.is_correct else '✗'}"


class SkillLevelCertificate(models.Model):
    """
    Certificates awarded for passing assessments
    """

    user = models.ForeignKey(
        User, on_delete=models.CASCADE, related_name="skill_certificates"
    )
    skill = models.ForeignKey(
        Skill, on_delete=models.CASCADE, related_name="certificates"
    )
    level = models.CharField(
        max_length=20, choices=AssessmentQuestion.DifficultyLevel.choices
    )
    assessment = models.OneToOneField(
        SkillAssessment, on_delete=models.CASCADE, related_name="certificate"
    )

    # Certificate details
    certificate_id = models.CharField(
        max_length=100, unique=True, db_index=True
    )  # UUID-based
    score_achieved = models.DecimalField(max_digits=5, decimal_places=2)
    issued_at = models.DateTimeField(auto_now_add=True)

    # Validity
    is_active = models.BooleanField(default=True)
    expires_at = models.DateTimeField(null=True, blank=True)  # Optional expiry

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "skill_level_certificates"
        verbose_name = _("Skill Level Certificate")
        verbose_name_plural = _("Skill Level Certificates")
        unique_together = ["user", "skill", "level"]
        ordering = ["-issued_at"]

    def __str__(self):
        return f"{self.user.email} - {self.skill.name} ({self.level}) - {self.certificate_id}"
