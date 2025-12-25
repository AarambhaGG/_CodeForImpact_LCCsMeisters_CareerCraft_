'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Cookies from 'js-cookie';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Sparkles, Briefcase, Target, BookOpen, AlertCircle, TrendingUp, Lightbulb, CheckCircle2 } from 'lucide-react';
import { useStreamingAnalysis } from '@/hooks/useStreamingAnalysis';
import { StreamingMetrics } from '@/components/StreamingMetrics';
import { AnalysisResults } from '@/components/AnalysisResults';
import { AnalysisChat } from '@/components/AnalysisChat';

type InputMethod = 'describe' | 'paste';
type FollowUpStep = 'initial' | 'questions' | 'analyzing' | 'results';

const INDUSTRIES = ['Tech', 'Finance', 'Healthcare', 'E-commerce', 'Education', 'Manufacturing', 'Other'];
const LEVELS = ['Entry Level', 'Mid-level', 'Senior', 'Lead/Manager', 'Executive'];
const PRODUCT_TYPES = ['SaaS', 'Mobile Apps', 'Web Apps', 'AI/ML', 'Data Analytics', 'Cloud Services', 'Other'];

// Status Step Component
function StatusStep({ icon, text, status }: { icon: React.ReactNode; text: string; status: 'pending' | 'active' | 'complete' }) {
  const getStatusStyles = () => {
    switch (status) {
      case 'active':
        return {
          container: 'bg-purple-50 dark:bg-purple-900/30 border-purple-200 dark:border-purple-700',
          icon: 'bg-purple-100 dark:bg-purple-900/50 text-purple-600 dark:text-purple-400',
          text: 'text-slate-900 dark:text-white font-medium',
        };
      case 'complete':
        return {
          container: 'bg-green-50 dark:bg-green-900/30 border-green-200 dark:border-green-700',
          icon: 'bg-green-100 dark:bg-green-900/50 text-green-600 dark:text-green-400',
          text: 'text-slate-700 dark:text-slate-300',
        };
      default:
        return {
          container: 'bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700',
          icon: 'bg-slate-100 dark:bg-slate-700 text-slate-400 dark:text-slate-500',
          text: 'text-slate-500 dark:text-slate-400',
        };
    }
  };

  const styles = getStatusStyles();

  return (
    <div className={`flex items-center gap-3 p-3 rounded-lg border ${styles.container} transition-all duration-300`}>
      <div className={`flex items-center justify-center w-8 h-8 rounded-full ${styles.icon}`}>
        {status === 'complete' ? <CheckCircle2 className="h-4 w-4" /> : icon}
      </div>
      <span className={`text-sm ${styles.text}`}>{text}</span>
      {status === 'active' && (
        <div className="ml-auto flex gap-1">
          <div className="w-1.5 h-1.5 bg-purple-600 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
          <div className="w-1.5 h-1.5 bg-purple-600 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
          <div className="w-1.5 h-1.5 bg-purple-600 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
        </div>
      )}
    </div>
  );
}

export default function DreamJobStreamingPage() {
  const router = useRouter();
  const [method, setMethod] = useState<InputMethod>('describe');
  const [followUpStep, setFollowUpStep] = useState<FollowUpStep>('initial');
  const [showChat, setShowChat] = useState(false);
  const [analysisData, setAnalysisData] = useState<any>(null);

  // Describe approach state
  const [roleDescription, setRoleDescription] = useState('');
  const [selectedIndustry, setSelectedIndustry] = useState('');
  const [selectedLevel, setSelectedLevel] = useState('');
  const [companies, setCompanies] = useState('');
  const [productTypes, setProductTypes] = useState<string[]>([]);

  // Paste approach state
  const [jobPosting, setJobPosting] = useState('');

  // Streaming state
  const { state, startAnalysis, cancelAnalysis } = useStreamingAnalysis();

  // Fetch full analysis when complete
  useEffect(() => {
    if (state.analysisId && state.progress === 100 && !analysisData) {
      fetchAnalysisData(state.analysisId);
    }
  }, [state.analysisId, state.progress, analysisData]);

  const fetchAnalysisData = async (analysisId: number) => {
    try {
      const token = Cookies.get('access_token');
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
      const response = await fetch(`${apiUrl}/api/jobs/analyses/${analysisId}/`, {
        headers: {
          'Authorization': token ? `Bearer ${token}` : '',
        },
      });
      if (response.ok) {
        const data = await response.json();
        setAnalysisData(data);
      }
    } catch (error) {
      console.error('Failed to fetch analysis:', error);
    }
  };

  const handleMethodChange = (newMethod: InputMethod) => {
    setMethod(newMethod);
    setFollowUpStep('initial');
    setRoleDescription('');
    setJobPosting('');
    setSelectedIndustry('');
    setSelectedLevel('');
    setCompanies('');
    setProductTypes([]);
  };

  const handleDescribeSubmit = () => {
    if (roleDescription.trim()) {
      setFollowUpStep('questions');
    }
  };

  const handleProductTypeToggle = (type: string) => {
    setProductTypes((prev) =>
      prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type]
    );
  };

  const handleAnalyze = async () => {
    setFollowUpStep('analyzing');

    let jobDescription = '';
    let additionalContext = '';

    if (method === 'paste') {
      jobDescription = jobPosting;
    } else {
      jobDescription = roleDescription;

      const contextParts = [];
      if (selectedIndustry) contextParts.push(`Industry: ${selectedIndustry}`);
      if (selectedLevel) contextParts.push(`Level: ${selectedLevel}`);
      if (companies) contextParts.push(`Target Companies: ${companies}`);
      if (productTypes.length > 0) contextParts.push(`Product Types: ${productTypes.join(', ')}`);

      additionalContext = contextParts.join('\n');
    }

    await startAnalysis(jobDescription, additionalContext, true);

    // When complete, show results
    if (!state.error && state.analysisId) {
      setFollowUpStep('results');
    }
  };

  const isPasteMethodComplete = jobPosting.trim().length > 0;
  const isDescribeMethodComplete =
    followUpStep === 'questions' &&
    selectedIndustry &&
    selectedLevel &&
    (companies || productTypes.length > 0);

  // Get status step states
  const getStepStatus = (step: string) => {
    if (!state.status) return 'pending';
    const steps = ['parsing', 'parsed', 'gathering_context', 'context_gathered', 'analyzing', 'processing', 'complete'];
    const currentIndex = steps.indexOf(state.status.step);
    const stepIndex = steps.indexOf(step);

    if (stepIndex < currentIndex) return 'complete';
    if (stepIndex === currentIndex) return 'active';
    return 'pending';
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      {/* <div className="flex items-center gap-4">
        <Link href="/dashboard">
          <Button variant="ghost" size="sm" className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back to Dashboard
          </Button>
        </Link>
      </div> */}

      {/* Main Content */}
      <div className="max-w-6xl mx-auto">
        {/* Title Section */}
        <div className="mb-8">
          {/* <Badge className="mb-4 bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800">
            <Target className="h-3 w-3 mr-1" />
            Step 2: Define Your Dream Job (Streaming)
          </Badge> */}
          <h1 className="text-4xl font-bold text-slate-900 dark:text-white mb-3">
          Watch as our team conducts real-time  analysis with evolving metrics to assess your fit.
          </h1>
          <p className="text-lg text-slate-600 dark:text-slate-400">
            Watch real-time AI analysis with progressive metrics as we evaluate your fit.
          </p>
        </div>

        {followUpStep === 'analyzing' ? (
          // Analyzing & Results View
          <div className="space-y-6">
            {/* Progress Card */}
            <Card className="border-purple-100 dark:border-purple-900/50">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Sparkles className="h-5 w-5 text-purple-600" />
                    {state.progress === 100 ? 'Analysis Complete!' : 'Analyzing Your Fit'}
                  </CardTitle>
                  <Badge className="bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300">
                    {state.progress}%
                  </Badge>
                </div>
                {state.status && (
                  <CardDescription>{state.status.message}</CardDescription>
                )}
              </CardHeader>
              <CardContent>
                {/* Progress Bar */}
                <div className="mb-6">
                  <div className="h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-purple-600 via-pink-600 to-purple-600 transition-all duration-500 ease-out"
                      style={{ width: `${state.progress}%` }}
                    ></div>
                  </div>
                </div>

                {/* Status Steps */}
                <div className="space-y-3">
                  <StatusStep
                    icon={<Briefcase className="h-4 w-4" />}
                    text="Parsing job description"
                    status={getStepStatus('parsing')}
                  />
                  <StatusStep
                    icon={<Target className="h-4 w-4" />}
                    text="Gathering your profile data"
                    status={getStepStatus('gathering_context')}
                  />
                  <StatusStep
                    icon={<TrendingUp className="h-4 w-4" />}
                    text="Analyzing your fit"
                    status={getStepStatus('analyzing')}
                  />
                  <StatusStep
                    icon={<Lightbulb className="h-4 w-4" />}
                    text="Calculating match scores"
                    status={getStepStatus('processing')}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Live Metrics */}
            {Object.keys(state.metrics).length > 0 && (
              <Card className="border-purple-100 dark:border-purple-900/50">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-purple-600" />
                    Live Match Metrics
                  </CardTitle>
                  <CardDescription>
                    Real-time analysis as AI evaluates your profile
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <StreamingMetrics metrics={state.metrics} isStreaming={state.isStreaming} />
                </CardContent>
              </Card>
            )}

            {/* Error Display */}
            {state.error && (
              <div className="bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/30 rounded-lg p-4 flex gap-3">
                <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400 shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-red-700 dark:text-red-300">Analysis Failed</p>
                  <p className="text-sm text-red-600 dark:text-red-400">{state.error}</p>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            {state.isStreaming && (
              <div className="flex gap-3">
                <Button
                  onClick={cancelAnalysis}
                  variant="outline"
                  className="flex-1"
                >
                  Cancel Analysis
                </Button>
              </div>
            )}

            {/* Analysis Results */}
            {state.progress === 100 && analysisData && !showChat && (
              <AnalysisResults
                analysis={analysisData}
                parsedJob={state.parsedJob}
                onAskQuestion={() => setShowChat(true)}
              />
            )}

            {/* Interactive Chat */}
            {state.progress === 100 && analysisData && showChat && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <Button
                    onClick={() => setShowChat(false)}
                    variant="outline"
                  >
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back to Results
                  </Button>
                </div>
                <AnalysisChat analysisId={state.analysisId!} />
              </div>
            )}
          </div>
        ) : (
          // Initial Form View (same as original)
          <>
            {/* Method Selection Tabs */}
            <div className="flex gap-3 mb-8">
              <button
                onClick={() => handleMethodChange('describe')}
                className={`flex-1 p-4 rounded-lg border-2 transition-all ${
                  method === 'describe'
                    ? 'border-purple-600 bg-purple-50 dark:bg-purple-950/30'
                    : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                }`}
              >
                <div className="flex items-center gap-3 justify-center">
                  <Briefcase className="h-5 w-5" />
                  <div className="text-left">
                    <p className="font-semibold text-slate-900 dark:text-white">Describe Your Dream Role</p>
                    <p className="text-sm text-slate-600 dark:text-slate-400">Tell us about your ideal position</p>
                  </div>
                </div>
              </button>

              <button
                onClick={() => handleMethodChange('paste')}
                className={`flex-1 p-4 rounded-lg border-2 transition-all ${
                  method === 'paste'
                    ? 'border-purple-600 bg-purple-50 dark:bg-purple-950/30'
                    : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                }`}
              >
                <div className="flex items-center gap-3 justify-center">
                  <BookOpen className="h-5 w-5" />
                  <div className="text-left">
                    <p className="font-semibold text-slate-900 dark:text-white">Paste Job Posting</p>
                    <p className="text-sm text-slate-600 dark:text-slate-400">Copy from LinkedIn or Indeed</p>
                  </div>
                </div>
              </button>
            </div>

            {/* Form content - reuse from original page */}
            {method === 'describe' ? (
              followUpStep === 'initial' ? (
                <Card className="border-purple-100 dark:border-purple-900/50">
                  <CardHeader>
                    <CardTitle>Your Ideal Role</CardTitle>
                    <CardDescription>
                      Describe the position you're aiming for
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <textarea
                      value={roleDescription}
                      onChange={(e) => setRoleDescription(e.target.value)}
                      placeholder="I want to be a Product Manager at a tech startup..."
                      className="w-full p-4 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-white placeholder-slate-500 dark:placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none min-h-32"
                    />
                    <Button
                      onClick={handleDescribeSubmit}
                      disabled={!roleDescription.trim()}
                      className="w-full bg-purple-600 hover:bg-purple-700"
                    >
                      Continue <Sparkles className="ml-2 h-4 w-4" />
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-6">
                  <Card className="border-purple-100 dark:border-purple-900/50">
                    <CardHeader>
                      <CardTitle>Let's refine your search</CardTitle>
                      <CardDescription>
                        Answer a few questions to help us better understand your target role
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      {/* Industry, Level, Companies, Product Types - same as original */}
                      <div>
                        <label className="block text-sm font-semibold text-slate-900 dark:text-white mb-3">
                          What industry interests you most?
                        </label>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                          {INDUSTRIES.map((industry) => (
                            <button
                              key={industry}
                              onClick={() => setSelectedIndustry(industry)}
                              className={`p-3 rounded-lg border-2 transition-all text-sm font-medium ${
                                selectedIndustry === industry
                                  ? 'border-purple-600 bg-purple-50 dark:bg-purple-950/30 text-purple-700 dark:text-purple-300'
                                  : 'border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-slate-300 dark:hover:border-slate-600'
                              }`}
                            >
                              {industry}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-slate-900 dark:text-white mb-3">
                          What experience level are you targeting?
                        </label>
                        <div className="space-y-2">
                          {LEVELS.map((level) => (
                            <button
                              key={level}
                              onClick={() => setSelectedLevel(level)}
                              className={`w-full p-3 rounded-lg border-2 transition-all text-left font-medium ${
                                selectedLevel === level
                                  ? 'border-purple-600 bg-purple-50 dark:bg-purple-950/30 text-purple-700 dark:text-purple-300'
                                  : 'border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-slate-300 dark:hover:border-slate-600'
                              }`}
                            >
                              {level}
                            </button>
                          ))}
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Button
                    onClick={handleAnalyze}
                    disabled={!isDescribeMethodComplete}
                    size="lg"
                    className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white shadow-lg h-12"
                  >
                    <Sparkles className="h-5 w-5 mr-2" />
                    Start Streaming Analysis
                  </Button>
                </div>
              )
            ) : (
              <Card className="border-purple-100 dark:border-purple-900/50">
                <CardHeader>
                  <CardTitle>Paste Job Description</CardTitle>
                  <CardDescription>
                    Copy a job posting from LinkedIn, Indeed, or any job board
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <textarea
                    value={jobPosting}
                    onChange={(e) => setJobPosting(e.target.value)}
                    placeholder="Paste the complete job description here..."
                    className="w-full p-4 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-white placeholder-slate-500 dark:placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none min-h-64"
                  />

                  <Button
                    onClick={handleAnalyze}
                    disabled={!isPasteMethodComplete}
                    size="lg"
                    className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white shadow-lg h-12"
                  >
                    <Sparkles className="h-5 w-5 mr-2" />
                    Start Streaming Analysis
                  </Button>
                </CardContent>
              </Card>
            )}
          </>
        )}
      </div>
    </div>
  );
}
