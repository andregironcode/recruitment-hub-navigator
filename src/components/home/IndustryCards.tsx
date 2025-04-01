
import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowRight } from 'lucide-react';

const industriesData = [
  { 
    id: 'technology', 
    name: 'Technology', 
    description: 'Software development, IT support, cybersecurity, and technical leadership roles.',
    jobCount: 42
  },
  { 
    id: 'finance', 
    name: 'Finance & Accounting', 
    description: 'Banking, accounting, financial analysis, and senior finance leadership positions.',
    jobCount: 36
  },
  { 
    id: 'engineering', 
    name: 'Engineering', 
    description: 'Civil, mechanical, electrical engineering and technical design positions.',
    jobCount: 31
  },
  { 
    id: 'sales', 
    name: 'Sales & Marketing', 
    description: 'Sales executives, digital marketing specialists, and brand management roles.',
    jobCount: 28
  },
  { 
    id: 'executive', 
    name: 'Executive Search', 
    description: 'C-suite, senior leadership, and board-level appointments across industries.',
    jobCount: 22
  },
  { 
    id: 'manufacturing', 
    name: 'Manufacturing', 
    description: 'Production management, quality control, and operations leadership positions.',
    jobCount: 24
  }
];

const IndustryCards = () => {
  return (
    <section className="py-12 md:py-16 bg-recruitment-light">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-2xl md:text-3xl font-bold text-center mb-8 md:mb-12 text-recruitment-primary">
          Our Specialist Sectors
        </h2>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          {industriesData.map((industry) => (
            <Link to={`/jobs?industry=${industry.id}`} key={industry.id} className="h-full">
              <Card className="h-full transition-all duration-300 hover:shadow-md hover:border-recruitment-primary border-2 border-transparent">
                <CardContent className="p-4 md:p-6 h-full flex flex-col">
                  <h3 className="text-lg md:text-xl font-semibold mb-2 text-recruitment-primary">
                    {industry.name}
                  </h3>
                  <p className="text-gray-600 mb-4 flex-grow">
                    {industry.description}
                  </p>
                  <div className="flex justify-between items-center text-recruitment-accent mt-auto">
                    <span className="font-medium">{industry.jobCount} openings</span>
                    <ArrowRight size={20} />
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};

export default IndustryCards;
