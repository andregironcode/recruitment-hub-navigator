import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";
import * as pdfjsLib from "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js";

// Initialize PDF.js worker
pdfjsLib.GlobalWorkerOptions.workerSrc = "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js";

// Define types for Azure Form Recognizer response
interface AzureFormRecognizerResponse {
  status: string;
  analyzeResult: {
    content: string;
    documentResults: Array<{
      fields: {
        Name?: { value: string };
        Email?: { value: string };
        Phone?: { value: string };
        Address?: { value: string };
        Education?: {
          valueArray: Array<{
            valueObject: {
              School?: { value: string };
              Degree?: { value: string };
              Field?: { value: string };
              Year?: { value: string };
              GPA?: { value: string };
            };
          }>;
        };
        Experience?: {
          valueArray: Array<{
            valueObject: {
              Company?: { value: string };
              Title?: { value: string };
              StartDate?: { value: string };
              EndDate?: { value: string };
              Description?: { value: string };
            };
          }>;
        };
        Skills?: { value: string };
      };
    }>;
  };
}

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
}

// Helper function to detect resume sections
function detectResumeSections(text: string): ResumeSection[] {
  const sections: ResumeSection[] = [];
  const lines = text.split('\n');
  let currentSection: ResumeSection | null = null;
  let currentContent: string[] = [];

  // Common section headers with more variations
  const sectionHeaders = {
    education: [
      'education', 'academic', 'qualification', 'degree', 'studies',
      'university', 'college', 'school', 'institute', 'academy'
    ],
    experience: [
      'experience', 'work', 'employment', 'career', 'professional',
      'work history', 'employment history', 'career history',
      'professional experience', 'work experience'
    ],
    skills: [
      'skills', 'expertise', 'competencies', 'technologies',
      'technical skills', 'professional skills', 'core competencies',
      'key skills', 'areas of expertise'
    ]
  };

  for (const line of lines) {
    const trimmedLine = line.trim();
    const lowerLine = trimmedLine.toLowerCase();
    
    // Check if line is a section header
    let sectionType: keyof typeof sectionHeaders | null = null;
    for (const [type, headers] of Object.entries(sectionHeaders)) {
      if (headers.some(header => {
        // Check for exact match or header followed by colon
        return lowerLine === header || 
               lowerLine === `${header}:` ||
               // Check for all caps headers
               trimmedLine === trimmedLine.toUpperCase() && 
               lowerLine.includes(header);
      })) {
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
        title: trimmedLine,
        content: '',
        type: sectionType as ResumeSection['type']
      };
      currentContent = [];
    } else if (currentSection) {
      // Skip empty lines at the start of sections
      if (currentContent.length === 0 && !trimmedLine) continue;
      currentContent.push(trimmedLine);
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
        let currentEntry: {
          company?: string;
          title?: string;
          startDate?: string;
          endDate?: string;
          description: string[];
        } = { description: [] };

        for (const entry of experienceEntries) {
          const lines = entry.split('\n').map(line => line.trim()).filter(line => line);
          
          // Try to find dates in various formats
          const datePatterns = [
            /\b(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\s+\d{4}\s*-\s*(Present|Current|(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\s+\d{4})\b/i,
            /\b(19|20)\d{2}\s*-\s*(Present|Current|(19|20)\d{2})\b/,
            /\b\d{1,2}\/\d{4}\s*-\s*(Present|Current|\d{1,2}\/\d{4})\b/
          ];

          let datesFound = false;
          for (const line of lines) {
            for (const pattern of datePatterns) {
              const match = line.match(pattern);
              if (match) {
                const [startDate, endDate] = match[0].split(/\s*-\s*/);
                currentEntry.startDate = startDate.trim();
                currentEntry.endDate = endDate.trim();
                datesFound = true;
                break;
              }
            }
            if (datesFound) break;
          }

          // If no dates found, try to find years
          if (!datesFound) {
            const yearMatch = entry.match(/\b(19|20)\d{2}\b/g);
            if (yearMatch && yearMatch.length >= 2) {
              currentEntry.startDate = yearMatch[0];
              currentEntry.endDate = yearMatch[1];
            }
          }

          // Extract company and title
          const firstLine = lines[0] || '';
          const secondLine = lines[1] || '';
          
          // Check if first line contains company name
          if (firstLine && !firstLine.match(/\b(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\b/i) && 
              !firstLine.match(/\b(19|20)\d{2}\b/)) {
            currentEntry.company = firstLine;
            currentEntry.title = secondLine;
          } else {
            currentEntry.title = firstLine;
            currentEntry.company = secondLine;
          }

          // Add description lines
          currentEntry.description = lines.slice(2);

          // Add the entry if we have enough information
          if (currentEntry.company && currentEntry.title) {
            data.experience.push({
              company: currentEntry.company,
              title: currentEntry.title,
              startDate: currentEntry.startDate,
              endDate: currentEntry.endDate,
              description: currentEntry.description.join('\n')
            });
          }

          // Reset for next entry
          currentEntry = { description: [] };
        }
        break;

      case 'skills':
        const skillLines = section.content.split('\n');
        let currentCategory = 'technical'; // Default category
        
        for (const line of skillLines) {
          const trimmedLine = line.trim();
          if (!trimmedLine) continue;

          // Check for category headers
          if (trimmedLine.toLowerCase().includes('technical') || 
              trimmedLine.toLowerCase().includes('programming') ||
              trimmedLine.toLowerCase().includes('tools')) {
            currentCategory = 'technical';
            continue;
          } else if (trimmedLine.toLowerCase().includes('soft') || 
                     trimmedLine.toLowerCase().includes('interpersonal') ||
                     trimmedLine.includes('communication')) {
            currentCategory = 'soft';
            continue;
          } else if (trimmedLine.toLowerCase().includes('industry') || 
                     trimmedLine.toLowerCase().includes('domain')) {
            currentCategory = 'industry';
            continue;
          }

          // Split skills by common delimiters
          const skills = trimmedLine.split(/[,;]|\s+and\s+/).map(skill => skill.trim());
          
          // Add skills to appropriate category
          for (const skill of skills) {
            if (skill) {
              data.skills[currentCategory].push(skill);
            }
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

// Add a delay utility function
async function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Azure Form Recognizer implementation
async function extractTextFromPDF(pdfBuffer: ArrayBuffer): Promise<{ rawText: string; structuredData: StructuredResumeData }> {
  const endpoint = process.env.AZURE_FORM_RECOGNIZER_ENDPOINT;
  const key = process.env.AZURE_FORM_RECOGNIZER_KEY;
  
  if (!endpoint || !key) {
    throw new Error('Azure Form Recognizer credentials not configured');
  }

  // Convert ArrayBuffer to base64
  const base64Data = btoa(String.fromCharCode(...new Uint8Array(pdfBuffer)));

  // Call Azure Form Recognizer
  const response = await fetch(`${endpoint}/formrecognizer/documentModels/prebuilt-document:analyze?api-version=2023-07-31`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Ocp-Apim-Subscription-Key': key
    },
    body: JSON.stringify({
      base64Source: base64Data
    })
  });

  if (!response.ok) {
    throw new Error(`Azure Form Recognizer error: ${response.statusText}`);
  }

  const result = await response.json();
  const operationLocation = response.headers.get('Operation-Location');

  if (!operationLocation) {
    throw new Error('No operation location returned from Azure Form Recognizer');
  }

  // Poll for results
  let analysisResult: AzureFormRecognizerResponse | null = null;
  for (let i = 0; i < 10; i++) {
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const statusResponse = await fetch(operationLocation, {
      headers: {
        'Ocp-Apim-Subscription-Key': key
      }
    });
    
    const statusResult = await statusResponse.json() as AzureFormRecognizerResponse;
    
    if (statusResult.status === 'succeeded') {
      analysisResult = statusResult;
      break;
    }
  }

  if (!analysisResult) {
    throw new Error('Timeout waiting for Azure Form Recognizer analysis');
  }

  // Process the results
  const structuredData: StructuredResumeData = {
    contactInfo: {},
    education: [],
    experience: [],
    skills: {
      technical: [],
      soft: [],
      industry: []
    }
  };

  // Extract contact information
  const contactFields = analysisResult.analyzeResult.documentResults[0].fields;
  structuredData.contactInfo = {
    name: contactFields.Name?.value || '',
    email: contactFields.Email?.value || '',
    phone: contactFields.Phone?.value || '',
    location: contactFields.Address?.value || ''
  };

  // Extract education
  if (contactFields.Education?.valueArray) {
    structuredData.education = contactFields.Education.valueArray.map(item => ({
      institution: item.valueObject.School?.value || '',
      degree: item.valueObject.Degree?.value || '',
      field: item.valueObject.Field?.value || '',
      year: item.valueObject.Year?.value || '',
      gpa: item.valueObject.GPA?.value || ''
    }));
  }

  // Extract experience
  if (contactFields.Experience?.valueArray) {
    structuredData.experience = contactFields.Experience.valueArray.map(item => ({
      company: item.valueObject.Company?.value || '',
      title: item.valueObject.Title?.value || '',
      startDate: item.valueObject.StartDate?.value || '',
      endDate: item.valueObject.EndDate?.value || '',
      description: item.valueObject.Description?.value || ''
    }));
  }

  // Extract skills
  if (contactFields.Skills?.value) {
    const skillsText = contactFields.Skills.value;
    
    // Categorize skills
    const technicalKeywords = ['programming', 'language', 'framework', 'tool', 'software', 'system', 'database'];
    const softKeywords = ['communication', 'leadership', 'team', 'problem', 'time', 'management'];
    
    const skillsList = skillsText.split(/[,;]/).map(skill => skill.trim());
    
    skillsList.forEach(skill => {
      const lowerSkill = skill.toLowerCase();
      if (technicalKeywords.some(keyword => lowerSkill.includes(keyword))) {
        structuredData.skills.technical.push(skill);
      } else if (softKeywords.some(keyword => lowerSkill.includes(keyword))) {
        structuredData.skills.soft.push(skill);
      } else {
        structuredData.skills.industry.push(skill);
      }
    });
  }

  // Get raw text
  const rawText = analysisResult.analyzeResult.content;

  return { rawText, structuredData };
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

// Enhanced GPT extraction with better prompts
async function extractStructuredDataWithGPT(resumeText: string): Promise<ExtractedResumeData> {
  logSection('Starting GPT extraction', { textLength: resumeText.length });
  
  const extractionPrompt = `You are an expert resume parser. Your task is to extract ALL information from this resume in a structured format. Be thorough and accurate.

Resume Text:
${resumeText}

Extract the following information in JSON format:
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
      "startDate": "start date in YYYY-MM format",
      "endDate": "end date in YYYY-MM format or 'Present'",
      "description": "detailed job description including responsibilities and achievements"
    }
  ],
  "skills": {
    "technical": ["list of ALL technical skills mentioned"],
    "soft": ["list of ALL soft skills mentioned"],
    "industry": ["list of ALL industry-specific skills mentioned"]
  }
}

Guidelines:
1. Extract ALL education information found in the resume:
   - Look for institution names, degrees, and fields of study
   - Extract graduation years in YYYY format
   - Include GPAs if mentioned
   - Handle various education formats (e.g., "Bachelor of Science in Computer Science" or "B.S. Computer Science")

2. Extract ALL work experience:
   - Identify company names and job titles
   - Convert dates to YYYY-MM format
   - Extract detailed descriptions including:
     * Key responsibilities
     * Major achievements
     * Technologies used
     * Projects completed
   - Handle various date formats (e.g., "Jan 2020 - Present" or "2020-01 - Present")

3. Categorize ALL skills mentioned:
   - Technical skills: programming languages, tools, frameworks, etc.
   - Soft skills: communication, leadership, teamwork, etc.
   - Industry skills: domain-specific knowledge and expertise

4. Be thorough and include ALL information found in the resume
5. Do not make assumptions or add information not present
6. Return a valid JSON object
7. Handle various resume formats and layouts
8. Preserve the original wording and terminology used in the resume`;

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
        max_tokens: 4000
      })
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.statusText}`);
    }

    const result = await response.json();
    const extractedData = JSON.parse(result.choices[0].message.content);
    
    // Validate and clean the extracted data
    const validatedData = validateAndCleanExtractedData(extractedData);
    
    logSection('GPT extraction completed', { 
      educationCount: validatedData.education.length,
      experienceCount: validatedData.experience.length,
      skillsCount: {
        technical: validatedData.skills.technical.length,
        soft: validatedData.skills.soft.length,
        industry: validatedData.skills.industry.length
      }
    });

    return validatedData;
  } catch (error) {
    logSection('GPT extraction failed', { error: error.message }, 'error');
    throw error;
  }
}

// Helper function to validate and clean extracted data
function validateAndCleanExtractedData(data: any): ExtractedResumeData {
  // Ensure all required fields exist
  const cleanedData: ExtractedResumeData = {
    contactInfo: {
      name: data.contactInfo?.name?.trim() || '',
      email: data.contactInfo?.email?.trim() || '',
      phone: data.contactInfo?.phone?.trim() || '',
      location: data.contactInfo?.location?.trim() || ''
    },
    education: [],
    experience: [],
    skills: {
      technical: [],
      soft: [],
      industry: []
    }
  };

  // Clean and validate education data
  if (Array.isArray(data.education)) {
    cleanedData.education = data.education.map((edu: any) => ({
      institution: edu.institution?.trim() || '',
      degree: edu.degree?.trim() || '',
      field: edu.field?.trim() || '',
      year: edu.year?.trim() || '',
      gpa: edu.gpa?.trim() || ''
    })).filter((edu: any) => edu.institution || edu.degree);
  }

  // Clean and validate experience data
  if (Array.isArray(data.experience)) {
    cleanedData.experience = data.experience.map((exp: any) => ({
      company: exp.company?.trim() || '',
      title: exp.title?.trim() || '',
      startDate: exp.startDate?.trim() || '',
      endDate: exp.endDate?.trim() || '',
      description: exp.description?.trim() || ''
    })).filter((exp: any) => exp.company || exp.title);
  }

  // Clean and validate skills data
  if (data.skills) {
    cleanedData.skills = {
      technical: (data.skills.technical || []).map((skill: string) => skill.trim()).filter(Boolean),
      soft: (data.skills.soft || []).map((skill: string) => skill.trim()).filter(Boolean),
      industry: (data.skills.industry || []).map((skill: string) => skill.trim()).filter(Boolean)
    };
  }

  return cleanedData;
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

  const analysisPrompt = `You are an expert recruitment analyst. Analyze this candidate's qualifications against the job description in detail.

CANDIDATE QUALIFICATIONS:
${JSON.stringify(extractedData, null, 2)}

JOB DESCRIPTION:
${jobDescription}

Provide a detailed analysis in this format:
{
  "educationLevel": "list all education found with details",
  "yearsExperience": "total years and breakdown by role",
  "skillsMatch": "High/Medium/Low with explanation",
  "keySkills": {
    "technical": ["matching technical skills with proficiency level"],
    "soft": ["matching soft skills with examples"],
    "industry": ["matching industry skills with relevance"]
  },
  "missingRequirements": {
    "skills": ["missing skills with importance level"],
    "qualifications": ["missing qualifications with impact"],
    "experience": ["missing experience with alternatives"]
  },
  "overallScore": number,
  "analysis": {
    "strengths": ["detailed list of candidate's strengths"],
    "gaps": ["detailed list of gaps and their impact"],
    "recommendations": ["specific recommendations for improvement"]
  }
}

Guidelines:
1. Report ALL education information found with details
2. Calculate years of experience from the provided experience data
3. Match skills explicitly mentioned in both resume and job description
4. List missing requirements based on job description
5. Score based on explicit matches and relevance
6. Provide detailed analysis of strengths, gaps, and recommendations
7. Return a valid JSON object`;

  try {
    // Add delay before GPT call
    await delay(500);
    
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
            content: 'You are an expert recruitment analyst. Analyze the candidate\'s qualifications against the job requirements in detail.'
          },
          {
            role: 'user',
            content: analysisPrompt
          }
        ],
        temperature: 0.1,
        max_tokens: 4000
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
        
        // Add delay after PDF extraction
        await delay(300);
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
    
    // Add delay between extraction and analysis
    await delay(500);
    
    // Second stage: Analyze against job description
    const analysis = await analyzeWithGPT(extractedData, jobDescription);
    
    // Add delay before storing results
    await delay(200);
    
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
