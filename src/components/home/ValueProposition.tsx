
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { CheckCircle } from 'lucide-react';

const valuePoints = [
  "We are a small team of professionals who take the time to listen and understand your needs.",
  "We put you at the centre of our work, and deliver based on old-fashioned values.",
  "We refer to our customers as partners and we invest ourselves in helping your business grow."
];

const industries = [
  "Tourism",
  "Education",
  "Finance",
  "Operations (HR/Marketing)"
];

const ValueProposition = () => {
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
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-3xl md:text-4xl font-bold text-recruitment-primary mb-8">
              Why businesses choose us?
            </h2>
            
            <div className="space-y-6">
              {valuePoints.map((point, index) => (
                <div key={index} className="flex">
                  <CheckCircle className="h-6 w-6 text-recruitment-primary flex-shrink-0 mr-4 mt-1" />
                  <p className="text-lg text-gray-700">{point}</p>
                </div>
              ))}
            </div>
            
            <div className="mt-12 grid grid-cols-2 gap-4">
              {industries.map((industry, index) => (
                <Card key={index} className="bg-white border-2 border-transparent hover:border-recruitment-primary/20 transition-all">
                  <CardContent className="p-6 text-center">
                    <p className="text-lg font-medium text-recruitment-primary">{industry}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-lg p-10 relative">
            <div className="absolute -top-5 -left-5 bg-recruitment-primary rounded-full w-12 h-12 flex items-center justify-center text-white text-2xl font-bold">
              ?
            </div>
            <h3 className="text-2xl font-bold text-recruitment-primary mb-6">
              Successful employees
            </h3>
            <img 
              src="/placeholder.svg" 
              alt="Successful employees" 
              className="w-full h-auto rounded-lg mb-6"
            />
            <p className="text-lg text-gray-600 italic">
              We believe in creating lasting partnerships that benefit both employers and employees, fostering a culture of success and growth.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ValueProposition;
