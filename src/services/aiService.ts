
import { supabase } from '@/integrations/supabase/client';

export interface ResumeAnalysis {
  educationLevel: string;
  yearsExperience: string;
  skillsMatch: string;
  keySkills: string[];
  missingRequirements: string[];
  overallScore: number;
}

/**
 * Analyze a resume against a job description
 */
export const analyzeResume = async (
  resumeUrl: string, 
  jobDescription: string,
  jobId?: number,
  applicantId?: number
): Promise<ResumeAnalysis> => {
  const { data, error } = await supabase.functions.invoke('analyze-resume', {
    body: {
      resumeUrl,
      jobDescription,
      jobId,
      applicantId
    }
  });

  if (error) {
    console.error('Error analyzing resume:', error);
    throw new Error('Failed to analyze resume');
  }

  return data as ResumeAnalysis;
};

/**
 * Get stored analysis for an application
 */
export const getApplicationAnalysis = async (applicationId: number): Promise<ResumeAnalysis | null> => {
  const { data, error } = await supabase
    .from('application_analyses')
    .select('*')
    .eq('application_id', applicationId)
    .single();

  if (error) {
    console.error('Error fetching application analysis:', error);
    return null;
  }

  if (!data) return null;

  return {
    educationLevel: data.education_level,
    yearsExperience: data.years_experience,
    skillsMatch: data.skills_match,
    keySkills: data.key_skills,
    missingRequirements: data.missing_requirements,
    overallScore: data.overall_score
  };
};

/**
 * Get analyses for all applications for a job
 */
export const getJobApplicationsAnalyses = async (jobId: number): Promise<Record<number, ResumeAnalysis>> => {
  const { data, error } = await supabase
    .from('application_analyses')
    .select('*')
    .eq('job_id', jobId);

  if (error) {
    console.error('Error fetching job application analyses:', error);
    return {};
  }

  const analysesMap: Record<number, ResumeAnalysis> = {};
  
  data.forEach(item => {
    analysesMap[item.application_id] = {
      educationLevel: item.education_level,
      yearsExperience: item.years_experience,
      skillsMatch: item.skills_match,
      keySkills: item.key_skills,
      missingRequirements: item.missing_requirements,
      overallScore: item.overall_score
    };
  });

  return analysesMap;
};
