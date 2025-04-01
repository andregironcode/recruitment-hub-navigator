
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';

const testimonialsData = [
  {
    id: 1,
    quote: "The Harries team took the time to understand our unique company culture and team dynamics, helping us find candidates who were not just qualified but were perfect fits for our organisation.",
    author: "Sarah Johnson",
    position: "HR Director, Manufacturing Industry"
  },
  {
    id: 2,
    quote: "Working with Harries Recruitment has transformed our hiring process. Their industry knowledge and commitment to finding the right match has saved us time and improved our retention rates.",
    author: "James Wilson",
    position: "Operations Manager, Technology Sector"
  },
  {
    id: 3,
    quote: "We've been partnering with Harries for over a decade. Their team consistently delivers exceptional candidates and valuable market insights that have helped us stay competitive in talent acquisition.",
    author: "Emily Turner",
    position: "CEO, Financial Services"
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
