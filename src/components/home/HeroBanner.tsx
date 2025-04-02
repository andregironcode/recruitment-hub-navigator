
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useIsMobile } from '@/hooks/use-mobile';
import { ArrowRight } from 'lucide-react';

const HeroBanner = () => {
  const isMobile = useIsMobile();
  
  return (
    <div className="relative bg-gradient-to-r from-recruitment-primary to-recruitment-secondary overflow-hidden">
      <div className="absolute inset-0 opacity-10">
        <img 
          src="/abstract-pattern.svg" 
          alt="" 
          className="w-full h-full object-cover"
        />
      </div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="pt-16 pb-20 md:pt-24 md:pb-28 flex flex-col md:flex-row items-center">
          <div className="md:w-1/2 text-center md:text-left mb-10 md:mb-0">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 text-white animate-fade-in">
              The <span className="text-white/90">Heather Harries</span> Group
            </h1>
            <p className="text-lg md:text-xl text-white/80 mb-8 max-w-lg">
              Business disrupter and innovator, the group has grown based on innovative thinking underwritten with old-fashioned values. The brand values are integrity, honesty, service, value and above all outstanding customer care.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
              <Link to="/about">
                <Button size={isMobile ? "default" : "lg"} className="bg-white text-recruitment-primary hover:bg-gray-100 font-medium w-full sm:w-auto">
                  Learn More <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link to="/contact">
                <Button size={isMobile ? "default" : "lg"} variant="outline" className="border-white text-white hover:bg-white/10 font-medium w-full sm:w-auto">
                  Contact Us
                </Button>
              </Link>
            </div>
          </div>
          <div className="md:w-1/2 flex justify-center md:justify-end">
            <div className="relative">
              <div className="absolute inset-0 bg-recruitment-primary rounded-full blur-3xl opacity-20"></div>
              <img 
                src="/recruitment-hero.svg" 
                alt="Professional recruitment" 
                className="relative z-10 max-w-full h-auto lg:max-w-lg"
              />
            </div>
          </div>
        </div>
      </div>
      
      <div className="bg-white py-4 border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap justify-center md:justify-between items-center gap-8 text-sm text-gray-500">
            <span>In a world where people have become numbers, our customers are our strategic partners, and their success is our success.</span>
            <div className="flex flex-wrap justify-center gap-8 md:gap-12">
              <img src="/client-logo-1.svg" alt="Client logo" className="h-6 opacity-60 hover:opacity-100 transition-opacity" />
              <img src="/client-logo-2.svg" alt="Client logo" className="h-6 opacity-60 hover:opacity-100 transition-opacity" />
              <img src="/client-logo-3.svg" alt="Client logo" className="h-6 opacity-60 hover:opacity-100 transition-opacity" />
              <img src="/client-logo-4.svg" alt="Client logo" className="h-6 opacity-60 hover:opacity-100 transition-opacity" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HeroBanner;
