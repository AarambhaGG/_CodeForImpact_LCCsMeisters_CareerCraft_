'use client';

import { StreamingMetrics as MetricsType } from '@/hooks/useStreamingAnalysis';
import { TrendingUp, Target, Briefcase, GraduationCap, MapPin, DollarSign, Code, Users, Brain } from 'lucide-react';

interface MetricCardProps {
  icon: React.ReactNode;
  label: string;
  value?: number;
  color: string;
  isLoading: boolean;
}

function MetricCard({ icon, label, value, color, isLoading }: MetricCardProps) {
  const getColorClasses = (color: string) => {
    switch (color) {
      case 'purple':
        return {
          bg: 'bg-purple-50 dark:bg-purple-950/30',
          border: 'border-purple-200 dark:border-purple-800',
          icon: 'text-purple-600 dark:text-purple-400',
          iconBg: 'bg-purple-100 dark:bg-purple-900/50',
          bar: 'bg-purple-600',
          text: 'text-purple-700 dark:text-purple-300',
        };
      case 'blue':
        return {
          bg: 'bg-blue-50 dark:bg-blue-950/30',
          border: 'border-blue-200 dark:border-blue-800',
          icon: 'text-blue-600 dark:text-blue-400',
          iconBg: 'bg-blue-100 dark:bg-blue-900/50',
          bar: 'bg-blue-600',
          text: 'text-blue-700 dark:text-blue-300',
        };
      case 'green':
        return {
          bg: 'bg-green-50 dark:bg-green-950/30',
          border: 'border-green-200 dark:border-green-800',
          icon: 'text-green-600 dark:text-green-400',
          iconBg: 'bg-green-100 dark:bg-green-900/50',
          bar: 'bg-green-600',
          text: 'text-green-700 dark:text-green-300',
        };
      case 'orange':
        return {
          bg: 'bg-orange-50 dark:bg-orange-950/30',
          border: 'border-orange-200 dark:border-orange-800',
          icon: 'text-orange-600 dark:text-orange-400',
          iconBg: 'bg-orange-100 dark:bg-orange-900/50',
          bar: 'bg-orange-600',
          text: 'text-orange-700 dark:text-orange-300',
        };
      default:
        return {
          bg: 'bg-slate-50 dark:bg-slate-900/30',
          border: 'border-slate-200 dark:border-slate-800',
          icon: 'text-slate-600 dark:text-slate-400',
          iconBg: 'bg-slate-100 dark:bg-slate-900/50',
          bar: 'bg-slate-600',
          text: 'text-slate-700 dark:text-slate-300',
        };
    }
  };

  const colors = getColorClasses(color);

  return (
    <div className={`rounded-lg border ${colors.border} ${colors.bg} p-4 transition-all duration-300`}>
      <div className="flex items-center gap-3 mb-3">
        <div className={`${colors.iconBg} p-2 rounded-lg`}>
          <div className={colors.icon}>
            {icon}
          </div>
        </div>
        <div className="flex-1">
          <p className="text-sm font-medium text-slate-700 dark:text-slate-300">{label}</p>
        </div>
      </div>

      {isLoading && value === undefined ? (
        <div className="space-y-2">
          <div className="h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
            <div className={`h-full ${colors.bar} animate-pulse w-1/3`}></div>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400">Calculating...</p>
        </div>
      ) : (
        <div className="space-y-2">
          <div className="flex items-baseline gap-2">
            <span className={`text-3xl font-bold ${colors.text}`}>
              {value !== undefined ? value : '--'}
            </span>
            <span className="text-sm text-slate-500 dark:text-slate-400">/ 100</span>
          </div>
          <div className="h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
            <div
              className={`h-full ${colors.bar} transition-all duration-500 ease-out`}
              style={{ width: `${value || 0}%` }}
            ></div>
          </div>
        </div>
      )}
    </div>
  );
}

interface StreamingMetricsProps {
  metrics: MetricsType;
  isStreaming: boolean;
}

export function StreamingMetrics({ metrics, isStreaming }: StreamingMetricsProps) {
  const metricsConfig = [
    {
      icon: <TrendingUp className="h-5 w-5" />,
      label: 'Overall Match',
      value: metrics.match_score,
      color: 'purple',
    },
    {
      icon: <Target className="h-5 w-5" />,
      label: 'Skills Match',
      value: metrics.skills_match_score,
      color: 'blue',
    },
    {
      icon: <Briefcase className="h-5 w-5" />,
      label: 'Experience Match',
      value: metrics.experience_match_score,
      color: 'green',
    },
    {
      icon: <Code className="h-5 w-5" />,
      label: 'Technical Skills',
      value: metrics.technical_skills_score,
      color: 'blue',
    },
    {
      icon: <Users className="h-5 w-5" />,
      label: 'Soft Skills',
      value: metrics.soft_skills_score,
      color: 'green',
    },
    {
      icon: <Brain className="h-5 w-5" />,
      label: 'Domain Knowledge',
      value: metrics.domain_knowledge_score,
      color: 'purple',
    },
    {
      icon: <GraduationCap className="h-5 w-5" />,
      label: 'Education Match',
      value: metrics.education_match_score,
      color: 'orange',
    },
    {
      icon: <MapPin className="h-5 w-5" />,
      label: 'Location Match',
      value: metrics.location_match_score,
      color: 'blue',
    },
    {
      icon: <DollarSign className="h-5 w-5" />,
      label: 'Salary Match',
      value: metrics.salary_match_score,
      color: 'green',
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {metricsConfig.map((metric, index) => (
        <MetricCard
          key={index}
          icon={metric.icon}
          label={metric.label}
          value={metric.value}
          color={metric.color}
          isLoading={isStreaming}
        />
      ))}
    </div>
  );
}
