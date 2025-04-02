
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useIsMobile } from '@/hooks/use-mobile';
import { ArrowRight, ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';

const rotatingWords = [
  "Education", 
  "Recruitment", 
  "Growth", 
  "Innovation", 
  "Excellence"
];

const HeroBanner = () => {
  const isMobile = useIsMobile();
  const [wordIndex, setWordIndex] = useState(0);
  
  useEffect(() => {
    const interval = setInterval(() => {
      setWordIndex((prev) => (prev + 1) % rotatingWords.length);
    }, 3000);
    
    return () => clearInterval(interval);
  }, []);
  
  return (
    <div className="relative bg-gradient-to-r from-recruitment-primary to-recruitment-secondary overflow-hidden">
      <div className="absolute inset-0 opacity-10">
        <img 
          src="/abstract-pattern.svg" 
          alt="" 
          className="w-full h-full object-cover"
        />
      </div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="pt-16 pb-20 md:pt-24 md:pb-28 flex flex-col md:flex-row items-center">
          <motion.div 
            className="md:w-1/2 text-center md:text-left mb-10 md:mb-0"
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 text-white">
              The <span className="text-white/90">Heather Harries</span> Group
            </h1>
            <div className="h-12 mb-6 overflow-hidden">
              <motion.div
                key={wordIndex}
                initial={{ y: 40, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: -40, opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="text-2xl md:text-3xl font-medium text-white/80"
              >
                Delivering <span className="text-recruitment-accent font-bold">{rotatingWords[wordIndex]}</span>
              </motion.div>
            </div>
            <p className="text-lg md:text-xl text-white/80 mb-8 max-w-lg">
              Business disrupter and innovator, the group has grown based on innovative thinking underwritten with old-fashioned values.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
              <Link to="/about">
                <Button size={isMobile ? "default" : "lg"} className="bg-white text-recruitment-primary hover:bg-gray-100 font-medium w-full sm:w-auto group">
                  Learn More <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
              <Link to="/contact">
                <Button size={isMobile ? "default" : "lg"} variant="outline" className="border-white text-white hover:bg-white/10 font-medium w-full sm:w-auto">
                  Contact Us
                </Button>
              </Link>
            </div>
          </motion.div>
          <motion.div 
            className="md:w-1/2 flex justify-center md:justify-end"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <div className="relative">
              <div className="absolute inset-0 bg-recruitment-primary rounded-full blur-3xl opacity-20"></div>
              <motion.img 
                src="/recruitment-hero.svg" 
                alt="Professional recruitment" 
                className="relative z-10 max-w-full h-auto lg:max-w-lg"
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
              />
            </div>
          </motion.div>
        </div>
      </div>
      
      <div className="bg-white py-4 border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap justify-center md:justify-between items-center gap-8 text-sm text-gray-500">
            <span>In a world where people have become numbers, our customers are our strategic partners, and their success is our success.</span>
            <div className="flex flex-wrap justify-center gap-8 md:gap-12">
              <motion.img 
                src="/client-logo-1.svg" 
                alt="Client logo" 
                className="h-6 opacity-60 hover:opacity-100 transition-opacity" 
                whileHover={{ scale: 1.1 }}
                transition={{ type: "spring", stiffness: 400, damping: 10 }}
              />
              <motion.img 
                src="/client-logo-2.svg" 
                alt="Client logo" 
                className="h-6 opacity-60 hover:opacity-100 transition-opacity"
                whileHover={{ scale: 1.1 }}
                transition={{ type: "spring", stiffness: 400, damping: 10 }}
              />
              <motion.img 
                src="/client-logo-3.svg" 
                alt="Client logo" 
                className="h-6 opacity-60 hover:opacity-100 transition-opacity"
                whileHover={{ scale: 1.1 }}
                transition={{ type: "spring", stiffness: 400, damping: 10 }}
              />
              <motion.img 
                src="/client-logo-4.svg" 
                alt="Client logo" 
                className="h-6 opacity-60 hover:opacity-100 transition-opacity"
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
