
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';

const testimonialsData = [
  {
    id: 1,
    quote: "Harries Recruitment understood our company culture and helped us find candidates who were not just qualified but were also a perfect fit for our team.",
    author: "Sarah Johnson",
    position: "HR Director, TechFusion Inc."
  },
  {
    id: 2,
    quote: "I was struggling to find a role that matched my skills and career aspirations. Harries Recruitment not only found me the perfect position but also provided valuable guidance throughout the process.",
    author: "James Wilson",
    position: "Software Engineer, CloudScale"
  },
  {
    id: 3,
    quote: "The team at Harries Recruitment is professional, thorough, and truly committed to finding the right match for both employers and candidates.",
    author: "Emily Turner",
    position: "Operations Manager, Global Finance"
  }
];

const Testimonials = () => {
  return (
    <section className="py-16 bg-recruitment-primary text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-3xl font-bold text-center mb-12">
          What Our Clients Say
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonialsData.map((testimonial) => (
            <Card key={testimonial.id} className="bg-white/10 border-none shadow-none">
              <CardContent className="p-6">
                <div className="text-3xl font-serif mb-4">"</div>
                <p className="text-white/90 mb-6 italic">
                  {testimonial.quote}
                </p>
                <div>
                  <h4 className="font-semibold">{testimonial.author}</h4>
                  <p className="text-white/70 text-sm">{testimonial.position}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
