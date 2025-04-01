
import { supabase } from '@/integrations/supabase/client';

interface ResumeAnalysisParams {
  resumeUrl?: string;
  resumeContent?: string;
  jobDescription: string;
  jobId?: number;
  applicantId?: number;
}

export interface ResumeAnalysis {
  educationLevel: string;
  yearsExperience: string;
  skillsMatch: string;
  keySkills: string[];
  missingRequirements: string[];
  overallScore: number;
  fallback?: boolean;
}

export async function analyzeResume({
  resumeUrl,
  resumeContent,
  jobDescription,
  jobId,
  applicantId
}: ResumeAnalysisParams): Promise<ResumeAnalysis> {
  try {
    console.log('Analyzing resume with params:', { 
      resumeUrl: resumeUrl?.substring(0, 50), 
      contentProvided: !!resumeContent, 
      contentLength: resumeContent ? resumeContent.length : 0,
      jobId, 
      applicantId 
    });
    
    // Get the Supabase anon key from the client instead of using process.env
    const { data: { session } } = await supabase.auth.getSession();
    const supabaseKey = session?.access_token || await getSBPublicKey();
    
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
          applicantId
        }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Error analyzing resume:', errorText);
      throw new Error(`Failed to analyze resume: ${errorText}`);
    }

    const data = await response.json();
    console.log('Received analysis result:', data);
    
    // Store the analysis result in the database directly if jobId and applicantId are provided
    if (jobId && applicantId) {
      try {
        // First check if an analysis already exists for this application
        const { data: existingAnalysis } = await supabase
          .from('application_analyses')
          .select('id')
          .eq('application_id', applicantId)
          .single();
        
        if (existingAnalysis) {
          // Update existing analysis
          const { error: updateError } = await supabase
            .from('application_analyses')
            .update({
              education_level: data.educationLevel || 'Not available',
              years_experience: data.yearsExperience || 'Not available',
              skills_match: data.skillsMatch || 'Low',
              key_skills: data.keySkills || [],
              missing_requirements: data.missingRequirements || [],
              overall_score: data.overallScore || 0,
              fallback: data.fallback || false,
              analyzed_at: new Date().toISOString()
            })
            .eq('id', existingAnalysis.id);
            
          if (updateError) {
            console.error('Error updating analysis:', updateError);
          } else {
            console.log('Updated existing analysis for application:', applicantId);
          }
        } else {
          // Insert new analysis
          const { error: insertError } = await supabase
            .from('application_analyses')
            .insert({
              application_id: applicantId,
              job_id: jobId,
              education_level: data.educationLevel || 'Not available',
              years_experience: data.yearsExperience || 'Not available',
              skills_match: data.skillsMatch || 'Low',
              key_skills: data.keySkills || [],
              missing_requirements: data.missingRequirements || [],
              overall_score: data.overallScore || 0,
              fallback: data.fallback || false
            });
            
          if (insertError) {
            console.error('Error inserting analysis:', insertError);
          } else {
            console.log('Inserted new analysis for application:', applicantId);
          }
        }
      } catch (error) {
        console.error('Error storing analysis in database:', error);
        // Continue despite storage error - we'll return the analysis anyway
      }
    }

    return {
      educationLevel: data.educationLevel || 'Not available',
      yearsExperience: data.yearsExperience || 'Not available',
      skillsMatch: data.skillsMatch || 'Low',
      keySkills: data.keySkills || [],
      missingRequirements: data.missingRequirements || [],
      overallScore: data.overallScore || 0,
      fallback: data.fallback
    };
  } catch (error) {
    console.error('Error in analyzeResume function:', error);
    // Return a default analysis when the API fails
    return {
      educationLevel: 'Not available',
      yearsExperience: 'Not available',
      skillsMatch: 'Low',
      keySkills: ['Unable to analyze resume'],
      missingRequirements: ['Unable to analyze resume'],
      overallScore: 0,
      fallback: true
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
      fallback: data.fallback || false
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
