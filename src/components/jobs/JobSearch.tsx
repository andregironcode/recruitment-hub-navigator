
import React, { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue 
} from '@/components/ui/select';
import { Search } from 'lucide-react';
import { getAllCategories } from '@/services/jobService';

interface JobSearchProps {
  onSearch: (filters: JobSearchFilters) => void;
}

export interface JobSearchFilters {
  keyword: string;
  location: string;
  industry: string;
  jobType: string;
  category?: string;
}

const JobSearch: React.FC<JobSearchProps> = ({ onSearch }) => {
  const [filters, setFilters] = useState<JobSearchFilters>({
    keyword: '',
    location: '',
    industry: '',
    jobType: ''
  });
  const [categories, setCategories] = useState<{id: number, name: string}[]>([]);
  
  useEffect(() => {
    const loadCategories = async () => {
      try {
        const data = await getAllCategories();
        setCategories(data);
      } catch (error) {
        console.error('Error loading categories:', error);
      }
    };
    
    loadCategories();
  }, []);

  const handleChange = (field: keyof JobSearchFilters, value: string) => {
    setFilters(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(filters);
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <div>
            <label htmlFor="keyword" className="block text-sm font-medium text-gray-700 mb-1">
              Keywords
            </label>
            <Input
              id="keyword"
              placeholder="Job title, skills, or company"
              value={filters.keyword}
              onChange={(e) => handleChange('keyword', e.target.value)}
              className="w-full"
            />
          </div>
          
          <div>
            <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-1">
              Location
            </label>
            <Input
              id="location"
              placeholder="City or remote"
              value={filters.location}
              onChange={(e) => handleChange('location', e.target.value)}
              className="w-full"
            />
          </div>
          
          <div>
            <label htmlFor="industry" className="block text-sm font-medium text-gray-700 mb-1">
              Industry
            </label>
            <Select 
              value={filters.industry}
              onValueChange={(value) => handleChange('industry', value)}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="All Industries" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Industries</SelectItem>
                <SelectItem value="Technology">Technology</SelectItem>
                <SelectItem value="Finance">Finance</SelectItem>
                <SelectItem value="Healthcare">Healthcare</SelectItem>
                <SelectItem value="Marketing">Marketing</SelectItem>
                <SelectItem value="Engineering">Engineering</SelectItem>
                <SelectItem value="Retail">Retail</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <label htmlFor="jobType" className="block text-sm font-medium text-gray-700 mb-1">
              Job Type
            </label>
            <Select 
              value={filters.jobType}
              onValueChange={(value) => handleChange('jobType', value)}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="All Types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Types</SelectItem>
                <SelectItem value="Full-Time">Full-Time</SelectItem>
                <SelectItem value="Part-Time">Part-Time</SelectItem>
                <SelectItem value="Contract">Contract</SelectItem>
                <SelectItem value="Temporary">Temporary</SelectItem>
                <SelectItem value="Remote">Remote</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
              Category
            </label>
            <Select 
              value={filters.category}
              onValueChange={(value) => handleChange('category', value)}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Categories</SelectItem>
                {categories.map(category => (
                  <SelectItem key={category.id} value={category.name}>{category.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        
        <div className="mt-6">
          <Button type="submit" className="w-full bg-recruitment-primary hover:bg-recruitment-primary/90">
            <Search className="mr-2 h-4 w-4" /> Search Jobs
          </Button>
        </div>
      </form>
    </div>
  );
};

export default JobSearch;
