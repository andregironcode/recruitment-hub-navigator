
import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MapPin, Briefcase, Clock, Building } from 'lucide-react';

export interface Job {
  id: number;
  title: string;
  company: string;
  location: string;
  salary: string;
  jobType: string;
  industry: string;
  description: string;
  postedDate: string;
  featured: boolean;
}

interface JobListProps {
  jobs: Job[];
  loading?: boolean;
}

const JobList: React.FC<JobListProps> = ({ jobs, loading = false }) => {
  if (loading) {
    return (
      <div className="py-10 text-center">
        <div className="animate-pulse flex flex-col space-y-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-48 bg-gray-200 rounded-lg"></div>
          ))}
        </div>
      </div>
    );
  }

  if (jobs.length === 0) {
    return (
      <div className="text-center py-10">
        <h3 className="text-xl font-medium text-gray-500">No jobs found matching your criteria</h3>
        <p className="mt-2 text-gray-500">Try adjusting your search filters</p>
      </div>
    );
  }

  // Function to strip HTML tags for preview
  const stripHtml = (html: string) => {
    const doc = new DOMParser().parseFromString(html, 'text/html');
    return doc.body.textContent || '';
  };

  return (
    <div className="space-y-4">
      {jobs.map((job) => (
        <Link to={`/jobs/${job.id}`} key={job.id}>
          <Card className={`hover:border-recruitment-primary transition-all ${job.featured ? 'border-recruitment-primary border-2' : ''}`}>
            <CardContent className="p-6">
              <div className="flex justify-between flex-wrap gap-4">
                <div>
                  <div className="flex items-start gap-2 flex-wrap">
                    <h3 className="text-xl font-semibold text-recruitment-dark">{job.title}</h3>
                    {job.featured && (
                      <Badge className="bg-recruitment-primary text-white">Featured</Badge>
                    )}
                  </div>
                  <div className="flex items-center text-gray-500 mt-2">
                    <Building size={16} className="mr-1" />
                    <span className="mr-4">{job.company}</span>
                    <MapPin size={16} className="mr-1" />
                    <span>{job.location}</span>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-lg font-semibold text-recruitment-primary">{job.salary}</div>
                  <div className="text-sm text-gray-500">Posted {job.postedDate}</div>
                </div>
              </div>
              
              <div className="mt-4">
                <p className="text-gray-600 line-clamp-2">{stripHtml(job.description)}</p>
              </div>
              
              <div className="mt-4 flex flex-wrap gap-2">
                <Badge variant="outline" className="flex items-center">
                  <Briefcase size={14} className="mr-1" /> {job.jobType}
                </Badge>
                <Badge variant="outline" className="flex items-center">
                  <Clock size={14} className="mr-1" /> {job.industry}
                </Badge>
              </div>
            </CardContent>
          </Card>
        </Link>
      ))}
    </div>
  );
};

export default JobList;
