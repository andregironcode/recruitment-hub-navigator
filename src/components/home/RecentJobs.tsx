
import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MapPin, Briefcase, PoundSterling, Clock, ArrowRight } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

// Mock data - in a real app, this would come from an API
const recentJobs = [
  {
    id: 'job1',
    title: 'Senior Software Engineer',
    company: 'TechSolutions Ltd',
    location: 'London',
    salary: '£70,000 - £85,000',
    type: 'Full-time',
    posted: '2 days ago',
    category: 'technology',
    featured: true
  },
  {
    id: 'job2',
    title: 'Finance Manager',
    company: 'Global Finance Group',
    location: 'Manchester',
    salary: '£55,000 - £65,000',
    type: 'Full-time',
    posted: '3 days ago',
    category: 'finance',
    featured: false
  },
  {
    id: 'job3',
    title: 'Marketing Director',
    company: 'Creative Brands',
    location: 'Bristol',
    salary: '£65,000 - £80,000',
    type: 'Full-time',
    posted: '1 week ago',
    category: 'sales',
    featured: true
  },
  {
    id: 'job4',
    title: 'Mechanical Engineer',
    company: 'Engineering Solutions',
    location: 'Birmingham',
    salary: '£45,000 - £55,000',
    type: 'Contract',
    posted: '5 days ago',
    category: 'engineering',
    featured: false
  }
];

const RecentJobs = () => {
  return (
    <section className="py-16 md:py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12">
          <div>
            <h2 className="text-3xl md:text-4xl font-bold text-recruitment-primary mb-4">
              Latest Job Opportunities
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl">
              Explore our most recent job listings across various industries and locations.
            </p>
          </div>
          <Link to="/jobs" className="mt-6 md:mt-0">
            <Button variant="outline" className="border-recruitment-primary text-recruitment-primary hover:bg-recruitment-primary hover:text-white">
              View All Jobs <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {recentJobs.map((job) => (
            <Link to={`/jobs/${job.id}`} key={job.id} className="group">
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
                      <span>{job.type}</span>
                    </div>
                    <div className="flex items-center text-gray-600">
                      <PoundSterling className="mr-2 h-4 w-4 text-gray-400" />
                      <span>{job.salary}</span>
                    </div>
                    <div className="flex items-center text-gray-600">
                      <Clock className="mr-2 h-4 w-4 text-gray-400" />
                      <span>{job.posted}</span>
                    </div>
                  </div>
                  
                  <div className="flex justify-end">
                    <span className="text-recruitment-primary group-hover:translate-x-1 transition-transform">
                      <ArrowRight size={20} />
                    </span>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
        
        <div className="mt-10 text-center">
          <Link to="/jobs">
            <Button className="bg-recruitment-primary hover:bg-recruitment-primary/90 text-white">
              Explore All Opportunities
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default RecentJobs;
