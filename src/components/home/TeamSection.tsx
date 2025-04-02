
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

const teamMembers = [
  {
    name: 'Heather',
    role: 'Chief Executive Officer',
    image: '/placeholder.svg'
  },
  {
    name: 'MHairi',
    role: 'Communications',
    image: '/placeholder.svg'
  },
  {
    name: 'james',
    role: 'Business Development',
    image: '/placeholder.svg'
  }
];

const TeamSection = () => {
  return (
    <section className="py-16 md:py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <div className="flex justify-center mb-6">
            <img 
              src="/placeholder-icon.svg" 
              alt="Stem Plant Outline" 
              className="w-12 h-12"
            />
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-recruitment-primary mb-6">
            Meet our team
          </h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {teamMembers.map((member, index) => (
            <Card key={index} className="text-center hover:shadow-lg transition-shadow border-2 border-transparent hover:border-recruitment-primary/20">
              <CardContent className="pt-8 pb-6 px-4">
                <div className="flex justify-center mb-4">
                  <Avatar className="h-24 w-24">
                    <AvatarImage src={member.image} alt={member.name} />
                    <AvatarFallback className="bg-recruitment-primary/10 text-recruitment-primary text-lg">
                      {member.name.substring(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                </div>
                <h3 className="text-xl font-bold text-recruitment-primary mb-1">{member.name}</h3>
                <p className="text-gray-600">{member.role}</p>
              </CardContent>
            </Card>
          ))}
        </div>
        
        <div className="mt-16 flex flex-col md:flex-row items-center justify-center bg-recruitment-light rounded-xl p-8 shadow-inner">
          <div className="md:w-1/3 mb-6 md:mb-0 flex justify-center">
            <img 
              src="/placeholder.svg" 
              alt="Happy Company Employees" 
              className="rounded-lg max-w-full h-auto md:max-w-xs"
            />
          </div>
          <div className="md:w-2/3 md:pl-10">
            <blockquote className="text-xl md:text-2xl font-medium text-recruitment-primary italic mb-4">
              "Without people a business has no relevance"
            </blockquote>
            <cite className="text-gray-600 not-italic">Heather Harries - Founder</cite>
          </div>
        </div>
      </div>
    </section>
  );
};

export default TeamSection;
