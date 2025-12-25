import { useState, useCallback, useRef } from 'react';
import Cookies from 'js-cookie';

export interface StreamingMetrics {
  match_score?: number;
  skills_match_score?: number;
  experience_match_score?: number;
  education_match_score?: number;
  culture_fit_score?: number;
  location_match_score?: number;
  salary_match_score?: number;
  technical_skills_score?: number;
  soft_skills_score?: number;
  domain_knowledge_score?: number;
  readiness_percentage?: number;
  eligibility_level?: string;
}

export interface StreamingStatus {
  step: string;
  message: string;
  progress: number;
}

export interface StreamingState {
  isStreaming: boolean;
  status: StreamingStatus | null;
  metrics: StreamingMetrics;
  error: string | null;
  analysisId: number | null;
  parsedJob: any | null;
  jobId: number | null;
  progress: number;
}

export interface UseStreamingAnalysisReturn {
  state: StreamingState;
  startAnalysis: (jobDescription: string, additionalContext?: string, saveJob?: boolean) => void;
  cancelAnalysis: () => void;
}

export function useStreamingAnalysis(): UseStreamingAnalysisReturn {
  const [state, setState] = useState<StreamingState>({
    isStreaming: false,
    status: null,
    metrics: {},
    error: null,
    analysisId: null,
    parsedJob: null,
    jobId: null,
    progress: 0,
  });

  const eventSourceRef = useRef<EventSource | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const cancelAnalysis = useCallback(() => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
      eventSourceRef.current = null;
    }
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    setState(prev => ({
      ...prev,
      isStreaming: false,
      error: 'Analysis cancelled',
    }));
  }, []);

  const startAnalysis = useCallback(async (
    jobDescription: string,
    additionalContext: string = '',
    saveJob: boolean = true
  ) => {
    // Reset state
    setState({
      isStreaming: true,
      status: { step: 'initializing', message: 'Starting analysis...', progress: 0 },
      metrics: {},
      error: null,
      analysisId: null,
      parsedJob: null,
      jobId: null,
      progress: 0,
    });

    try {
      const token = Cookies.get('access_token');
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

      // For SSE, we need to use fetch with a streaming response
      abortControllerRef.current = new AbortController();

      const response = await fetch(`${apiUrl}/api/jobs/analyses/stream_analyze_dream_job/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token ? `Bearer ${token}` : '',
        },
        body: JSON.stringify({
          job_description: jobDescription,
          additional_context: additionalContext,
          save_job: saveJob,
        }),
        signal: abortControllerRef.current.signal,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      if (!response.body) {
        throw new Error('Response body is null');
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();

        if (done) {
          break;
        }

        // Decode the chunk
        buffer += decoder.decode(value, { stream: true });

        // Process complete SSE messages
        const lines = buffer.split('\n');
        buffer = lines.pop() || ''; // Keep incomplete line in buffer

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6);
            try {
              const event = JSON.parse(data);

              // Handle different event types
              switch (event.type) {
                case 'status':
                  setState(prev => ({
                    ...prev,
                    status: {
                      step: event.step,
                      message: event.message,
                      progress: event.progress,
                    },
                    progress: event.progress,
                  }));
                  break;

                case 'partial_metric':
                  setState(prev => ({
                    ...prev,
                    metrics: {
                      ...prev.metrics,
                      ...event.metrics,
                    },
                    progress: event.progress,
                  }));
                  break;

                case 'metrics_complete':
                  setState(prev => ({
                    ...prev,
                    metrics: event.metrics,
                    progress: event.progress,
                  }));
                  break;

                case 'complete':
                  setState(prev => ({
                    ...prev,
                    analysisId: event.analysis_id,
                    progress: 100,
                    status: {
                      step: 'complete',
                      message: event.message,
                      progress: 100,
                    },
                  }));
                  break;

                case 'final':
                  setState(prev => ({
                    ...prev,
                    parsedJob: event.parsed_job,
                    jobId: event.job_id,
                    isStreaming: false,
                  }));
                  break;

                case 'error':
                  setState(prev => ({
                    ...prev,
                    error: event.message || event.error,
                    isStreaming: false,
                  }));
                  break;

                default:
                  console.log('Unknown event type:', event.type, event);
              }
            } catch (e) {
              console.error('Failed to parse SSE event:', e, data);
            }
          }
        }
      }

      // Mark as complete
      setState(prev => ({
        ...prev,
        isStreaming: false,
      }));

    } catch (error: any) {
      if (error.name === 'AbortError') {
        // Cancelled by user
        return;
      }

      console.error('Streaming analysis error:', error);
      setState(prev => ({
        ...prev,
        error: error.message || 'Failed to analyze job',
        isStreaming: false,
      }));
    }
  }, []);

  return {
    state,
    startAnalysis,
    cancelAnalysis,
  };
}
