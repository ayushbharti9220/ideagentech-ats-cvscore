import React, { useState } from 'react';
import { FileSearch, ArrowLeft, Download, Edit3, CheckCircle2, Lightbulb, Info } from 'lucide-react';
import { UploadZone } from './components/UploadZone';
import { ResumePreview } from './components/ResumePreview';
import { extractResumeLines } from './core/pdfParser';
import { buildResume } from './core/resumeBuilder';
import { improveWithAI } from './core/aiImprove';
import { downloadResumePdf } from './core/pdfExporter';
import { ResumeData } from './types/resume';

export default function App() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [resume, setResume] = useState<ResumeData | null>(null);
  const [editing, setEditing] = useState(false);
  const [notes, setNotes] = useState<string[]>([]);
  const [aiUsed, setAiUsed] = useState(false);

  const handleGenerate = async (buffer: ArrayBuffer, jdText: string) => {
    setIsLoading(true);
    setError('');
    try {
      const lines = await extractResumeLines(buffer);
      const base = buildResume(lines, jdText);
      let finalData = base;
      let aiNotes: string[] = [];
      let used = false;
      try {
        // AI rewrite: stronger bullets, tailored summary, grouped skills, extra improvements.
        const ai = await improveWithAI(base, jdText);
        finalData = ai.resume;
        aiNotes = ai.notes;
        used = true;
      } catch (aiErr) {
        console.warn('AI step skipped, using standard improvement.', aiErr);
      }
      setResume(finalData);
      setNotes(aiNotes);
      setAiUsed(used);
      setEditing(false);
      // One click: the improved resume downloads immediately.
      try {
        downloadResumePdf(finalData);
      } catch (e) {
        console.error('Auto-download failed, use the button instead.', e);
      }
    } catch (err: any) {
      console.error(err);
      setError(err?.message || 'Something went wrong while reading your resume.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAFAFA] text-zinc-900 flex flex-col font-sans">
      <header className="border-b border-[#E4E4E7] bg-white/80 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-sm">
            <FileSearch className="w-5 h-5" />
          </div>
          <div>
            <span className="font-bold tracking-tight text-base sm:text-lg">Ideagentech ATS CVScore</span>
            <span className="text-xs text-zinc-500 block">Resume Upgrader</span>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-10">
        {!resume ? (
          <UploadZone onGenerate={handleGenerate} isLoading={isLoading} error={error} />
        ) : (
          <div className="space-y-6 animate-fade-in">
            <div className="max-w-[780px] mx-auto bg-emerald-50 border border-emerald-200 rounded-2xl px-5 py-4 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2.5 text-emerald-800">
                <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
                <div>
                  <p className="font-semibold text-sm">Your improved resume is ready.</p>
                  <p className="text-xs text-emerald-700">It should have downloaded already. If not, use the button.</p>
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <button
                  onClick={() => setEditing(e => !e)}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white hover:bg-zinc-50 text-zinc-800 font-semibold text-xs border border-zinc-200 shadow-sm"
                >
                  <Edit3 className="w-3.5 h-3.5" /> {editing ? 'Done editing' : 'Edit text'}
                </button>
                <button
                  onClick={() => { setEditing(false); downloadResumePdf(resume); }}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs shadow-sm"
                >
                  <Download className="w-3.5 h-3.5" /> Download PDF
                </button>
              </div>
            </div>

            {!aiUsed && (
              <div className="max-w-[780px] mx-auto bg-amber-50 border border-amber-200 rounded-2xl px-5 py-3 flex items-start gap-2.5 text-amber-800 text-xs">
                <Info className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <span>AI rewriting was unavailable, so this is the standard clean-up (layout, phrasing, keywords). Add a free GEMINI_API_KEY on Vercel to enable full AI rewriting (see README).</span>
              </div>
            )}

            {notes.length > 0 && (
              <div className="max-w-[780px] mx-auto bg-blue-50 border border-blue-100 rounded-2xl px-5 py-4">
                <p className="flex items-center gap-2 text-sm font-semibold text-blue-900 mb-2">
                  <Lightbulb className="w-4 h-4" /> Make it even stronger: add these if they are true
                </p>
                <ul className="list-disc pl-5 space-y-1 text-xs text-blue-900/90">
                  {notes.map((n, i) => <li key={i}>{n}</li>)}
                </ul>
                <p className="text-[11px] text-blue-700/80 mt-2">We never invent numbers or experience for you. Use "Edit text" to add them.</p>
              </div>
            )}

            <div className="flex justify-center bg-zinc-100/70 rounded-2xl p-3 sm:p-8">
              <ResumePreview data={resume} editing={editing} onChange={setResume} />
            </div>

            <div className="max-w-[780px] mx-auto">
              <button
                onClick={() => { setResume(null); setEditing(false); setNotes([]); }}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white hover:bg-zinc-50 text-zinc-800 font-medium text-xs border border-zinc-200 shadow-sm"
              >
                <ArrowLeft className="w-4 h-4" /> Improve another resume
              </button>
            </div>
          </div>
        )}
      </main>

      <footer className="border-t border-[#E4E4E7] py-6 text-center text-xs text-zinc-500 bg-white">
        Ideagentech ATS CVScore &bull; Your resume is processed to rewrite it and is not stored
      </footer>
    </div>
  );
}
