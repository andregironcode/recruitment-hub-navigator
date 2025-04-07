
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MapPin, Briefcase, PoundSterling, Clock, ArrowRight } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { motion } from 'framer-motion';
import { supabase } from '@/integrations/supabase/client';
import { Job } from '@/components/jobs/JobList';
import { useToast } from '@/components/ui/use-toast';

const RecentJobs = () => {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const fetchJobs = async () => {
      setIsLoading(true);
      try {
        const { data, error } = await supabase
          .from('jobs')
          .select('*')
          .order('posted_date', { ascending: false })
          .limit(4);

        if (error) {
          throw error;
        }

        // Map the database results to our Job type
        const formattedJobs: Job[] = data.map(job => ({
          id: job.id,
          title: job.title,
          company: job.company,
          location: job.location,
          salary: job.salary || '',
          jobType: job.job_type,
          industry: job.industry,
          description: job.description,
          postedDate: job.posted_date ? new Date(job.posted_date).toLocaleDateString() : 'Today',
          featured: job.featured || false
        }));

        setJobs(formattedJobs);
      } catch (error) {
        console.error('Error fetching jobs:', error);
        toast({
          title: 'Error',
          description: 'Failed to load job listings. Please try again later.',
          variant: 'destructive'
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchJobs();
  }, [toast]);

  if (isLoading) {
    return (
      <section className="py-16 md:py-24 bg-gradient-to-br from-recruitment-light to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-recruitment-primary mb-4">
              Loading Latest Jobs...
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
              {[1, 2, 3, 4].map((index) => (
                <Card key={index} className="h-full opacity-50 animate-pulse">
                  <CardContent className="p-6 h-48"></CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>
    );
  }

  if (jobs.length === 0) {
    return (
      <section className="py-16 md:py-24 bg-gradient-to-br from-recruitment-light to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-recruitment-primary mb-4">
              No Jobs Available
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto mb-8">
              Check back soon for new job listings.
            </p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-16 md:py-24 bg-gradient-to-br from-recruitment-light to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div 
          className="flex flex-col md:flex-row md:items-end justify-between mb-12"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <div>
            <motion.span 
              className="inline-block px-4 py-1 bg-recruitment-primary/10 rounded-full text-recruitment-primary font-medium text-sm mb-4"
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              Career Opportunities
            </motion.span>
            <motion.h2 
              className="text-3xl md:text-4xl font-bold text-recruitment-primary mb-4"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              Latest Job Opportunities
            </motion.h2>
            <motion.p 
              className="text-lg text-gray-600 max-w-2xl"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              Explore our most recent job listings across various industries and locations.
            </motion.p>
          </div>
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="mt-6 md:mt-0"
          >
            <Link to="/jobs">
              <Button variant="outline" className="border-recruitment-primary text-recruitment-primary hover:bg-recruitment-primary hover:text-white">
                View All Jobs <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </motion.div>
        </motion.div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {jobs.map((job, index) => (
            <motion.div
              key={job.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 * index }}
              whileHover={{ y: -5 }}
            >
              <Link to={`/jobs/${job.id}`} className="group">
                <Card className={`h-full transition-all duration-300 hover:shadow-lg border-2 ${job.featured ? 'border-recruitment-accent/20' : 'border-transparent'} group-hover:border-recruitment-primary/20`}>
                  <CardContent className="p-6 h-full">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="text-xl font-semibold text-recruitment-primary group-hover:text-recruitment-primary/80 transition-colors">
                          {job.title}
                        </h3>
                        <p className="text-gray-700">{job.company}</p>
                      </div>
                      {job.featured && (
                        <Badge className="bg-recruitment-accent text-white">Featured</Badge>
                      )}
                    </div>
                    
                    <div className="grid grid-cols-2 gap-y-3 mb-6">
                      <div className="flex items-center text-gray-600">
                        <MapPin className="mr-2 h-4 w-4 text-gray-400" />
                        <span>{job.location}</span>
                      </div>
                      <div className="flex items-center text-gray-600">
                        <Briefcase className="mr-2 h-4 w-4 text-gray-400" />
                        <span>{job.jobType}</span>
                      </div>
                      <div className="flex items-center text-gray-600">
                        <PoundSterling className="mr-2 h-4 w-4 text-gray-400" />
                        <span>{job.salary}</span>
                      </div>
                      <div className="flex items-center text-gray-600">
                        <Clock className="mr-2 h-4 w-4 text-gray-400" />
                        <span>{job.postedDate}</span>
                      </div>
                    </div>
                    
                    <div className="flex justify-end">
                      <motion.span 
                        className="text-recruitment-primary"
                        whileHover={{ x: 5 }}
                        transition={{ type: "spring", stiffness: 400, damping: 10 }}
                      >
                        <ArrowRight size={20} />
                      </motion.span>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            </motion.div>
          ))}
        </div>
        
        <motion.div 
          className="mt-10 text-center"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.5 }}
        >
          <Link to="/jobs">
            <Button className="bg-recruitment-primary hover:bg-recruitment-primary/90 text-white">
              Explore All Opportunities
            </Button>
          </Link>
        </motion.div>
      </div>
    </section>
  );
};

export default RecentJobs;
