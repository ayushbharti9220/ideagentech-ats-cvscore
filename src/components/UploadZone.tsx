import React, { useState } from 'react';
import { Upload, FileText, Briefcase, Sparkles, AlertCircle, ArrowRight, Wand2 } from 'lucide-react';

interface UploadZoneProps {
  onAnalyze: (resumeArrayBuffer: ArrayBuffer, jdText: string) => void;
  isLoading: boolean;
}

export const UploadZone: React.FC<UploadZoneProps> = ({ onAnalyze, isLoading }) => {
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [jdText, setJdText] = useState<string>('');
  const [errorMsg, setErrorMsg] = useState<string>('');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf')) {
        setErrorMsg('Please upload a valid PDF resume file.');
        return;
      }
      setErrorMsg('');
      setResumeFile(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resumeFile) {
      setErrorMsg('Please upload your resume PDF.');
      return;
    }
    if (!jdText.trim()) {
      setErrorMsg('Please paste the Job Description.');
      return;
    }
    setErrorMsg('');
    const buffer = await resumeFile.arrayBuffer();
    onAnalyze(buffer, jdText);
  };

  const loadSampleData = () => {
    setJdText(`We are looking for a Full Stack Software Engineer with expertise in React, TypeScript, Node.js, and SQL databases. 
Requirements:
- 1+ years building web applications with React and TypeScript.
- Strong proficiency in Node.js, REST APIs, and backend integration.
- Experience with Git version control, Agile methodologies, and Tailwind CSS.
- Knowledge of cloud platforms like AWS or Supabase is a plus.`);
    
    const samplePdfBytes = new Uint8Array([
      37, 80, 68, 70, 45, 49, 46, 53, 10, 49, 32, 48, 32, 111, 98, 106, 10, 60, 60, 47, 84, 121, 112, 101, 47, 67, 97, 116, 97, 108, 111, 103, 47, 80, 97, 103, 101, 115, 32, 50, 32, 48, 32, 82, 62, 62, 10, 101, 110, 100, 111, 98, 106, 10, 10
    ]);
    const mockFile = new File([samplePdfBytes], "sample_resume.pdf", { type: "application/pdf" });
    setResumeFile(mockFile);
    setErrorMsg('');
  };

  return (
    <div className="max-w-5xl mx-auto bg-white border border-[#E4E4E7] rounded-2xl p-8 sm:p-10 shadow-sm animate-fade-in">
      <div className="text-center max-w-2xl mx-auto mb-10">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-100 text-blue-700 text-xs font-semibold mb-4 tracking-wide uppercase">
          <Sparkles className="w-3.5 h-3.5 text-blue-600" /> INSTANT RESUME & JD MATCH
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold text-zinc-900 tracking-tight mb-3">
          Optimize your resume for ATS screening
        </h1>
        <p className="text-zinc-600 text-sm sm:text-base leading-relaxed">
          Upload your resume and target job description to analyze keyword match score, detect formatting issues, and get tailored optimization suggestions.
        </p>
      </div>

      {errorMsg && (
        <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm flex items-center gap-3">
          <AlertCircle className="w-5 h-5 flex-shrink-0 text-red-500" />
          <span>{errorMsg}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="block text-sm font-semibold text-zinc-800 flex items-center gap-2">
                <FileText className="w-4 h-4 text-blue-600" /> Resume PDF
              </label>
              <button
                type="button"
                onClick={loadSampleData}
                className="text-xs text-blue-600 hover:text-blue-700 font-medium inline-flex items-center gap-1 hover:underline"
              >
                <Wand2 className="w-3.5 h-3.5" /> Load sample resume & job
              </button>
            </div>
            
            <div className="relative border-2 border-dashed border-zinc-300 hover:border-blue-600 rounded-xl p-6 text-center transition-all bg-zinc-50/50 hover:bg-zinc-50 group cursor-pointer h-52 flex items-center justify-center">
              <input
                type="file"
                accept=".pdf"
                onChange={handleFileChange}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
              <div className="flex flex-col items-center justify-center space-y-3">
                <div className="w-12 h-12 rounded-full bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 group-hover:scale-105 transition-transform">
                  <Upload className="w-5 h-5" />
                </div>
                {resumeFile ? (
                  <div>
                    <p className="text-sm font-medium text-zinc-900 truncate max-w-[280px]">{resumeFile.name}</p>
                    <p className="text-xs text-emerald-600 font-medium mt-1">Ready for analysis</p>
                  </div>
                ) : (
                  <div>
                    <p className="text-sm font-medium text-zinc-800">Drop your resume PDF here</p>
                    <p className="text-xs text-zinc-500 mt-1">Supports standard PDF formats</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="space-y-2 flex flex-col">
            <div className="flex items-center justify-between">
              <label className="block text-sm font-semibold text-zinc-800 flex items-center gap-2">
                <Briefcase className="w-4 h-4 text-emerald-600" /> Target Job Description
              </label>
            </div>
            <textarea
              rows={7}
              value={jdText}
              onChange={(e) => setJdText(e.target.value)}
              placeholder="Paste the target job description requirements here..."
              className="w-full flex-1 bg-zinc-50/50 border border-zinc-300 rounded-xl p-4 text-sm text-zinc-900 placeholder-zinc-400 focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 transition-all resize-none font-sans"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full py-4 px-6 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl shadow-sm hover:shadow flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base"
        >
          {isLoading ? (
            <>
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              <span>Analyzing Resume...</span>
            </>
          ) : (
            <>
              <span>Run ATS CVScore Analysis</span>
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </form>
    </div>
  );
};
