import React, { useState, useEffect } from 'react';
import { X, Download, Sparkles, CheckCircle2, Edit3, Check } from 'lucide-react';
import { StructuredResume } from '../types/ats';
import { downloadResumePDF } from '../core/pdfExporter';

interface OptimizedResumeModalProps {
  isOpen: boolean;
  onClose: () => void;
  optimizedResume: StructuredResume;
}

export const OptimizedResumeModal: React.FC<OptimizedResumeModalProps> = ({
  isOpen,
  onClose,
  optimizedResume
}) => {
  const [resumeData, setResumeData] = useState<StructuredResume>(optimizedResume);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [downloaded, setDownloaded] = useState<boolean>(false);

  useEffect(() => {
    setResumeData(optimizedResume);
  }, [optimizedResume]);

  if (!isOpen) return null;

  const handleDirectDownload = () => {
    setIsEditing(false);
    downloadResumePDF(resumeData);
    setDownloaded(true);
    setTimeout(() => setDownloaded(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-900/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white border border-zinc-200 rounded-2xl max-w-4xl w-full max-h-[92vh] flex flex-col shadow-2xl overflow-hidden">
        
        {/* Top Action Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 px-6 py-4 border-b border-zinc-200 bg-zinc-50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-700">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-zinc-900 text-sm sm:text-base">ATS & Recruiter-Ready Resume</h3>
              <p className="text-xs text-zinc-500">Preserves your real details while integrating missing job keywords cleanly</p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={() => setIsEditing(!isEditing)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-white hover:bg-zinc-100 text-zinc-700 border border-zinc-300 rounded-xl text-xs font-semibold transition-all"
            >
              <Edit3 className="w-3.5 h-3.5" /> {isEditing ? 'Done Editing' : 'Quick Edit'}
            </button>
            <button
              onClick={handleDirectDownload}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow-sm transition-all"
            >
              {downloaded ? (
                <>
                  <Check className="w-4 h-4" /> Downloaded PDF!
                </>
              ) : (
                <>
                  <Download className="w-4 h-4" /> Download Resume PDF
                </>
              )}
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-700 hover:bg-zinc-200/60 transition-colors"
              aria-label="Close modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Paper Preview Container */}
        <div className="p-6 sm:p-10 overflow-y-auto bg-zinc-100/70 flex justify-center">
          <div className="w-full max-w-[760px] bg-white border border-zinc-200 shadow-sm px-10 py-10 text-zinc-900 font-sans space-y-5">
            {/* Candidate Header */}
            <div className="pb-2">
              {isEditing ? (
                <div className="space-y-2">
                  <input
                    value={resumeData.fullName}
                    onChange={(e) => setResumeData({ ...resumeData, fullName: e.target.value })}
                    className="w-full text-2xl font-bold uppercase tracking-tight border border-zinc-300 rounded px-2 py-1"
                  />
                  <input
                    value={resumeData.headline}
                    onChange={(e) => setResumeData({ ...resumeData, headline: e.target.value })}
                    className="w-full text-sm text-zinc-600 border border-zinc-300 rounded px-2 py-1"
                  />
                  <input
                    value={resumeData.contactLine}
                    onChange={(e) => setResumeData({ ...resumeData, contactLine: e.target.value })}
                    className="w-full text-xs text-zinc-500 border border-zinc-300 rounded px-2 py-1"
                  />
                </div>
              ) : (
                <>
                  <h1 className="text-[26px] font-bold tracking-tight text-zinc-900 uppercase leading-tight">
                    {resumeData.fullName}
                  </h1>
                  <p className="text-[13px] text-zinc-600 mt-1">
                    {resumeData.headline} &bull; {resumeData.contactLine}
                  </p>
                </>
              )}
            </div>

            {/* Professional Summary */}
            <div>
              <h2 className="text-[12px] font-bold uppercase tracking-wider text-zinc-900 border-b border-zinc-300 pb-1 mb-2.5">
                Professional Summary
              </h2>
              {isEditing ? (
                <textarea
                  rows={3}
                  value={resumeData.summary}
                  onChange={(e) => setResumeData({ ...resumeData, summary: e.target.value })}
                  className="w-full text-[13px] text-zinc-800 border border-zinc-300 rounded p-2 leading-relaxed"
                />
              ) : (
                <p className="text-[13px] text-zinc-800 leading-[1.6]">
                  {resumeData.summary}
                </p>
              )}
            </div>

            {/* Technical Skills */}
            <div>
              <h2 className="text-[12px] font-bold uppercase tracking-wider text-zinc-900 border-b border-zinc-300 pb-1 mb-2.5">
                Technical Skills
              </h2>
              {isEditing ? (
                <input
                  value={resumeData.skills.join(', ')}
                  onChange={(e) =>
                    setResumeData({
                      ...resumeData,
                      skills: e.target.value.split(',').map(s => s.trim()).filter(Boolean)
                    })
                  }
                  className="w-full text-[12px] text-zinc-800 border border-zinc-300 rounded p-2"
                />
              ) : (
                <div className="flex flex-wrap gap-1.5">
                  {resumeData.skills.map((skill, idx) => (
                    <span
                      key={idx}
                      className="px-2.5 py-1 bg-zinc-100 border border-zinc-200/90 rounded text-[11.5px] font-medium text-zinc-800"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Work Experience */}
            <div>
              <h2 className="text-[12px] font-bold uppercase tracking-wider text-zinc-900 border-b border-zinc-300 pb-1 mb-2.5">
                Work Experience
              </h2>
              <div className="space-y-4">
                {resumeData.experienceItems.map((exp, idx) => (
                  <div key={idx}>
                    <p className="text-[13px] font-bold text-zinc-900 mb-1.5">{exp.header}</p>
                    <ul className="list-disc pl-5 space-y-1.5 text-[13px] text-zinc-800 leading-[1.55]">
                      {exp.bullets.map((bullet, bIdx) => (
                        <li key={bIdx}>
                          {isEditing ? (
                            <input
                              value={bullet}
                              onChange={(e) => {
                                const updatedExp = [...resumeData.experienceItems];
                                updatedExp[idx].bullets[bIdx] = e.target.value;
                                setResumeData({ ...resumeData, experienceItems: updatedExp });
                              }}
                              className="w-full text-[12.5px] border border-zinc-300 rounded px-2 py-0.5"
                            />
                          ) : (
                            bullet
                          )}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>

            {/* Education */}
            <div>
              <h2 className="text-[12px] font-bold uppercase tracking-wider text-zinc-900 border-b border-zinc-300 pb-1 mb-2">
                Education
              </h2>
              <div className="space-y-1 text-[13px] text-zinc-800">
                {resumeData.educationItems.map((edu, idx) => (
                  <p key={idx} className={idx === 0 ? 'font-semibold text-zinc-900' : 'text-zinc-700'}>
                    {edu}
                  </p>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Status Bar */}
        <div className="px-6 py-3.5 border-t border-zinc-200 bg-white flex flex-wrap items-center justify-between gap-2 text-xs text-zinc-600">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
            <span>
              Single-column ATS format &bull; Direct 1-click PDF export &bull;{' '}
              {resumeData.integratedKeywords.length > 0
                ? `Integrated: ${resumeData.integratedKeywords.join(', ')}`
                : 'All target keywords aligned'}
            </span>
          </div>
          <button
            onClick={handleDirectDownload}
            className="text-blue-600 hover:text-blue-700 font-semibold hover:underline"
          >
            Download PDF now &rarr;
          </button>
        </div>

      </div>
    </div>
  );
};
