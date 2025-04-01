
import React from 'react';
import { Users, Briefcase, Award, Building } from 'lucide-react';

const stats = [
  {
    id: 1,
    stat: '10,000+',
    title: 'Placements',
    description: 'Successful job placements',
    icon: Users,
  },
  {
    id: 2,
    stat: '500+',
    title: 'Companies',
    description: 'Partner companies',
    icon: Building,
  },
  {
    id: 3,
    stat: '15+',
    title: 'Years',
    description: 'Industry experience',
    icon: Briefcase,
  },
  {
    id: 4,
    stat: '98%',
    title: 'Satisfaction',
    description: 'Client satisfaction rate',
    icon: Award,
  },
];

const CompanyStats = () => {
  return (
    <section className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-3xl font-bold text-center mb-12 text-recruitment-dark">
          Why Choose Harries Recruitment
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {stats.map((item) => (
            <div 
              key={item.id} 
              className="flex flex-col items-center p-6 text-center"
            >
              <div className="bg-recruitment-light p-4 rounded-full mb-4 text-recruitment-primary">
                <item.icon size={32} />
              </div>
              <h3 className="text-3xl font-bold text-recruitment-primary mb-1">{item.stat}</h3>
              <h4 className="text-xl font-semibold text-recruitment-dark mb-2">{item.title}</h4>
              <p className="text-gray-600">{item.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default CompanyStats;
