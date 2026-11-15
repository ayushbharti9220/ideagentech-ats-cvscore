import React from 'react';
import { Entry, ResumeData } from '../types/resume';

interface Props {
  data: ResumeData;
  editing: boolean;
  onChange: (d: ResumeData) => void;
}

const H: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <h2 className="text-[12px] font-bold uppercase tracking-wider text-[#1e3a5f] border-b border-[#1e3a5f] pb-1 mb-2.5">
    {children}
  </h2>
);

export const ResumePreview: React.FC<Props> = ({ data, editing, onChange }) => {
  const setEntries = (key: 'experience' | 'projects' | 'education', idx: number, patch: Partial<Entry>) => {
    const next = data[key].map((e, i) => (i === idx ? { ...e, ...patch } : e));
    onChange({ ...data, [key]: next });
  };

  const renderEntries = (key: 'experience' | 'projects' | 'education', title: string) => {
    const list = data[key];
    if (list.length === 0) return null;
    return (
      <section>
        <H>{title}</H>
        <div className="space-y-3.5">
          {list.map((e, idx) => (
            <div key={idx}>
              <div className="flex items-baseline justify-between gap-4">
                <p className="text-[13px] font-bold text-zinc-900">{e.title}</p>
                {e.date && <p className="text-[12px] text-zinc-500 whitespace-nowrap">{e.date}</p>}
              </div>
              {e.subtitle && <p className="text-[12.5px] italic text-zinc-600">{e.subtitle}</p>}
              {e.bullets.length > 0 && (
                <ul className="list-disc pl-5 mt-1 space-y-1 text-[13px] text-zinc-800 leading-[1.5]">
                  {e.bullets.map((b, bi) => (
                    <li key={bi}>
                      {editing ? (
                        <textarea
                          rows={2}
                          value={b}
                          onChange={ev =>
                            setEntries(key, idx, { bullets: e.bullets.map((x, xi) => (xi === bi ? ev.target.value : x)) })
                          }
                          className="w-full text-[12.5px] border border-zinc-300 rounded px-2 py-1"
                        />
                      ) : (
                        b
                      )}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </div>
      </section>
    );
  };

  return (
    <div className="w-full max-w-[780px] bg-white border border-zinc-200 shadow-sm px-6 sm:px-10 py-10 text-zinc-900 space-y-5">
      <header className="text-center">
        {editing ? (
          <div className="space-y-2">
            <input value={data.name} onChange={e => onChange({ ...data, name: e.target.value })}
              className="w-full text-center text-2xl font-bold border border-zinc-300 rounded px-2 py-1" />
            <input value={data.headline} onChange={e => onChange({ ...data, headline: e.target.value })}
              className="w-full text-center text-sm border border-zinc-300 rounded px-2 py-1" placeholder="Headline" />
            <input value={data.contacts.join(' | ')}
              onChange={e => onChange({ ...data, contacts: e.target.value.split('|').map(s => s.trim()).filter(Boolean) })}
              className="w-full text-center text-xs border border-zinc-300 rounded px-2 py-1" />
          </div>
        ) : (
          <>
            <h1 className="text-[26px] font-bold tracking-tight leading-tight">{data.name}</h1>
            {data.headline && <p className="text-[13.5px] text-[#1e3a5f] mt-0.5">{data.headline}</p>}
            <p className="text-[12px] text-zinc-500 mt-1">{data.contacts.join('  |  ')}</p>
          </>
        )}
      </header>

      {data.summary && (
        <section>
          <H>Professional Summary</H>
          {editing ? (
            <textarea rows={4} value={data.summary} onChange={e => onChange({ ...data, summary: e.target.value })}
              className="w-full text-[13px] border border-zinc-300 rounded p-2" />
          ) : (
            <p className="text-[13px] leading-[1.6] text-zinc-800">{data.summary}</p>
          )}
        </section>
      )}

      {data.skills.length > 0 && (
        <section>
          <H>Technical Skills</H>
          <div className="space-y-1 text-[13px] text-zinc-800 leading-[1.5]">
            {data.skills.map((g, i) => (
              <p key={i}>
                {g.label && <span className="font-bold">{g.label}: </span>}
                {g.items.join(', ')}
              </p>
            ))}
          </div>
        </section>
      )}

      {renderEntries('experience', 'Professional Experience')}
      {renderEntries('projects', 'Projects')}
      {renderEntries('education', 'Education')}

      {data.certifications.length > 0 && (
        <section>
          <H>Certifications</H>
          <ul className="list-disc pl-5 space-y-1 text-[13px] text-zinc-800">
            {data.certifications.map((c, i) => <li key={i}>{c}</li>)}
          </ul>
        </section>
      )}

      {data.extras.map((ex, i) => (
        <section key={i}>
          <H>{ex.title}</H>
          <ul className="list-disc pl-5 space-y-1 text-[13px] text-zinc-800">
            {ex.lines.map((l, li) => <li key={li}>{l}</li>)}
          </ul>
        </section>
      ))}
    </div>
  );
};
