import React, { useRef, useState } from 'react';
import { Upload, FileText, Briefcase, Sparkles, AlertCircle, Download, Wand2 } from 'lucide-react';
import { makeSampleResumePdf, SAMPLE_JD } from '../core/sampleResume';

interface UploadZoneProps {
  onGenerate: (resume: ArrayBuffer, jdText: string) => void;
  isLoading: boolean;
  error: string;
}

export const UploadZone: React.FC<UploadZoneProps> = ({ onGenerate, isLoading, error }) => {
  const [file, setFile] = useState<File | null>(null);
  const [jd, setJd] = useState('');
  const [localError, setLocalError] = useState('');
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const acceptFile = (f: File | undefined | null) => {
    if (!f) return;
    if (f.type !== 'application/pdf' && !f.name.toLowerCase().endsWith('.pdf')) {
      setLocalError('Please upload a PDF resume.');
      return;
    }
    setLocalError('');
    setFile(f);
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      setLocalError('Please upload your resume PDF first.');
      return;
    }
    setLocalError('');
    onGenerate(await file.arrayBuffer(), jd);
  };

  const loadSample = () => {
    const bytes = makeSampleResumePdf();
    setFile(new File([bytes], 'sample_resume.pdf', { type: 'application/pdf' }));
    setJd(SAMPLE_JD);
    setLocalError('');
  };

  const shownError = localError || error;

  return (
    <div className="max-w-5xl mx-auto bg-white border border-[#E4E4E7] rounded-2xl p-6 sm:p-10 shadow-sm animate-fade-in">
      <div className="text-center max-w-2xl mx-auto mb-10">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-100 text-blue-700 text-xs font-semibold mb-4 tracking-wide uppercase">
          <Sparkles className="w-3.5 h-3.5" /> One click resume upgrade
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold text-zinc-900 tracking-tight mb-3">
          Upload your resume. Get a better one back.
        </h1>
        <p className="text-zinc-600 text-sm sm:text-base leading-relaxed">
          AI rewrites your resume into a polished, ATS-friendly PDF: a sharper summary, stronger impact-driven bullets,
          organised skills and the right keywords for the job. It downloads in one click.
        </p>
      </div>

      {shownError && (
        <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm flex items-start gap-3">
          <AlertCircle className="w-5 h-5 flex-shrink-0 text-red-500 mt-0.5" />
          <span>{shownError}</span>
        </div>
      )}

      <form onSubmit={submit} className="space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-sm font-semibold text-zinc-800 flex items-center gap-2">
                <FileText className="w-4 h-4 text-blue-600" /> Your resume (PDF)
              </label>
              <button
                type="button"
                onClick={loadSample}
                className="text-xs text-blue-600 hover:text-blue-700 font-medium inline-flex items-center gap-1 hover:underline"
              >
                <Wand2 className="w-3.5 h-3.5" /> Try a sample
              </button>
            </div>

            <div
              onDragOver={e => { e.preventDefault(); setDragging(true); }}
              onDragLeave={() => setDragging(false)}
              onDrop={e => { e.preventDefault(); setDragging(false); acceptFile(e.dataTransfer.files?.[0]); }}
              onClick={() => inputRef.current?.click()}
              className={`relative border-2 border-dashed rounded-xl p-6 text-center transition-all cursor-pointer h-52 flex items-center justify-center ${
                dragging ? 'border-blue-600 bg-blue-50/60' : 'border-zinc-300 hover:border-blue-600 bg-zinc-50/50 hover:bg-zinc-50'
              }`}
            >
              <input
                ref={inputRef}
                type="file"
                accept=".pdf,application/pdf"
                onChange={e => acceptFile(e.target.files?.[0])}
                className="hidden"
              />
              <div className="flex flex-col items-center space-y-3">
                <div className="w-12 h-12 rounded-full bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600">
                  <Upload className="w-5 h-5" />
                </div>
                {file ? (
                  <div>
                    <p className="text-sm font-medium text-zinc-900 truncate max-w-[260px]">{file.name}</p>
                    <p className="text-xs text-emerald-600 font-medium mt-1">Ready, click to replace</p>
                  </div>
                ) : (
                  <div>
                    <p className="text-sm font-medium text-zinc-800">Drop your resume PDF here</p>
                    <p className="text-xs text-zinc-500 mt-1">or click to browse (text-based PDF)</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="space-y-2 flex flex-col">
            <label className="text-sm font-semibold text-zinc-800 flex items-center gap-2">
              <Briefcase className="w-4 h-4 text-emerald-600" /> Target job description
              <span className="text-xs font-normal text-zinc-400">(optional, recommended)</span>
            </label>
            <textarea
              rows={7}
              value={jd}
              onChange={e => setJd(e.target.value)}
              placeholder="Paste the job description so your resume is tailored to it..."
              className="w-full flex-1 min-h-[13rem] bg-zinc-50/50 border border-zinc-300 rounded-xl p-4 text-sm text-zinc-900 placeholder-zinc-400 focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 transition-all resize-none"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full py-4 px-6 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl shadow-sm flex items-center justify-center gap-2 transition-all disabled:opacity-60 disabled:cursor-not-allowed text-sm sm:text-base"
        >
          {isLoading ? (
            <>
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              <span>Building your resume...</span>
            </>
          ) : (
            <>
              <Download className="w-4 h-4" />
              <span>Improve &amp; Download Resume</span>
            </>
          )}
        </button>
      </form>
    </div>
  );
};
