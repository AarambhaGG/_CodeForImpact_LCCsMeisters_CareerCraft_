"""
Assessment service for skill verification
"""

import uuid
import random
from datetime import timedelta
from decimal import Decimal
from django.utils import timezone
from django.db.models import Q
from apps.profiles.models import (
    AssessmentQuestion,
    SkillAssessment,
    AssessmentAnswer,
    SkillLevelCertificate,
    UserSkill,
    Skill,
)


class AssessmentService:
    """
    Business logic for skill assessments
    """

    # Constants
    QUESTIONS_PER_LEVEL = 20
    PASSING_PERCENTAGE = Decimal("70.00")
    TIME_LIMIT_HOURS = 2

    # Level progression mapping
    LEVEL_ORDER = {
        "LEVEL_1": 1,
        "LEVEL_2": 2,
        "LEVEL_3": 3,
        "LEVEL_4": 4,
        "LEVEL_5": 5,
    }

    # Level to proficiency mapping
    LEVEL_TO_PROFICIENCY = {
        "LEVEL_1": "BEGINNER",
        "LEVEL_2": "INTERMEDIATE",
        "LEVEL_3": "ADVANCED",
        "LEVEL_4": "EXPERT",
        "LEVEL_5": "EXPERT",  # Both 4 and 5 map to EXPERT
    }

    def can_take_assessment(self, user, skill, level):
        """
        Check if user can take assessment at this level

        Args:
            user: User instance
            skill: Skill instance
            level: Level string (LEVEL_1 to LEVEL_5)

        Returns:
            tuple: (can_take: bool, reason: str)
        """
        # Level 1 is always available
        if level == "LEVEL_1":
            return True, "Level 1 is always available"

        # Check if previous level has been passed
        previous_level_num = self.LEVEL_ORDER[level] - 1
        previous_level = f"LEVEL_{previous_level_num}"

        # Look for a passed assessment at previous level
        previous_passed = SkillAssessment.objects.filter(
            user=user,
            skill=skill,
            level=previous_level,
            status=SkillAssessment.AssessmentStatus.PASSED,
        ).exists()

        if not previous_passed:
            return (
                False,
                f"You must pass {previous_level} before attempting {level}",
            )

        return True, f"{level} unlocked"

    def get_unlocked_levels(self, user, skill):
        """
        Get list of levels user can access for a skill

        Args:
            user: User instance
            skill: Skill instance

        Returns:
            list: List of unlocked level strings
        """
        unlocked = ["LEVEL_1"]  # Always unlocked

        # Check each level sequentially
        for level_num in range(2, 6):
            level = f"LEVEL_{level_num}"
            can_take, _ = self.can_take_assessment(user, skill, level)
            if can_take:
                unlocked.append(level)
            else:
                # If this level is locked, all higher levels are also locked
                break

        return unlocked

    def get_highest_passed_level(self, user, skill):
        """
        Get the highest level the user has passed for a skill

        Args:
            user: User instance
            skill: Skill instance

        Returns:
            str or None: Highest passed level or None
        """
        passed_assessments = SkillAssessment.objects.filter(
            user=user,
            skill=skill,
            status=SkillAssessment.AssessmentStatus.PASSED,
        ).order_by("-level")

        if passed_assessments.exists():
            # Sort by level number to get the highest
            highest = None
            highest_num = 0
            for assessment in passed_assessments:
                level_num = self.LEVEL_ORDER[assessment.level]
                if level_num > highest_num:
                    highest_num = level_num
                    highest = assessment.level
            return highest

        return None

    def create_assessment(self, user, skill, level):
        """
        Create new assessment with random questions

        Args:
            user: User instance
            skill: Skill instance
            level: Level string (LEVEL_1 to LEVEL_5)

        Returns:
            SkillAssessment instance

        Raises:
            ValueError: If insufficient questions or level locked
        """
        # Check if user can take this level
        can_take, reason = self.can_take_assessment(user, skill, level)
        if not can_take:
            raise ValueError(reason)

        # Get all active questions for this skill and level
        available_questions = AssessmentQuestion.objects.filter(
            skill=skill, level=level, is_active=True
        )

        if available_questions.count() < self.QUESTIONS_PER_LEVEL:
            raise ValueError(
                f"Insufficient questions available for {skill.name} - {level}. "
                f"Need {self.QUESTIONS_PER_LEVEL}, found {available_questions.count()}"
            )

        # Randomly select questions
        selected_questions = random.sample(
            list(available_questions), self.QUESTIONS_PER_LEVEL
        )

        # Calculate total points
        total_points = sum(q.points for q in selected_questions)

        # Check for previous attempts
        previous_attempts = SkillAssessment.objects.filter(
            user=user, skill=skill, level=level
        ).order_by("-started_at")

        attempt_number = 1
        previous_assessment = None
        if previous_attempts.exists():
            attempt_number = previous_attempts.first().attempt_number + 1
            previous_assessment = previous_attempts.first()

        # Create assessment
        assessment = SkillAssessment.objects.create(
            user=user,
            skill=skill,
            level=level,
            status=SkillAssessment.AssessmentStatus.IN_PROGRESS,
            total_questions=self.QUESTIONS_PER_LEVEL,
            total_points=total_points,
            expires_at=timezone.now() + timedelta(hours=self.TIME_LIMIT_HOURS),
            attempt_number=attempt_number,
            previous_assessment=previous_assessment,
        )

        # Store selected questions (we'll reference them when answering)
        # We don't create Answer records yet - they're created when user submits answers
        assessment.selected_question_ids = [q.id for q in selected_questions]

        return assessment

    def validate_answer(self, question, user_answer):
        """
        Validate user's answer against correct answer

        Args:
            question: AssessmentQuestion instance
            user_answer: User's answer as string

        Returns:
            tuple: (is_correct: bool, points_earned: int)
        """
        is_correct = False
        points_earned = 0

        # Normalize answers for comparison
        correct_answer = str(question.correct_answer).strip().lower()
        user_answer_normalized = str(user_answer).strip().lower()

        if question.question_type == AssessmentQuestion.QuestionType.MULTIPLE_CHOICE:
            # Exact match for multiple choice
            is_correct = user_answer_normalized == correct_answer

        elif question.question_type == AssessmentQuestion.QuestionType.TRUE_FALSE:
            # Boolean comparison
            is_correct = user_answer_normalized in [
                correct_answer,
                "true" if correct_answer == "true" else "false",
            ]

        elif question.question_type == AssessmentQuestion.QuestionType.CODE_SNIPPET:
            # For code, we do exact match (can be enhanced with code execution)
            is_correct = user_answer_normalized == correct_answer

        elif question.question_type == AssessmentQuestion.QuestionType.SCENARIO:
            # For scenarios, check if answer contains key points
            # This is a simple implementation - can be enhanced with NLP
            is_correct = correct_answer in user_answer_normalized

        # Award points if correct
        if is_correct:
            points_earned = question.points

        return is_correct, points_earned

    def submit_answer(self, assessment, question, user_answer, time_taken_seconds):
        """
        Submit answer for a question

        Args:
            assessment: SkillAssessment instance
            question: AssessmentQuestion instance
            user_answer: User's answer as string
            time_taken_seconds: Time taken to answer in seconds

        Returns:
            AssessmentAnswer instance

        Raises:
            ValueError: If assessment is not in progress or expired
        """
        # Check if assessment is still in progress
        if assessment.status != SkillAssessment.AssessmentStatus.IN_PROGRESS:
            raise ValueError("Assessment is not in progress")

        # Check if expired
        if assessment.expires_at and timezone.now() > assessment.expires_at:
            assessment.status = SkillAssessment.AssessmentStatus.EXPIRED
            assessment.save()
            raise ValueError("Assessment has expired")

        # Validate answer
        is_correct, points_earned = self.validate_answer(question, user_answer)

        # Create or update answer
        answer, created = AssessmentAnswer.objects.update_or_create(
            assessment=assessment,
            question=question,
            defaults={
                "user_answer": user_answer,
                "is_correct": is_correct,
                "points_earned": points_earned,
                "time_taken_seconds": time_taken_seconds,
            },
        )

        # Update assessment progress
        answered_count = AssessmentAnswer.objects.filter(assessment=assessment).count()
        total_earned = sum(
            AssessmentAnswer.objects.filter(assessment=assessment).values_list(
                "points_earned", flat=True
            )
        )
        total_time = sum(
            AssessmentAnswer.objects.filter(assessment=assessment).values_list(
                "time_taken_seconds", flat=True
            )
        )

        assessment.questions_answered = answered_count
        assessment.points_earned = total_earned
        assessment.time_spent_seconds = total_time
        assessment.save()

        return answer

    def calculate_final_score(self, assessment):
        """
        Calculate final score and determine pass/fail

        Args:
            assessment: SkillAssessment instance

        Returns:
            tuple: (percentage_score: Decimal, passed: bool)
        """
        if assessment.total_points == 0:
            return Decimal("0.00"), False

        percentage = (
            Decimal(assessment.points_earned) / Decimal(assessment.total_points)
        ) * Decimal("100")
        percentage = percentage.quantize(Decimal("0.01"))  # Round to 2 decimals

        passed = percentage >= self.PASSING_PERCENTAGE

        return percentage, passed

    def complete_assessment(self, assessment):
        """
        Complete the assessment and determine pass/fail

        Args:
            assessment: SkillAssessment instance

        Returns:
            SkillAssessment instance (updated)

        Raises:
            ValueError: If assessment is not in progress
        """
        if assessment.status != SkillAssessment.AssessmentStatus.IN_PROGRESS:
            raise ValueError("Assessment is not in progress")

        # Calculate final score
        percentage_score, passed = self.calculate_final_score(assessment)

        # Update assessment
        assessment.percentage_score = percentage_score
        assessment.completed_at = timezone.now()
        assessment.status = (
            SkillAssessment.AssessmentStatus.PASSED
            if passed
            else SkillAssessment.AssessmentStatus.FAILED
        )
        assessment.save()

        # If passed, award certificate and update UserSkill
        if passed:
            self.award_certificate(assessment)
            self.update_user_skill_verification(
                assessment.user, assessment.skill, assessment.level
            )

        return assessment

    def award_certificate(self, assessment):
        """
        Create certificate for passed assessment

        Args:
            assessment: SkillAssessment instance (must be PASSED)

        Returns:
            SkillLevelCertificate instance

        Raises:
            ValueError: If assessment didn't pass
        """
        if assessment.status != SkillAssessment.AssessmentStatus.PASSED:
            raise ValueError("Cannot award certificate for non-passed assessment")

        # Generate unique certificate ID
        certificate_id = f"CC-{assessment.skill.name[:3].upper()}-{assessment.level}-{uuid.uuid4().hex[:8].upper()}"

        # Create or update certificate
        certificate, created = SkillLevelCertificate.objects.update_or_create(
            user=assessment.user,
            skill=assessment.skill,
            level=assessment.level,
            defaults={
                "assessment": assessment,
                "certificate_id": certificate_id,
                "score_achieved": assessment.percentage_score,
                "is_active": True,
            },
        )

        return certificate

    def update_user_skill_verification(self, user, skill, level):
        """
        Update UserSkill with assessment verification

        Args:
            user: User instance
            skill: Skill instance
            level: Assessment level (LEVEL_1 to LEVEL_5)

        Returns:
            UserSkill instance
        """
        # Get user profile
        try:
            profile = user.profile
        except:
            raise ValueError("User does not have a profile")

        # Map level to proficiency
        proficiency = self.LEVEL_TO_PROFICIENCY.get(level, "INTERMEDIATE")

        # Get or create UserSkill
        user_skill, created = UserSkill.objects.get_or_create(
            profile=profile,
            skill=skill,
            defaults={
                "proficiency_level": proficiency,
                "is_verified": True,
                "verified_by": f"CareerCraft Assessment - {level}",
            },
        )

        if not created:
            # Update existing skill
            # Only update proficiency if new level is higher
            current_proficiency_order = {
                "BEGINNER": 1,
                "INTERMEDIATE": 2,
                "ADVANCED": 3,
                "EXPERT": 4,
            }
            new_level_value = current_proficiency_order.get(proficiency, 0)
            current_level_value = current_proficiency_order.get(
                user_skill.proficiency_level, 0
            )

            if new_level_value > current_level_value:
                user_skill.proficiency_level = proficiency

            user_skill.is_verified = True
            user_skill.verified_by = f"CareerCraft Assessment - {level}"
            user_skill.save()

        return user_skill

    def get_assessment_history(self, user, skill=None):
        """
        Get assessment history for user

        Args:
            user: User instance
            skill: Optional Skill instance to filter by

        Returns:
            QuerySet of SkillAssessment instances
        """
        queryset = SkillAssessment.objects.filter(user=user).select_related("skill")

        if skill:
            queryset = queryset.filter(skill=skill)

        return queryset.order_by("-started_at")

    def get_skill_progress(self, user, skill):
        """
        Get user's progress for a specific skill

        Args:
            user: User instance
            skill: Skill instance

        Returns:
            dict: Progress information
        """
        highest_passed = self.get_highest_passed_level(user, skill)
        unlocked_levels = self.get_unlocked_levels(user, skill)

        # Get best scores for each level
        level_scores = {}
        for level in ["LEVEL_1", "LEVEL_2", "LEVEL_3", "LEVEL_4", "LEVEL_5"]:
            best_assessment = (
                SkillAssessment.objects.filter(
                    user=user,
                    skill=skill,
                    level=level,
                    status=SkillAssessment.AssessmentStatus.PASSED,
                )
                .order_by("-percentage_score")
                .first()
            )
            if best_assessment:
                level_scores[level] = float(best_assessment.percentage_score)

        # Check for certificates
        certificates = SkillLevelCertificate.objects.filter(
            user=user, skill=skill, is_active=True
        )

        return {
            "skill": skill.name,
            "highest_passed_level": highest_passed,
            "unlocked_levels": unlocked_levels,
            "level_scores": level_scores,
            "certificates_count": certificates.count(),
            "total_attempts": SkillAssessment.objects.filter(
                user=user, skill=skill
            ).count(),
        }
