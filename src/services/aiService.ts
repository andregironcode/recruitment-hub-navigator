import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';

interface ResumeAnalysisParams {
  resumeUrl?: string;
  resumeContent?: string;
  jobDescription: string;
  jobId?: number;
  applicantId?: number;
  forceUpdate?: boolean; // New parameter to force a new analysis
}

export interface ResumeAnalysis {
  educationLevel: string;
  yearsExperience: string;
  skillsMatch: string;
  keySkills: string[];
  missingRequirements: string[];
  overallScore: number;
  fallback?: boolean;
  debugInfo?: string; // Add debug info field to help troubleshoot issues
}

export async function analyzeResume(params: ResumeAnalysisParams): Promise<ResumeAnalysis> {
  try {
    console.log('Analyzing resume with params:', {
      resumeUrl: params.resumeUrl,
      contentProvided: !!params.resumeContent,
      contentLength: params.resumeContent?.length || 0,
      jobId: params.jobId,
      applicantId: params.applicantId,
      forceUpdate: params.forceUpdate
    });

    const requestData = {
      resumeUrl: params.resumeUrl,
      resumeContent: params.resumeContent,
      jobDescription: params.jobDescription,
      jobId: params.jobId,
      applicantId: params.applicantId,
      forceUpdate: params.forceUpdate
    };

    console.log('Sending resume analysis request with:', {
      resumeUrlProvided: !!params.resumeUrl,
      resumeContentProvided: !!params.resumeContent,
      resumeContentLength: params.resumeContent?.length || 0,
      jobDescriptionLength: params.jobDescription.length,
      forceUpdate: params.forceUpdate
    });

    const response = await fetch('/api/analyze-resume', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestData),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      throw new Error(
        errorData?.error || 
        `HTTP error! status: ${response.status}`
      );
    }

    const data = await response.json();
    
    // Validate the response data
    if (!isValidResumeAnalysis(data)) {
      throw new Error('Invalid response format from resume analysis');
    }

    console.log('Analysis received for', params.applicantId, ':', data);
    return data;
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

// Helper function to get the public Supabase key if the session isn't available
async function getSBPublicKey(): Promise<string> {
  // Try to get the public key from the window object if available
  if (typeof window !== 'undefined' && (window as any).SUPABASE_ANON_KEY) {
    return (window as any).SUPABASE_ANON_KEY;
  }
  
  // Fallback key - this should be replaced with the actual public key if needed
  // This is safe to include in the client code as it's a public key
  return 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ0dXpkZWF4bXBpa3d1dnBsY2JoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDM1MDYzMTIsImV4cCI6MjA1OTA4MjMxMn0.Ame9c-wN0mL45G_x01pcY0G1ryY1elR5LuUg7BWYJhU';
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
      yearsExperience: data.years_experience || 'Not available',
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
    const { data, error } = await supabase
      .from('application_analyses')
      .select('*')
      .eq('job_id', jobId);

    if (error) {
      console.error('Error fetching analyses:', error);
      return {};
    }

    const analysesMap: Record<number, ResumeAnalysis> = {};
    
    for (const analysis of data || []) {
      analysesMap[analysis.application_id] = {
        educationLevel: analysis.education_level || 'Not available',
        yearsExperience: analysis.years_experience || 'Not available',
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
