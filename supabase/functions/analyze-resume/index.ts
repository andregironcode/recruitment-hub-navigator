
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
    let isPdfFile = false;
    let pdfBuffer: ArrayBuffer | null = null;
    
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
            isPdfFile = true;
            // For PDFs, store the buffer for later uploading to OpenAI
            pdfBuffer = await response.arrayBuffer();
            console.log(`Downloaded PDF, size: ${pdfBuffer.byteLength} bytes`);
            
            // Set temporary text to identify this is a PDF
            resumeText = "[PDF_CONTENTS]";
          } else if (contentType?.includes('text')) {
            // For text files, just get the content directly
            resumeText = await response.text();
            console.log(`Successfully extracted text from text file, length: ${resumeText.length}`);
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
    if ((!resumeText || resumeText.includes('Error accessing resume file') || resumeText.length < 50) 
        && !isPdfFile) {
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
    
    // Analyze the resume using OpenAI
    try {
      console.log("Preparing to send request to OpenAI");
      
      // Build system prompt for the OpenAI API
      const systemPrompt = `You are an expert AI recruitment assistant. Your task is to analyze a resume against a job description in detail.

      Pay special attention to extracting:
      1. Education level - Look for degrees, certifications, and educational achievements (Bachelor's, Master's, PhD, etc.)
      2. Years of experience - Calculate total relevant years of work experience
      3. Technical skills - Identify specific technologies, tools, programming languages, and other technical competencies
      4. Key matching skills - Determine which skills in the resume match the job requirements
      5. Missing requirements - Identify important job requirements not present in the resume
      
      Be thorough in your analysis and provide an accurate assessment of the candidate's match for the position.`;

      // Analyze PDF using OpenAI's API
      let messages = [];
      let openaiResponse;
      
      if (isPdfFile && pdfBuffer) {
        console.log("Processing PDF resume using OpenAI");
        
        // Step 1: First upload the PDF file to OpenAI
        const formData = new FormData();
        const pdfBlob = new Blob([pdfBuffer], { type: 'application/pdf' });
        formData.append('file', pdfBlob, 'resume.pdf');
        formData.append('purpose', 'assistants');
        
        const uploadResponse = await fetch('https://api.openai.com/v1/files', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${Deno.env.get('OPENAI_API_KEY')}`
          },
          body: formData
        });
        
        if (!uploadResponse.ok) {
          const errorData = await uploadResponse.text();
          console.error('Error uploading PDF to OpenAI:', errorData);
          throw new Error(`Failed to upload PDF to OpenAI: ${uploadResponse.statusText}`);
        }
        
        const uploadData = await uploadResponse.json();
        const fileId = uploadData.id;
        console.log(`Successfully uploaded PDF to OpenAI, file ID: ${fileId}`);
        
        try {
          // Step 2: Create a new assistant specifically for resume analysis
          const assistantResponse = await fetch('https://api.openai.com/v1/assistants', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${Deno.env.get('OPENAI_API_KEY')}`,
              'Content-Type': 'application/json',
              'OpenAI-Beta': 'assistants=v1'
            },
            body: JSON.stringify({
              name: "Resume Analyzer",
              description: "Analyzes resumes against job descriptions",
              instructions: systemPrompt,
              model: "gpt-4o-mini",
              tools: []
            })
          });
          
          if (!assistantResponse.ok) {
            const errorData = await assistantResponse.text();
            console.error('Error creating assistant:', errorData);
            throw new Error(`Failed to create assistant: ${assistantResponse.statusText}`);
          }
          
          const assistantData = await assistantResponse.json();
          const assistantId = assistantData.id;
          console.log(`Successfully created assistant with ID: ${assistantId}`);
          
          // Step 3: Create a thread with the user's message and the uploaded file
          const userMessage = `Analyze how well the resume in the attached PDF matches the following job description:
          
          JOB DESCRIPTION:
          ${jobDescription}
          
          Return ONLY a clean JSON object with these fields (no markdown, no explanations, just valid JSON):
          {
            "educationLevel": "The candidate's highest level of education (Bachelor's, Master's, PhD, etc., or 'Unknown' if not found)",
            "yearsExperience": "Total relevant years of experience (a number, range, or 'Unknown' if not clearly stated)",
            "skillsMatch": "Overall match level ('High', 'Medium', or 'Low')",
            "keySkills": ["Array of specific skills from resume that match job requirements"],
            "missingRequirements": ["Array of key requirements from job description not found in resume"],
            "overallScore": "A score from 0-100 representing overall match percentage"
          }`;
          
          const threadResponse = await fetch('https://api.openai.com/v1/threads', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${Deno.env.get('OPENAI_API_KEY')}`,
              'Content-Type': 'application/json',
              'OpenAI-Beta': 'assistants=v1'
            },
            body: JSON.stringify({
              messages: [
                {
                  role: 'user',
                  content: userMessage,
                  file_ids: [fileId]
                }
              ]
            })
          });
          
          if (!threadResponse.ok) {
            const errorData = await threadResponse.text();
            console.error('Error creating thread:', errorData);
            throw new Error(`Failed to create thread: ${threadResponse.statusText}`);
          }
          
          const threadData = await threadResponse.json();
          const threadId = threadData.id;
          console.log(`Successfully created thread with ID: ${threadId}`);
          
          // Step 4: Run the assistant on the thread
          const runResponse = await fetch(`https://api.openai.com/v1/threads/${threadId}/runs`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${Deno.env.get('OPENAI_API_KEY')}`,
              'Content-Type': 'application/json',
              'OpenAI-Beta': 'assistants=v1'
            },
            body: JSON.stringify({
              assistant_id: assistantId,
              model: 'gpt-4o-mini'
            })
          });
          
          if (!runResponse.ok) {
            const errorData = await runResponse.text();
            console.error('Error running assistant:', errorData);
            throw new Error(`Failed to run assistant: ${runResponse.statusText}`);
          }
          
          const runData = await runResponse.json();
          const runId = runData.id;
          console.log(`Started run with ID: ${runId}`);
          
          // Poll for the run to complete
          let runStatus = 'queued';
          let retries = 0;
          const maxRetries = 60; // 5 minutes with 5-second intervals
          
          while (runStatus !== 'completed' && retries < maxRetries) {
            await new Promise(resolve => setTimeout(resolve, 5000)); // Wait 5 seconds
            
            const statusResponse = await fetch(`https://api.openai.com/v1/threads/${threadId}/runs/${runId}`, {
              headers: {
                'Authorization': `Bearer ${Deno.env.get('OPENAI_API_KEY')}`,
                'OpenAI-Beta': 'assistants=v1'
              }
            });
            
            if (!statusResponse.ok) {
              console.error(`Error checking run status: ${statusResponse.statusText}`);
              retries++;
              continue;
            }
            
            const statusData = await statusResponse.json();
            runStatus = statusData.status;
            console.log(`Run status: ${runStatus} (attempt ${retries + 1})`);
            
            if (runStatus === 'failed' || runStatus === 'cancelled' || runStatus === 'expired') {
              throw new Error(`Run ended with status: ${runStatus}`);
            }
            
            retries++;
          }
          
          if (runStatus !== 'completed') {
            throw new Error('Run did not complete in the allowed time');
          }
          
          // Get the messages from the thread
          const messagesResponse = await fetch(`https://api.openai.com/v1/threads/${threadId}/messages`, {
            headers: {
              'Authorization': `Bearer ${Deno.env.get('OPENAI_API_KEY')}`,
              'OpenAI-Beta': 'assistants=v1'
            }
          });
          
          if (!messagesResponse.ok) {
            const errorData = await messagesResponse.text();
            console.error('Error getting messages:', errorData);
            throw new Error(`Failed to get messages: ${messagesResponse.statusText}`);
          }
          
          const messagesData = await messagesResponse.json();
          const assistantMessages = messagesData.data.filter(msg => msg.role === 'assistant');
          
          if (assistantMessages.length === 0) {
            throw new Error('No assistant messages found');
          }
          
          const analysisText = assistantMessages[0].content[0].text.value;
          console.log(`Received analysis from OpenAI: ${analysisText.substring(0, 200)}...`);
          
          // Parse the JSON from the assistant's message
          let analysis;
          try {
            // Clean the response to ensure it's valid JSON
            const cleanedText = analysisText.trim()
              .replace(/```json/g, '')  // Remove markdown code blocks if present
              .replace(/```/g, '')      // Remove closing code blocks
              .trim();
              
            analysis = JSON.parse(cleanedText);
            console.log("Successfully parsed analysis result as JSON from PDF");
          } catch (parseError) {
            console.error('Error parsing assistant response:', parseError);
            throw new Error(`Failed to parse analysis result: ${parseError.message}`);
          }
          
          // Clean up
          try {
            // Delete the assistant
            const deleteAssistantResponse = await fetch(`https://api.openai.com/v1/assistants/${assistantId}`, {
              method: 'DELETE',
              headers: {
                'Authorization': `Bearer ${Deno.env.get('OPENAI_API_KEY')}`,
                'OpenAI-Beta': 'assistants=v1'
              }
            });
            
            if (deleteAssistantResponse.ok) {
              console.log(`Successfully deleted assistant ${assistantId}`);
            } else {
              console.warn(`Failed to delete assistant ${assistantId}: ${deleteAssistantResponse.statusText}`);
            }
            
            // Delete the file from OpenAI
            const deleteFileResponse = await fetch(`https://api.openai.com/v1/files/${fileId}`, {
              method: 'DELETE',
              headers: {
                'Authorization': `Bearer ${Deno.env.get('OPENAI_API_KEY')}`
              }
            });
            
            if (deleteFileResponse.ok) {
              console.log(`Successfully deleted file ${fileId} from OpenAI`);
            } else {
              console.warn(`Failed to delete file ${fileId}: ${deleteFileResponse.statusText}`);
            }
          } catch (deleteError) {
            console.warn(`Error during cleanup:`, deleteError);
          }
          
          // Store analysis in database and return response
          if (analysis) {
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
            
            // Store in database if we have job and application IDs
            if (jobId && applicantId) {
              await storeAnalysisInDatabase(jobId, applicantId, analysis, forceUpdate);
            }
            
            return new Response(
              JSON.stringify(analysis),
              { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            );
          }
        } finally {
          // Cleanup code already included in the try block above
        }
      } else {
        // For text-based resumes, use the regular chat completions API
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
        openaiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${Deno.env.get('OPENAI_API_KEY')}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: 'gpt-4o-mini',  // Using gpt-4o-mini as requested
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
          await storeAnalysisInDatabase(jobId, applicantId, analysis, forceUpdate);
        }
        
        return new Response(
          JSON.stringify(analysis),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
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

// Helper function to store analysis in the database
async function storeAnalysisInDatabase(jobId, applicantId, analysis, forceUpdate) {
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
