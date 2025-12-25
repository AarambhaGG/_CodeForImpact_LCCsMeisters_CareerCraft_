"""
Streaming services for job analysis with real-time updates
"""

import json
import os
from typing import Dict, Any, Generator, Optional
from decimal import Decimal

from langchain_openai import ChatOpenAI
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.prompts import ChatPromptTemplate

from apps.users.models import User
from .models import Job, JobEligibilityAnalysis
from .services import JobEligibilityAnalyzer


class StreamingJobAnalyzer(JobEligibilityAnalyzer):
    """
    Extended analyzer that supports streaming responses with progressive metrics
    """

    def __init__(self, model_name: str = None):
        """Initialize with streaming support"""
        super().__init__(model_name)

    def stream_analyze_eligibility(
        self,
        user: User,
        job: Job,
        additional_context: str = ""
    ) -> Generator[Dict[str, Any], None, JobEligibilityAnalysis]:
        """
        Perform streaming job eligibility analysis with progressive updates

        Args:
            user: User to analyze
            job: Job to analyze for
            additional_context: Additional context provided by user

        Yields:
            Dict containing progress updates:
            - type: 'status', 'partial_metric', 'partial_analysis', 'complete'
            - data: relevant data for each type

        Returns:
            Final JobEligibilityAnalysis instance
        """
        # Step 1: Emit gathering context status
        yield {
            'type': 'status',
            'step': 'gathering_context',
            'message': 'Gathering your profile information...',
            'progress': 10
        }

        # Gather context
        user_context = self._gather_user_context(user)
        job_context = self._gather_job_context(job)

        yield {
            'type': 'status',
            'step': 'context_gathered',
            'message': f'Analyzed {len(user_context.get("skills", []))} skills and {len(user_context.get("work_experience", []))} work experiences',
            'progress': 20
        }

        # Step 2: Create prompt
        yield {
            'type': 'status',
            'step': 'analyzing',
            'message': 'AI is analyzing your fit for this role...',
            'progress': 30
        }

        prompt = self._create_prompt(user_context, job_context, additional_context)

        # Step 3: Stream LLM response
        accumulated_content = ""
        chunk_count = 0

        try:
            # Use streaming invoke
            for chunk in self.llm.stream(prompt):
                chunk_count += 1
                content = chunk.content if hasattr(chunk, 'content') else str(chunk)
                accumulated_content += content

                # Emit partial content every 10 chunks
                if chunk_count % 10 == 0:
                    progress = min(30 + (chunk_count // 10), 80)
                    yield {
                        'type': 'partial_analysis',
                        'content': content,
                        'accumulated_length': len(accumulated_content),
                        'progress': progress
                    }

                # Try to parse partial JSON for metrics
                if chunk_count % 20 == 0:
                    try:
                        partial_metrics = self._extract_partial_metrics(accumulated_content)
                        if partial_metrics:
                            yield {
                                'type': 'partial_metric',
                                'metrics': partial_metrics,
                                'progress': min(40 + (chunk_count // 20) * 5, 85)
                            }
                    except:
                        pass

            # Step 4: Process complete response
            yield {
                'type': 'status',
                'step': 'processing',
                'message': 'Processing analysis results...',
                'progress': 90
            }

            # Parse final JSON response
            try:
                start_idx = accumulated_content.find("{")
                end_idx = accumulated_content.rfind("}") + 1
                if start_idx != -1 and end_idx > start_idx:
                    json_str = accumulated_content[start_idx:end_idx]
                    result = json.loads(json_str)
                else:
                    raise ValueError("No JSON found in response")
            except Exception as e:
                result = {
                    "eligibility_level": "FAIR",
                    "match_score": 50,
                    "analysis_summary": f"Analysis could not be parsed properly.",
                    "strengths": [],
                    "gaps": [],
                    "recommendations": [],
                    "matching_skills": [],
                    "missing_skills": [],
                    "experience_match": "Unable to parse experience match",
                }

            # Helper functions (reused from parent class)
            def to_decimal(value):
                if value and value != "null":
                    try:
                        return Decimal(str(value))
                    except:
                        return None
                return None

            def to_int(value, default=0):
                if value is not None and value != "null":
                    try:
                        return int(value)
                    except:
                        return default
                return default

            def ensure_list(value):
                if isinstance(value, list):
                    return value
                elif isinstance(value, str):
                    try:
                        parsed = json.loads(value)
                        return parsed if isinstance(parsed, list) else [value]
                    except:
                        return [value] if value else []
                return []

            # Extract all metrics
            exp_gap = to_decimal(result.get("experience_gap_years"))
            years_required = to_decimal(result.get("years_of_experience_required"))
            years_user = to_decimal(result.get("years_of_experience_user"))

            skills_match_score = to_int(result.get("skills_match_score"), 0)
            experience_match_score = to_int(result.get("experience_match_score"), 0)
            education_match_score = to_int(result.get("education_match_score"), 0)
            culture_fit_score = to_int(result.get("culture_fit_score"), 0)
            location_match_score = to_int(result.get("location_match_score"), 0)
            salary_match_score = to_int(result.get("salary_match_score"), 0)
            technical_skills_score = to_int(result.get("technical_skills_score"), 0)
            soft_skills_score = to_int(result.get("soft_skills_score"), 0)
            domain_knowledge_score = to_int(result.get("domain_knowledge_score"), 0)
            readiness_percentage = to_int(result.get("readiness_percentage"), 0)

            confidence_level = result.get("confidence_level", "MEDIUM")
            valid_confidence = ["VERY_HIGH", "HIGH", "MEDIUM", "LOW", "VERY_LOW"]
            if confidence_level not in valid_confidence:
                confidence_level = "MEDIUM"

            # Emit complete metrics
            yield {
                'type': 'metrics_complete',
                'metrics': {
                    'match_score': int(result.get("match_score", 50)),
                    'skills_match_score': skills_match_score,
                    'experience_match_score': experience_match_score,
                    'education_match_score': education_match_score,
                    'culture_fit_score': culture_fit_score,
                    'location_match_score': location_match_score,
                    'salary_match_score': salary_match_score,
                    'technical_skills_score': technical_skills_score,
                    'soft_skills_score': soft_skills_score,
                    'domain_knowledge_score': domain_knowledge_score,
                    'readiness_percentage': readiness_percentage,
                    'eligibility_level': result.get("eligibility_level", "FAIR"),
                },
                'progress': 95
            }

            # Step 5: Save to database
            analysis = JobEligibilityAnalysis.objects.create(
                user=user,
                job=job,
                additional_context=additional_context,
                eligibility_level=result.get("eligibility_level", "FAIR"),
                match_score=int(result.get("match_score", 50)),
                analysis_summary=result.get("analysis_summary", ""),
                strengths=ensure_list(result.get("strengths", [])),
                gaps=ensure_list(result.get("gaps", [])),
                recommendations=ensure_list(result.get("recommendations", [])),
                matching_skills=ensure_list(result.get("matching_skills", [])),
                missing_skills=ensure_list(result.get("missing_skills", [])),
                skill_gaps=ensure_list(result.get("skill_gaps", [])),
                skills_match_score=skills_match_score,
                experience_match_score=experience_match_score,
                education_match_score=education_match_score,
                culture_fit_score=culture_fit_score,
                location_match_score=location_match_score,
                salary_match_score=salary_match_score,
                technical_skills_score=technical_skills_score,
                soft_skills_score=soft_skills_score,
                domain_knowledge_score=domain_knowledge_score,
                experience_match=result.get("experience_match", ""),
                experience_gap_years=exp_gap,
                years_of_experience_required=years_required,
                years_of_experience_user=years_user,
                readiness_percentage=readiness_percentage,
                estimated_preparation_time=result.get("estimated_preparation_time", ""),
                confidence_level=confidence_level,
                next_steps=ensure_list(result.get("next_steps", [])),
                priority_improvements=ensure_list(result.get("priority_improvements", [])),
                learning_resources=ensure_list(result.get("learning_resources", [])),
                full_analysis=accumulated_content,
                llm_model=self.model_name,
                token_usage=0,
            )

            # Step 6: Emit completion
            yield {
                'type': 'complete',
                'analysis_id': analysis.id,
                'message': 'Analysis complete!',
                'progress': 100
            }

            return analysis

        except Exception as e:
            yield {
                'type': 'error',
                'error': str(e),
                'message': f'Analysis failed: {str(e)}'
            }
            raise

    def _extract_partial_metrics(self, content: str) -> Optional[Dict[str, int]]:
        """
        Extract partial metrics from incomplete JSON response

        Args:
            content: Partial JSON content

        Returns:
            Dictionary of metrics if found, None otherwise
        """
        try:
            # Try to find and parse score fields
            metrics = {}
            score_fields = [
                'match_score',
                'skills_match_score',
                'experience_match_score',
                'technical_skills_score',
                'readiness_percentage'
            ]

            for field in score_fields:
                # Look for patterns like "field_name": 85
                import re
                pattern = f'"{field}"\\s*:\\s*(\\d+)'
                match = re.search(pattern, content)
                if match:
                    metrics[field] = int(match.group(1))

            return metrics if metrics else None
        except:
            return None
