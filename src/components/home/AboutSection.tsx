
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { motion } from 'framer-motion';

const AboutSection = () => {
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
          <h2 className="text-3xl md:text-4xl font-bold text-recruitment-primary mb-4">
            About the Heather Harries Group
          </h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto mb-8">
            Business disrupter and innovator, the group has grown based on innovative thinking underwritten with old-fashioned values. The brand values are integrity, honesty, service, value and above all outstanding customer care.
          </p>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto mb-8">
            The company has grown through horizontal integration from education, to consultancy, to human resource solutions, from the earliest interaction with our customers we recognize their value and we have always referred to human resources as human assets as we believe this is exactly what they are.
          </p>
          
          <div className="flex justify-center">
            <div className="h-1 w-24 bg-recruitment-primary rounded-full"></div>
          </div>
        </motion.div>
        
        <motion.div 
          className="grid grid-cols-1 md:grid-cols-3 gap-6"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, staggerChildren: 0.1 }}
        >
          {['Integrity', 'Innovation', 'Partnership'].map((value, index) => (
            <motion.div
              key={value}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
            >
              <Card className="hover:shadow-lg transition-shadow border-2 border-transparent hover:border-recruitment-primary/20">
                <CardContent className="p-6 text-center">
                  <h3 className="text-xl font-bold text-recruitment-primary mb-2">{value}</h3>
                  <div className="h-1 w-12 bg-recruitment-primary/40 mx-auto mb-4 rounded-full"></div>
                  <p className="text-gray-600">
                    Our commitment to {value.toLowerCase()} drives everything we do, creating lasting partnerships with our clients.
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default AboutSection;
