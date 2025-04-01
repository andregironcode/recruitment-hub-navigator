
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
const supabaseUrl = Deno.env.get('SUPABASE_URL');
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { resumeUrl, jobDescription, jobId, applicantId } = await req.json();
    
    if (!resumeUrl || !jobDescription) {
      return new Response(
        JSON.stringify({ error: 'Resume URL and job description are required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Initialize Supabase client
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    // Fetch the resume text content if available
    let resumeText = "";
    
    if (resumeUrl) {
      try {
        const resumeResponse = await fetch(resumeUrl);
        if (resumeResponse.ok) {
          // Assuming the resume is in text format or can be converted to text
          resumeText = await resumeResponse.text();
        } else {
          console.log("Could not fetch resume content, using placeholder");
          resumeText = "Resume content unavailable";
        }
      } catch (error) {
        console.error("Error fetching resume:", error);
        resumeText = "Error retrieving resume content";
      }
    }

    // Define the AI analysis prompt
    const prompt = `
    You are an expert HR AI assistant that analyzes resumes against job requirements.
    
    Job Description: ${jobDescription}
    
    Resume Content: ${resumeText}
    
    Analyze this resume against the job requirements and provide the following information in JSON format:
    1. Education level (e.g., Bachelor's, Master's, PhD, None Specified)
    2. Years of experience (e.g., <1, 1-3, 3-5, 5+, 10+, None Specified)
    3. Skills match (Low, Medium, High)
    4. Key skills identified in the resume (list up to 5)
    5. Missing key requirements from the job description (list up to 3)
    6. Overall match score (0-100)
    
    Return ONLY valid JSON with these fields:
    {
      "educationLevel": string,
      "yearsExperience": string,
      "skillsMatch": string,
      "keySkills": string[],
      "missingRequirements": string[],
      "overallScore": number
    }
    `;

    // Call OpenAI API
    const openAiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: 'You are an expert HR assistant that analyzes resumes against job requirements.' },
          { role: 'user', content: prompt }
        ],
        temperature: 0.2,
      }),
    });

    if (!openAiResponse.ok) {
      const errorText = await openAiResponse.text();
      console.error("OpenAI API error:", errorText);
      return new Response(
        JSON.stringify({ error: 'Failed to analyze resume' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const openAiData = await openAiResponse.json();
    let analysisResult;
    
    try {
      // Extract the JSON string from the OpenAI response
      const resultContent = openAiData.choices[0].message.content;
      // Parse the JSON string
      analysisResult = JSON.parse(resultContent);
      
      // Store the analysis result in the database if we have jobId and applicantId
      if (jobId && applicantId) {
        const { error } = await supabase
          .from('application_analyses')
          .upsert({
            application_id: applicantId,
            job_id: jobId,
            education_level: analysisResult.educationLevel,
            years_experience: analysisResult.yearsExperience,
            skills_match: analysisResult.skillsMatch,
            key_skills: analysisResult.keySkills,
            missing_requirements: analysisResult.missingRequirements,
            overall_score: analysisResult.overallScore,
            analyzed_at: new Date().toISOString()
          });
          
        if (error) {
          console.error("Error storing analysis result:", error);
        }
      }
      
    } catch (error) {
      console.error("Error parsing AI response:", error);
      return new Response(
        JSON.stringify({ error: 'Failed to parse AI analysis' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify(analysisResult),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error("Error in analyze-resume function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
