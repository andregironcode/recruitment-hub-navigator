
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Check } from 'lucide-react';

const visionPoints = [
  "Our vision is to change the recruitment industry by setting new standards for integrity, honesty and customer care.",
  "To ensure all humans are assets to the organisation and make an active difference.",
  "To change recruitment from a single-service agency approach to a multi-channel approach, through ensuring complete integration."
];

const VisionSection = () => {
  return (
    <section className="py-16 md:py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-r from-recruitment-primary to-recruitment-secondary rounded-2xl shadow-xl overflow-hidden">
          <div className="p-8 md:p-12 lg:p-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-8 text-white">
              Our Vision
            </h2>
            
            <div className="space-y-8">
              {visionPoints.map((point, index) => (
                <div key={index} className="flex items-start">
                  <div className="bg-white/20 rounded-full p-1 mt-1 mr-4">
                    <Check className="h-5 w-5 text-white" />
                  </div>
                  <p className="text-lg text-white/90">{point}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
        
        <div className="mt-16 bg-recruitment-light p-8 rounded-xl shadow-inner">
          <h3 className="text-2xl font-semibold text-recruitment-primary mb-6 text-center">
            Get In Touch
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
            <div>
              <h4 className="text-lg font-medium text-recruitment-primary mb-2">Office</h4>
              <p className="text-gray-600">Harries Centre, Swansea Enterprise Park<br />Swansea, SA6 8QF</p>
            </div>
            <div>
              <h4 className="text-lg font-medium text-recruitment-primary mb-2">Email</h4>
              <a href="mailto:James@harriesgroup.com" className="text-gray-600 hover:text-recruitment-primary transition-colors">
                James@harriesgroup.com
              </a>
            </div>
            <div>
              <h4 className="text-lg font-medium text-recruitment-primary mb-2">Telephone</h4>
              <a href="tel:042672726" className="text-gray-600 hover:text-recruitment-primary transition-colors">
                04 267 2726
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default VisionSection;
