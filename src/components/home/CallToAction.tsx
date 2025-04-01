
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useIsMobile } from '@/hooks/use-mobile';

const CallToAction = () => {
  const isMobile = useIsMobile();
  
  return (
    <section className="py-12 md:py-16 bg-recruitment-light">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 className="text-2xl md:text-3xl font-bold mb-3 md:mb-4 text-recruitment-primary">
          Partner With Us For Your Recruitment Needs
        </h2>
        <p className="text-base md:text-lg text-gray-600 mb-6 md:mb-8 max-w-3xl mx-auto">
          Whether you're seeking exceptional talent or looking for your next career opportunity, 
          our experienced team is ready to help you achieve your goals.
        </p>
        <div className="flex flex-col sm:flex-row justify-center gap-3 md:gap-4">
          <Link to="/jobs" className="w-full sm:w-auto">
            <Button size={isMobile ? "default" : "lg"} className="bg-recruitment-primary hover:bg-recruitment-primary/90 text-white w-full sm:w-auto">
              View Current Openings
            </Button>
          </Link>
          <Link to="/contact" className="w-full sm:w-auto">
            <Button size={isMobile ? "default" : "lg"} variant="outline" className="border-recruitment-primary text-recruitment-primary hover:bg-recruitment-primary hover:text-white w-full sm:w-auto">
              Contact Our Team
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default CallToAction;
