
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
        console.log('Detected Supabase signed URL');
        
        try {
          const response = await fetch(resumeUrl);
          
          if (!response.ok) {
            throw new Error(`Failed to fetch resume: ${response.statusText}`);
          }
          
          const contentType = response.headers.get('content-type');
          console.log(`File content type: ${contentType}`);
          
          if (contentType?.includes('application/pdf')) {
              // FIXED: Use the proper OpenAI API for PDF text extraction
              try {
                const pdfBytes = await response.arrayBuffer();
                const pdfBase64 = btoa(String.fromCharCode(...new Uint8Array(pdfBytes)));
                
                // Use text extraction from PDF using OpenAI's API
                const openaiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
                  method: 'POST',
                  headers: {
                    'Authorization': `Bearer ${Deno.env.get('OPENAI_API_KEY')}`,
                    'Content-Type': 'application/json',
                  },
                  body: JSON.stringify({
                    model: 'gpt-4o-mini',
                    messages: [
                      { 
                        role: 'user', 
                        content: [
                          { 
                            type: 'text', 
                            text: 'Extract all text content from this PDF resume. Format it clearly maintaining the structure.' 
                          },
                          {
                            type: 'image_url',
                            image_url: {
                              url: `data:application/pdf;base64,${pdfBase64}`
                            }
                          }
                        ]
                      }
                    ]
                  }),
                });
                
                if (!openaiResponse.ok) {
                  const errorText = await openaiResponse.text();
                  throw new Error(`OpenAI error: ${errorText}`);
                }
                
                const openaiData = await openaiResponse.json();
                resumeText = openaiData.choices[0].message.content;
                console.log(`Successfully extracted text from PDF, length: ${resumeText.length}`);
              } catch (error) {
                console.error('Error processing PDF:', error);
                throw new Error(`Failed to process PDF: ${error.message}`);
              }
          } else if (contentType?.includes('text')) {
            // For text files, just get the content directly
            resumeText = await response.text();
          } else {
            resumeText = `Unsupported file type: ${contentType}. Please upload a PDF or text file.`;
          }
        } catch (error) {
          console.error('Error fetching resume from signed URL:', error);
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
    }
    
    console.log(`Resume text (preview): ${resumeText.substring(0, 100)}...`);
    
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
        fallback: true
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
    
    // Prepare prompt for OpenAI to analyze the resume against job description
    const prompt = `
    You're an AI recruitment assistant tasked with analyzing resumes against job descriptions.
    
    JOB DESCRIPTION:
    ${jobDescription}
    
    RESUME:
    ${resumeText}
    
    Analyze how well this resume matches the job description and return ONLY a JSON object with these fields:
    1. educationLevel: The candidate's highest level of education mentioned (or "Unknown" if not found)
    2. yearsExperience: Total relevant years of experience (or "Unknown" if not clearly stated)
    3. skillsMatch: Overall match as "High", "Medium", or "Low"
    4. keySkills: Array of key skills found in resume that match job requirements
    5. missingRequirements: Array of key requirements from job description not found in resume
    6. overallScore: A numeric score from 0-100 representing overall match percentage
    
    Return your analysis as clean, parseable JSON WITHOUT explanations, code blocks, or other text.
    `;
    
    try {
      // Send the prompt to OpenAI for analysis
      const openaiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${Deno.env.get('OPENAI_API_KEY')}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [{ role: 'user', content: prompt }],
          temperature: 0.3,
        }),
      });
      
      if (!openaiResponse.ok) {
        throw new Error(`OpenAI API error: ${openaiResponse.statusText}`);
      }
      
      const openaiData = await openaiResponse.json();
      const analysisText = openaiData.choices[0].message.content;
      
      console.log(`Attempting to parse JSON: ${analysisText.substring(0, 100)}...`);
      
      // Try to parse the result as JSON
      let analysis;
      try {
        analysis = JSON.parse(analysisText.trim());
        console.log("Successfully parsed analysis result");
        
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
        
        // Provide a fallback analysis if parsing fails
        analysis = {
          educationLevel: "Not available",
          yearsExperience: "Not available",
          skillsMatch: "Low",
          keySkills: ["Failed to extract skills from resume"],
          missingRequirements: ["Failed to analyze resume against job requirements"],
          overallScore: 0,
          fallback: true
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
          fallback: true
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
        fallback: true
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
