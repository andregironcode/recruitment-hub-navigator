
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';

const AboutSection = () => {
  return (
    <section className="py-16 md:py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-recruitment-primary mb-4">
            About the Heather Harries Group
          </h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto mb-8">
            The company has grown through horizontal integration from education, to consultancy, to human resource solutions, from the earliest interaction with our customers we recognize their value and we have always referred to human resources as human assets as we believe this is exactly what they are.
          </p>
          
          <div className="flex justify-center">
            <div className="h-1 w-24 bg-recruitment-primary rounded-full"></div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AboutSection;
