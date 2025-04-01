
import { supabase } from '@/integrations/supabase/client';

export interface ResumeAnalysis {
  overallScore: number;
  skillsMatch: string;
  keySkills: string[];
  missingRequirements: string[];
  educationLevel: string;
  yearsExperience: string;
  fallback?: boolean;
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
  try {
    // For blob URLs, we can't send the actual content to the edge function
    // So we'll extract a preview of the file content when possible
    let resumeContent = null;
    
    if (resumeUrl && resumeUrl.startsWith('blob:')) {
      try {
        // Log this limitation
        console.log('Attempting to extract content from blob URL:', resumeUrl);
        console.error('Blob URLs cannot be processed by the server. Please upload files to storage first.');
      } catch (err) {
        console.warn('Unable to extract content from blob URL:', err);
      }
    }

    const { data, error } = await supabase.functions.invoke('analyze-resume', {
      body: {
        resumeUrl,
        resumeContent,
        jobDescription,
        jobId,
        applicantId
      }
    });

    if (error) {
      console.error('Error analyzing resume:', error);
      throw new Error('Failed to analyze resume');
    }

    // Check if we got an error response from the edge function
    if (data.error) {
      console.error('Error from edge function:', data.error);
      throw new Error(data.error);
    }

    return data as ResumeAnalysis;
  } catch (err) {
    console.error('Resume analysis error:', err);
    throw err;
  }
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
    overallScore: data.overall_score,
    fallback: data.fallback
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
      overallScore: item.overall_score,
      fallback: item.fallback
    };
  });

  return analysesMap;
};
