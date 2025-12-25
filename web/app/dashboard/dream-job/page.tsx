'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Sparkles, Briefcase, Target, BookOpen, Building2, AlertCircle, TrendingUp, Lightbulb } from 'lucide-react';
import { analyzeDreamJob } from '@/api';

type InputMethod = 'describe' | 'paste';
type FollowUpStep = 'initial' | 'questions' | 'analyzing';

const INDUSTRIES = ['Tech', 'Finance', 'Healthcare', 'E-commerce', 'Education', 'Manufacturing', 'Other'];
const LEVELS = ['Entry Level', 'Mid-level', 'Senior', 'Lead/Manager', 'Executive'];
const PRODUCT_TYPES = ['SaaS', 'Mobile Apps', 'Web Apps', 'AI/ML', 'Data Analytics', 'Cloud Services', 'Other'];

// Analyzing Step Component
function AnalyzingStep({ icon, text, delay }: { icon: React.ReactNode; text: string; delay: number }) {
  return (
    <div
      className="flex items-center gap-3 p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 opacity-0 animate-fade-in"
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="flex items-center justify-center w-8 h-8 rounded-full bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400">
        {icon}
      </div>
      <span className="text-sm text-slate-700 dark:text-slate-300 font-medium">{text}</span>
      <div className="ml-auto flex gap-1">
        <div className="w-1.5 h-1.5 bg-purple-600 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
        <div className="w-1.5 h-1.5 bg-purple-600 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
        <div className="w-1.5 h-1.5 bg-purple-600 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
      </div>
    </div>
  );
}

export default function DreamJobPage() {
  const router = useRouter();
  const [method, setMethod] = useState<InputMethod>('describe');
  const [followUpStep, setFollowUpStep] = useState<FollowUpStep>('initial');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Describe approach state
  const [roleDescription, setRoleDescription] = useState('');
  const [selectedIndustry, setSelectedIndustry] = useState('');
  const [selectedLevel, setSelectedLevel] = useState('');
  const [companies, setCompanies] = useState('');
  const [productTypes, setProductTypes] = useState<string[]>([]);

  // Paste approach state
  const [jobPosting, setJobPosting] = useState('');

  const handleMethodChange = (newMethod: InputMethod) => {
    setMethod(newMethod);
    setFollowUpStep('initial');
    setRoleDescription('');
    setJobPosting('');
    setSelectedIndustry('');
    setSelectedLevel('');
    setCompanies('');
    setProductTypes([]);
    setError(null);
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
    setIsAnalyzing(true);
    setFollowUpStep('analyzing');
    setError(null);

    try {
      let jobDescription = '';
      let additionalContext = '';

      if (method === 'paste') {
        // Use the pasted job posting directly
        jobDescription = jobPosting;
      } else {
        // Build job description from describe method
        jobDescription = roleDescription;

        // Build additional context from user selections
        const contextParts = [];
        if (selectedIndustry) contextParts.push(`Industry: ${selectedIndustry}`);
        if (selectedLevel) contextParts.push(`Level: ${selectedLevel}`);
        if (companies) contextParts.push(`Target Companies: ${companies}`);
        if (productTypes.length > 0) contextParts.push(`Product Types: ${productTypes.join(', ')}`);

        additionalContext = contextParts.join('\n');
      }

      const response = await analyzeDreamJob({
        job_description: jobDescription,
        additional_context: additionalContext || undefined,
        save_job: true,
      });

      console.log('Analysis result:', response);

      // Navigate to results page with data
      const encodedData = encodeURIComponent(JSON.stringify(response));
      router.push(`/dashboard/job-analysis-results?data=${encodedData}`);

    } catch (err: any) {
      console.error('Analysis error:', err);
      setError(err.response?.data?.message || 'Failed to analyze job. Please try again.');
      setIsAnalyzing(false);
      setFollowUpStep(method === 'describe' ? 'questions' : 'initial');
    }
  };

  const isPasteMethodComplete = jobPosting.trim().length > 0;
  const isDescribeMethodComplete =
    followUpStep === 'questions' &&
    selectedIndustry &&
    selectedLevel &&
    (companies || productTypes.length > 0);

  return (
    <div className="space-y-8">
      {/* Header with back button */}
      {/* <div className="flex items-center gap-4">
        <Link href="/dashboard">
          <Button variant="ghost" size="sm" className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back to Dashboard
          </Button>
        </Link>
      </div> */}

      {/* Main Content */}
      <div className="max-w-4xl mx-auto">
        {/* Title Section */}
        <div className="mb-8">
          <Badge className="mb-4 bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800">
            <Target className="h-3 w-3 mr-1" />
            Step 2: Define Your Dream Job
          </Badge>
          <h1 className="text-4xl font-bold text-slate-900 dark:text-white mb-3">
            Tell us about your ideal role
          </h1>
          <p className="text-lg text-slate-600 dark:text-slate-400">
            We'll analyze your profile against your dream job and tell you exactly what skills you need to become job-ready.
          </p>
        </div>

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

        {/* Content based on selected method */}
        {method === 'describe' ? (
          // Describe Method
          <div className="space-y-6">
            {followUpStep === 'initial' ? (
              <Card className="border-purple-100 dark:border-purple-900/50">
                <CardHeader>
                  <CardTitle>Your Ideal Role</CardTitle>
                  <CardDescription>
                    Describe the position you're aiming for (e.g., "Product Manager at a tech startup" or "Senior Frontend Engineer at a fintech company")
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
            ) : followUpStep === 'analyzing' ? (
              <div className="space-y-6">
                <Card className="border-purple-100 dark:border-purple-900/50 overflow-hidden">
                  <CardContent className="pt-6">
                    <div className="flex flex-col items-center justify-center py-16 gap-6">
                      {/* Animated Icon */}
                      <div className="relative">
                        {/* Outer rotating ring */}
                        <div className="absolute inset-0 w-32 h-32 -m-8">
                          <div className="w-full h-full rounded-full border-4 border-transparent border-t-purple-600 border-r-pink-600 animate-spin"></div>
                        </div>
                        {/* Middle pulsing glow */}
                        <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full blur-2xl opacity-40 animate-pulse"></div>
                        {/* Inner icon */}
                        <div className="relative bg-white dark:bg-slate-900 rounded-full p-6 shadow-xl">
                          <Sparkles className="h-12 w-12 text-purple-600 dark:text-purple-400 animate-pulse" />
                        </div>
                      </div>

                      {/* Text Content */}
                      <div className="text-center space-y-3 max-w-md">
                        <h3 className="text-2xl font-bold text-slate-900 dark:text-white">
                          Analyzing Your Fit
                        </h3>
                        <p className="text-slate-600 dark:text-slate-400 text-lg">
                          Our AI is comparing your profile with the job requirements
                        </p>
                      </div>

                      {/* Progress Steps */}
                      <div className="w-full max-w-md space-y-3 mt-4">
                        <AnalyzingStep
                          icon={<Briefcase className="h-4 w-4" />}
                          text="Analyzing job requirements"
                          delay={0}
                        />
                        <AnalyzingStep
                          icon={<Target className="h-4 w-4" />}
                          text="Matching your skills"
                          delay={600}
                        />
                        <AnalyzingStep
                          icon={<TrendingUp className="h-4 w-4" />}
                          text="Calculating match scores"
                          delay={1200}
                        />
                        <AnalyzingStep
                          icon={<Lightbulb className="h-4 w-4" />}
                          text="Generating recommendations"
                          delay={1800}
                        />
                      </div>

                      {/* Loading Bar */}
                      <div className="w-full max-w-md mt-6">
                        <div className="h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                          <div className="h-full bg-gradient-to-r from-purple-600 via-pink-600 to-purple-600 animate-loading-bar"></div>
                        </div>
                      </div>

                      {/* Status Text */}
                      <p className="text-sm text-slate-500 dark:text-slate-400 animate-pulse">
                        This may take a few moments...
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            ) : (
              // Questions step
              <div className="space-y-6">
                <Card className="border-purple-100 dark:border-purple-900/50">
                  <CardHeader>
                    <CardTitle>Let's refine your search</CardTitle>
                    <CardDescription>
                      Answer a few questions to help us better understand your target role
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Industry Selection */}
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

                    {/* Level Selection */}
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

                    {/* Companies */}
                    <div>
                      <label className="block text-sm font-semibold text-slate-900 dark:text-white mb-3">
                        Any specific companies in mind? (optional)
                      </label>
                      <input
                        type="text"
                        value={companies}
                        onChange={(e) => setCompanies(e.target.value)}
                        placeholder="e.g., Google, Microsoft, Startup XYZ"
                        className="w-full p-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-white placeholder-slate-500 dark:placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                      />
                    </div>

                    {/* Product Types */}
                    <div>
                      <label className="block text-sm font-semibold text-slate-900 dark:text-white mb-3">
                        What types of products interest you? (optional)
                      </label>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                        {PRODUCT_TYPES.map((type) => (
                          <button
                            key={type}
                            onClick={() => handleProductTypeToggle(type)}
                            className={`p-3 rounded-lg border-2 transition-all text-sm font-medium ${
                              productTypes.includes(type)
                                ? 'border-purple-600 bg-purple-50 dark:bg-purple-950/30 text-purple-700 dark:text-purple-300'
                                : 'border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-slate-300 dark:hover:border-slate-600'
                            }`}
                          >
                            {type}
                          </button>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Summary Card */}
                <Card className="border-slate-200 dark:border-slate-700 bg-gradient-to-br from-slate-50 to-white dark:from-slate-900 dark:to-slate-950">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Target className="h-5 w-5 text-purple-600" />
                      Your Target Role Profile
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div>
                      <p className="text-xs text-slate-600 dark:text-slate-400 uppercase font-semibold">Your Dream Role</p>
                      <p className="text-slate-900 dark:text-white font-medium mt-1">{roleDescription}</p>
                    </div>
                    {selectedIndustry && (
                      <div>
                        <p className="text-xs text-slate-600 dark:text-slate-400 uppercase font-semibold">Industry</p>
                        <p className="text-slate-900 dark:text-white font-medium mt-1">{selectedIndustry}</p>
                      </div>
                    )}
                    {selectedLevel && (
                      <div>
                        <p className="text-xs text-slate-600 dark:text-slate-400 uppercase font-semibold">Level</p>
                        <p className="text-slate-900 dark:text-white font-medium mt-1">{selectedLevel}</p>
                      </div>
                    )}
                    {companies && (
                      <div>
                        <p className="text-xs text-slate-600 dark:text-slate-400 uppercase font-semibold">Target Companies</p>
                        <p className="text-slate-900 dark:text-white font-medium mt-1">{companies}</p>
                      </div>
                    )}
                    {productTypes.length > 0 && (
                      <div>
                        <p className="text-xs text-slate-600 dark:text-slate-400 uppercase font-semibold">Product Types</p>
                        <div className="flex flex-wrap gap-2 mt-2">
                          {productTypes.map((type) => (
                            <Badge key={type} className="bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300">
                              {type}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Error Message */}
                {error && (
                  <div className="bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/30 rounded-lg p-4 flex gap-3">
                    <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400 shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium text-red-700 dark:text-red-300">Analysis Failed</p>
                      <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
                    </div>
                  </div>
                )}

                <Button
                  onClick={handleAnalyze}
                  disabled={!isDescribeMethodComplete || isAnalyzing}
                  size="lg"
                  className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white shadow-lg h-12"
                >
                  {isAnalyzing ? (
                    <>
                      <Sparkles className="h-5 w-5 mr-2 animate-spin" />
                      Analyzing Your Fit...
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-5 w-5 mr-2" />
                      Analyze My Fit
                    </>
                  )}
                </Button>
              </div>
            )}
          </div>
        ) : (
          // Paste Method
          <Card className="border-purple-100 dark:border-purple-900/50">
            <CardHeader>
              <CardTitle>Paste Job Description</CardTitle>
              <CardDescription>
                Copy a job posting from LinkedIn, Indeed, or any job board and paste it below. Our AI will automatically extract all requirements.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <textarea
                value={jobPosting}
                onChange={(e) => setJobPosting(e.target.value)}
                placeholder="Paste the complete job description here..."
                className="w-full p-4 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-white placeholder-slate-500 dark:placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none min-h-64"
              />

              <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900/50 rounded-lg p-4">
                <p className="text-sm text-blue-900 dark:text-blue-300">
                  <span className="font-semibold">💡 Tip:</span> The more complete the job description, the more accurate our analysis will be.
                </p>
              </div>

              {/* Error Message */}
              {error && (
                <div className="bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/30 rounded-lg p-4 flex gap-3">
                  <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium text-red-700 dark:text-red-300">Analysis Failed</p>
                    <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
                  </div>
                </div>
              )}

              <Button
                onClick={handleAnalyze}
                disabled={!isPasteMethodComplete || isAnalyzing}
                size="lg"
                className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white shadow-lg h-12"
              >
                {isAnalyzing ? (
                  <>
                    <Sparkles className="h-5 w-5 mr-2 animate-spin" />
                    Analyzing Your Fit...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-5 w-5 mr-2" />
                    Analyze My Fit
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
