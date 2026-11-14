import React from 'react';
import { CheckCircle2, ListFilter } from 'lucide-react';

interface CoverageCardProps {
  matchedCount: number;
  totalCount: number;
}

export const CoverageCard: React.FC<CoverageCardProps> = ({ matchedCount, totalCount }) => {
  const percentage = totalCount > 0 ? Math.round((matchedCount / totalCount) * 100) : 0;

  return (
    <div className="bg-white border border-[#E4E4E7] rounded-2xl p-6 flex flex-col justify-between shadow-sm h-full">
      <div className="w-full flex items-center justify-between mb-4">
        <span className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Keyword Coverage</span>
        <ListFilter className="w-4 h-4 text-zinc-400" />
      </div>

      <div className="my-auto py-2">
        <div className="flex items-baseline justify-between mb-2">
          <span className="text-2xl font-bold text-zinc-900">{matchedCount} of {totalCount}</span>
          <span className="text-sm font-medium text-zinc-500">{percentage}%</span>
        </div>
        
        <div className="w-full bg-zinc-100 h-2 rounded-full overflow-hidden">
          <div 
            className="bg-blue-600 h-full rounded-full transition-all duration-1000"
            style={{ width: `${percentage}%` }}
          ></div>
        </div>
      </div>

      <div className="mt-4 pt-3 border-t border-zinc-100 text-xs text-zinc-500 flex items-center gap-1.5">
        <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
        <span>Key role skills indexed from job description</span>
      </div>
    </div>
  );
};
