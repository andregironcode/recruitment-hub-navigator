
import React from 'react';
import { Users, Briefcase, Award, Building } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';
import { Card, CardContent } from '@/components/ui/card';

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
    <section className="py-16 md:py-24 bg-recruitment-light relative overflow-hidden">
      <div className="absolute inset-0 opacity-5">
        <img 
          src="/dots-pattern.svg" 
          alt="" 
          className="w-full h-full object-cover"
        />
      </div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center mb-12 md:mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-recruitment-primary mb-4">
            Our Recruitment Expertise
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Harries Recruitment has established a track record of excellence with our dedicated approach to talent acquisition.
          </p>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
          {stats.map((item) => (
            <Card 
              key={item.id} 
              className="border-2 border-transparent hover:border-recruitment-primary/10 hover:shadow-lg transition-all duration-300"
            >
              <CardContent className="p-6 text-center">
                <div className="flex justify-center">
                  <div className="bg-recruitment-primary/10 p-4 rounded-full mb-4 text-recruitment-primary">
                    <item.icon size={isMobile ? 28 : 32} />
                  </div>
                </div>
                <h3 className="text-3xl md:text-4xl font-bold text-recruitment-primary mb-2">{item.stat}</h3>
                <h4 className="text-xl font-semibold text-recruitment-dark mb-2">{item.title}</h4>
                <p className="text-gray-600">{item.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default CompanyStats;
