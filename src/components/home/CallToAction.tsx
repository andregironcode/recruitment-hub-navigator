
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

const CallToAction = () => {
  return (
    <section className="py-16 bg-recruitment-light">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 className="text-3xl font-bold mb-4 text-recruitment-dark">
          Partner With Us For Your Recruitment Needs
        </h2>
        <p className="text-lg text-gray-600 mb-8 max-w-3xl mx-auto">
          Whether you're seeking exceptional talent or looking for your next career opportunity, 
          our experienced team is ready to help you achieve your goals.
        </p>
        <div className="flex flex-col sm:flex-row justify-center gap-4">
          <Link to="/jobs">
            <Button size="lg" className="bg-recruitment-primary hover:bg-recruitment-primary/90 text-white">
              View Current Openings
            </Button>
          </Link>
          <Link to="/contact">
            <Button size="lg" variant="outline" className="border-recruitment-primary text-recruitment-primary hover:bg-recruitment-primary hover:text-white">
              Contact Our Team
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default CallToAction;
