
import { Job } from '@/components/jobs/JobList';
import { JobSearchFilters } from '@/components/jobs/JobSearch';
import { supabase } from '@/integrations/supabase/client';

// Get all jobs
export const getAllJobs = async (): Promise<Job[]> => {
  const { data, error } = await supabase
    .from('jobs')
    .select('*')
    .order('posted_date', { ascending: false });
  
  if (error) {
    console.error('Error fetching jobs:', error);
    throw error;
  }
  
  return data.map(job => ({
    ...job,
    postedDate: formatPostedDate(job.posted_date)
  }));
};

// Format posted date for display
const formatPostedDate = (postedDate: string): string => {
  const date = new Date(postedDate);
  const now = new Date();
  const diffTime = Math.abs(now.getTime() - date.getTime());
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  
  if (diffDays === 0) {
    return 'Today';
  } else if (diffDays === 1) {
    return 'Yesterday';
  } else if (diffDays < 7) {
    return `${diffDays} days ago`;
  } else if (diffDays < 30) {
    return `${Math.floor(diffDays / 7)} weeks ago`;
  } else {
    return `${Math.floor(diffDays / 30)} months ago`;
  }
};

// Get job by ID
export const getJobById = async (id: number): Promise<Job | undefined> => {
  const { data, error } = await supabase
    .from('jobs')
    .select('*')
    .eq('id', id)
    .single();
  
  if (error) {
    console.error('Error fetching job by ID:', error);
    if (error.code === 'PGRST116') {
      // No rows returned (job not found)
      return undefined;
    }
    throw error;
  }
  
  return {
    ...data,
    postedDate: formatPostedDate(data.posted_date)
  };
};

// Filter jobs based on search criteria
export const filterJobs = async (filters: JobSearchFilters): Promise<Job[]> => {
  let query = supabase
    .from('jobs')
    .select('*')
    .order('featured', { ascending: false })
    .order('posted_date', { ascending: false });
  
  // Filter by keyword (in title, company, or description)
  if (filters.keyword) {
    const keyword = filters.keyword.toLowerCase();
    query = query.or(`title.ilike.%${keyword}%,company.ilike.%${keyword}%,description.ilike.%${keyword}%`);
  }
  
  // Filter by location
  if (filters.location) {
    query = query.ilike('location', `%${filters.location}%`);
  }
  
  // Filter by industry
  if (filters.industry && filters.industry !== 'all-industries') {
    query = query.ilike('industry', `%${filters.industry}%`);
  }
  
  // Filter by job type
  if (filters.jobType && filters.jobType !== 'all-types') {
    query = query.ilike('job_type', `%${filters.jobType}%`);
  }
  
  // Filter by category
  if (filters.category) {
    query = query.eq('category', filters.category);
  }
  
  const { data, error } = await query;
  
  if (error) {
    console.error('Error filtering jobs:', error);
    throw error;
  }
  
  return data.map(job => ({
    ...job,
    postedDate: formatPostedDate(job.posted_date)
  }));
};

// Get all categories
export const getAllCategories = async (): Promise<any[]> => {
  const { data: categories, error: categoriesError } = await supabase
    .from('job_categories')
    .select('*')
    .order('name');
  
  if (categoriesError) {
    console.error('Error fetching categories:', categoriesError);
    throw categoriesError;
  }
  
  // Get count of jobs for each category
  for (let category of categories) {
    const { count, error: countError } = await supabase
      .from('jobs')
      .select('id', { count: 'exact', head: true })
      .eq('category', category.name);
    
    if (countError) {
      console.error('Error counting jobs for category:', countError);
      category.jobCount = 0;
    } else {
      category.jobCount = count || 0;
    }
  }
  
  return categories;
};

// Add a new category
export const addCategory = async (category: Omit<any, 'id' | 'jobCount'>): Promise<any> => {
  const { data, error } = await supabase
    .from('job_categories')
    .insert([{
      name: category.name,
      description: category.description
    }])
    .select()
    .single();
  
  if (error) {
    console.error('Error adding category:', error);
    throw error;
  }
  
  return { ...data, jobCount: 0 };
};

// Delete a category
export const deleteCategory = async (id: number): Promise<boolean> => {
  // First, get the category name to update jobs
  const { data: categoryData, error: categoryError } = await supabase
    .from('job_categories')
    .select('name')
    .eq('id', id)
    .single();
  
  if (categoryError) {
    console.error('Error fetching category name:', categoryError);
    throw categoryError;
  }
  
  // Update all jobs with this category to have no category
  const { error: updateError } = await supabase
    .from('jobs')
    .update({ category: null })
    .eq('category', categoryData.name);
  
  if (updateError) {
    console.error('Error updating jobs categories:', updateError);
    throw updateError;
  }
  
  // Now delete the category
  const { error: deleteError } = await supabase
    .from('job_categories')
    .delete()
    .eq('id', id);
  
  if (deleteError) {
    console.error('Error deleting category:', deleteError);
    throw deleteError;
  }
  
  return true;
};

// Get all applications
export const getAllApplications = async (): Promise<any[]> => {
  const { data, error } = await supabase
    .from('applications')
    .select('*')
    .order('date_applied', { ascending: false });
  
  if (error) {
    console.error('Error fetching applications:', error);
    throw error;
  }
  
  return data.map(app => ({
    ...app,
    dateApplied: formatPostedDate(app.date_applied)
  }));
};

// Update application status
export const updateApplicationStatus = async (id: number, status: string): Promise<boolean> => {
  const { error } = await supabase
    .from('applications')
    .update({ status })
    .eq('id', id);
  
  if (error) {
    console.error('Error updating application status:', error);
    throw error;
  }
  
  return true;
};

// Admin functions for managing jobs

// Add a new job
export const addJob = async (job: Omit<Job, 'id'>): Promise<Job> => {
  const { data, error } = await supabase
    .from('jobs')
    .insert([{
      title: job.title,
      company: job.company,
      location: job.location,
      salary: job.salary,
      job_type: job.jobType,
      industry: job.industry,
      description: job.description,
      featured: job.featured,
      category: job.category
    }])
    .select()
    .single();
  
  if (error) {
    console.error('Error adding job:', error);
    throw error;
  }
  
  return {
    ...data,
    postedDate: formatPostedDate(data.posted_date),
    jobType: data.job_type
  };
};

// Update an existing job
export const updateJob = async (updatedJob: Job): Promise<Job> => {
  const { data, error } = await supabase
    .from('jobs')
    .update({
      title: updatedJob.title,
      company: updatedJob.company,
      location: updatedJob.location,
      salary: updatedJob.salary,
      job_type: updatedJob.jobType,
      industry: updatedJob.industry,
      description: updatedJob.description,
      featured: updatedJob.featured,
      category: updatedJob.category
    })
    .eq('id', updatedJob.id)
    .select()
    .single();
  
  if (error) {
    console.error('Error updating job:', error);
    throw error;
  }
  
  return {
    ...data,
    postedDate: formatPostedDate(data.posted_date),
    jobType: data.job_type
  };
};

// Delete a job
export const deleteJob = async (id: number): Promise<boolean> => {
  const { error } = await supabase
    .from('jobs')
    .delete()
    .eq('id', id);
  
  if (error) {
    console.error('Error deleting job:', error);
    throw error;
  }
  
  return true;
};
