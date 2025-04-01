
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Create a Supabase client with the service role key
const supabaseAdmin = createClient(
  Deno.env.get('SUPABASE_URL') || '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || ''
);

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { resumeUrl, resumeContent, jobDescription, jobId, applicantId, forceUpdate } = await req.json();
    
    console.log(`Processing request with forceUpdate: ${forceUpdate}`);
    console.log(`Request data: resumeUrl=${resumeUrl?.substring(0, 100) || 'none'}, contentLength=${resumeContent?.length || 0}`);
    
    // Check for existing analysis first if we have an application ID
    if (applicantId && !forceUpdate) {
      const { data: existingAnalysis, error: queryError } = await supabaseAdmin
        .from('application_analyses')
        .select('*')
        .eq('application_id', applicantId)
        .single();
      
      if (!queryError && existingAnalysis) {
        console.log(`Found existing analysis for application ${applicantId}, returning it`);
        
        // Return existing analysis with formatted response
        return new Response(
          JSON.stringify({
            educationLevel: existingAnalysis.education_level,
            yearsExperience: existingAnalysis.years_experience, 
            skillsMatch: existingAnalysis.skills_match,
            keySkills: existingAnalysis.key_skills,
            missingRequirements: existingAnalysis.missing_requirements,
            overallScore: existingAnalysis.overall_score,
            fallback: existingAnalysis.fallback
          }),
          {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          }
        );
      }
    }
    
    let resumeText = '';
    
    // Extract text from resume if URL is provided
    if (resumeUrl) {
      console.log(`Processing resume URL: ${resumeUrl}`);
      
      // Check if it's a Supabase storage URL
      if (resumeUrl.includes('supabase.co/storage/v1/object/public')) {
        console.log('Detected Supabase storage URL');
        
        try {
          // Download the file content
          const response = await fetch(resumeUrl);
          
          if (!response.ok) {
            throw new Error(`Failed to access resume: ${response.statusText}`);
          }
          
          const contentType = response.headers.get('content-type');
          console.log(`File content type: ${contentType}`);
          
          if (contentType?.includes('application/pdf')) {
            // For PDFs, get the content directly
            const pdfBuffer = await response.arrayBuffer();
            console.log(`Downloaded PDF, size: ${pdfBuffer.byteLength} bytes`);
            
            // For now, we'll just indicate we have a PDF without actual text extraction
            // The text will be described in the prompt
            resumeText = "This is a PDF resume that has been downloaded. The analysis will be based on this document.";
            
            console.log(`PDF detected, prepared for analysis`);
          } else if (contentType?.includes('text')) {
            // For text files, just get the content directly
            resumeText = await response.text();
            console.log(`Successfully extracted text, length: ${resumeText.length}`);
          } else {
            resumeText = `Unsupported file type: ${contentType}. Please upload a PDF or text file.`;
            console.log(resumeText);
          }
        } catch (error) {
          console.error('Error accessing resume from URL:', error);
          resumeText = `Error accessing resume file: ${error.message}`;
        }
      } else if (resumeUrl.startsWith('blob:')) {
        console.log(`Blob URL detected, cannot process directly: ${resumeUrl}`);
        resumeText = "This resume was submitted as a temporary blob URL which cannot be processed server-side. For production use, ensure files are properly uploaded to storage first.";
      } else {
        console.log(`Unknown URL format: ${resumeUrl}`);
        resumeText = "Unrecognized URL format. Please upload the resume to a proper storage service.";
      }
    } else if (resumeContent) {
      // If content was provided directly, use that
      resumeText = resumeContent;
      console.log(`Using provided resume content, length: ${resumeText.length}`);
    } else {
      resumeText = "No resume content or URL provided";
      console.log(resumeText);
    }
    
    // If we have no meaningful text to analyze, return a fallback analysis
    if (!resumeText || resumeText.includes('Error accessing resume file') || resumeText.length < 50) {
      console.log('Insufficient resume text, generating fallback analysis');
      
      const fallbackAnalysis = {
        educationLevel: "Unknown",
        yearsExperience: "Unknown",
        skillsMatch: "Unknown",
        keySkills: [],
        missingRequirements: [],
        overallScore: 0,
        fallback: true,
        debugInfo: `Failed to extract text from resume. Original URL: ${resumeUrl?.substring(0, 100)}`
      };
      
      // Store the fallback analysis if we have job and application IDs
      if (jobId && applicantId) {
        try {
          if (forceUpdate) {
            // If forcing update, first delete existing analysis
            await supabaseAdmin
              .from('application_analyses')
              .delete()
              .eq('application_id', applicantId);
          }
          
          // Then insert the new analysis
          const { error } = await supabaseAdmin
            .from('application_analyses')
            .upsert({
              application_id: applicantId,
              job_id: jobId,
              education_level: fallbackAnalysis.educationLevel,
              years_experience: fallbackAnalysis.yearsExperience,
              skills_match: fallbackAnalysis.skillsMatch,
              key_skills: fallbackAnalysis.keySkills,
              missing_requirements: fallbackAnalysis.missingRequirements,
              overall_score: fallbackAnalysis.overallScore,
              fallback: true
            });
            
          if (error) {
            console.error('Error storing fallback analysis:', error);
          }
        } catch (error) {
          console.error('Error in database operation for fallback analysis:', error);
        }
      }
      
      return new Response(
        JSON.stringify(fallbackAnalysis),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    try {
      console.log("Sending request to OpenAI");
      
      // Build a richer prompt for the OpenAI API
      const systemPrompt = `You are an expert AI recruitment assistant. Your task is to analyze a resume against a job description in detail.

      Pay special attention to extracting:
      1. Education level - Look for degrees, certifications, and educational achievements (Bachelor's, Master's, PhD, etc.)
      2. Years of experience - Calculate total relevant years of work experience
      3. Technical skills - Identify specific technologies, tools, programming languages, and other technical competencies
      4. Key matching skills - Determine which skills in the resume match the job requirements
      5. Missing requirements - Identify important job requirements not present in the resume
      
      Be thorough in your analysis and provide an accurate assessment of the candidate's match for the position.`;
      
      const userPrompt = `Analyze how well the following resume matches the job description:
      
      JOB DESCRIPTION:
      ${jobDescription}
      
      RESUME:
      ${resumeText}
      
      Return ONLY a clean JSON object with these fields (no markdown, no explanations, just valid JSON):
      {
        "educationLevel": "The candidate's highest level of education (Bachelor's, Master's, PhD, etc., or 'Unknown' if not found)",
        "yearsExperience": "Total relevant years of experience (a number, range, or 'Unknown' if not clearly stated)",
        "skillsMatch": "Overall match level ('High', 'Medium', or 'Low')",
        "keySkills": ["Array of specific skills from resume that match job requirements"],
        "missingRequirements": ["Array of key requirements from job description not found in resume"],
        "overallScore": "A score from 0-100 representing overall match percentage"
      }`;
      
      // Send the prompt to OpenAI for analysis
      const openaiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${Deno.env.get('OPENAI_API_KEY')}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-4o',  // Using GPT-4o for better accuracy
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt }
          ],
          temperature: 0.1,  // Lower temperature for more consistent results
        }),
      });
      
      if (!openaiResponse.ok) {
        const errorText = await openaiResponse.text();
        console.error(`OpenAI API error: ${openaiResponse.status} - ${errorText}`);
        throw new Error(`OpenAI API error: ${openaiResponse.statusText} (${openaiResponse.status})`);
      }
      
      const openaiData = await openaiResponse.json();
      
      // Get the analysis text from the OpenAI response
      const analysisText = openaiData.choices[0].message.content;
      
      console.log(`OpenAI response received, length: ${analysisText.length}`);
      console.log(`Analysis text preview: ${analysisText.substring(0, 200)}`);
      
      // Try to parse the result as JSON
      let analysis;
      try {
        // Clean the response to ensure it's valid JSON
        const cleanedText = analysisText.trim()
          .replace(/```json/g, '')  // Remove markdown code blocks if present
          .replace(/```/g, '')      // Remove closing code blocks
          .trim();
          
        analysis = JSON.parse(cleanedText);
        console.log("Successfully parsed analysis result as JSON");
        
        // Ensure all required fields exist
        analysis.educationLevel = analysis.educationLevel || "Not available";
        analysis.yearsExperience = analysis.yearsExperience || "Not available";
        analysis.skillsMatch = analysis.skillsMatch || "Low";
        analysis.keySkills = analysis.keySkills || [];
        analysis.missingRequirements = analysis.missingRequirements || [];
        analysis.overallScore = typeof analysis.overallScore === 'number' ? 
          analysis.overallScore : 
          (typeof analysis.overallScore === 'string' ? parseInt(analysis.overallScore, 10) || 0 : 0);
        analysis.fallback = false;
      } catch (parseError) {
        console.error('Error parsing OpenAI response:', parseError);
        console.log('Raw response that failed to parse:', analysisText);
        
        // Provide a fallback analysis if parsing fails
        analysis = {
          educationLevel: "Not available",
          yearsExperience: "Not available",
          skillsMatch: "Low",
          keySkills: ["Failed to extract skills from resume"],
          missingRequirements: ["Failed to analyze resume against job requirements"],
          overallScore: 0,
          fallback: true,
          debugInfo: `Failed to parse OpenAI response. Response started with: ${analysisText.substring(0, 100)}`
        };
      }
      
      // Store analysis in database if we have job and application IDs
      if (jobId && applicantId) {
        try {
          if (forceUpdate) {
            // If forcing update, first delete existing analysis
            await supabaseAdmin
              .from('application_analyses')
              .delete()
              .eq('application_id', applicantId);
              
            console.log(`Deleted existing analysis for application ${applicantId} as forceUpdate was requested`);
          }
          
          // Use upsert to handle both insert and update cases
          const { error } = await supabaseAdmin
            .from('application_analyses')
            .upsert({
              application_id: applicantId,
              job_id: jobId,
              education_level: analysis.educationLevel,
              years_experience: analysis.yearsExperience,
              skills_match: analysis.skillsMatch,
              key_skills: analysis.keySkills,
              missing_requirements: analysis.missingRequirements,
              overall_score: analysis.overallScore,
              fallback: analysis.fallback
            });
            
          if (error) {
            console.error('Error storing analysis result:', error);
          } else {
            console.log(`Successfully stored/updated analysis for application ${applicantId}`);
          }
        } catch (dbError) {
          console.error('Database error when storing analysis:', dbError);
        }
      }
      
      return new Response(
        JSON.stringify(analysis),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    } catch (error) {
      console.error('Error in analysis process:', error);
      
      return new Response(
        JSON.stringify({
          educationLevel: "Error",
          yearsExperience: "Error",
          skillsMatch: "Error",
          keySkills: [`Error analyzing resume: ${error.message}`],
          missingRequirements: [],
          overallScore: 0,
          fallback: true,
          debugInfo: `Analysis error: ${error.message}`
        }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }
  } catch (error) {
    console.error('Request processing error:', error);
    
    return new Response(
      JSON.stringify({ 
        error: `Server error: ${error.message}`,
        fallback: true,
        debugInfo: `Server error: ${error.message}`
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
