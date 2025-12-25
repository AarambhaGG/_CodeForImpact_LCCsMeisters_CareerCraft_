'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import Cookies from 'js-cookie';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Loader2, AlertCircle } from 'lucide-react';
import { AnalysisResults } from '@/components/AnalysisResults';
import { AnalysisChat } from '@/components/AnalysisChat';

export default function AnalysisDetailPage() {
  const params = useParams();
  const analysisId = params.id as string;

  const [analysisData, setAnalysisData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showChat, setShowChat] = useState(false);

  useEffect(() => {
    if (analysisId) {
      fetchAnalysisData();
    }
  }, [analysisId]);

  const fetchAnalysisData = async () => {
    try {
      setIsLoading(true);
      const token = Cookies.get('access_token');
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

      const response = await fetch(`${apiUrl}/api/jobs/analyses/${analysisId}/`, {
        headers: {
          'Authorization': token ? `Bearer ${token}` : '',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch analysis');
      }

      const data = await response.json();
      setAnalysisData(data);
    } catch (err: any) {
      console.error('Error fetching analysis:', err);
      setError(err.message || 'Failed to load analysis');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/dashboard/my-analyses">
          <Button variant="ghost" size="sm" className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back to All Analyses
          </Button>
        </Link>
      </div>

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
            <p className="font-medium text-red-700 dark:text-red-300">Failed to Load Analysis</p>
            <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
            <Button
              onClick={fetchAnalysisData}
              variant="outline"
              size="sm"
              className="mt-3"
            >
              Try Again
            </Button>
          </div>
        </div>
      )}

      {/* Analysis Content */}
      {!isLoading && !error && analysisData && !showChat && (
        <AnalysisResults
          analysis={analysisData}
          parsedJob={analysisData.job}
          onAskQuestion={() => setShowChat(true)}
        />
      )}

      {/* Interactive Chat */}
      {!isLoading && !error && analysisData && showChat && (
        <div className="space-y-6">
          <Button
            onClick={() => setShowChat(false)}
            variant="outline"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Results
          </Button>
          <AnalysisChat analysisId={parseInt(analysisId)} />
        </div>
      )}
    </div>
  );
}
