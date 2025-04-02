
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { useIsMobile } from '@/hooks/use-mobile';
import { Star, ChevronLeft, ChevronRight } from 'lucide-react';

const testimonialsData = [
  {
    id: 1,
    quote: "The Harries team took the time to understand our unique company culture and team dynamics, helping us find candidates who were not just qualified but were perfect fits for our organisation.",
    author: "Sarah Johnson",
    position: "HR Director, Manufacturing Industry",
    avatar: "/avatars/sarah.jpg",
    rating: 5
  },
  {
    id: 2,
    quote: "Working with Harries Recruitment has transformed our hiring process. Their industry knowledge and commitment to finding the right match has saved us time and improved our retention rates.",
    author: "James Wilson",
    position: "Operations Manager, Technology Sector",
    avatar: "/avatars/james.jpg",
    rating: 5
  },
  {
    id: 3,
    quote: "We've been partnering with Harries for over a decade. Their team consistently delivers exceptional candidates and valuable market insights that have helped us stay competitive in talent acquisition.",
    author: "Emily Turner",
    position: "CEO, Financial Services",
    avatar: "/avatars/emily.jpg",
    rating: 5
  }
];

const Testimonials = () => {
  const isMobile = useIsMobile();

  return (
    <section className="py-16 md:py-24 bg-gradient-to-r from-recruitment-primary to-recruitment-secondary text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12 md:mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            What Our Clients Say
          </h2>
          <p className="text-lg text-white/80 max-w-2xl mx-auto">
            Don't just take our word for it — hear from the companies who've partnered with us.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
          {testimonialsData.map((testimonial) => (
            <Card key={testimonial.id} className="bg-white/10 border-none shadow-xl backdrop-blur-sm hover:bg-white/15 transition-all duration-300">
              <CardContent className="p-6 md:p-8">
                <div className="flex mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star 
                      key={i} 
                      className={`w-5 h-5 ${i < testimonial.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`}
                    />
                  ))}
                </div>
                <p className="text-white/90 mb-6 italic text-lg">
                  "{isMobile 
                    ? testimonial.quote.split('.')[0] + '...' 
                    : testimonial.quote}"
                </p>
                <div className="flex items-center">
                  <div className="mr-4">
                    <div className="w-12 h-12 rounded-full overflow-hidden bg-white/20">
                      <img 
                        src={testimonial.avatar} 
                        alt={testimonial.author} 
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          // Fallback to initials if avatar fails to load
                          e.currentTarget.style.display = 'none';
                          e.currentTarget.parentElement.dataset.initials = testimonial.author.split(' ').map(n => n[0]).join('');
                        }}
                      />
                    </div>
                  </div>
                  <div>
                    <h4 className="font-semibold text-lg">{testimonial.author}</h4>
                    <p className="text-white/70 text-sm">{testimonial.position}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
        
        <div className="flex justify-center mt-10">
          <button className="bg-white/10 hover:bg-white/20 p-2 rounded-full mx-2 transition-colors">
            <ChevronLeft className="w-6 h-6" />
          </button>
          <button className="bg-white/10 hover:bg-white/20 p-2 rounded-full mx-2 transition-colors">
            <ChevronRight className="w-6 h-6" />
          </button>
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
