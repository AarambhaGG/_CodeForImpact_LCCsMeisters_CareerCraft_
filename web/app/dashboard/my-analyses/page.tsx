'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Cookies from 'js-cookie';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  FileText,
  Calendar,
  TrendingUp,
  Target,
  Clock,
  Sparkles,
  ChevronRight,
  Filter,
  Loader2,
  AlertCircle,
} from 'lucide-react';

interface Job {
  id: number;
  title: string;
  company_name: string;
  location: string;
  job_type: string;
  is_remote: boolean;
  remote_policy: string;
  experience_level: string;
  salary_min?: number;
  salary_max?: number;
  latest_analysis: {
    id: number;
    eligibility_level: 'EXCELLENT' | 'GOOD' | 'FAIR' | 'POOR';
    match_score: number;
    readiness_percentage: number;
    analyzed_at: string;
    analysis_summary: string;
  };
}

export default function MyAnalysesPage() {
  const router = useRouter();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<string>('all');

  useEffect(() => {
    fetchAnalyzedJobs();
  }, []);

  const fetchAnalyzedJobs = async () => {
    try {
      setIsLoading(true);
      const token = Cookies.get('access_token');
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

      // Build URL with filter if needed
      let url = `${apiUrl}/api/jobs/analyzed/`;
      if (filter !== 'all') {
        url += `?eligibility_level=${filter}`;
      }

      const response = await fetch(url, {
        headers: {
          'Authorization': token ? `Bearer ${token}` : '',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch analyzed jobs');
      }

      const data = await response.json();
      setJobs(data.results || data);
    } catch (err: any) {
      console.error('Error fetching analyzed jobs:', err);
      setError(err.message || 'Failed to load analyzed jobs');
    } finally {
      setIsLoading(false);
    }
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

  const getMatchScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600 dark:text-green-400';
    if (score >= 60) return 'text-blue-600 dark:text-blue-400';
    if (score >= 40) return 'text-orange-600 dark:text-orange-400';
    return 'text-red-600 dark:text-red-400';
  };

  // Re-fetch when filter changes
  useEffect(() => {
    if (filter) {
      fetchAnalyzedJobs();
    }
  }, [filter]);

  // Filter is now handled server-side, but calculate stats client-side
  // Filter out jobs without latest_analysis (safety check)
  const validJobs = jobs.filter((j) => j.latest_analysis);

  const stats = {
    total: validJobs.length,
    excellent: validJobs.filter((j) => j.latest_analysis.eligibility_level === 'EXCELLENT').length,
    good: validJobs.filter((j) => j.latest_analysis.eligibility_level === 'GOOD').length,
    fair: validJobs.filter((j) => j.latest_analysis.eligibility_level === 'FAIR').length,
    poor: validJobs.filter((j) => j.latest_analysis.eligibility_level === 'POOR').length,
    avgScore: validJobs.length > 0
      ? Math.round(validJobs.reduce((sum, j) => sum + j.latest_analysis.match_score, 0) / validJobs.length)
      : 0,
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-4xl font-bold text-slate-900 dark:text-white mb-3">
          Analyzed Jobs
        </h1>
        <p className="text-lg text-slate-600 dark:text-slate-400">
          View all jobs you've analyzed and track your match scores.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border-purple-100 dark:border-purple-900/50">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
                  Jobs Analyzed
                </p>
                <p className="text-3xl font-bold text-slate-900 dark:text-white mt-1">
                  {stats.total}
                </p>
              </div>
              <FileText className="h-10 w-10 text-purple-600 dark:text-purple-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-blue-100 dark:border-blue-900/50">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
                  Average Match
                </p>
                <p className="text-3xl font-bold text-slate-900 dark:text-white mt-1">
                  {stats.avgScore}%
                </p>
              </div>
              <TrendingUp className="h-10 w-10 text-blue-600 dark:text-blue-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-green-100 dark:border-green-900/50">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
                  Great Matches
                </p>
                <p className="text-3xl font-bold text-slate-900 dark:text-white mt-1">
                  {stats.excellent + stats.good}
                </p>
              </div>
              <Target className="h-10 w-10 text-green-600 dark:text-green-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Filter className="h-5 w-5" />
                Filter by Eligibility
              </CardTitle>
            </div>
            <Link href="/dashboard/dream-job-streaming">
              <Button className="bg-purple-600 hover:bg-purple-700">
                <Sparkles className="h-4 w-4 mr-2" />
                New Analysis
              </Button>
            </Link>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            <Button
              onClick={() => setFilter('all')}
              variant={filter === 'all' ? 'default' : 'outline'}
              size="sm"
            >
              All ({stats.total})
            </Button>
            <Button
              onClick={() => setFilter('EXCELLENT')}
              variant={filter === 'EXCELLENT' ? 'default' : 'outline'}
              size="sm"
              className={filter === 'EXCELLENT' ? 'bg-green-600 hover:bg-green-700' : ''}
            >
              Excellent ({stats.excellent})
            </Button>
            <Button
              onClick={() => setFilter('GOOD')}
              variant={filter === 'GOOD' ? 'default' : 'outline'}
              size="sm"
              className={filter === 'GOOD' ? 'bg-blue-600 hover:bg-blue-700' : ''}
            >
              Good ({stats.good})
            </Button>
            <Button
              onClick={() => setFilter('FAIR')}
              variant={filter === 'FAIR' ? 'default' : 'outline'}
              size="sm"
              className={filter === 'FAIR' ? 'bg-orange-600 hover:bg-orange-700' : ''}
            >
              Fair ({stats.fair})
            </Button>
            <Button
              onClick={() => setFilter('POOR')}
              variant={filter === 'POOR' ? 'default' : 'outline'}
              size="sm"
              className={filter === 'POOR' ? 'bg-red-600 hover:bg-red-700' : ''}
            >
              Poor ({stats.poor})
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Loading State */}
      {isLoading && (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/30 rounded-lg p-6 flex gap-3">
          <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400 shrink-0 mt-0.5" />
          <div>
            <p className="font-medium text-red-700 dark:text-red-300">Failed to Load Analyses</p>
            <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
            <Button
              onClick={fetchAnalyses}
              variant="outline"
              size="sm"
              className="mt-3"
            >
              Try Again
            </Button>
          </div>
        </div>
      )}

      {/* Jobs List */}
      {!isLoading && !error && validJobs.length === 0 && (
        <Card>
          <CardContent className="py-12">
            <div className="text-center space-y-4">
              <FileText className="h-12 w-12 text-slate-400 mx-auto" />
              <div>
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                  No jobs analyzed yet
                </h3>
                <p className="text-slate-600 dark:text-slate-400 mt-1">
                  {filter === 'all'
                    ? "Start analyzing jobs to see them here."
                    : `No ${filter.toLowerCase()} matches found. Try a different filter.`}
                </p>
              </div>
              <Link href="/dashboard/dream-job-streaming">
                <Button className="bg-purple-600 hover:bg-purple-700">
                  <Sparkles className="h-4 w-4 mr-2" />
                  Analyze Your First Job
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Job Cards */}
      {!isLoading && !error && validJobs.length > 0 && (
        <div className="grid grid-cols-1 gap-6">
          {validJobs.map((job) => (
            <Card
              key={job.id}
              className="hover:shadow-lg transition-shadow cursor-pointer border-slate-200 dark:border-slate-700"
              onClick={() => router.push(`/dashboard/my-analyses/${job.latest_analysis.id}`)}
            >
              <CardContent className="pt-6">
                <div className="space-y-4">
                  {/* Header */}
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-1">
                        {job.title}
                      </h3>
                      <p className="text-slate-600 dark:text-slate-400">
                        {job.company_name} • {job.location}
                      </p>
                    </div>
                    <Badge className={getEligibilityColor(job.latest_analysis.eligibility_level)}>
                      {job.latest_analysis.eligibility_level}
                    </Badge>
                  </div>

                  {/* Summary */}
                  <p className="text-slate-700 dark:text-slate-300 line-clamp-2">
                    {job.latest_analysis.analysis_summary}
                  </p>

                  {/* Metrics */}
                  <div className="flex items-center gap-6 pt-4 border-t border-slate-200 dark:border-slate-700">
                    <div className="flex items-center gap-2">
                      <TrendingUp className={`h-5 w-5 ${getMatchScoreColor(job.latest_analysis.match_score)}`} />
                      <div>
                        <p className="text-sm text-slate-600 dark:text-slate-400">Match Score</p>
                        <p className={`text-lg font-bold ${getMatchScoreColor(job.latest_analysis.match_score)}`}>
                          {job.latest_analysis.match_score}%
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Target className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                      <div>
                        <p className="text-sm text-slate-600 dark:text-slate-400">Job Ready</p>
                        <p className="text-lg font-bold text-blue-600 dark:text-blue-400">
                          {job.latest_analysis.readiness_percentage}%
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Calendar className="h-5 w-5 text-slate-600 dark:text-slate-400" />
                      <div>
                        <p className="text-sm text-slate-600 dark:text-slate-400">Analyzed</p>
                        <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
                          {new Date(job.latest_analysis.analyzed_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>

                    <div className="ml-auto">
                      <Button variant="ghost" size="sm">
                        View Analysis
                        <ChevronRight className="h-4 w-4 ml-1" />
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
