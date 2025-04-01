
import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import Layout from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MapPin, Briefcase, Clock, Building, Share, ArrowLeft } from 'lucide-react';
import { getJobById } from '@/services/jobService';
import { Job } from '@/components/jobs/JobList';
import { useToast } from '@/components/ui/use-toast';

const JobDetail = () => {
  const { id } = useParams<{ id: string }>();
  const [job, setJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const fetchJob = async () => {
      if (!id) return;
      
      setLoading(true);
      try {
        const jobData = await getJobById(parseInt(id, 10));
        if (jobData) {
          setJob(jobData);
        } else {
          toast({
            title: 'Job Not Found',
            description: 'The job you are looking for does not exist.',
            variant: 'destructive'
          });
        }
      } catch (error) {
        console.error('Error fetching job:', error);
        toast({
          title: 'Error',
          description: 'Failed to load job details. Please try again.',
          variant: 'destructive'
        });
      } finally {
        setLoading(false);
      }
    };

    fetchJob();
  }, [id, toast]);

  if (loading) {
    return (
      <Layout>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-3/4 mb-6"></div>
            <div className="h-6 bg-gray-200 rounded w-1/2 mb-6"></div>
            <div className="h-40 bg-gray-200 rounded mb-6"></div>
            <div className="h-6 bg-gray-200 rounded w-1/4 mb-2"></div>
            <div className="h-6 bg-gray-200 rounded w-1/3 mb-2"></div>
            <div className="h-6 bg-gray-200 rounded w-1/2 mb-6"></div>
            <div className="h-10 bg-gray-200 rounded w-1/4"></div>
          </div>
        </div>
      </Layout>
    );
  }

  if (!job) {
    return (
      <Layout>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 text-center">
          <h2 className="text-2xl font-bold text-gray-700 mb-4">Job Not Found</h2>
          <p className="text-gray-600 mb-6">The job you are looking for does not exist or has been removed.</p>
          <Link to="/jobs">
            <Button className="bg-recruitment-primary hover:bg-recruitment-primary/90">
              <ArrowLeft className="mr-2 h-4 w-4" /> Back to Jobs
            </Button>
          </Link>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="bg-recruitment-light min-h-screen py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-6">
            <Link to="/jobs" className="text-recruitment-primary hover:text-recruitment-primary/80 flex items-center">
              <ArrowLeft className="mr-1 h-4 w-4" /> Back to Jobs
            </Link>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main content */}
            <div className="lg:col-span-2">
              <Card>
                <CardContent className="p-8">
                  <div className="mb-6">
                    <div className="flex items-start justify-between">
                      <h1 className="text-3xl font-bold text-recruitment-dark mb-2">{job.title}</h1>
                      <Button variant="outline" size="sm" className="flex items-center gap-1">
                        <Share size={14} /> Share
                      </Button>
                    </div>
                    <div className="flex items-center text-gray-600 flex-wrap gap-y-2">
                      <Building size={16} className="mr-1" />
                      <span className="mr-4">{job.company}</span>
                      <MapPin size={16} className="mr-1" />
                      <span className="mr-4">{job.location}</span>
                      <Clock size={16} className="mr-1" />
                      <span>Posted {job.postedDate}</span>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2 mb-6">
                    <Badge variant="outline" className="flex items-center">
                      <Briefcase size={14} className="mr-1" /> {job.jobType}
                    </Badge>
                    <Badge variant="outline" className="flex items-center">
                      <Clock size={14} className="mr-1" /> {job.industry}
                    </Badge>
                    {job.featured && (
                      <Badge className="bg-recruitment-accent text-white">Featured</Badge>
                    )}
                  </div>

                  <div className="mb-8">
                    <h2 className="text-xl font-semibold mb-4 text-recruitment-dark">Job Description</h2>
                    <p className="text-gray-600 whitespace-pre-line">
                      {job.description}
                      {/* Extended description for detail view */}
                      {"\n\n"}
                      As a {job.title} at {job.company}, you will be responsible for driving projects from conception to completion, collaborating with cross-functional teams, and delivering high-quality results.
                      {"\n\n"}
                      The ideal candidate will have:
                      {"\n"}
                      • Minimum of 3-5 years of relevant experience
                      {"\n"}
                      • Strong communication and teamwork skills
                      {"\n"}
                      • Ability to work in a fast-paced environment
                      {"\n"}
                      • Passion for innovation and continuous improvement
                      {"\n\n"}
                      We offer competitive compensation, excellent benefits, and opportunities for professional growth.
                    </p>
                  </div>

                  <div>
                    <h2 className="text-xl font-semibold mb-4 text-recruitment-dark">About {job.company}</h2>
                    <p className="text-gray-600">
                      {job.company} is a leading organization in the {job.industry.toLowerCase()} sector, known for innovation and excellence. With a passionate team of professionals, we are committed to delivering exceptional results for our clients and creating a supportive work environment for our employees.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Sidebar */}
            <div>
              <Card className="sticky top-6">
                <CardContent className="p-6">
                  <h2 className="text-xl font-semibold mb-4 text-recruitment-dark">Job Overview</h2>
                  
                  <div className="space-y-4 mb-6">
                    <div>
                      <div className="text-sm text-gray-500">Salary</div>
                      <div className="font-medium text-recruitment-primary">{job.salary}</div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-500">Job Type</div>
                      <div>{job.jobType}</div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-500">Location</div>
                      <div>{job.location}</div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-500">Industry</div>
                      <div>{job.industry}</div>
                    </div>
                  </div>
                  
                  <Button className="w-full bg-recruitment-primary hover:bg-recruitment-primary/90 mb-3">
                    Apply Now
                  </Button>
                  
                  <Button variant="outline" className="w-full">
                    Save Job
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default JobDetail;
