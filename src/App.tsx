import React, { useState, useMemo } from 'react';
import { UploadZone } from './components/UploadZone';
import { ScoreCard } from './components/ScoreCard';
import { CoverageCard } from './components/CoverageCard';
import { FormattingCard } from './components/FormattingCard';
import { SkillPillsTabs } from './components/SkillPillsTabs';
import { SuggestedBullets } from './components/SuggestedBullets';
import { OptimizedResumeModal } from './components/OptimizedResumeModal';
import { parseResumePDF } from './core/pdfParser';
import { analyzeLayout } from './core/layoutAnalyzer';
import { computeTFIDFAndMatch } from './core/tfidfEngine';
import { generatePhrasingFixes } from './core/suggestionEngine';
import { buildOptimizedResume } from './core/resumeOptimizer';
import { downloadResumePDF } from './core/pdfExporter';
import { AnalysisResult } from './types/ats';
import { FileSearch, ArrowLeft, Sparkles, Download } from 'lucide-react';

export default function App() {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [isOptimizerOpen, setIsOptimizerOpen] = useState<boolean>(false);

  const handleAnalyze = async (buffer: ArrayBuffer, jdText: string) => {
    setIsLoading(true);
    try {
      const parseRes = await parseResumePDF(buffer);
      const layoutReport = analyzeLayout(parseRes);
      const matchData = computeTFIDFAndMatch(parseRes.text, jdText);
      const phrasingFixes = generatePhrasingFixes(matchData.missingKeywords);

      const analysisResult: AnalysisResult = {
        matchScore: matchData.matchScore,
        resumeWordCount: parseRes.wordCount,
        jdWordCount: jdText.split(/\s+/).filter(Boolean).length,
        hasMultiColumnRisk: parseRes.hasMultiColumnRisk,
        columnShifts: parseRes.columnShifts,
        detectedSections: parseRes.detectedSections,
        matchedKeywords: matchData.matchedKeywords,
        missingKeywords: matchData.missingKeywords,
        phrasingFixes,
        rawText: parseRes.text,
        rawLines: parseRes.lines,
        summary: layoutReport.isSafe 
          ? 'Resume layout is clean and keyword alignment is well-optimized.'
          : 'Multi-column parsing risk or keyword gaps detected.'
      };

      setResult(analysisResult);
    } catch (err) {
      console.error('Analysis error:', err);
      alert('Failed to parse resume PDF. Please ensure it is a valid, text-based PDF file.');
    } finally {
      setIsLoading(false);
    }
  };

  const optimizedResume = useMemo(() => {
    if (!result) return null;
    return buildOptimizedResume(
      result.rawLines,
      result.rawText,
      result.matchedKeywords,
      result.missingKeywords,
      result.phrasingFixes
    );
  }, [result]);

  return (
    <div className="min-h-screen bg-[#FAFAFA] text-zinc-900 flex flex-col font-sans">
      {/* Header */}
      <header className="border-b border-[#E4E4E7] bg-white/80 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-sm">
              <FileSearch className="w-5 h-5" />
            </div>
            <div>
              <span className="font-bold text-zinc-900 tracking-tight text-base sm:text-lg">Ideagentech ATS CVScore</span>
              <span className="text-xs text-zinc-500 block">ATS Compatibility & Keyword Scorer</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-6 py-10">
        {!result ? (
          <div className="py-6">
            <UploadZone onAnalyze={handleAnalyze} isLoading={isLoading} />
          </div>
        ) : (
          <div className="space-y-6 animate-fade-in">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <button
                onClick={() => setResult(null)}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white hover:bg-zinc-50 text-zinc-800 font-medium text-xs border border-zinc-200 shadow-sm transition-all"
              >
                <ArrowLeft className="w-4 h-4" /> Analyze Another Resume
              </button>

              <div className="flex flex-wrap items-center gap-2.5">
                {optimizedResume && (
                  <>
                    <button
                      onClick={() => setIsOptimizerOpen(true)}
                      className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white hover:bg-zinc-50 text-zinc-800 font-semibold text-xs border border-zinc-200 shadow-sm transition-all"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-emerald-600" /> Preview & Edit Resume
                    </button>
                    <button
                      onClick={() => downloadResumePDF(optimizedResume)}
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs shadow-sm transition-all"
                    >
                      <Download className="w-3.5 h-3.5" /> Download Optimized PDF
                    </button>
                  </>
                )}
                <span className="text-xs font-semibold text-zinc-600 bg-white px-3 py-2 rounded-xl border border-zinc-200 shadow-sm hidden md:inline-block">
                  ATS Compatibility Report
                </span>
              </div>
            </div>

            {/* Top 3-Card Summary Row */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <ScoreCard score={result.matchScore} />
              <CoverageCard 
                matchedCount={result.matchedKeywords.length} 
                totalCount={result.matchedKeywords.length + result.missingKeywords.length} 
              />
              <FormattingCard 
                report={analyzeLayout({
                  text: result.rawText,
                  lines: result.rawLines,
                  wordCount: result.resumeWordCount,
                  hasMultiColumnRisk: result.hasMultiColumnRisk,
                  columnShifts: result.columnShifts,
                  detectedSections: result.detectedSections
                })}
                wordCount={result.resumeWordCount}
                detectedSections={result.detectedSections}
                rawText={result.rawText}
              />
            </div>

            {/* Skill Pills Tabs */}
            <SkillPillsTabs matched={result.matchedKeywords} missing={result.missingKeywords} />

            {/* Top Suggested Bullet Points */}
            <SuggestedBullets fixes={result.phrasingFixes} />

            {/* Optimized Resume Modal */}
            {optimizedResume && (
              <OptimizedResumeModal
                isOpen={isOptimizerOpen}
                onClose={() => setIsOptimizerOpen(false)}
                optimizedResume={optimizedResume}
              />
            )}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-[#E4E4E7] py-6 text-center text-xs text-zinc-500 bg-white">
        <p>Ideagentech ATS CVScore • Instant Resume Scoring & Keyword Optimization</p>
      </footer>
    </div>
  );
}