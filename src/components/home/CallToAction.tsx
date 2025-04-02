
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useIsMobile } from '@/hooks/use-mobile';
import { PhoneCall, Mail } from 'lucide-react';

const CallToAction = () => {
  const isMobile = useIsMobile();
  
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
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          <div className="p-8 md:p-12 lg:p-16 flex flex-col md:flex-row items-center">
            <div className="md:w-2/3 mb-8 md:mb-0 md:pr-8">
              <h2 className="text-3xl md:text-4xl font-bold mb-4 text-recruitment-primary">
                Ready to Transform Your Hiring Process?
              </h2>
              <p className="text-lg text-gray-600 mb-6">
                Partner with Harries Recruitment to find exceptional talent that will drive your business forward. Our team of specialists is ready to help you achieve your hiring goals.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
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
            <div className="md:w-1/3 bg-recruitment-primary/5 p-6 md:p-8 rounded-xl border border-recruitment-primary/10">
              <h3 className="text-xl font-semibold mb-4 text-recruitment-primary">
                Get in Touch
              </h3>
              <div className="space-y-4">
                <div className="flex items-center">
                  <PhoneCall className="text-recruitment-primary mr-3" size={20} />
                  <span className="text-gray-700">+44 (0) 1792 814 444</span>
                </div>
                <div className="flex items-center">
                  <Mail className="text-recruitment-primary mr-3" size={20} />
                  <a 
                    href="mailto:info@harriesgroup.com" 
                    className="text-gray-700 hover:text-recruitment-primary transition-colors"
                  >
                    info@harriesgroup.com
                  </a>
                </div>
              </div>
              <div className="mt-6 pt-6 border-t border-gray-200">
                <p className="text-gray-600 text-sm">
                  Mon-Fri: 9:00 AM - 5:30 PM<br />
                  Harries Centre, Swansea Enterprise Park<br />
                  Swansea, SA6 8QF
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CallToAction;
