
import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { motion } from 'framer-motion';
import { Badge } from '@/components/ui/badge';

const teamMembers = [
  {
    name: 'Heather',
    role: 'Chief Executive Officer',
    image: '/lovable-uploads/55c7a32e-42dd-4bbd-be07-450a61145ce5.png',
    bio: 'Heather has over 20 years of experience in recruitment and education. She founded the Heather Harries Group with a vision to transform how businesses approach talent acquisition.',
    tag: 'Founder'
  },
  {
    name: 'James',
    role: 'Business Development',
    image: '/lovable-uploads/08380770-d0b9-4afb-90ce-7816e675abdf.png',
    bio: 'James oversees business development initiatives and strategic partnerships. With his background in finance and operations, he helps clients optimize their recruitment processes.',
    tag: 'Strategy'
  },
  {
    name: 'Mhairi',
    role: 'Communications',
    image: '/lovable-uploads/4469be87-a336-4ab0-bd14-63e379979292.png',
    bio: 'Mhairi leads our communications strategy, ensuring clear and consistent messaging across all channels. Her expertise in digital marketing has helped grow our brand presence.',
    tag: 'Marketing'
  }
];

const TeamSection = () => {
  const [activeCard, setActiveCard] = useState<number | null>(null);
  
  return (
    <section className="py-16 md:py-24 bg-gradient-to-b from-white to-recruitment-light">
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
              alt="Team Icon" 
              className="w-12 h-12"
              animate={{ rotate: 360 }}
              transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            />
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-recruitment-primary mb-6">
            Meet our team
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Our dedicated professionals work together to deliver exceptional recruitment solutions with a personal touch.
          </p>
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
                className={`h-full overflow-hidden transition-all duration-300 ${activeCard === index ? 'shadow-xl border-recruitment-primary/50 transform -translate-y-2' : 'hover:shadow-lg border-2 border-transparent hover:border-recruitment-primary/20 hover:-translate-y-1'}`}
                onClick={() => setActiveCard(activeCard === index ? null : index)}
              >
                <div className="h-48 overflow-hidden relative">
                  <motion.div 
                    className="absolute inset-0 bg-gradient-to-b from-recruitment-primary/10 to-recruitment-primary/60 z-10"
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                  />
                  <motion.img 
                    src={member.image} 
                    alt={member.name}
                    className="w-full h-full object-cover object-center" 
                    whileHover={{ scale: 1.05 }}
                    transition={{ type: "spring", stiffness: 200, damping: 30 }}
                  />
                  <div className="absolute top-4 right-4 z-20">
                    <Badge variant="secondary" className="bg-white/80 text-recruitment-primary font-medium">
                      {member.tag}
                    </Badge>
                  </div>
                </div>
                <CardContent className="pt-6 pb-6 px-6">
                  <div className="flex flex-col items-center">
                    <motion.div 
                      className="relative -mt-16 mb-4 z-20"
                      whileHover={{ scale: 1.05 }}
                      transition={{ type: "spring", stiffness: 400, damping: 17 }}
                    >
                      <Avatar className="h-24 w-24 border-4 border-white shadow-lg rounded-full overflow-hidden">
                        <AvatarImage 
                          src={member.image} 
                          alt={member.name}
                          className="object-cover w-full h-full" 
                        />
                        <AvatarFallback className="bg-recruitment-primary/10 text-recruitment-primary text-lg">
                          <img 
                            src={member.image} 
                            alt={member.name}
                            className="object-cover w-full h-full" 
                          />
                        </AvatarFallback>
                      </Avatar>
                    </motion.div>
                    <h3 className="text-xl font-bold text-recruitment-primary mb-1">{member.name}</h3>
                    <p className="text-gray-600 mb-4">{member.role}</p>
                    
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={activeCard === index ? { height: 'auto', opacity: 1 } : { height: 0, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      className="overflow-hidden w-full"
                    >
                      <div className="pt-4 border-t border-gray-100">
                        <p className="text-gray-600 text-sm">{member.bio}</p>
                      </div>
                    </motion.div>
                    
                    <motion.button
                      className="mt-4 text-recruitment-primary text-sm font-medium flex items-center"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      {activeCard === index ? "Show less" : "Read more"}
                    </motion.button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
        
        <motion.div 
          className="mt-16 flex flex-col md:flex-row items-center justify-center bg-white rounded-xl p-8 shadow-xl border border-gray-100"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <div className="md:w-1/3 mb-6 md:mb-0 flex justify-center">
            <motion.div className="rounded-lg overflow-hidden shadow-lg">
              <motion.img 
                src="/lovable-uploads/55c7a32e-42dd-4bbd-be07-450a61145ce5.png"
                alt="Heather Harries" 
                className="max-w-full h-auto md:max-w-xs"
                whileHover={{ scale: 1.05 }}
                transition={{ type: "spring", stiffness: 400, damping: 17 }}
              />
            </motion.div>
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
