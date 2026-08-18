/*
  (c) EliteJobsAfrica
  Creator: Otemade Balogun Adedamola 
  Access: 
  balogun.otemade@gmail.com
  Info@elitejobs.africa
*/
import { ResumeData, TargetRole, TailoredResume } from '../types';

async function handleApiResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    let errorMessage = `Server error (${response.status})`;
    try {
      const errJson = await response.json();
      if (errJson && errJson.error) {
        errorMessage = errJson.error;
      }
    } catch {
      // fallback
    }
    throw new Error(errorMessage);
  }
  return response.json() as Promise<T>;
}

export const generateTailoredResume = async (
  jobDescription: string,
  targetRole: TargetRole,
  baseResume: ResumeData,
  jobLink?: string
): Promise<TailoredResume> => {
  const response = await fetch('/api/generate-tailored-resume', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      jobDescription,
      targetRole,
      baseResume,
      jobLink
    })
  });

  return handleApiResponse<TailoredResume>(response);
};

export const optimizeTailoredResume = async (
  currentResume: TailoredResume,
  userPrompt: string,
  jobDescription: string,
  targetRole: TargetRole
): Promise<TailoredResume> => {
  const response = await fetch('/api/optimize-tailored-resume', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      currentResume,
      userPrompt,
      jobDescription,
      targetRole
    })
  });

  return handleApiResponse<TailoredResume>(response);
};

export interface ApplicationAnswerResponse {
  generated_answer: string;
  confidence_note: string;
  intent_detected: string;
}

export const generateApplicationAnswer = async (
  question: string,
  targetRole: TargetRole,
  baseResume: ResumeData,
  wordLimit?: number,
  jobDescription?: string,
  jobLink?: string
): Promise<ApplicationAnswerResponse> => {
  const response = await fetch('/api/generate-application-answer', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      question,
      targetRole,
      baseResume,
      wordLimit,
      jobDescription,
      jobLink
    })
  });

  return handleApiResponse<ApplicationAnswerResponse>(response);
};

export interface CoverLetterResponse {
  content: string;
}

export const generateCoverLetter = async (
  companyName: string,
  hiringManager: string,
  targetRole: TargetRole,
  baseResume: ResumeData,
  jobDescription?: string,
): Promise<CoverLetterResponse> => {
  const response = await fetch('/api/generate-cover-letter', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      companyName,
      hiringManager,
      targetRole,
      baseResume,
      jobDescription
    })
  });

  return handleApiResponse<CoverLetterResponse>(response);
};

export const parseResumeFromText = async (text: string): Promise<ResumeData> => {
  const response = await fetch('/api/parse-resume-text', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text })
  });

  return handleApiResponse<ResumeData>(response);
};
