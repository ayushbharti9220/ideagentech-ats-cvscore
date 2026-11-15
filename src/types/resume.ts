export interface Entry {
  title: string;
  subtitle?: string;
  date?: string;
  bullets: string[];
}

export interface SkillGroup {
  label?: string;
  items: string[];
}

export interface ExtraSection {
  title: string;
  lines: string[];
}

export interface ResumeData {
  name: string;
  headline: string;
  contacts: string[];
  summary: string;
  skills: SkillGroup[];
  experience: Entry[];
  projects: Entry[];
  education: Entry[];
  certifications: string[];
  extras: ExtraSection[];
}
