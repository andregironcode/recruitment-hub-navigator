import { supabase } from '@/integrations/supabase/client';
import { Job } from '@/components/jobs/JobList';
import { JobSearchFilters } from '@/components/jobs/JobSearch';

/**
 * Get all jobs from the database
 */
export const getAllJobs = async (): Promise<Job[]> => {
  const { data, error } = await supabase
    .from('jobs')
    .select('*')
    .order('posted_date', { ascending: false });

  if (error) {
    console.error('Error fetching jobs:', error);
    throw new Error('Failed to fetch jobs');
  }

  // Map from database schema to our Job type
  return data.map(job => ({
    id: job.id,
    title: job.title,
    company: job.company,
    location: job.location,
    salary: job.salary || '',
    jobType: job.job_type, // Map job_type to jobType
    industry: job.industry,
    description: job.description,
    postedDate: job.posted_date ? new Date(job.posted_date).toLocaleDateString() : 'Today',
    featured: job.featured || false
  }));
};

/**
 * Get a job by ID
 */
export const getJobById = async (id: number): Promise<Job | null> => {
  const { data, error } = await supabase
    .from('jobs')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    console.error('Error fetching job by ID:', error);
    throw new Error('Failed to fetch job');
  }

  if (!data) return null;

  // Map from database schema to our Job type
  return {
    id: data.id,
    title: data.title,
    company: data.company,
    location: data.location,
    salary: data.salary || '',
    jobType: data.job_type, // Map job_type to jobType
    industry: data.industry,
    description: data.description,
    postedDate: data.posted_date ? new Date(data.posted_date).toLocaleDateString() : 'Today',
    featured: data.featured || false
  };
};

/**
 * Filter jobs based on search criteria
 */
export const filterJobs = async (filters: JobSearchFilters): Promise<Job[]> => {
  let query = supabase
    .from('jobs')
    .select('*')
    .order('posted_date', { ascending: false });

  // Apply filters if they exist
  if (filters.keyword) {
    query = query.or(`title.ilike.%${filters.keyword}%,company.ilike.%${filters.keyword}%,description.ilike.%${filters.keyword}%`);
  }

  if (filters.location) {
    query = query.ilike('location', `%${filters.location}%`);
  }

  if (filters.industry) {
    query = query.eq('industry', filters.industry);
  }

  if (filters.jobType) {
    query = query.eq('job_type', filters.jobType);
  }

  const { data, error } = await query;

  if (error) {
    console.error('Error filtering jobs:', error);
    throw new Error('Failed to filter jobs');
  }

  // Map from database schema to our Job type
  return data.map(job => ({
    id: job.id,
    title: job.title,
    company: job.company,
    location: job.location,
    salary: job.salary || '',
    jobType: job.job_type, // Map job_type to jobType
    industry: job.industry,
    description: job.description,
    postedDate: job.posted_date ? new Date(job.posted_date).toLocaleDateString() : 'Today',
    featured: job.featured || false
  }));
};

/**
 * Add a new job
 */
export const addJob = async (job: Omit<Job, 'id'>): Promise<void> => {
  // Convert from our Job type to database schema
  const dbJob = {
    title: job.title,
    company: job.company,
    location: job.location,
    salary: job.salary,
    job_type: job.jobType, // Map jobType to job_type
    industry: job.industry,
    description: job.description,
    featured: job.featured
  };

  const { error } = await supabase
    .from('jobs')
    .insert(dbJob);

  if (error) {
    console.error('Error adding job:', error);
    throw new Error('Failed to add job');
  }
};

/**
 * Update an existing job
 */
export const updateJob = async (job: Job): Promise<void> => {
  // Convert from our Job type to database schema
  const dbJob = {
    title: job.title,
    company: job.company,
    location: job.location,
    salary: job.salary,
    job_type: job.jobType, // Map jobType to job_type
    industry: job.industry,
    description: job.description,
    featured: job.featured
  };

  const { error } = await supabase
    .from('jobs')
    .update(dbJob)
    .eq('id', job.id);

  if (error) {
    console.error('Error updating job:', error);
    throw new Error('Failed to update job');
  }
};

/**
 * Delete a job
 */
export const deleteJob = async (id: number): Promise<void> => {
  const { error } = await supabase
    .from('jobs')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting job:', error);
    throw new Error('Failed to delete job');
  }
};

/**
 * Get all job categories (industries)
 */
export const getAllCategories = async (): Promise<{ id: number; name: string; description: string; jobCount: number }[]> => {
  const { data, error } = await supabase
    .from('job_categories')
    .select('*');

  if (error) {
    console.error('Error fetching categories:', error);
    throw new Error('Failed to fetch categories');
  }
  
  // Count jobs per industry
  const categoriesWithCount = await Promise.all(data.map(async (category) => {
    const { count, error: countError } = await supabase
      .from('jobs')
      .select('*', { count: 'exact', head: true })
      .eq('industry', category.name);
      
    if (countError) {
      console.error('Error counting jobs for industry:', countError);
      return { ...category, jobCount: 0 };
    }
    
    return {
      id: category.id,
      name: category.name,
      description: category.description,
      jobCount: count || 0
    };
  }));

  return categoriesWithCount;
};

/**
 * Add a new industry category
 */
export const addCategory = async (category: Omit<{ name: string; description: string }, 'id' | 'jobCount'>): Promise<void> => {
  const { error } = await supabase
    .from('job_categories')
    .insert(category);

  if (error) {
    console.error('Error adding industry:', error);
    throw new Error('Failed to add industry');
  }
};

/**
 * Delete an industry category
 */
export const deleteCategory = async (id: number): Promise<void> => {
  const { error } = await supabase
    .from('job_categories')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting industry:', error);
    throw new Error('Failed to delete industry');
  }
};

/**
 * Get all job applications
 */
export const getAllApplications = async () => {
  const { data, error } = await supabase
    .from('applications')
    .select('*')
    .order('date_applied', { ascending: false });

  if (error) {
    console.error('Error fetching applications:', error);
    throw new Error('Failed to fetch applications');
  }

  return data.map(app => ({
    id: app.id,
    jobId: app.job_id,
    jobTitle: app.job_title,
    applicantName: app.applicant_name,
    email: app.email,
    phone: app.phone || '',
    resumeUrl: app.resume_url || '',
    coverLetter: app.cover_letter || '',
    status: app.status,
    dateApplied: new Date(app.date_applied).toLocaleDateString()
  }));
};

/**
 * Update application status
 */
export const updateApplicationStatus = async (id: number, status: string): Promise<void> => {
  const { error } = await supabase
    .from('applications')
    .update({ status })
    .eq('id', id);

  if (error) {
    console.error('Error updating application status:', error);
    throw new Error('Failed to update application status');
  }
};
