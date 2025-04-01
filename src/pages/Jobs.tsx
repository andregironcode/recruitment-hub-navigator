
import React, { useState, useEffect } from 'react';
import Layout from '@/components/layout/Layout';
import JobSearch, { JobSearchFilters } from '@/components/jobs/JobSearch';
import JobList, { Job } from '@/components/jobs/JobList';
import { getAllJobs, filterJobs } from '@/services/jobService';
import { useLocation } from 'react-router-dom';
import { useToast } from '@/components/ui/use-toast';

const Jobs = () => {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<JobSearchFilters>({
    keyword: '',
    location: '',
    industry: '',
    jobType: ''
  });
  const location = useLocation();
  const { toast } = useToast();
  
  // Parse query parameters on initial load
  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    
    const industry = queryParams.get('industry');
    if (industry) {
      setFilters(prev => ({ ...prev, industry }));
    }
    
    loadJobs();
  }, [location.search]);
  
  const loadJobs = async () => {
    setLoading(true);
    try {
      // Get all jobs initially
      const allJobs = await getAllJobs();
      setJobs(allJobs);
      
      // Apply filters if they exist
      if ((filters.industry && filters.industry !== 'all') || 
          (filters.jobType && filters.jobType !== 'all') || 
          filters.keyword || 
          filters.location) {
        handleSearch(filters);
      }
    } catch (error) {
      console.error('Error loading jobs:', error);
      toast({
        title: 'Error',
        description: 'Failed to load jobs. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };
  
  const handleSearch = async (searchFilters: JobSearchFilters) => {
    setLoading(true);
    setFilters(searchFilters);
    
    try {
      // If all filters are either empty or 'all', load all jobs
      if ((!searchFilters.industry || searchFilters.industry === 'all') && 
          (!searchFilters.jobType || searchFilters.jobType === 'all') && 
          !searchFilters.keyword && 
          !searchFilters.location) {
        const allJobs = await getAllJobs();
        setJobs(allJobs);
      } else {
        // Clean up filters - convert 'all' to empty string for backend filtering
        const cleanedFilters = { ...searchFilters };
        if (cleanedFilters.industry === 'all') cleanedFilters.industry = '';
        if (cleanedFilters.jobType === 'all') cleanedFilters.jobType = '';
        
        const filteredJobs = await filterJobs(cleanedFilters);
        setJobs(filteredJobs);
      }
    } catch (error) {
      console.error('Error filtering jobs:', error);
      toast({
        title: 'Error',
        description: 'Failed to filter jobs. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="bg-recruitment-light min-h-screen py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <h1 className="text-3xl font-bold text-recruitment-dark mb-2">Find Your Perfect Job</h1>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Browse through our extensive list of job opportunities across various industries.
              Use the filters below to find the perfect match for your skills and career goals.
            </p>
          </div>
          
          <JobSearch onSearch={handleSearch} initialFilters={filters} />
          
          <div className="mt-8">
            <div className="mb-4 flex justify-between items-center">
              <h2 className="text-xl font-semibold text-recruitment-dark">
                {loading ? 'Searching jobs...' : `${jobs.length} Jobs Found`}
              </h2>
              {!loading && jobs.length > 0 && (
                <div className="text-sm text-gray-500">
                  {filters.industry && filters.industry !== 'all' 
                    ? `Filtered by ${filters.industry}` 
                    : 'Showing all industries'}
                  {filters.jobType && filters.jobType !== 'all' && 
                    ` | Job Type: ${filters.jobType}`}
                </div>
              )}
            </div>
            
            <JobList jobs={jobs} loading={loading} />
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Jobs;
