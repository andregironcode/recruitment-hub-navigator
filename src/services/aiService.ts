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

export async function analyzeResume({
  resumeUrl,
  resumeContent,
  jobDescription,
  jobId,
  applicantId,
  forceUpdate = false
}: ResumeAnalysisParams): Promise<ResumeAnalysis> {
  try {
    console.log('Analyzing resume with params:', { 
      resumeUrl: resumeUrl?.substring(0, 100), 
      contentProvided: !!resumeContent, 
      contentLength: resumeContent ? resumeContent.length : 0,
      jobId, 
      applicantId,
      forceUpdate 
    });
    
    // Get the Supabase anon key from the client instead of using process.env
    const { data: { session } } = await supabase.auth.getSession();
    const supabaseKey = session?.access_token || await getSBPublicKey();
    
    // First check if an analysis already exists for this application
    if (jobId && applicantId && !forceUpdate) {
      const existingAnalysis = await getExistingAnalysis(applicantId);
      if (existingAnalysis) {
        console.log('Found existing analysis for application', applicantId, existingAnalysis);
        // If an analysis already exists and is not a fallback, return it
        if (!existingAnalysis.fallback) {
          return existingAnalysis;
        }
        // Otherwise continue to generate a new one
      }
    }
    
    // Only make the function call if we have both a resumeUrl/resumeContent and a jobDescription
    if ((!resumeUrl && !resumeContent) || !jobDescription) {
      console.error('Missing required parameters for resume analysis:', {
        hasResumeUrl: !!resumeUrl,
        hasResumeContent: !!resumeContent,
        hasJobDescription: !!jobDescription
      });
      return {
        educationLevel: 'Not available',
        yearsExperience: 'Not available',
        skillsMatch: 'Low',
        keySkills: ['Unable to analyze resume - missing required parameters'],
        missingRequirements: ['Unable to analyze resume - missing required parameters'],
        overallScore: 0,
        fallback: true,
        debugInfo: 'Missing required parameters'
      };
    }
    
    // Log important parameters for debugging
    console.log('Sending resume analysis request with:', {
      resumeUrlProvided: !!resumeUrl,
      resumeContentProvided: !!resumeContent,
      resumeContentLength: resumeContent?.length || 0,
      jobDescriptionLength: jobDescription.length,
      forceUpdate
    });
    
    // Display a toast message for users to know the analysis is in progress
    if (forceUpdate) {
      toast({
        title: 'Re-analyzing resume',
        description: 'Sending resume to AI for a fresh analysis...',
      });
    } else {
      toast({
        title: 'Analyzing resume',
        description: 'Processing resume against job requirements...',
      });
    }
    
    // Check if URL ends with pdf to ensure we're passing the full URL to the edge function
    // Sometimes URLs can get truncated and this causes issues with PDF detection
    if (resumeUrl && !resumeUrl.endsWith('.pdf') && resumeUrl.includes('.pdf')) {
      resumeUrl = resumeUrl.substring(0, resumeUrl.indexOf('.pdf') + 4);
      console.log('Fixed PDF URL:', resumeUrl);
    }
    
    // Send to edge function for analysis
    const response = await fetch(
      'https://rtuzdeaxmpikwuvplcbh.supabase.co/functions/v1/analyze-resume',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${supabaseKey}`,
        },
        body: JSON.stringify({
          resumeUrl,
          resumeContent,
          jobDescription,
          jobId,
          applicantId,
          forceUpdate
        }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Error analyzing resume:', errorText);
      toast({
        title: 'Analysis Error',
        description: 'There was an error analyzing the resume. Please try again.',
        variant: 'destructive'
      });
      return {
        educationLevel: 'Error',
        yearsExperience: 'Error',
        skillsMatch: 'Error',
        keySkills: [`Error analyzing resume: ${errorText}`],
        missingRequirements: [],
        overallScore: 0,
        fallback: true,
        debugInfo: `HTTP Error ${response.status}: ${errorText}`
      };
    }

    const data = await response.json();
    console.log('Received analysis result:', data);

    // Show success message
    toast({
      title: 'Analysis Complete',
      description: data.fallback ? 
        'Resume was analyzed but with limited results.' : 
        'Resume successfully analyzed against job requirements.',
    });

    // Validate and return the analysis data
    return {
      educationLevel: data.educationLevel || 'Not available',
      yearsExperience: data.yearsExperience || 'Not available',
      skillsMatch: data.skillsMatch || 'Low',
      keySkills: Array.isArray(data.keySkills) ? data.keySkills : [],
      missingRequirements: Array.isArray(data.missingRequirements) ? data.missingRequirements : [],
      overallScore: typeof data.overallScore === 'number' ? data.overallScore : 0,
      fallback: !!data.fallback,
      debugInfo: data.debugInfo || data.error || null
    };
  } catch (error) {
    console.error('Error in analyzeResume function:', error);
    toast({
      title: 'Analysis Failed',
      description: 'Failed to analyze the resume. Please try again later.',
      variant: 'destructive'
    });
    // Return a default analysis when the API fails
    return {
      educationLevel: 'Not available',
      yearsExperience: 'Not available',
      skillsMatch: 'Low',
      keySkills: ['Unable to analyze resume due to error'],
      missingRequirements: ['Unable to analyze resume due to error'],
      overallScore: 0,
      fallback: true,
      debugInfo: error instanceof Error ? error.message : 'Unknown error'
    };
  }
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
