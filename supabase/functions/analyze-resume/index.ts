
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
    let resumeFileData = null;
    
    // Extract text from resume if URL is provided
    if (resumeUrl) {
      console.log(`Processing resume URL: ${resumeUrl}`);
      
      // Check if it's a Supabase storage URL
      if (resumeUrl.includes('supabase.co/storage/v1/object/public')) {
        console.log('Detected Supabase storage URL');
        
        try {
          // Get the content type and the file data
          const headResponse = await fetch(resumeUrl, { method: 'HEAD' });
          
          if (!headResponse.ok) {
            throw new Error(`Failed to access resume: ${headResponse.statusText}`);
          }
          
          const contentType = headResponse.headers.get('content-type');
          console.log(`File content type: ${contentType}`);
          
          if (contentType?.includes('application/pdf')) {
            console.log("PDF detected, downloading file content");
            // Download the PDF content directly
            const pdfResponse = await fetch(resumeUrl);
            if (!pdfResponse.ok) {
              throw new Error(`Failed to download PDF: ${pdfResponse.statusText}`);
            }
            
            // Get the PDF data as an array buffer
            resumeFileData = await pdfResponse.arrayBuffer();
            console.log(`Successfully downloaded PDF, size: ${resumeFileData.byteLength} bytes`);
            resumeText = "PDF downloaded successfully and will be processed directly via the OpenAI API";
          } else if (contentType?.includes('text')) {
            // For text files, just get the content directly
            const response = await fetch(resumeUrl);
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
    
    console.log(`Resume text preview (first 100 chars): ${resumeText.substring(0, 100)}`);
    
    // If we have no meaningful text to analyze, return a fallback analysis
    if (!resumeUrl && (!resumeText || resumeText.includes('Error accessing resume file') || resumeText.length < 50)) {
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
      
      let openaiResponse;
      
      // Change in approach: direct file upload for PDFs vs text-based approach
      if (resumeFileData && resumeUrl && resumeUrl.includes('.pdf')) {
        console.log("Using direct PDF upload for resume analysis");
        
        // Create a FormData object to upload the PDF directly
        const formData = new FormData();
        
        // Add system and user message parts
        formData.append(
          'purpose', 
          'assistant_request'
        );
        
        formData.append(
          'system', 
          `You are an AI recruitment assistant that analyzes resumes against job descriptions.
          Extract relevant education, experience, and skills from the resume PDF.
          Your task is to determine how well the candidate matches the job requirements.`
        );
        
        formData.append(
          'user', 
          `Analyze how well this resume matches the following job description:
          
          JOB DESCRIPTION:
          ${jobDescription}
          
          Return ONLY a JSON object with these fields:
          1. educationLevel: The candidate's highest level of education mentioned (or "Unknown" if not found)
          2. yearsExperience: Total relevant years of experience (or "Unknown" if not clearly stated)
          3. skillsMatch: Overall match as "High", "Medium", or "Low"
          4. keySkills: Array of key skills found in resume that match job requirements
          5. missingRequirements: Array of key requirements from job description not found in resume
          6. overallScore: A numeric score from 0-100 representing overall match percentage
          
          Return your analysis as clean, parseable JSON WITHOUT explanations, code blocks, or other text.`
        );
        
        // Create a Blob from the array buffer and append to form
        const pdfBlob = new Blob([resumeFileData], { type: 'application/pdf' });
        formData.append(
          'file', 
          pdfBlob, 
          'resume.pdf'
        );
        
        // Send the request to OpenAI with file upload
        openaiResponse = await fetch('https://api.openai.com/v1/files/assistants_tools', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${Deno.env.get('OPENAI_API_KEY')}`,
          },
          body: formData,
        });
        
        if (!openaiResponse.ok) {
          // If direct file upload fails, try the text-based approach as fallback
          console.error(`File upload failed: ${await openaiResponse.text()}`);
          console.log("Falling back to text-based approach");
          
          // Prepare messages for text-based approach
          const messages = [
            { 
              role: 'system',
              content: `You are an AI recruitment assistant that analyzes resumes against job descriptions.
              Extract relevant education, experience, and skills from the resume text.
              Your task is to determine how well the candidate matches the job requirements.`
            },
            { 
              role: 'user', 
              content: `Analyze how well this resume matches the following job description:
          
              JOB DESCRIPTION:
              ${jobDescription}
              
              RESUME TEXT:
              ${resumeText}
              
              Return ONLY a JSON object with these fields:
              1. educationLevel: The candidate's highest level of education mentioned (or "Unknown" if not found)
              2. yearsExperience: Total relevant years of experience (or "Unknown" if not clearly stated)
              3. skillsMatch: Overall match as "High", "Medium", or "Low"
              4. keySkills: Array of key skills found in resume that match job requirements
              5. missingRequirements: Array of key requirements from job description not found in resume
              6. overallScore: A numeric score from 0-100 representing overall match percentage
              
              Return your analysis as clean, parseable JSON WITHOUT explanations, code blocks, or other text.`
            }
          ];
          
          // Use the chat completions API as fallback
          openaiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${Deno.env.get('OPENAI_API_KEY')}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              model: 'gpt-4o-mini',
              messages: messages,
              temperature: 0.3,
            }),
          });
        }
      } else {
        // Use text-only approach
        const messages = [
          { 
            role: 'system',
            content: `You are an AI recruitment assistant that analyzes resumes against job descriptions.
            Extract relevant education, experience, and skills from the resume text.
            Your task is to determine how well the candidate matches the job requirements.`
          },
          { 
            role: 'user', 
            content: `Analyze how well this resume matches the following job description:
        
            JOB DESCRIPTION:
            ${jobDescription}
            
            RESUME TEXT:
            ${resumeText}
            
            Return ONLY a JSON object with these fields:
            1. educationLevel: The candidate's highest level of education mentioned (or "Unknown" if not found)
            2. yearsExperience: Total relevant years of experience (or "Unknown" if not clearly stated)
            3. skillsMatch: Overall match as "High", "Medium", or "Low"
            4. keySkills: Array of key skills found in resume that match job requirements
            5. missingRequirements: Array of key requirements from job description not found in resume
            6. overallScore: A numeric score from 0-100 representing overall match percentage
            
            Return your analysis as clean, parseable JSON WITHOUT explanations, code blocks, or other text.`
          }
        ];
        
        console.log("Using text-only approach for resume analysis");
        
        // Send the prompt to OpenAI for analysis
        openaiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${Deno.env.get('OPENAI_API_KEY')}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: 'gpt-4o-mini',
            messages: messages,
            temperature: 0.3,
          }),
        });
      }
      
      if (!openaiResponse.ok) {
        const errorText = await openaiResponse.text();
        console.error(`OpenAI API error: ${openaiResponse.status} - ${errorText}`);
        throw new Error(`OpenAI API error: ${openaiResponse.statusText} (${openaiResponse.status})`);
      }
      
      const openaiData = await openaiResponse.json();
      let analysisText;
      
      // Handle response based on API used (file upload vs chat completions)
      if (openaiData.choices) {
        // Response from chat completions API
        analysisText = openaiData.choices[0].message.content;
      } else {
        // Response from file upload API
        analysisText = openaiData.content || JSON.stringify({
          educationLevel: "Unknown",
          yearsExperience: "Unknown",
          skillsMatch: "Low",
          keySkills: ["Unable to process PDF format"],
          missingRequirements: ["Unable to determine"],
          overallScore: 0,
          fallback: true
        });
      }
      
      console.log(`OpenAI response received, length: ${analysisText.length}`);
      console.log(`Analysis text preview: ${analysisText.substring(0, 200)}`);
      
      // Try to parse the result as JSON
      let analysis;
      try {
        analysis = JSON.parse(analysisText.trim());
        console.log("Successfully parsed analysis result as JSON");
        
        // Ensure all required fields exist
        analysis.educationLevel = analysis.educationLevel || "Not available";
        analysis.yearsExperience = analysis.yearsExperience || "Not available";
        analysis.skillsMatch = analysis.skillsMatch || "Low";
        analysis.keySkills = analysis.keySkills || [];
        analysis.missingRequirements = analysis.missingRequirements || [];
        analysis.overallScore = analysis.overallScore || 0;
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
