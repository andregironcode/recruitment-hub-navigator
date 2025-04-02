
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Check, Mail, Phone, MapPin } from 'lucide-react';
import { motion } from 'framer-motion';

const visionPoints = [
  "Our vision is to change the recruitment industry by setting new standards for integrity, honesty and customer care.",
  "To ensure all humans are assets to the organisation and make an active difference.",
  "To change recruitment from a single-service agency approach to a multi-channel approach, through ensuring complete integration."
];

const VisionSection = () => {
  return (
    <section className="py-16 md:py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div 
          className="bg-gradient-to-r from-recruitment-primary to-recruitment-secondary rounded-2xl shadow-xl overflow-hidden"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          whileHover={{ y: -5 }}
        >
          <div className="p-8 md:p-12 lg:p-16">
            <motion.h2 
              className="text-3xl md:text-4xl font-bold mb-8 text-white"
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              Our Vision
            </motion.h2>
            
            <div className="space-y-8">
              {visionPoints.map((point, index) => (
                <motion.div 
                  key={index} 
                  className="flex items-start"
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: 0.2 + index * 0.1 }}
                >
                  <motion.div 
                    className="bg-white/20 rounded-full p-1 mt-1 mr-4"
                    whileHover={{ scale: 1.2, backgroundColor: "rgba(255,255,255,0.3)" }}
                    transition={{ type: "spring", stiffness: 400, damping: 10 }}
                  >
                    <Check className="h-5 w-5 text-white" />
                  </motion.div>
                  <p className="text-lg text-white/90">{point}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>
        
        <motion.div 
          className="mt-16 bg-recruitment-light p-8 rounded-xl shadow-inner"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.5 }}
        >
          <h3 className="text-2xl font-semibold text-recruitment-primary mb-6 text-center">
            Get In Touch
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
            <motion.div
              whileHover={{ y: -5 }}
              transition={{ type: "spring", stiffness: 400, damping: 17 }}
            >
              <div className="flex justify-center mb-3">
                <div className="bg-recruitment-primary/10 p-2 rounded-full">
                  <MapPin className="h-6 w-6 text-recruitment-primary" />
                </div>
              </div>
              <h4 className="text-lg font-medium text-recruitment-primary mb-2">Office</h4>
              <p className="text-gray-600">Harries Centre, Swansea Enterprise Park<br />Swansea, SA6 8QF</p>
            </motion.div>
            <motion.div
              whileHover={{ y: -5 }}
              transition={{ type: "spring", stiffness: 400, damping: 17 }}
            >
              <div className="flex justify-center mb-3">
                <div className="bg-recruitment-primary/10 p-2 rounded-full">
                  <Mail className="h-6 w-6 text-recruitment-primary" />
                </div>
              </div>
              <h4 className="text-lg font-medium text-recruitment-primary mb-2">Email</h4>
              <a href="mailto:James@harriesgroup.com" className="text-gray-600 hover:text-recruitment-primary transition-colors">
                James@harriesgroup.com
              </a>
            </motion.div>
            <motion.div
              whileHover={{ y: -5 }}
              transition={{ type: "spring", stiffness: 400, damping: 17 }}
            >
              <div className="flex justify-center mb-3">
                <div className="bg-recruitment-primary/10 p-2 rounded-full">
                  <Phone className="h-6 w-6 text-recruitment-primary" />
                </div>
              </div>
              <h4 className="text-lg font-medium text-recruitment-primary mb-2">Telephone</h4>
              <a href="tel:042672726" className="text-gray-600 hover:text-recruitment-primary transition-colors">
                04 267 2726
              </a>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default VisionSection;
