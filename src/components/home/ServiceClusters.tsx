
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { GraduationCap, Users } from 'lucide-react';

const ServiceClusters = () => {
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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
          {/* Education Cluster */}
          <div className="order-2 md:order-1 flex flex-col md:items-end">
            <div className="bg-white rounded-lg shadow-lg p-8 max-w-md relative">
              <div className="absolute top-0 right-0 -mt-8 -mr-8">
                <img 
                  src="/placeholder-icon.svg" 
                  alt="Stem Plant Outline" 
                  className="w-16 h-16"
                />
              </div>
              <h3 className="text-2xl font-bold text-recruitment-primary mb-4">Education</h3>
              <p className="text-xl font-medium text-gray-700 mb-4">
                World-class education at a click of a button
              </p>
              <p className="text-gray-600">
                Our Education cluster has some of the best teachers supporting students in 3 different continents. Our network supports children from FS1 through to University with all their educational needs.
              </p>
              <div className="mt-6 bg-recruitment-primary/10 p-4 rounded-lg">
                <GraduationCap className="h-12 w-12 text-recruitment-primary mb-2" />
                <h4 className="text-lg font-semibold text-recruitment-primary">Education</h4>
              </div>
            </div>
          </div>
          
          {/* Simple vine illustration */}
          <div className="hidden md:flex order-1 md:order-2 justify-center">
            <div className="w-px h-64 bg-recruitment-primary/30 relative">
              <div className="absolute top-1/4 -left-3 w-6 h-px bg-recruitment-primary/30"></div>
              <div className="absolute top-2/4 -right-3 w-6 h-px bg-recruitment-primary/30"></div>
              <div className="absolute top-3/4 -left-3 w-6 h-px bg-recruitment-primary/30"></div>
            </div>
          </div>
          
          {/* Human Assets Cluster */}
          <div className="order-3">
            <div className="bg-white rounded-lg shadow-lg p-8 max-w-md">
              <h3 className="text-2xl font-bold text-recruitment-primary mb-4">Human Assets</h3>
              <p className="text-xl font-medium text-gray-700 mb-4">
                A full service agency supporting your business from the inside.
              </p>
              <p className="text-gray-600">
                Our Human Resources cluster specialises in ensuring you have the best team in place for your business to grow. A different approach to recruitment, which you will find so refreshing.
              </p>
              <div className="mt-6 bg-recruitment-primary/10 p-4 rounded-lg">
                <Users className="h-12 w-12 text-recruitment-primary mb-2" />
                <h4 className="text-lg font-semibold text-recruitment-primary">Human Resources</h4>
              </div>
            </div>
          </div>
          
          {/* Another plant outline for symmetry */}
          <div className="order-4 hidden md:flex justify-center">
            <img 
              src="/placeholder-icon.svg" 
              alt="Stem Plant Outline" 
              className="w-16 h-16 opacity-50"
            />
          </div>
        </div>
      </div>
    </section>
  );
};

export default ServiceClusters;
