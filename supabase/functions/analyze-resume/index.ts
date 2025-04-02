import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";
import * as pdfjsLib from "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js";

// Initialize PDF.js worker
pdfjsLib.GlobalWorkerOptions.workerSrc = "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js";

// Define resume section types
type ResumeSection = {
  title: string;
  content: string;
  type: 'education' | 'experience' | 'skills' | 'other';
};

// Define structured resume data
type StructuredResumeData = {
  contactInfo: {
    name?: string;
    email?: string;
    phone?: string;
    location?: string;
  };
  education: Array<{
    institution: string;
    degree: string;
    field: string;
    year?: string;
    gpa?: string;
  }>;
  experience: Array<{
    company: string;
    title: string;
    startDate?: string;
    endDate?: string;
    description: string;
  }>;
  skills: {
    technical: string[];
    soft: string[];
    industry: string[];
  };
};

// Add new types for the multi-stage processing
interface ExtractedResumeData {
  education: Array<{
    institution: string;
    degree: string;
    field: string;
    year?: string;
    gpa?: string;
  }>;
  experience: Array<{
    company: string;
    title: string;
    startDate?: string;
    endDate?: string;
    description?: string;
  }>;
  skills: {
    technical: string[];
    soft: string[];
    industry: string[];
  };
}

// Helper function to detect resume sections
function detectResumeSections(text: string): ResumeSection[] {
  const sections: ResumeSection[] = [];
  const lines = text.split('\n');
  let currentSection: ResumeSection | null = null;
  let currentContent: string[] = [];

  // Common section headers
  const sectionHeaders = {
    education: ['education', 'academic', 'qualification', 'degree'],
    experience: ['experience', 'work', 'employment', 'career'],
    skills: ['skills', 'expertise', 'competencies', 'technologies']
  };

  for (const line of lines) {
    const trimmedLine = line.trim().toLowerCase();
    
    // Check if line is a section header
    let sectionType: keyof typeof sectionHeaders | null = null;
    for (const [type, headers] of Object.entries(sectionHeaders)) {
      if (headers.some(header => trimmedLine.includes(header))) {
        sectionType = type as keyof typeof sectionHeaders;
        break;
      }
    }

    if (sectionType) {
      // Save previous section if exists
      if (currentSection) {
        currentSection.content = currentContent.join('\n');
        sections.push(currentSection);
      }

      // Start new section
      currentSection = {
        title: line.trim(),
        content: '',
        type: sectionType as ResumeSection['type']
      };
      currentContent = [];
    } else if (currentSection) {
      currentContent.push(line);
    }
  }

  // Add last section
  if (currentSection) {
    currentSection.content = currentContent.join('\n');
    sections.push(currentSection);
  }

  return sections;
}

// Helper function to extract structured data from sections
function extractStructuredData(sections: ResumeSection[]): StructuredResumeData {
  const data: StructuredResumeData = {
    contactInfo: {},
    education: [],
    experience: [],
    skills: {
      technical: [],
      soft: [],
      industry: []
    }
  };

  // Extract contact info from first section
  const firstSection = sections[0]?.content || '';
  const contactLines = firstSection.split('\n');
  for (const line of contactLines) {
    const trimmedLine = line.trim();
    if (trimmedLine.includes('@')) {
      data.contactInfo.email = trimmedLine;
    } else if (trimmedLine.match(/\d{3}[-.]?\d{3}[-.]?\d{4}/)) {
      data.contactInfo.phone = trimmedLine;
    } else if (!data.contactInfo.name) {
      data.contactInfo.name = trimmedLine;
    }
  }

  // Process each section
  for (const section of sections) {
    switch (section.type) {
      case 'education':
        const educationEntries = section.content.split('\n\n');
        for (const entry of educationEntries) {
          const lines = entry.split('\n');
          const institution = lines[0]?.trim() || '';
          const degreeLine = lines[1]?.trim() || '';
          const yearMatch = degreeLine.match(/\b(19|20)\d{2}\b/);
          
          data.education.push({
            institution,
            degree: degreeLine.split(yearMatch?.[0] || '')[0].trim(),
            field: degreeLine.split(yearMatch?.[0] || '')[1]?.trim() || '',
            year: yearMatch?.[0]
          });
        }
        break;

      case 'experience':
        const experienceEntries = section.content.split('\n\n');
        for (const entry of experienceEntries) {
          const lines = entry.split('\n');
          const titleLine = lines[0]?.trim() || '';
          const companyLine = lines[1]?.trim() || '';
          const dateMatch = titleLine.match(/\b(19|20)\d{2}\b/g);
          
          data.experience.push({
            company: companyLine,
            title: titleLine.split(dateMatch?.[0] || '')[0].trim(),
            startDate: dateMatch?.[0],
            endDate: dateMatch?.[1],
            description: lines.slice(2).join('\n')
          });
        }
        break;

      case 'skills':
        const skillLines = section.content.split('\n');
        for (const line of skillLines) {
          const trimmedLine = line.trim().toLowerCase();
          if (trimmedLine.includes('technical') || trimmedLine.includes('programming')) {
            data.skills.technical.push(line.trim());
          } else if (trimmedLine.includes('soft') || trimmedLine.includes('interpersonal')) {
            data.skills.soft.push(line.trim());
          } else {
            data.skills.industry.push(line.trim());
          }
        }
        break;
    }
  }

  return data;
}

// Add logging utility
function logSection(title: string, data: any, level: 'info' | 'debug' | 'error' = 'info') {
  const timestamp = new Date().toISOString();
  const logMessage = `[${timestamp}] ${title}: ${JSON.stringify(data, null, 2)}`;
  
  switch (level) {
    case 'debug':
      console.debug(logMessage);
      break;
    case 'error':
      console.error(logMessage);
      break;
    default:
      console.log(logMessage);
  }
}

// Enhanced validation function
function validateStructuredData(data: StructuredResumeData): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];

  // Validate contact info
  if (!data.contactInfo) {
    errors.push('Missing contact info section');
  } else {
    if (!data.contactInfo.name) {
      errors.push('Missing name in contact info');
    }
    if (!data.contactInfo.email && !data.contactInfo.phone) {
      errors.push('Missing both email and phone in contact info');
    }
  }

  // Validate education
  if (!Array.isArray(data.education)) {
    errors.push('Education must be an array');
  } else {
    data.education.forEach((edu, index) => {
      if (!edu.institution) {
        errors.push(`Education entry ${index} missing institution`);
      }
      if (!edu.degree) {
        errors.push(`Education entry ${index} missing degree`);
      }
      if (edu.year && !edu.year.match(/\b(19|20)\d{2}\b/)) {
        errors.push(`Education entry ${index} has invalid year format`);
      }
    });
  }

  // Validate experience
  if (!Array.isArray(data.experience)) {
    errors.push('Experience must be an array');
  } else {
    data.experience.forEach((exp, index) => {
      if (!exp.company) {
        errors.push(`Experience entry ${index} missing company`);
      }
      if (!exp.title) {
        errors.push(`Experience entry ${index} missing title`);
      }
      if (exp.startDate && !exp.startDate.match(/\b(19|20)\d{2}\b/)) {
        errors.push(`Experience entry ${index} has invalid start date format`);
      }
      if (exp.endDate && !exp.endDate.match(/\b(19|20)\d{2}\b/)) {
        errors.push(`Experience entry ${index} has invalid end date format`);
      }
    });
  }

  // Validate skills
  if (!data.skills) {
    errors.push('Missing skills section');
  } else {
    if (!Array.isArray(data.skills.technical)) {
      errors.push('Technical skills must be an array');
    }
    if (!Array.isArray(data.skills.soft)) {
      errors.push('Soft skills must be an array');
    }
    if (!Array.isArray(data.skills.industry)) {
      errors.push('Industry skills must be an array');
    }
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

// Update the extractTextFromPDF function with better logging
async function extractTextFromPDF(pdfBuffer: ArrayBuffer): Promise<{ rawText: string; structuredData: StructuredResumeData }> {
  logSection('Starting PDF extraction', { bufferSize: pdfBuffer.byteLength });
  
  const pdf = await pdfjsLib.getDocument({ data: pdfBuffer }).promise;
  logSection('PDF document loaded', { pageCount: pdf.numPages });
  
  let fullText = '';
  const pageTexts: string[] = [];

  // Extract text from each page while preserving structure
  for (let i = 1; i <= pdf.numPages; i++) {
    logSection(`Processing page ${i}`, {}, 'debug');
    
    const page = await pdf.getPage(i);
    const textContent = await page.getTextContent();
    let pageText = '';
    let lastY = null;
    let lastFontSize = null;

    // Sort text items by vertical position and then horizontal position
    const textItems = textContent.items.sort((a: any, b: any) => {
      if (Math.abs(a.transform[5] - b.transform[5]) > 5) {
        return b.transform[5] - a.transform[5];
      }
      return a.transform[4] - b.transform[4];
    });

    logSection(`Page ${i} text items`, { count: textItems.length }, 'debug');

    // Process text items with better formatting preservation
    for (const item of textItems) {
      const { str, transform, fontName, fontSize } = item as any;
      const y = transform[5];
      const x = transform[4];

      // Add spacing based on vertical position
      if (lastY !== null && Math.abs(y - lastY) > 5) {
        pageText += '\n';
      }

      // Add spacing based on font size changes
      if (lastFontSize !== null && Math.abs(fontSize - lastFontSize) > 2) {
        pageText += ' ';
      }

      pageText += str;
      lastY = y;
      lastFontSize = fontSize;
    }

    pageTexts.push(pageText);
    fullText += pageText + '\n\n';
    
    logSection(`Page ${i} processed`, { textLength: pageText.length }, 'debug');
  }

  // Clean up the text
  fullText = fullText
    .replace(/\s+/g, ' ')  // Replace multiple spaces with single space
    .replace(/\n{3,}/g, '\n\n') // Replace multiple newlines with double newline
    .trim();

  logSection('Text extraction complete', { 
    totalLength: fullText.length,
    pageCount: pageTexts.length,
    averagePageLength: Math.round(fullText.length / pageTexts.length)
  });

  // Extract structured data using a more reliable method
  const structuredData = extractStructuredDataFromText(fullText);
  
  // Validate the structured data
  const validation = validateStructuredData(structuredData);
  if (!validation.isValid) {
    logSection('Structured data validation errors', validation.errors, 'error');
  } else {
    logSection('Structured data validation passed', {});
  }

  return { rawText: fullText, structuredData };
}

// Add education level detection function
function detectEducationLevel(degree: string, field: string): string {
  const degreeLower = degree.toLowerCase();
  const fieldLower = field.toLowerCase();
  
  // Check for PhD/Doctorate
  if (degreeLower.includes('phd') || degreeLower.includes('doctorate') || 
      degreeLower.includes('ph.d') || degreeLower.includes('d.phil')) {
    return 'Doctorate';
  }
  
  // Check for Master's
  if (degreeLower.includes('master') || degreeLower.includes('m.s') || 
      degreeLower.includes('m.a') || degreeLower.includes('mba') || 
      degreeLower.includes('m.ed') || degreeLower.includes('m.eng')) {
    return 'Master\'s';
  }
  
  // Check for Bachelor's
  if (degreeLower.includes('bachelor') || degreeLower.includes('b.s') || 
      degreeLower.includes('b.a') || degreeLower.includes('b.eng') || 
      degreeLower.includes('b.ed') || degreeLower.includes('b.tech')) {
    return 'Bachelor\'s';
  }
  
  // Check for Associate's
  if (degreeLower.includes('associate') || degreeLower.includes('a.s') || 
      degreeLower.includes('a.a') || degreeLower.includes('aas')) {
    return 'Associate\'s';
  }
  
  // Check for certifications
  if (degreeLower.includes('certificate') || degreeLower.includes('diploma') || 
      degreeLower.includes('certification')) {
    return 'Certification';
  }
  
  return 'Other';
}

// Enhanced education extraction function
function extractEducationInfo(text: string): Array<{
  institution: string;
  degree: string;
  field: string;
  year?: string;
  level: string;
}> {
  const educationEntries: Array<{
    institution: string;
    degree: string;
    field: string;
    year?: string;
    level: string;
  }> = [];
  
  // Split text into lines
  const lines = text.split('\n').map(line => line.trim()).filter(line => line.length > 0);
  
  // Common education keywords
  const educationKeywords = [
    'university', 'college', 'school', 'institute', 'academy',
    'bachelor', 'master', 'phd', 'doctorate', 'degree',
    'diploma', 'certificate', 'graduated', 'graduation'
  ];
  
  let currentEntry: string[] = [];
  let foundEducation = false;
  
  for (const line of lines) {
    const lowerLine = line.toLowerCase();
    
    // Check if line contains education keywords
    const isEducationLine = educationKeywords.some(keyword => lowerLine.includes(keyword));
    
    if (isEducationLine) {
      foundEducation = true;
      if (currentEntry.length > 0) {
        // Process previous entry
        const entry = processEducationEntry(currentEntry);
        if (entry) {
          educationEntries.push(entry);
        }
      }
      currentEntry = [line];
    } else if (foundEducation && currentEntry.length > 0) {
      // If we're in an education section, add to current entry
      currentEntry.push(line);
    }
  }
  
  // Process last entry
  if (currentEntry.length > 0) {
    const entry = processEducationEntry(currentEntry);
    if (entry) {
      educationEntries.push(entry);
    }
  }
  
  return educationEntries;
}

// Helper function to process education entry
function processEducationEntry(lines: string[]): {
  institution: string;
  degree: string;
  field: string;
  year?: string;
  level: string;
} | null {
  if (lines.length === 0) return null;
  
  // Find year if present
  const yearMatch = lines.join(' ').match(/\b(19|20)\d{2}\b/);
  const year = yearMatch ? yearMatch[0] : undefined;
  
  // Try to identify institution and degree
  let institution = '';
  let degree = '';
  let field = '';
  
  // First line is usually institution
  institution = lines[0].trim();
  
  // Look for degree and field in remaining lines
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    
    // Skip empty lines and years
    if (!line || line.match(/\b(19|20)\d{2}\b/)) continue;
    
    // If we haven't found a degree yet, this line might be it
    if (!degree) {
      degree = line;
      // Try to extract field from degree
      const fieldMatch = degree.match(/in\s+([^,]+)/i);
      if (fieldMatch) {
        field = fieldMatch[1].trim();
        degree = degree.replace(/in\s+[^,]+/i, '').trim();
      }
    }
  }
  
  // If we still don't have a degree, try to extract it from the institution line
  if (!degree) {
    const parts = institution.split(',').map(part => part.trim());
    if (parts.length > 1) {
      institution = parts[0];
      degree = parts[1];
    }
  }
  
  // Clean up the extracted information
  institution = institution.replace(/,$/, '').trim();
  degree = degree.replace(/,$/, '').trim();
  field = field.replace(/,$/, '').trim();
  
  // Only return if we have at least an institution
  if (!institution) return null;
  
  // Determine education level
  const level = detectEducationLevel(degree, field);
  
  return {
    institution,
    degree: degree || 'Not specified',
    field: field || 'Not specified',
    year,
    level
  };
}

// Update the extractStructuredDataFromText function
function extractStructuredDataFromText(text: string): StructuredResumeData {
  logSection('Starting structured data extraction', { textLength: text.length });
  
  const data: StructuredResumeData = {
    contactInfo: {},
    education: [],
    experience: [],
    skills: {
      technical: [],
      soft: [],
      industry: []
    }
  };

  // Extract education information first
  const educationEntries = extractEducationInfo(text);
  data.education = educationEntries;
  
  logSection('Extracted education entries', { 
    count: educationEntries.length,
    entries: educationEntries 
  }, 'debug');

  // Split text into lines and process
  const lines = text.split('\n').map(line => line.trim()).filter(line => line.length > 0);
  logSection('Text split into lines', { lineCount: lines.length }, 'debug');
  
  // Extract contact info from first few lines
  for (let i = 0; i < Math.min(5, lines.length); i++) {
    const line = lines[i];
    if (line.includes('@')) {
      data.contactInfo.email = line;
      logSection('Found email', { email: line }, 'debug');
    } else if (line.match(/\d{3}[-.]?\d{3}[-.]?\d{4}/)) {
      data.contactInfo.phone = line;
      logSection('Found phone', { phone: line }, 'debug');
    } else if (!data.contactInfo.name) {
      data.contactInfo.name = line;
      logSection('Found name', { name: line }, 'debug');
    }
  }

  // Process each line for experience and skills
  let currentSection = '';
  let currentEntry: string[] = [];

  for (const line of lines) {
    const lowerLine = line.toLowerCase();
    
    // Check for section headers
    if (lowerLine.includes('experience') || lowerLine.includes('work')) {
      currentSection = 'experience';
      currentEntry = [];
      logSection('Found experience section', { line }, 'debug');
    } else if (lowerLine.includes('skills') || lowerLine.includes('expertise')) {
      currentSection = 'skills';
      currentEntry = [];
      logSection('Found skills section', { line }, 'debug');
    } else {
      // Process content based on current section
      switch (currentSection) {
        case 'experience':
          if (line.match(/\b(19|20)\d{2}\b/)) {
            // Found a year, process the experience entry
            const years = line.match(/\b(19|20)\d{2}\b/g);
            if (years && years.length > 0) {
              const titleInfo = line.split(years[0])[0].trim();
              const company = currentEntry.join(' ').trim();
              
              if (titleInfo && company) {
                data.experience.push({
                  company,
                  title: titleInfo,
                  startDate: years[0],
                  endDate: years[1],
                  description: ''
                });
                logSection('Processed experience entry', { company, title: titleInfo, years }, 'debug');
              }
            }
            currentEntry = [];
          } else {
            currentEntry.push(line);
          }
          break;

        case 'skills':
          // Categorize skills based on keywords
          if (lowerLine.includes('technical') || lowerLine.includes('programming')) {
            data.skills.technical.push(line);
            logSection('Found technical skill', { skill: line }, 'debug');
          } else if (lowerLine.includes('soft') || lowerLine.includes('interpersonal')) {
            data.skills.soft.push(line);
            logSection('Found soft skill', { skill: line }, 'debug');
          } else {
            data.skills.industry.push(line);
            logSection('Found industry skill', { skill: line }, 'debug');
          }
          break;
      }
    }
  }

  logSection('Structured data extraction complete', {
    educationCount: data.education.length,
    experienceCount: data.experience.length,
    skillsCount: {
      technical: data.skills.technical.length,
      soft: data.skills.soft.length,
      industry: data.skills.industry.length
    }
  });

  return data;
}

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Create a Supabase client with the service role key
const supabaseAdmin = createClient(
  Deno.env.get('SUPABASE_URL') || '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || ''
);

// Add these helper functions before the serve function
async function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function callOpenAIWithRetry(messages: any[], maxRetries = 3, initialDelay = 1000): Promise<any> {
  let lastError;
  
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${Deno.env.get('OPENAI_API_KEY')}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-4',
          messages,
          temperature: 0.1,
          max_tokens: 4000,
        }),
      });

      if (response.status === 429) {
        // Rate limit hit - calculate backoff time
        const retryAfter = response.headers.get('Retry-After') || '60';
        const delay = parseInt(retryAfter) * 1000;
        console.log(`Rate limit hit, waiting ${delay}ms before retry ${attempt + 1}/${maxRetries}`);
        await sleep(delay);
        continue;
      }

      if (!response.ok) {
        throw new Error(`OpenAI API error: ${response.statusText} (${response.status})`);
      }

      return await response.json();
    } catch (error) {
      lastError = error;
      if (attempt < maxRetries - 1) {
        const delay = initialDelay * Math.pow(2, attempt);
        console.log(`Attempt ${attempt + 1} failed, retrying in ${delay}ms`);
        await sleep(delay);
      }
    }
  }

  throw lastError;
}

// Add a fallback analysis function
function generateFallbackAnalysis(resumeText: string, jobDescription: string): any {
  // Basic text analysis for fallback
  const hasEducation = resumeText.toLowerCase().includes('education') || 
                      resumeText.toLowerCase().includes('degree') ||
                      resumeText.toLowerCase().includes('university');
  
  const hasExperience = resumeText.toLowerCase().includes('experience') ||
                       resumeText.toLowerCase().includes('work') ||
                       resumeText.toLowerCase().includes('employment');

  const hasSkills = resumeText.toLowerCase().includes('skills') ||
                   resumeText.toLowerCase().includes('expertise') ||
                   resumeText.toLowerCase().includes('technologies');

  return {
    educationLevel: hasEducation ? "Education information found in resume" : "No education information found",
    yearsExperience: hasExperience ? "Experience information found in resume" : "No experience information found",
    skillsMatch: hasSkills ? "Medium" : "Low",
    keySkills: {
      technical: hasSkills ? ["Skills information found in resume"] : [],
      soft: [],
      industry: []
    },
    missingRequirements: {
      skills: [],
      qualifications: [],
      experience: []
    },
    overallScore: hasEducation && hasExperience && hasSkills ? 50 : 30,
    analysis: {
      strengths: [],
      gaps: [],
      recommendations: []
    },
    fallback: true
  };
}

// Add new function for the first GPT call to extract structured data
async function extractStructuredDataWithGPT(resumeText: string): Promise<ExtractedResumeData> {
  logSection('Starting GPT extraction', { textLength: resumeText.length });
  
  const extractionPrompt = `Extract the following information from this resume in JSON format:
{
  "education": [
    {
      "institution": "exact institution name",
      "degree": "exact degree name",
      "field": "field of study",
      "year": "graduation year",
      "gpa": "if mentioned"
    }
  ],
  "experience": [
    {
      "company": "exact company name",
      "title": "exact job title",
      "startDate": "start date",
      "endDate": "end date",
      "description": "job description"
    }
  ],
  "skills": {
    "technical": ["list of technical skills"],
    "soft": ["list of soft skills"],
    "industry": ["list of industry skills"]
  }
}

Guidelines:
1. Extract ALL education information found in the resume
2. Include exact institution names, degrees, and fields
3. Extract ALL work experience with exact company names and titles
4. List ALL skills mentioned, properly categorized
5. Do not make assumptions or add information not present
6. Return a valid JSON object

Resume text:
${resumeText}`;

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${Deno.env.get('OPENAI_API_KEY')}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content: 'You are an expert resume parser. Extract all information accurately and return it in the specified JSON format.'
          },
          {
            role: 'user',
            content: extractionPrompt
          }
        ],
        temperature: 0.1,
        max_tokens: 2000
      })
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.statusText}`);
    }

    const result = await response.json();
    const extractedData = JSON.parse(result.choices[0].message.content);
    
    logSection('GPT extraction completed', { 
      educationCount: extractedData.education.length,
      experienceCount: extractedData.experience.length,
      skillsCount: {
        technical: extractedData.skills.technical.length,
        soft: extractedData.skills.soft.length,
        industry: extractedData.skills.industry.length
      }
    });

    return extractedData;
  } catch (error) {
    logSection('GPT extraction failed', { error: error.message }, 'error');
    throw error;
  }
}

// Add new function for the second GPT call to analyze against job description
async function analyzeWithGPT(extractedData: ExtractedResumeData, jobDescription: string): Promise<ResumeAnalysis> {
  logSection('Starting GPT analysis', { 
    jobDescriptionLength: jobDescription.length,
    extractedDataSummary: {
      educationCount: extractedData.education.length,
      experienceCount: extractedData.experience.length,
      skillsCount: {
        technical: extractedData.skills.technical.length,
        soft: extractedData.skills.soft.length,
        industry: extractedData.skills.industry.length
      }
    }
  });

  const analysisPrompt = `Analyze this candidate's qualifications against the job description:

CANDIDATE QUALIFICATIONS:
${JSON.stringify(extractedData, null, 2)}

JOB DESCRIPTION:
${jobDescription}

Provide a detailed analysis in this format:
{
  "educationLevel": "list all education found",
  "yearsExperience": "total years and breakdown",
  "skillsMatch": "High/Medium/Low",
  "keySkills": {
    "technical": ["matching technical skills"],
    "soft": ["matching soft skills"],
    "industry": ["matching industry skills"]
  },
  "missingRequirements": {
    "skills": ["missing skills"],
    "qualifications": ["missing qualifications"],
    "experience": ["missing experience"]
  },
  "overallScore": number,
  "analysis": {
    "strengths": ["list of strengths"],
    "gaps": ["list of gaps"],
    "recommendations": ["list of recommendations"]
  }
}

Guidelines:
1. Report ALL education information found
2. Calculate years of experience from the provided experience data
3. Match skills explicitly mentioned in both resume and job description
4. List missing requirements based on job description
5. Score based on explicit matches only
6. Return a valid JSON object`;

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${Deno.env.get('OPENAI_API_KEY')}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content: 'You are an expert recruitment analyst. Analyze the candidate\'s qualifications against the job requirements.'
          },
          {
            role: 'user',
            content: analysisPrompt
          }
        ],
        temperature: 0.1,
        max_tokens: 2000
      })
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.statusText}`);
    }

    const result = await response.json();
    const analysis = JSON.parse(result.choices[0].message.content);
    
    logSection('GPT analysis completed', { 
      educationLevel: analysis.educationLevel,
      skillsMatch: analysis.skillsMatch,
      overallScore: analysis.overallScore
    });

    return analysis;
  } catch (error) {
    logSection('GPT analysis failed', { error: error.message }, 'error');
    throw error;
  }
}

// Update the main handler to use the new multi-stage processing
serve(async (req) => {
  try {
    // Handle CORS preflight requests
    if (req.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }

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
    
    // Extract text from the resume
    let resumeText = '';
    let structuredData: StructuredResumeData | null = null;

    if (resumeUrl) {
      const response = await fetch(resumeUrl);
      if (!response.ok) {
        throw new Error(`Failed to fetch resume: ${response.statusText}`);
      }
      const contentType = response.headers.get('content-type');
      const buffer = await response.arrayBuffer();

      if (contentType?.includes('pdf')) {
        const { rawText, structuredData: extractedData } = await extractTextFromPDF(buffer);
        resumeText = rawText;
        structuredData = extractedData;
      } else if (contentType?.includes('text')) {
        resumeText = new TextDecoder().decode(buffer);
      } else {
        throw new Error('Unsupported file type. Please upload a PDF or text file.');
      }
    } else if (resumeContent) {
      resumeText = resumeContent;
    } else {
      throw new Error('No resume content provided');
    }
    
    // If we have no meaningful text to analyze, return a fallback analysis
    if ((!resumeText || resumeText.includes('Error accessing resume file') || resumeText.length < 50) 
        && !structuredData) {
      console.log('Insufficient resume text, generating fallback analysis');
      
      const fallbackAnalysis = generateFallbackAnalysis(resumeText, jobDescription);
      
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
    
    // First stage: Extract structured data with GPT
    const extractedData = await extractStructuredDataWithGPT(resumeText);
    
    // Second stage: Analyze against job description
    const analysis = await analyzeWithGPT(extractedData, jobDescription);
    
    // Store results in database
    const { error: dbError } = await supabaseAdmin
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
        fallback: false
      });

    if (dbError) {
      logSection('Database error', { error: dbError.message }, 'error');
      throw dbError;
    }

    return new Response(
      JSON.stringify({
        success: true,
        analysis,
        extractedData
      }),
      {
        headers: { 'Content-Type': 'application/json' },
        status: 200
      }
    );
  } catch (error) {
    console.error('Error in request handler:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
