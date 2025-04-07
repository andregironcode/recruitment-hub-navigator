
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useIsMobile } from '@/hooks/use-mobile';
import { ArrowRight, ChevronDown, CheckCircle } from 'lucide-react';
import { motion } from 'framer-motion';

const rotatingPhrases = [
  "Transform your workforce", 
  "Find top talent", 
  "Grow your business", 
  "Innovate with experts", 
  "Build diverse teams"
];

const HeroBanner = () => {
  const isMobile = useIsMobile();
  const [phraseIndex, setPhraseIndex] = useState(0);
  
  useEffect(() => {
    const interval = setInterval(() => {
      setPhraseIndex((prev) => (prev + 1) % rotatingPhrases.length);
    }, 3000);
    
    return () => clearInterval(interval);
  }, []);
  
  return (
    <div className="relative overflow-hidden bg-gradient-to-br from-recruitment-primary via-[#5d2a4c] to-recruitment-secondary">
      {/* Animated background elements */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 left-0 w-full h-full">
          <svg viewBox="0 0 400 400" className="w-full h-full opacity-20">
            <defs>
              <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M 40 0 L 0 0 0 40" fill="none" stroke="white" strokeWidth="1" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" />
          </svg>
        </div>
      </div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="pt-20 pb-24 md:pt-28 md:pb-32 flex justify-center">
          <motion.div 
            className="max-w-3xl text-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-block mb-2 px-3 py-1 bg-white/10 backdrop-blur-sm rounded-full text-white/90 text-sm font-medium">
              Leading Recruitment Solutions Since 2010
            </div>
            
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 text-white">
              <span className="text-white/90">The</span> Heather Harries <span className="text-white/90">Group</span>
            </h1>
            
            <div className="h-16 mb-6 overflow-hidden">
              <motion.div
                key={phraseIndex}
                initial={{ y: 40, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: -40, opacity: 0 }}
                transition={{ duration: 0.4 }}
                className="text-2xl md:text-3xl font-medium text-white/90"
              >
                {rotatingPhrases[phraseIndex]}
              </motion.div>
            </div>
            
            <p className="text-lg md:text-xl text-white/80 mb-8 mx-auto">
              Business disrupter and innovator, delivering exceptional recruitment solutions with old-fashioned values.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/about">
                <Button size={isMobile ? "default" : "lg"} className="bg-white text-recruitment-primary hover:bg-gray-100 font-medium w-full sm:w-auto group">
                  Learn More <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
              <Link to="/contact">
                <Button size={isMobile ? "default" : "lg"} variant="outline" className="border-white text-white bg-recruitment-accent/20 hover:bg-recruitment-accent hover:border-recruitment-accent font-medium w-full sm:w-auto">
                  Contact Us
                </Button>
              </Link>
            </div>
            
            <div className="mt-8 flex flex-wrap justify-center gap-4 text-white/80">
              <div className="flex items-center">
                <CheckCircle className="mr-2 h-5 w-5 text-recruitment-accent" />
                <span>Award-winning</span>
              </div>
              <div className="flex items-center">
                <CheckCircle className="mr-2 h-5 w-5 text-recruitment-accent" />
                <span>Industry experts</span>
              </div>
              <div className="flex items-center">
                <CheckCircle className="mr-2 h-5 w-5 text-recruitment-accent" />
                <span>Personalized service</span>
              </div>
            </div>
          </motion.div>
        </div>
        
        {/* Scroll indicator */}
        <motion.div 
          className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex flex-col items-center text-white/60"
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        >
          <span className="text-sm mb-2">Scroll to explore</span>
          <ChevronDown className="h-5 w-5" />
        </motion.div>
      </div>
      
      <div className="bg-white py-6 border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap justify-center md:justify-between items-center gap-8">
            <p className="text-sm text-gray-500 max-w-md text-center md:text-left">
              In a world where people have become numbers, our customers are our strategic partners, and their success is our success.
            </p>
            <div className="flex flex-wrap justify-center gap-8 md:gap-12">
              <motion.img 
                src="/client-logo-1.svg" 
                alt="Client logo" 
                className="h-7 opacity-60 hover:opacity-100 transition-opacity" 
                whileHover={{ scale: 1.1 }}
                transition={{ type: "spring", stiffness: 400, damping: 10 }}
              />
              <motion.img 
                src="/client-logo-2.svg" 
                alt="Client logo" 
                className="h-7 opacity-60 hover:opacity-100 transition-opacity"
                whileHover={{ scale: 1.1 }}
                transition={{ type: "spring", stiffness: 400, damping: 10 }}
              />
              <motion.img 
                src="/client-logo-3.svg" 
                alt="Client logo" 
                className="h-7 opacity-60 hover:opacity-100 transition-opacity"
                whileHover={{ scale: 1.1 }}
                transition={{ type: "spring", stiffness: 400, damping: 10 }}
              />
              <motion.img 
                src="/client-logo-4.svg" 
                alt="Client logo" 
                className="h-7 opacity-60 hover:opacity-100 transition-opacity"
                whileHover={{ scale: 1.1 }}
                transition={{ type: "spring", stiffness: 400, damping: 10 }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HeroBanner;
