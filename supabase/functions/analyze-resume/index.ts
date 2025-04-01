
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
    const { resumeUrl, resumeContent, jobDescription, jobId, applicantId } = await req.json();
    
    if (!jobDescription) {
      return new Response(
        JSON.stringify({ error: 'Job description is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Initialize Supabase client
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    try {
      if (!openAIApiKey) {
        console.log("OpenAI API key is not configured");
        throw new Error("OpenAI API key is not configured");
      }
      
      // Extract text from the resume
      let resumeText = "Could not extract resume text.";
      
      if (resumeContent) {
        resumeText = resumeContent;
      } else if (resumeUrl) {
        try {
          // Check if it's a Supabase Storage URL or an external URL
          if (resumeUrl.includes('supabase.co') || resumeUrl.includes('supabase.in')) {
            // Parse the URL to get bucket and path
            const url = new URL(resumeUrl);
            const pathParts = url.pathname.split('/');
            // Format typically: /storage/v1/object/public/bucket-name/path/to/file.pdf
            
            // Find the index of 'object' in the path
            const objectIndex = pathParts.findIndex(part => part === 'object');
            if (objectIndex !== -1) {
              // Get the bucket (should be after 'public')
              const bucketIndex = objectIndex + 2;
              if (bucketIndex < pathParts.length) {
                const bucket = pathParts[bucketIndex];
                // Get everything after the bucket name as the path
                const path = pathParts.slice(bucketIndex + 1).join('/');
                
                if (bucket && path) {
                  const { data, error } = await supabase.storage.from(bucket).download(path);
                  if (error) {
                    console.error("Error downloading file from Supabase Storage:", error);
                  } else if (data) {
                    // For simplicity, we'll assume it's a text-based file
                    // In a real implementation, you would need to handle different file formats
                    resumeText = await data.text();
                  }
                }
              }
            }
          } else if (resumeUrl.startsWith('blob:')) {
            // If it's a blob URL, we can't directly access it.
            resumeText = "This resume was submitted as a temporary blob URL which cannot be processed server-side. For production use, implement client-side extraction or permanent storage.";
            console.log("Blob URL detected, cannot process directly:", resumeUrl);
          } else {
            // Try to fetch the content if it's an accessible URL
            try {
              const response = await fetch(resumeUrl);
              if (response.ok) {
                const contentType = response.headers.get('content-type');
                if (contentType && contentType.includes('text')) {
                  resumeText = await response.text();
                } else {
                  resumeText = "Retrieved non-text content that requires special processing.";
                }
              }
            } catch (fetchError) {
              console.error("Error fetching resume content:", fetchError);
              resumeText = "Could not fetch resume content from URL.";
            }
          }
        } catch (extractionError) {
          console.error("Error extracting resume text:", extractionError);
        }
      }

      console.log("Resume text (preview):", resumeText.substring(0, 100) + "...");

      const prompt = `
      You are an expert HR AI assistant that analyzes job applications.
      
      Job Description: ${jobDescription}
      
      Resume Content:
      ${resumeText}
      
      Analyze the resume against the job description and provide:
      1. The candidate's education level
      2. Years of experience in relevant fields
      3. How well the candidate's skills match the job requirements
      4. Key skills found in the resume that are relevant to the job
      5. Important requirements from the job description that appear to be missing from the resume
      6. An overall match score from 0-100
      
      Return JSON with these fields:
      {
        "educationLevel": string (e.g., "High School", "Bachelor's Degree", "Master's Degree", "PhD", "Associate's Degree"),
        "yearsExperience": string (e.g., "<1", "1-3", "3-5", "5+", "7+", "10+"),
        "skillsMatch": string (choose from "Low", "Medium", "High"),
        "keySkills": string[] (list up to 5 skills that are relevant based on the job description),
        "missingRequirements": string[] (list up to 3 potential missing requirements based on the job description),
        "overallScore": number (a realistic score between 0-100)
      }
      Do not format with markdown or code blocks.
      `;

      try {
        // Try calling OpenAI API
        const openAiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${openAIApiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: 'gpt-4o-mini',
            messages: [
              { role: 'system', content: 'You are an expert HR assistant that analyzes job applications.' },
              { role: 'user', content: prompt }
            ],
            temperature: 0.7,
          }),
        });

        if (!openAiResponse.ok) {
          const errorText = await openAiResponse.text();
          console.error("OpenAI API error:", errorText);
          throw new Error(`OpenAI API error: ${errorText}`);
        }

        const openAiData = await openAiResponse.json();
        let resultContent = openAiData.choices[0].message.content;
        
        // Handle the case where GPT wraps the JSON in markdown code blocks
        if (resultContent.includes('```json')) {
          resultContent = resultContent.replace(/```json\n|\n```/g, '');
        } else if (resultContent.includes('```')) {
          resultContent = resultContent.replace(/```\n|\n```/g, '');
        }
        
        let analysisResult;
        try {
          // Clean up any non-JSON formatting that may be in the response
          const cleanedContent = resultContent.trim();
          
          // Try to find JSON object within text if it's not pure JSON
          const jsonMatch = cleanedContent.match(/(\{[\s\S]*\})/);
          const jsonStr = jsonMatch ? jsonMatch[0] : cleanedContent;
          
          console.log("Attempting to parse JSON:", jsonStr.substring(0, 100) + "...");
          analysisResult = JSON.parse(jsonStr);
          
          console.log("Successfully parsed analysis result");
        } catch (parseError) {
          console.error("Error parsing OpenAI response:", parseError, "Response was:", resultContent);
          throw new Error("Failed to parse AI analysis response");
        }
        
        // Store the analysis result in the database if we have jobId and applicantId
        if (jobId && applicantId) {
          const { error: upsertError } = await supabase
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
              analyzed_at: new Date().toISOString(),
              fallback: false
            });
            
          if (upsertError) {
            console.error("Error storing analysis result:", upsertError);
          }
        }
        
        return new Response(
          JSON.stringify(analysisResult),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      } catch (openAiError) {
        console.error("OpenAI API call failed:", openAiError.message);
        
        // Generate a fallback analysis
        const fallbackAnalysis = generateFallbackAnalysis(jobDescription, resumeText);
        
        // Store the fallback analysis if we have jobId and applicantId
        if (jobId && applicantId) {
          try {
            const { error: upsertError } = await supabase
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
                analyzed_at: new Date().toISOString(),
                fallback: true
              });
              
            if (upsertError) {
              console.error("Error storing fallback analysis:", upsertError);
            }
          } catch (dbError) {
            console.error("Error storing fallback analysis:", dbError);
          }
        }
        
        // Return the fallback analysis
        return new Response(
          JSON.stringify({
            ...fallbackAnalysis,
            _note: "Generated without OpenAI due to API limitations",
            fallback: true
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    } catch (aiError) {
      console.error("AI analysis error:", aiError);
      
      // Generate a fallback analysis
      const fallbackAnalysis = generateFallbackAnalysis(jobDescription, resumeText || "");
      
      return new Response(
        JSON.stringify({
          ...fallbackAnalysis,
          _note: "Fallback analysis due to API error",
          _error: aiError.message,
          fallback: true
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
  } catch (error) {
    console.error("Error in analyze-resume function:", error);
    
    // Return an error response
    return new Response(
      JSON.stringify({ 
        error: "Function failed: " + error.message,
        fallback: true
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

// Fallback analysis generator that attempts to extract some info from resume text
function generateFallbackAnalysis(jobDescription: string, resumeText: string) {
  // Extract some keywords from job description and resume to use for "smart" fallback
  const lowercaseDesc = jobDescription.toLowerCase();
  const lowercaseResume = resumeText.toLowerCase();
  
  // Education level detection from resume
  let educationLevel = "Bachelor's Degree"; // Default
  if (lowercaseResume.includes("phd") || lowercaseResume.includes("doctorate") || lowercaseResume.includes("doctor of")) {
    educationLevel = "PhD";
  } else if (lowercaseResume.includes("master") || lowercaseResume.includes("mba") || lowercaseResume.includes("ms in") || lowercaseResume.includes("m.s")) {
    educationLevel = "Master's Degree";
  } else if (lowercaseResume.includes("high school") && !lowercaseResume.includes("bachelor") && !lowercaseResume.includes("college degree")) {
    educationLevel = "High School";
  } else if (lowercaseResume.includes("associate") || lowercaseResume.includes("a.a.") || lowercaseResume.includes("a.a")) {
    educationLevel = "Associate's Degree";
  }

  // Fallback to job description requirements if resume doesn't contain education info
  if (educationLevel === "Bachelor's Degree" && resumeText.length < 100) {
    if (lowercaseDesc.includes("phd") || lowercaseDesc.includes("doctorate") || lowercaseDesc.includes("research")) {
      educationLevel = "PhD";
    } else if (lowercaseDesc.includes("master") || lowercaseDesc.includes("mba") || lowercaseDesc.includes("advanced degree")) {
      educationLevel = "Master's Degree";
    } else if (lowercaseDesc.includes("high school") || lowercaseDesc.includes("entry level")) {
      educationLevel = "High School";
    } else if (lowercaseDesc.includes("associate") || lowercaseDesc.includes("certificate")) {
      educationLevel = "Associate's Degree";
    }
  }

  // Experience level prediction from resume
  let yearsExperience = "3-5"; // Default
  
  // Try to find years of experience mentions in the resume
  const experiencePatterns = [
    { pattern: /(\d+)\+?\s*years? of experience/i, handler: (match: string[]) => parseInt(match[1]) },
    { pattern: /experience\D*(\d+)\+?\s*years?/i, handler: (match: string[]) => parseInt(match[1]) },
    { pattern: /(\d+)\+?\s*years? in/i, handler: (match: string[]) => parseInt(match[1]) },
    { pattern: /(\d{4})\s*-\s*present/i, handler: (match: string[]) => new Date().getFullYear() - parseInt(match[1]) },
    { pattern: /(\d{4})\s*-\s*(\d{4})/gi, handler: (match: string[]) => {
      // Get all year ranges and sum them up
      let totalYears = 0;
      let matches;
      while ((matches = /(\d{4})\s*-\s*(\d{4})/gi.exec(resumeText)) !== null) {
        const startYear = parseInt(matches[1]);
        const endYear = parseInt(matches[2]);
        if (endYear > startYear && endYear <= new Date().getFullYear()) {
          totalYears += (endYear - startYear);
        }
      }
      return totalYears;
    }}
  ];
  
  let foundYears = 0;
  for (const { pattern, handler } of experiencePatterns) {
    const match = lowercaseResume.match(pattern);
    if (match) {
      foundYears = handler(match);
      break;
    }
  }
  
  if (foundYears > 0) {
    if (foundYears < 1) yearsExperience = "<1";
    else if (foundYears >= 1 && foundYears < 3) yearsExperience = "1-3";
    else if (foundYears >= 3 && foundYears < 5) yearsExperience = "3-5";
    else if (foundYears >= 5 && foundYears < 7) yearsExperience = "5+";
    else if (foundYears >= 7 && foundYears < 10) yearsExperience = "7+";
    else yearsExperience = "10+";
  } else {
    // Fallback to job title inference if no explicit years found
    if (lowercaseResume.includes("senior") || lowercaseResume.includes("lead") || lowercaseResume.includes("manager")) {
      yearsExperience = "5+";
    } else if (lowercaseResume.includes("principal") || lowercaseResume.includes("director") || lowercaseResume.includes("head")) {
      yearsExperience = "10+";
    } else if (lowercaseResume.includes("junior") || lowercaseResume.includes("entry")) {
      yearsExperience = "1-3";
    } else if (lowercaseResume.includes("intern") || lowercaseResume.includes("trainee")) {
      yearsExperience = "<1";
    }
  }

  // Detect skills from job description and resume
  const potentialSkills = [
    { term: "javascript", skill: "JavaScript" },
    { term: "react", skill: "React" },
    { term: "node", skill: "Node.js" },
    { term: "python", skill: "Python" },
    { term: "java", skill: "Java" },
    { term: "c#", skill: "C#" },
    { term: "sql", skill: "SQL" },
    { term: "nosql", skill: "NoSQL" },
    { term: "mongodb", skill: "MongoDB" },
    { term: "aws", skill: "AWS" },
    { term: "azure", skill: "Azure" },
    { term: "cloud", skill: "Cloud Computing" },
    { term: "agile", skill: "Agile Methodology" },
    { term: "scrum", skill: "Scrum" },
    { term: "management", skill: "Project Management" },
    { term: "customer", skill: "Customer Service" },
    { term: "sales", skill: "Sales" },
    { term: "marketing", skill: "Marketing" },
    { term: "communication", skill: "Communication Skills" },
    { term: "leadership", skill: "Leadership" },
    { term: "teamwork", skill: "Teamwork" },
    { term: "design", skill: "Design" },
    { term: "ui", skill: "UI Design" },
    { term: "ux", skill: "UX Design" },
    { term: "analysis", skill: "Data Analysis" },
    { term: "excel", skill: "Microsoft Excel" },
    { term: "word", skill: "Microsoft Word" },
    { term: "powerpoint", skill: "Microsoft PowerPoint" },
    { term: "presentation", skill: "Presentation Skills" },
    { term: "research", skill: "Research" }
  ];
  
  // Find skills mentioned in the resume
  const resumeSkills = potentialSkills
    .filter(item => lowercaseResume.includes(item.term))
    .map(item => item.skill);
  
  // Find skills mentioned in the job description
  const jobSkills = potentialSkills
    .filter(item => lowercaseDesc.includes(item.term))
    .map(item => item.skill);
  
  // Matching skills (intersection of resume skills and job skills)
  const matchingSkills = resumeSkills.filter(skill => jobSkills.includes(skill));
  
  // Key skills to highlight (prioritize matching skills, but include some resume skills if needed)
  let keySkills = [...matchingSkills];
  if (keySkills.length < 5) {
    const additionalSkills = resumeSkills
      .filter(skill => !keySkills.includes(skill))
      .slice(0, 5 - keySkills.length);
    keySkills = [...keySkills, ...additionalSkills];
  }
  
  // If we still don't have enough skills, add some generic ones
  if (keySkills.length < 3) {
    const genericSkills = ["Communication", "Problem Solving", "Time Management", "Attention to Detail", "Teamwork"];
    while (keySkills.length < 5) {
      const skill = genericSkills[keySkills.length];
      if (!keySkills.includes(skill)) {
        keySkills.push(skill);
      }
    }
  }
  
  // Limit to 5 skills
  keySkills = keySkills.slice(0, 5);
  
  // Missing requirements - job skills not found in resume
  const missingSkills = jobSkills
    .filter(skill => !resumeSkills.includes(skill))
    .slice(0, 3);
  
  // Calculate skills match percentage based on matching skills vs job skills
  const matchPercentage = jobSkills.length > 0 
    ? Math.round((matchingSkills.length / jobSkills.length) * 100)
    : 70; // Default if no job skills detected
  
  // Adjust for resume quality/length
  const overallScore = resumeText.length > 500
    ? matchPercentage
    : Math.max(30, Math.round(matchPercentage * 0.7)); // Penalize very short or empty resumes
  
  // Determine skill match level based on score
  const skillsMatch = overallScore > 75 ? "High" : overallScore > 60 ? "Medium" : "Low";
  
  return {
    educationLevel,
    yearsExperience,
    skillsMatch,
    keySkills,
    missingRequirements: missingSkills,
    overallScore
  };
}
