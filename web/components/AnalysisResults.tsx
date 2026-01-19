'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  CheckCircle2,
  XCircle,
  AlertCircle,
  TrendingUp,
  BookOpen,
  Lightbulb,
  Target,
  Clock,
  Sparkles,
  MessageSquare,
  ExternalLink,
  ChevronDown,
  ChevronUp
} from 'lucide-react';

interface AnalysisResultsProps {
  analysis: any;
  parsedJob: any;
  onAskQuestion?: () => void;
}

export function AnalysisResults({ analysis, parsedJob, onAskQuestion }: AnalysisResultsProps) {
  const [expandedQuestions, setExpandedQuestions] = useState<Set<number>>(new Set());

  if (!analysis) return null;

  const toggleQuestion = (index: number) => {
    setExpandedQuestions((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(index)) {
        newSet.delete(index);
      } else {
        newSet.add(index);
      }
      return newSet;
    });
  };

  const getEligibilityColor = (level: string) => {
    switch (level) {
      case 'EXCELLENT':
        return 'bg-green-100 dark:bg-green-950 text-green-700 dark:text-green-300 border-green-200 dark:border-green-800';
      case 'GOOD':
        return 'bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800';
      case 'FAIR':
        return 'bg-orange-100 dark:bg-orange-950 text-orange-700 dark:text-orange-300 border-orange-200 dark:border-orange-800';
      case 'POOR':
        return 'bg-red-100 dark:bg-red-950 text-red-700 dark:text-red-300 border-red-200 dark:border-red-800';
      default:
        return 'bg-slate-100 dark:bg-slate-950 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800';
    }
  };

  return (
    <div className="space-y-6">
      {/* Overall Summary */}
      <Card className="border-purple-100 dark:border-purple-900/50">
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="text-2xl">Analysis Complete!</CardTitle>
              <CardDescription className="mt-2 text-base">
                {analysis.analysis_summary}
              </CardDescription>
            </div>
            <Badge className={`text-lg px-4 py-2 ${getEligibilityColor(analysis.eligibility_level)}`}>
              {analysis.eligibility_level}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-6">
            <div className="text-center">
              <div className="text-4xl font-bold text-purple-600 dark:text-purple-400">
                {analysis.match_score}%
              </div>
              <div className="text-sm text-slate-600 dark:text-slate-400 mt-1">Overall Match</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-blue-600 dark:text-blue-400">
                {analysis.readiness_percentage}%
              </div>
              <div className="text-sm text-slate-600 dark:text-slate-400 mt-1">Job Ready</div>
            </div>
            {analysis.estimated_preparation_time && (
              <div className="text-center">
                <div className="flex items-center gap-2 text-orange-600 dark:text-orange-400">
                  <Clock className="h-6 w-6" />
                  <span className="text-2xl font-bold">{analysis.estimated_preparation_time}</span>
                </div>
                <div className="text-sm text-slate-600 dark:text-slate-400 mt-1">Prep Time</div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Strengths */}
      {analysis.strengths && analysis.strengths.length > 0 && (
        <Card className="border-green-100 dark:border-green-900/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-green-700 dark:text-green-300">
              <CheckCircle2 className="h-5 w-5" />
              Your Strengths ({analysis.strengths.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {analysis.strengths.map((strength: string, index: number) => (
                <li key={index} className="flex items-start gap-2">
                  <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400 shrink-0 mt-0.5" />
                  <span className="text-slate-700 dark:text-slate-300">{strength}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {/* Gaps */}
      {analysis.gaps && analysis.gaps.length > 0 && (
        <Card className="border-orange-100 dark:border-orange-900/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-orange-700 dark:text-orange-300">
              <AlertCircle className="h-5 w-5" />
              Areas to Improve ({analysis.gaps.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {analysis.gaps.map((gap: string, index: number) => (
                <li key={index} className="flex items-start gap-2">
                  <XCircle className="h-5 w-5 text-orange-600 dark:text-orange-400 shrink-0 mt-0.5" />
                  <span className="text-slate-700 dark:text-slate-300">{gap}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {/* Skills Analysis */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Matching Skills */}
        {analysis.matching_skills && analysis.matching_skills.length > 0 && (
          <Card className="border-blue-100 dark:border-blue-900/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-blue-700 dark:text-blue-300">
                <Target className="h-5 w-5" />
                Matching Skills ({analysis.matching_skills.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {analysis.matching_skills.map((skill: string, index: number) => (
                  <Badge key={index} className="bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300">
                    {skill}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Missing Skills */}
        {analysis.missing_skills && analysis.missing_skills.length > 0 && (
          <Card className="border-red-100 dark:border-red-900/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-red-700 dark:text-red-300">
                <AlertCircle className="h-5 w-5" />
                Skills to Learn ({analysis.missing_skills.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {analysis.missing_skills.map((skill: string, index: number) => (
                  <Badge key={index} className="bg-red-100 dark:bg-red-950 text-red-700 dark:text-red-300">
                    {skill}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Next Steps */}
      {analysis.next_steps && analysis.next_steps.length > 0 && (
        <Card className="border-purple-100 dark:border-purple-900/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-purple-700 dark:text-purple-300">
              <TrendingUp className="h-5 w-5" />
              Recommended Next Steps
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ol className="space-y-3">
              {analysis.next_steps.map((step: string, index: number) => (
                <li key={index} className="flex items-start gap-3">
                  <span className="flex items-center justify-center w-6 h-6 rounded-full bg-purple-100 dark:bg-purple-900/50 text-purple-700 dark:text-purple-300 text-sm font-bold shrink-0">
                    {index + 1}
                  </span>
                  <span className="text-slate-700 dark:text-slate-300 flex-1">{step}</span>
                </li>
              ))}
            </ol>
          </CardContent>
        </Card>
      )}

      {/* Learning Resources */}
      {analysis.learning_resources && analysis.learning_resources.length > 0 && (
        <Card className="border-blue-100 dark:border-blue-900/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-blue-700 dark:text-blue-300">
              <BookOpen className="h-5 w-5" />
              Recommended Learning Resources
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {analysis.learning_resources.map((resource: any, index: number) => (
                <div
                  key={index}
                  className="border border-slate-200 dark:border-slate-700 rounded-lg p-4 hover:border-blue-400 dark:hover:border-blue-600 transition-colors"
                >
                  <div className="flex items-start justify-between mb-2">
                    {resource.url ? (
                      <a
                        href={resource.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 flex items-center gap-2 group"
                      >
                        {resource.title}
                        <ExternalLink className="h-4 w-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                      </a>
                    ) : (
                      <h4 className="font-semibold text-slate-900 dark:text-white">{resource.title}</h4>
                    )}
                    <Badge className="bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 shrink-0 ml-2">
                      {resource.priority}
                    </Badge>
                  </div>
                  <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">
                    {resource.description}
                  </p>
                  <div className="flex items-center gap-4 text-xs text-slate-500 dark:text-slate-400">
                    <span className="flex items-center gap-1">
                      <BookOpen className="h-3 w-3" />
                      {resource.resource_type}
                    </span>
                    {resource.estimated_duration && (
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {resource.estimated_duration}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Interview Questions */}
      {analysis.interview_questions && (() => {
        try {
          const questions = typeof analysis.interview_questions === 'string'
            ? JSON.parse(analysis.interview_questions)
            : analysis.interview_questions;

          if (Array.isArray(questions) && questions.length > 0) {
            return (
              <Card className="border-emerald-100 dark:border-emerald-900/50">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-emerald-700 dark:text-emerald-300">
                    <MessageSquare className="h-5 w-5" />
                    Interview Questions
                  </CardTitle>
                  <CardDescription>
                    Practice these {questions.length} technical questions tailored to this role
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {questions.map((q: any, idx: number) => (
                      <div
                        key={idx}
                        className="border border-slate-200 dark:border-slate-700 rounded-lg overflow-hidden"
                      >
                        <button
                          onClick={() => toggleQuestion(idx)}
                          className="w-full text-left p-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors flex items-start justify-between gap-3"
                        >
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <span className="flex items-center justify-center w-6 h-6 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 font-semibold text-sm shrink-0">
                                {idx + 1}
                              </span>
                              <Badge
                                className={
                                  q.difficulty === 'hard'
                                    ? 'bg-red-100 dark:bg-red-950 text-red-700 dark:text-red-300'
                                    : q.difficulty === 'medium'
                                    ? 'bg-yellow-100 dark:bg-yellow-950 text-yellow-700 dark:text-yellow-300'
                                    : 'bg-green-100 dark:bg-green-950 text-green-700 dark:text-green-300'
                                }
                              >
                                {q.difficulty || 'medium'}
                              </Badge>
                            </div>
                            <p className="text-slate-800 dark:text-slate-200 font-medium">
                              {q.question}
                            </p>
                            {q.skills_tested && q.skills_tested.length > 0 && (
                              <div className="flex flex-wrap gap-1 mt-2">
                                {q.skills_tested.map((skill: string, skillIdx: number) => (
                                  <Badge
                                    key={skillIdx}
                                    variant="outline"
                                    className="text-xs"
                                  >
                                    {skill}
                                  </Badge>
                                ))}
                              </div>
                            )}
                          </div>
                          {expandedQuestions.has(idx) ? (
                            <ChevronUp className="h-5 w-5 text-slate-400 shrink-0 mt-1" />
                          ) : (
                            <ChevronDown className="h-5 w-5 text-slate-400 shrink-0 mt-1" />
                          )}
                        </button>

                        {expandedQuestions.has(idx) && (
                          <div className="p-4 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-200 dark:border-slate-700 space-y-4">
                            {q.why_asked && (
                              <div>
                                <h4 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">
                                  Why This Question?
                                </h4>
                                <p className="text-sm text-slate-600 dark:text-slate-400">
                                  {q.why_asked}
                                </p>
                              </div>
                            )}

                            {q.detailed_answer && (
                              <div>
                                <h4 className="text-sm font-semibold text-emerald-700 dark:text-emerald-300 mb-2">
                                  Suggested Answer
                                </h4>
                                <div className="prose prose-sm dark:prose-invert max-w-none">
                                  <p className="text-slate-700 dark:text-slate-300 whitespace-pre-line">
                                    {q.detailed_answer}
                                  </p>
                                </div>
                              </div>
                            )}

                            {q.key_points_to_cover && q.key_points_to_cover.length > 0 && (
                              <div>
                                <h4 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                                  Key Points to Cover
                                </h4>
                                <ul className="space-y-1">
                                  {q.key_points_to_cover.map((point: string, pointIdx: number) => (
                                    <li
                                      key={pointIdx}
                                      className="flex items-start gap-2 text-sm text-slate-600 dark:text-slate-400"
                                    >
                                      <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                                      <span>{point}</span>
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            )}

                            {q.common_mistakes && (
                              <div>
                                <h4 className="text-sm font-semibold text-red-700 dark:text-red-300 mb-1">
                                  Common Mistakes to Avoid
                                </h4>
                                <p className="text-sm text-slate-600 dark:text-slate-400">
                                  {q.common_mistakes}
                                </p>
                              </div>
                            )}

                            {q.follow_up_questions && q.follow_up_questions.length > 0 && (
                              <div>
                                <h4 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                                  Potential Follow-up Questions
                                </h4>
                                <ul className="space-y-1">
                                  {q.follow_up_questions.map((followUp: string, followUpIdx: number) => (
                                    <li
                                      key={followUpIdx}
                                      className="text-sm text-slate-600 dark:text-slate-400 flex items-start gap-2"
                                    >
                                      <span className="text-slate-400">•</span>
                                      <span>{followUp}</span>
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            );
          }
        } catch (e) {
          console.error('Failed to parse interview questions:', e);
        }
        return null;
      })()}

      {/* Recommendations */}
      {analysis.recommendations && analysis.recommendations.length > 0 && (
        <Card className="border-yellow-100 dark:border-yellow-900/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-yellow-700 dark:text-yellow-300">
              <Lightbulb className="h-5 w-5" />
              AI Recommendations
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {analysis.recommendations.map((recommendation: string, index: number) => (
                <li key={index} className="flex items-start gap-2">
                  <Lightbulb className="h-5 w-5 text-yellow-600 dark:text-yellow-400 shrink-0 mt-0.5" />
                  <span className="text-slate-700 dark:text-slate-300">{recommendation}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {/* Interactive Chat Section */}
      <Card className="border-purple-100 dark:border-purple-900/50">
        <CardHeader>
          <div className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5 text-purple-600 dark:text-purple-400" />
            <CardTitle>Discuss Your Analysis with AI</CardTitle>
          </div>
          <CardDescription>
            Share more context about your experience, ask questions about the analysis, or get personalized advice on how to improve your fit for this role.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {onAskQuestion && (
            <Button
              onClick={onAskQuestion}
              size="lg"
              className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
            >
              <Sparkles className="h-5 w-5 mr-2" />
              Start Conversation
            </Button>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
