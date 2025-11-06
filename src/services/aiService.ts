
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';

interface ResumeAnalysisParams {
  resumeUrl?: string;
  resumeContent?: string;
  jobDescription: string;
  jobId?: number;
  applicantId?: number;
  forceUpdate?: boolean;
}

export interface ResumeAnalysis {
  educationLevel: string;
  yearsExperience: string;
  skillsMatch: string;
  keySkills: string[];
  missingRequirements: string[];
  overallScore: number;
  fallback?: boolean;
  debugInfo?: string;
}

export async function analyzeResume(params: ResumeAnalysisParams): Promise<ResumeAnalysis> {
  try {
    console.log('AI features have been disabled, returning static data');
    
    // Return static data instead of making API call
    return {
      educationLevel: 'Bachelor\'s Degree',
      yearsExperience: '1-3 years',
      skillsMatch: 'Medium',
      keySkills: ['Communication', 'Organization', 'Time Management'],
      missingRequirements: ['Technical Experience'],
      overallScore: 65,
      fallback: true
    };
  } catch (error) {
    console.error('Error in analyzeResume function:', error);
    throw error instanceof Error ? error : new Error('Unknown error occurred during resume analysis');
  }
}

// Helper function to validate resume analysis response
function isValidResumeAnalysis(data: unknown): data is ResumeAnalysis {
  if (!data || typeof data !== 'object') return false;
  
  const analysis = data as ResumeAnalysis;
  return (
    typeof analysis.educationLevel === 'string' &&
    typeof analysis.yearsExperience === 'string' &&
    typeof analysis.skillsMatch === 'string' &&
    Array.isArray(analysis.keySkills) &&
    Array.isArray(analysis.missingRequirements) &&
    typeof analysis.overallScore === 'number' &&
    typeof analysis.fallback === 'boolean'
  );
}

export async function getExistingAnalysis(applicationId: number): Promise<ResumeAnalysis | null> {
  try {
    const { data, error } = await supabase
      .from('application_analyses')
      .select('*')
      .eq('application_id', applicationId)
      .single();

    if (error) {
      console.error('Error fetching analysis:', error);
      return null;
    }

    if (!data) {
      return null;
    }

    return {
      educationLevel: data.education_level || 'Not available',
      yearsExperience: data.years_experience ? String(data.years_experience) : 'Not available',
      skillsMatch: data.skills_match || 'Low',
      keySkills: data.key_skills || [],
      missingRequirements: data.missing_requirements || [],
      overallScore: data.overall_score || 0,
      fallback: data.fallback || false,
      debugInfo: null
    };
  } catch (error) {
    console.error('Error in getExistingAnalysis:', error);
    return null;
  }
}

export async function getJobApplicationsAnalyses(jobId: number): Promise<Record<number, ResumeAnalysis>> {
  try {
    // First get all applications for this job
    const { data: applications, error: appError } = await supabase
      .from('applications')
      .select('id')
      .eq('job_id', jobId);

    if (appError || !applications || applications.length === 0) {
      console.error('Error fetching applications:', appError);
      return {};
    }

    const applicationIds = applications.map(app => app.id);

    // Then get analyses for those applications
    const { data, error } = await supabase
      .from('application_analyses')
      .select('*')
      .in('application_id', applicationIds);

    if (error) {
      console.error('Error fetching analyses:', error);
      return {};
    }

    const analysesMap: Record<number, ResumeAnalysis> = {};
    
    for (const analysis of data || []) {
      analysesMap[analysis.application_id] = {
        educationLevel: analysis.education_level || 'Not available',
        yearsExperience: analysis.years_experience ? String(analysis.years_experience) : 'Not available',
        skillsMatch: analysis.skills_match || 'Low',
        keySkills: analysis.key_skills || [],
        missingRequirements: analysis.missing_requirements || [],
        overallScore: analysis.overall_score || 0,
        fallback: analysis.fallback || false
      };
    }

    return analysesMap;
  } catch (error) {
    console.error('Error in getJobApplicationsAnalyses:', error);
    return {};
  }
}

export async function getJobDescription(jobId: number): Promise<string> {
  try {
    const { data, error } = await supabase
      .from('jobs')
      .select('description')
      .eq('id', jobId)
      .single();

    if (error) {
      console.error('Error fetching job description:', error);
      return '';
    }

    return data.description || '';
  } catch (error) {
    console.error('Error in getJobDescription:', error);
    return '';
  }
}
