import React, { useState } from 'react';
import { Eye } from 'lucide-react';
import { FormattingDiagnosticReport } from '../core/layoutAnalyzer';
import { ExtractedTextModal } from './ExtractedTextModal';

interface FormattingCardProps {
  report: FormattingDiagnosticReport;
  wordCount: number;
  detectedSections: string[];
  rawText: string;
}

export const FormattingCard: React.FC<FormattingCardProps> = ({ report, wordCount, detectedSections, rawText }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      <div className="bg-white border border-[#E4E4E7] rounded-2xl p-6 flex flex-col justify-between shadow-sm h-full">
        <div>
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Formatting & Readability Check</span>
            <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${report.isSafe ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-amber-50 text-amber-700 border border-amber-200'}`}>
              {report.isSafe ? 'Single-column readable' : 'Formatting Needs Attention'}
            </span>
          </div>

          <div className="space-y-3 mb-4">
            <div className="flex items-center justify-between text-xs text-zinc-600 bg-zinc-50 px-3 py-2 rounded-lg border border-zinc-100">
              <span className="font-medium text-zinc-700">Word Count:</span>
              <span className="font-mono">{wordCount} words</span>
            </div>

            <div className="text-xs text-zinc-600 bg-zinc-50 px-3 py-2 rounded-lg border border-zinc-100">
              <div className="font-medium text-zinc-700 mb-1.5 flex items-center justify-between">
                <span>Detected Sections:</span>
                <button
                  onClick={() => setIsModalOpen(true)}
                  className="text-blue-600 hover:text-blue-700 font-medium inline-flex items-center gap-1 hover:underline"
                >
                  <Eye className="w-3.5 h-3.5" /> View extracted text
                </button>
              </div>
              <div className="flex flex-wrap gap-1 mt-1">
                {detectedSections.length > 0 ? (
                  detectedSections.map((sec, i) => (
                    <span key={i} className="px-2 py-0.5 rounded bg-white text-zinc-700 border border-zinc-200 text-[10px] font-mono uppercase">
                      {sec}
                    </span>
                  ))
                ) : (
                  <span className="text-amber-600">Standard sections not clearly detected</span>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-zinc-100 pt-3">
          <p className="text-xs text-zinc-600 leading-relaxed">
            <strong className="text-zinc-800 font-medium">Status:</strong> {report.recommendations[0]}
          </p>
        </div>
      </div>

      <ExtractedTextModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        rawText={rawText}
      />
    </>
  );
};
