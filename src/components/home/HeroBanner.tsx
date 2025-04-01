
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

const HeroBanner = () => {
  return (
    <div className="bg-gradient-to-r from-recruitment-primary to-recruitment-secondary text-white py-16 md:py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="md:w-2/3">
          <h1 className="text-3xl md:text-5xl font-bold mb-4 animate-fade-in">
            Your Career Journey Starts Here
          </h1>
          <p className="text-lg md:text-xl mb-8 md:mb-10 opacity-90">
            Harries Recruitment connects talented professionals with leading employers across industries.
            Find your dream job or your next star employee with us.
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <Link to="/jobs">
              <Button size="lg" className="bg-white text-recruitment-primary hover:bg-gray-100 font-medium">
                Browse Jobs
              </Button>
            </Link>
            <Link to="/contact">
              <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10 font-medium">
                Hire Talent
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HeroBanner;
