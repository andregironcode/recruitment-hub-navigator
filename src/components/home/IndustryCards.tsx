
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { supabase } from '@/integrations/supabase/client';

// Define our industry data but without hardcoded counts
const industriesData = [
  { 
    id: 'finance', 
    name: 'Finance', 
    description: 'Banking, accounting, financial analysis, and senior finance leadership positions.',
    icon: '/icons/emiratization.svg'
  },
  { 
    id: 'emiratization', 
    name: 'Emiratization', 
    description: 'Specialized recruitment supporting UAE nationals in developing careers across all sectors.',
    icon: '/icons/emiratization.svg'
  },
  { 
    id: 'real-estate', 
    name: 'Real Estate', 
    description: 'Property management, real estate agents, development, and construction specialists.',
    icon: '/icons/real-estate.svg'
  },
  { 
    id: 'law', 
    name: 'Law', 
    description: 'Legal professionals, paralegals, attorneys, and corporate legal advisors.',
    icon: '/icons/law.svg'
  },
  { 
    id: 'tourism', 
    name: 'Tourism', 
    description: 'Hospitality, travel management, tourism operations, and customer service roles.',
    icon: '/icons/tourism.svg'
  },
  { 
    id: 'education', 
    name: 'Education', 
    description: 'Teaching professionals, educational administration, and academic leadership positions.',
    icon: '/icons/education.svg'
  }
];

const IndustryCards = () => {
  const [hoveredCard, setHoveredCard] = useState<string | null>(null);
  const [industries, setIndustries] = useState<Array<typeof industriesData[0] & { jobCount: number }>>(
    industriesData.map(industry => ({ ...industry, jobCount: 0 }))
  );
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    const fetchJobCounts = async () => {
      setIsLoading(true);
      try {
        // Prepare an array to store all industry counts
        const industriesWithCounts = await Promise.all(
          industriesData.map(async (industry) => {
            // For each industry, count the number of jobs in that category
            const { count, error } = await supabase
              .from('jobs')
              .select('*', { count: 'exact', head: true })
              .eq('industry', industry.name);
              
            if (error) {
              console.error(`Error fetching count for ${industry.name}:`, error);
              return { ...industry, jobCount: 0 };
            }
            
            return {
              ...industry,
              jobCount: count || 0
            };
          })
        );
        
        setIndustries(industriesWithCounts);
      } catch (error) {
        console.error('Error fetching job counts:', error);
        // If there's an error, use the industries with zero counts
        setIndustries(industriesData.map(industry => ({ ...industry, jobCount: 0 })));
      } finally {
        setIsLoading(false);
      }
    };

    fetchJobCounts();
  }, []);
  
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
          {industries.map((industry, index) => (
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
                        {isLoading ? 'Loading...' : `${industry.jobCount} opening${industry.jobCount !== 1 ? 's' : ''}`}
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
