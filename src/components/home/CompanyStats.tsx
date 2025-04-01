
import React from 'react';
import { Users, Briefcase, Award, Building } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';

const stats = [
  {
    id: 1,
    stat: '25+',
    title: 'Years',
    description: 'Industry experience',
    icon: Briefcase,
  },
  {
    id: 2,
    stat: '1000+',
    title: 'Clients',
    description: 'Trusted partnerships',
    icon: Building,
  },
  {
    id: 3,
    stat: '60+',
    title: 'Team',
    description: 'Recruitment specialists',
    icon: Users,
  },
  {
    id: 4,
    stat: '97%',
    title: 'Retention',
    description: 'Client satisfaction rate',
    icon: Award,
  },
];

const CompanyStats = () => {
  const isMobile = useIsMobile();
  
  return (
    <section className="py-10 md:py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-2xl md:text-3xl font-bold text-center mb-8 md:mb-12 text-recruitment-dark">
          Proven Recruitment Excellence
        </h2>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8">
          {stats.map((item) => (
            <div 
              key={item.id} 
              className="flex flex-col items-center p-3 md:p-6 text-center"
            >
              <div className="bg-recruitment-light p-3 md:p-4 rounded-full mb-3 md:mb-4 text-recruitment-primary">
                <item.icon size={isMobile ? 24 : 32} />
              </div>
              <h3 className="text-2xl md:text-3xl font-bold text-recruitment-primary mb-1">{item.stat}</h3>
              <h4 className="text-lg md:text-xl font-semibold text-recruitment-dark mb-1 md:mb-2">{item.title}</h4>
              <p className="text-sm md:text-base text-gray-600">{item.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default CompanyStats;
