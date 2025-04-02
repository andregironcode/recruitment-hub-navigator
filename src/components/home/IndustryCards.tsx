
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';

const industriesData = [
  { 
    id: 'technology', 
    name: 'Technology', 
    description: 'Software development, IT support, cybersecurity, and technical leadership roles.',
    jobCount: 42,
    icon: '/icons/technology.svg'
  },
  { 
    id: 'finance', 
    name: 'Finance & Accounting', 
    description: 'Banking, accounting, financial analysis, and senior finance leadership positions.',
    jobCount: 36,
    icon: '/icons/finance.svg'
  },
  { 
    id: 'engineering', 
    name: 'Engineering', 
    description: 'Civil, mechanical, electrical engineering and technical design positions.',
    jobCount: 31,
    icon: '/icons/engineering.svg'
  },
  { 
    id: 'sales', 
    name: 'Sales & Marketing', 
    description: 'Sales executives, digital marketing specialists, and brand management roles.',
    jobCount: 28,
    icon: '/icons/marketing.svg'
  },
  { 
    id: 'executive', 
    name: 'Executive Search', 
    description: 'C-suite, senior leadership, and board-level appointments across industries.',
    jobCount: 22,
    icon: '/icons/executive.svg'
  },
  { 
    id: 'manufacturing', 
    name: 'Manufacturing', 
    description: 'Production management, quality control, and operations leadership positions.',
    jobCount: 24,
    icon: '/icons/manufacturing.svg'
  }
];

const IndustryCards = () => {
  const [hoveredCard, setHoveredCard] = useState<string | null>(null);
  
  return (
    <section className="py-16 md:py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div 
          className="text-center mb-12 md:mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <h2 className="text-3xl md:text-4xl font-bold text-recruitment-primary mb-4">
            Our Specialist Sectors
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            We specialize in recruiting exceptional talent across a diverse range of industries.
          </p>
        </motion.div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          {industriesData.map((industry, index) => (
            <motion.div
              key={industry.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              onHoverStart={() => setHoveredCard(industry.id)}
              onHoverEnd={() => setHoveredCard(null)}
            >
              <Link to={`/jobs?industry=${industry.id}`} className="block h-full">
                <Card className={`h-full transition-all duration-300 hover:shadow-lg border-2 border-transparent ${hoveredCard === industry.id ? 'border-recruitment-primary/40 shadow-lg' : 'hover:border-recruitment-primary/20'}`}>
                  <CardContent className="p-6 h-full flex flex-col">
                    <div className="flex items-center mb-4">
                      <motion.div 
                        className="bg-recruitment-primary/10 p-3 rounded-full mr-3"
                        animate={hoveredCard === industry.id ? { scale: 1.1, backgroundColor: 'rgba(78, 26, 61, 0.2)' } : {}}
                        transition={{ duration: 0.3 }}
                      >
                        <img 
                          src={industry.icon} 
                          alt={industry.name} 
                          className="w-6 h-6"
                          onError={(e) => {
                            // Fallback to a placeholder if the icon fails to load
                            e.currentTarget.src = '/placeholder-icon.svg';
                          }}
                        />
                      </motion.div>
                      <h3 className="text-xl font-semibold text-recruitment-primary">
                        {industry.name}
                      </h3>
                    </div>
                    <p className="text-gray-600 mb-6 flex-grow">
                      {industry.description}
                    </p>
                    <div className="flex justify-between items-center mt-auto">
                      <span className="font-medium text-recruitment-accent">
                        {industry.jobCount} openings
                      </span>
                      <motion.span 
                        className="text-recruitment-primary"
                        animate={hoveredCard === industry.id ? { x: 5 } : { x: 0 }}
                        transition={{ duration: 0.3 }}
                      >
                        <ArrowRight size={20} />
                      </motion.span>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default IndustryCards;
