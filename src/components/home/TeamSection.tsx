
import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { motion } from 'framer-motion';

const teamMembers = [
  {
    name: 'Heather',
    role: 'Chief Executive Officer',
    image: '/lovable-uploads/357969b6-4cae-4ff9-b23d-44173d7d2def.png',
    bio: 'Heather has over 20 years of experience in recruitment and education. She founded the Heather Harries Group with a vision to transform how businesses approach talent acquisition.'
  },
  {
    name: 'James',
    role: 'Business Development',
    image: '/lovable-uploads/2d3ad749-e103-44a2-9866-34d4b50eec73.png',
    bio: 'James oversees business development initiatives and strategic partnerships. With his background in finance and operations, he helps clients optimize their recruitment processes.'
  },
  {
    name: 'MHairi',
    role: 'Communications',
    image: '/lovable-uploads/d45d62a8-53c1-4063-8848-949a1f705344.png',
    bio: 'MHairi leads our communications strategy, ensuring clear and consistent messaging across all channels. Her expertise in digital marketing has helped grow our brand presence.'
  }
];

const TeamSection = () => {
  const [activeCard, setActiveCard] = useState<number | null>(null);
  
  return (
    <section className="py-16 md:py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div 
          className="text-center mb-12"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex justify-center mb-6">
            <motion.img 
              src="/placeholder-icon.svg" 
              alt="Stem Plant Outline" 
              className="w-12 h-12"
              animate={{ rotate: 360 }}
              transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            />
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-recruitment-primary mb-6">
            Meet our team
          </h2>
        </motion.div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {teamMembers.map((member, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <Card 
                className={`text-center transition-all duration-300 ${activeCard === index ? 'shadow-xl border-recruitment-primary/50' : 'hover:shadow-lg border-2 border-transparent hover:border-recruitment-primary/20'}`}
                onClick={() => setActiveCard(activeCard === index ? null : index)}
              >
                <CardContent className="pt-8 pb-6 px-4">
                  <motion.div 
                    className="flex justify-center mb-4"
                    whileHover={{ scale: 1.05 }}
                    transition={{ type: "spring", stiffness: 400, damping: 17 }}
                  >
                    <Avatar className="h-24 w-24 rounded-full overflow-hidden">
                      <AvatarImage 
                        src={member.image} 
                        alt={member.name}
                        className="object-cover w-full h-full" 
                      />
                      <AvatarFallback className="bg-recruitment-primary/10 text-recruitment-primary text-lg">
                        {index === 0 ? (
                          <img 
                            src="/lovable-uploads/55c7a32e-42dd-4bbd-be07-450a61145ce5.png" 
                            alt="Heather"
                            className="object-cover w-full h-full" 
                          />
                        ) : (
                          member.name.substring(0, 2).toUpperCase()
                        )}
                      </AvatarFallback>
                    </Avatar>
                  </motion.div>
                  <h3 className="text-xl font-bold text-recruitment-primary mb-1">{member.name}</h3>
                  <p className="text-gray-600">{member.role}</p>
                  
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={activeCard === index ? { height: 'auto', opacity: 1 } : { height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="overflow-hidden"
                  >
                    <div className="mt-4 pt-4 border-t border-gray-100">
                      <p className="text-gray-600 text-sm">{member.bio}</p>
                    </div>
                  </motion.div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
        
        <motion.div 
          className="mt-16 flex flex-col md:flex-row items-center justify-center bg-recruitment-light rounded-xl p-8 shadow-inner"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <div className="md:w-1/3 mb-6 md:mb-0 flex justify-center">
            <motion.img 
              src="/lovable-uploads/55c7a32e-42dd-4bbd-be07-450a61145ce5.png"
              alt="Heather Harries" 
              className="rounded-lg max-w-full h-auto md:max-w-xs"
              whileHover={{ scale: 1.05 }}
              transition={{ type: "spring", stiffness: 400, damping: 17 }}
            />
          </div>
          <div className="md:w-2/3 md:pl-10">
            <motion.blockquote 
              className="text-xl md:text-2xl font-medium text-recruitment-primary italic mb-4"
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.5 }}
            >
              "Without people a business has no relevance"
            </motion.blockquote>
            <motion.cite 
              className="text-gray-600 not-italic"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.7 }}
            >
              Heather Harries - Founder
            </motion.cite>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default TeamSection;
