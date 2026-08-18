
export enum TargetRole {
  CLOUD_SECURITY = 'Cloud Security Engineer',
  CLOUD_ENGINEER = 'Cloud Engineer',
  DEVSECOPS = 'DevSecOps Engineer',
  IAM_ENGINEER = 'IAM Engineer',
  DEVOPS_ENGINEER = 'DevOps Engineer',
  AWS_CLOUD_ENGINEER = 'AWS Cloud Engineer',
  AZURE_CLOUD_ENGINEER = 'Azure Cloud Engineer',
  CLOUD_SOLUTION_ARCHITECT = 'Cloud Solution Architect',
  AZURE_CLOUD_ARCHITECT = 'Azure Cloud Architect',
  SITE_RELIABILITY_ENGINEER = 'Site Reliability Engineer'
}

export interface WorkExperience {
  company: string;
  role: string;
  duration: string;
  bullets: string[];
}

export interface ResumeData {
  name: string;
  contact: {
    location: string;
    email: string;
    phone: string;
    linkedin: string;
  };
  summary: string;
  skills: string[];
  certifications: string[];
  education: string[];
  experience: WorkExperience[];
}

export interface TailoredResume {
  summary: string;
  skills: string[];
  certifications: string[];
  experience: WorkExperience[];
  analysis: {
    matchScore: number;
    keywordsUsed: string[];
    toneNotes: string;
  };
}

export interface HistoryItem {
  id: string;
  timestamp: number;
  targetRole: TargetRole;
  jobDescription: string;
  jobLink?: string;
  tailoredResume: TailoredResume;
}