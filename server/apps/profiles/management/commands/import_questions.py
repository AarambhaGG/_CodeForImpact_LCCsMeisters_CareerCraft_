"""
Django management command to import assessment questions from JSON
"""
import json
from django.core.management.base import BaseCommand
from django.db import transaction
from apps.profiles.models import Skill, AssessmentQuestion


class Command(BaseCommand):
    help = 'Import assessment questions from JSON file'

    def add_arguments(self, parser):
        parser.add_argument(
            'json_file',
            type=str,
            help='Path to JSON file containing questions'
        )
        parser.add_argument(
            '--clear',
            action='store_true',
            help='Clear existing questions before importing'
        )

    def handle(self, *args, **options):
        json_file = options['json_file']
        clear_existing = options.get('clear', False)

        self.stdout.write(f'Loading questions from: {json_file}')

        try:
            with open(json_file, 'r') as f:
                data = json.load(f)
        except FileNotFoundError:
            self.stdout.write(self.style.ERROR(f'File not found: {json_file}'))
            return
        except json.JSONDecodeError as e:
            self.stdout.write(self.style.ERROR(f'Invalid JSON: {e}'))
            return

        if clear_existing:
            confirm = input('Are you sure you want to delete all existing questions? (yes/no): ')
            if confirm.lower() == 'yes':
                count = AssessmentQuestion.objects.all().count()
                AssessmentQuestion.objects.all().delete()
                self.stdout.write(self.style.WARNING(f'Deleted {count} existing questions'))

        # Import questions
        questions_created = 0
        questions_skipped = 0

        with transaction.atomic():
            for item in data:
                skill_name = item.get('skill')
                
                # Get or create skill
                try:
                    skill = Skill.objects.get(name__iexact=skill_name)
                except Skill.DoesNotExist:
                    # Create skill if it doesn't exist
                    skill = Skill.objects.create(
                        name=skill_name,
                        skill_type='TECHNICAL',
                        description=f'Auto-created skill for {skill_name}'
                    )
                    self.stdout.write(self.style.SUCCESS(f'Created skill: {skill_name}'))

                # Check if question already exists (avoid duplicates)
                exists = AssessmentQuestion.objects.filter(
                    skill=skill,
                    level=item.get('level'),
                    question_text=item.get('question_text')
                ).exists()

                if exists:
                    questions_skipped += 1
                    continue

                # Create question
                try:
                    AssessmentQuestion.objects.create(
                        skill=skill,
                        level=item.get('level'),
                        question_type=item.get('question_type'),
                        question_text=item.get('question_text'),
                        code_snippet=item.get('code_snippet', ''),
                        options=item.get('options', []),
                        correct_answer=item.get('correct_answer'),
                        explanation=item.get('explanation', ''),
                        points=item.get('points', 10),
                        time_limit_seconds=item.get('time_limit_seconds', 120),
                        is_active=item.get('is_active', True)
                    )
                    questions_created += 1
                except Exception as e:
                    self.stdout.write(self.style.ERROR(f'Error creating question: {e}'))
                    continue

        self.stdout.write(self.style.SUCCESS(
            f'\nImport complete!'
            f'\n✓ Questions created: {questions_created}'
            f'\n- Questions skipped (duplicates): {questions_skipped}'
        ))
