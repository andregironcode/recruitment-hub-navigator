
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useIsMobile } from '@/hooks/use-mobile';

const HeroBanner = () => {
  const isMobile = useIsMobile();
  
  return (
    <div className="bg-gradient-to-r from-recruitment-primary to-recruitment-secondary text-white py-12 md:py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-center md:justify-start mb-8">
          <img 
            src="/logo-white.png" 
            alt="Harries Recruitment Logo" 
            className="h-16 md:h-20"
          />
        </div>
        <div className="md:w-2/3 text-center md:text-left">
          <h1 className="text-3xl md:text-5xl font-bold mb-4 animate-fade-in">
            Building Winning Teams
          </h1>
          <p className="text-lg md:text-xl mb-6 md:mb-10 opacity-90">
            Harries Recruitment specialises in connecting exceptional talent with leading companies. 
            {!isMobile && (
              <span> For over 25 years, we've built lasting relationships, becoming trusted partners in 
              recruitment across the UK.</span>
            )}
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center md:justify-start">
            <Link to="/jobs">
              <Button size={isMobile ? "default" : "lg"} className="bg-white text-recruitment-primary hover:bg-gray-100 font-medium w-full sm:w-auto">
                Browse Jobs
              </Button>
            </Link>
            <Link to="/contact">
              <Button size={isMobile ? "default" : "lg"} variant="outline" className="border-white text-white hover:bg-white/10 font-medium w-full sm:w-auto">
                Contact Us
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HeroBanner;
