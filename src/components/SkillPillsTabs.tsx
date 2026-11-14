import React, { useState } from 'react';
import { KeywordGap } from '../types/ats';
import { Check, Search, ChevronDown, ChevronUp } from 'lucide-react';

interface SkillPillsTabsProps {
  matched: KeywordGap[];
  missing: KeywordGap[];
}

export const SkillPillsTabs: React.FC<SkillPillsTabsProps> = ({ matched, missing }) => {
  const [activeTab, setActiveTab] = useState<'missing' | 'matched'>('missing');
  const [showAll, setShowAll] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const currentList = activeTab === 'missing' ? missing : matched;
  const filteredList = currentList.filter(item =>
    item.keyword.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const displayedList = showAll ? filteredList : filteredList.slice(0, 12);

  return (
    <div className="bg-white border border-[#E4E4E7] rounded-2xl p-6 sm:p-8 shadow-sm">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-2 bg-zinc-100 p-1 rounded-xl">
          <button
            onClick={() => { setActiveTab('missing'); setShowAll(false); }}
            className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all ${activeTab === 'missing' ? 'bg-white text-zinc-900 shadow-sm' : 'text-zinc-600 hover:text-zinc-900'}`}
          >
            Missing Keywords ({missing.length})
          </button>
          <button
            onClick={() => { setActiveTab('matched'); setShowAll(false); }}
            className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all ${activeTab === 'matched' ? 'bg-white text-zinc-900 shadow-sm' : 'text-zinc-600 hover:text-zinc-900'}`}
          >
            Matched Keywords ({matched.length})
          </button>
        </div>

        <div className="relative w-full sm:w-60">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-zinc-400" />
          <input
            type="text"
            placeholder="Search keywords..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-zinc-50 border border-zinc-300 rounded-xl pl-9 pr-4 py-2 text-xs text-zinc-900 placeholder-zinc-400 focus:outline-none focus:border-blue-600 transition-all"
          />
        </div>
      </div>

      <div className="flex flex-wrap gap-2 min-h-[120px] items-start content-start">
        {displayedList.length > 0 ? (
          displayedList.map((item, idx) => (
            <div
              key={idx}
              className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-medium border transition-all ${
                activeTab === 'missing'
                  ? 'bg-zinc-50 border-zinc-200 text-zinc-700 hover:border-zinc-300'
                  : 'bg-emerald-50/50 border-emerald-200 text-emerald-800'
              }`}
            >
              {activeTab === 'missing' ? (
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
              ) : (
                <Check className="w-3.5 h-3.5 text-emerald-600" />
              )}
              <span className="font-semibold">{item.keyword}</span>
              
              {item.importance > 1 && (
                <span className="px-1.5 py-0.5 rounded bg-zinc-200/60 text-zinc-600 text-[10px] font-mono">
                  High Priority
                </span>
              )}
            </div>
          ))
        ) : (
          <div className="w-full py-12 text-center text-zinc-500 text-sm">
            No keywords found matching your filter.
          </div>
        )}
      </div>

      {filteredList.length > 12 && (
        <div className="mt-6 text-center border-t border-zinc-100 pt-4">
          <button
            onClick={() => setShowAll(!showAll)}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-600 hover:text-blue-700 transition-colors"
          >
            {showAll ? (
              <>Show fewer keywords <ChevronUp className="w-4 h-4" /></>
            ) : (
              <>Show all {filteredList.length} keywords <ChevronDown className="w-4 h-4" /></>
            )}
          </button>
        </div>
      )}
    </div>
  );
};
