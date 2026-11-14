import React from 'react';
import { Award } from 'lucide-react';

interface ScoreCardProps {
  score: number;
}

export const ScoreCard: React.FC<ScoreCardProps> = ({ score }) => {
  const radius = 64;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  let colorClass = 'text-emerald-600';
  let badgeBg = 'bg-emerald-50 text-emerald-700 border-emerald-200';
  let label = 'Strong Match';

  if (score < 50) {
    colorClass = 'text-red-600';
    badgeBg = 'bg-red-50 text-red-700 border-red-200';
    label = 'Needs Improvement';
  } else if (score < 75) {
    colorClass = 'text-amber-600';
    badgeBg = 'bg-amber-50 text-amber-700 border-amber-200';
    label = 'Good Match';
  }

  return (
    <div className="bg-white border border-[#E4E4E7] rounded-2xl p-6 flex flex-col items-center justify-between relative shadow-sm h-full">
      <div className="w-full flex items-center justify-between mb-2">
        <span className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Resume Match Score</span>
        <Award className="w-4 h-4 text-zinc-400" />
      </div>

      <div className="relative w-36 h-36 flex items-center justify-center my-2">
        <svg className="w-full h-full transform -rotate-90">
          <circle
            cx="72"
            cy="72"
            r={radius}
            stroke="currentColor"
            strokeWidth="10"
            className="text-zinc-100 fill-none"
          />
          <circle
            cx="72"
            cy="72"
            r={radius}
            stroke="currentColor"
            strokeWidth="10"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            className={`${colorClass} fill-none transition-all duration-1000 ease-out`}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
          <span className={`text-3xl font-bold ${colorClass}`}>{score}%</span>
        </div>
      </div>

      <div className={`mt-2 px-3 py-1 rounded-full border text-xs font-medium ${badgeBg}`}>
        {label}
      </div>
    </div>
  );
};
