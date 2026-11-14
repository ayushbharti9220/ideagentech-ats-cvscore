import React, { useState } from 'react';
import { PhrasingFix } from '../types/ats';
import { Sparkles, Copy, Check } from 'lucide-react';

interface SuggestedBulletsProps {
  fixes: PhrasingFix[];
}

export const SuggestedBullets: React.FC<SuggestedBulletsProps> = ({ fixes }) => {
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  if (!fixes || fixes.length === 0) return null;

  return (
    <div className="bg-white border border-[#E4E4E7] rounded-2xl p-6 sm:p-8 shadow-sm">
      <div className="flex items-center gap-2 mb-6">
        <Sparkles className="w-5 h-5 text-blue-600" />
        <h3 className="text-base font-bold text-zinc-900">Top Suggested Resume Bullet Points</h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {fixes.slice(0, 4).map((fix) => (
          <div key={fix.id} className="bg-zinc-50 border border-zinc-200/80 rounded-xl p-5 flex flex-col justify-between hover:border-zinc-300 transition-all">
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="px-2.5 py-1 rounded-lg bg-white text-zinc-800 font-mono text-xs font-semibold border border-zinc-200 shadow-sm">
                  {fix.missingKeyword}
                </span>
                <span className="text-xs text-zinc-500 font-medium">{fix.context}</span>
              </div>

              <p className="text-xs font-mono text-zinc-800 bg-white border border-zinc-200/60 p-3 rounded-lg leading-relaxed mb-4">
                &ldquo;{fix.suggestedBullet}&rdquo;
              </p>
            </div>

            <div className="flex justify-end pt-2 border-t border-zinc-200/50">
              <button
                onClick={() => handleCopy(fix.suggestedBullet, fix.id)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-zinc-200 hover:bg-zinc-50 text-zinc-700 text-xs font-semibold transition-colors shadow-sm"
              >
                {copiedId === fix.id ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                    <span className="text-emerald-700">Copied</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5 text-zinc-500" />
                    <span>Copy bullet</span>
                  </>
                )}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
