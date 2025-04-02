
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { GraduationCap, Users } from 'lucide-react';
import { motion } from 'framer-motion';

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
        <motion.div 
          className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          {/* Education Cluster */}
          <motion.div 
            className="order-2 md:order-1 flex flex-col md:items-end"
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <motion.div 
              className="bg-white rounded-lg shadow-lg p-8 max-w-md relative"
              whileHover={{ y: -5, boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)" }}
              transition={{ type: "spring", stiffness: 400, damping: 17 }}
            >
              <div className="absolute top-0 right-0 -mt-8 -mr-8">
                <motion.img 
                  src="/placeholder-icon.svg" 
                  alt="Stem Plant Outline" 
                  className="w-16 h-16"
                  animate={{ rotate: [0, 5, 0, -5, 0] }}
                  transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
                />
              </div>
              <h3 className="text-2xl font-bold text-recruitment-primary mb-4">Education</h3>
              <p className="text-xl font-medium text-gray-700 mb-4">
                World-class education at a click of a button
              </p>
              <p className="text-gray-600">
                Our Education cluster has some of the best teachers supporting students in 3 different continents. Our network supports children from FS1 through to University with all their educational needs.
              </p>
              <motion.div 
                className="mt-6 bg-recruitment-primary/10 p-4 rounded-lg"
                whileHover={{ scale: 1.05 }}
                transition={{ type: "spring", stiffness: 400, damping: 17 }}
              >
                <GraduationCap className="h-12 w-12 text-recruitment-primary mb-2" />
                <h4 className="text-lg font-semibold text-recruitment-primary">Education</h4>
              </motion.div>
            </motion.div>
          </motion.div>
          
          {/* Simple vine illustration */}
          <div className="hidden md:flex order-1 md:order-2 justify-center">
            <motion.div 
              className="w-px h-64 bg-recruitment-primary/30 relative"
              initial={{ height: 0 }}
              whileInView={{ height: 260 }}
              viewport={{ once: true }}
              transition={{ duration: 1 }}
            >
              <motion.div 
                className="absolute top-1/4 -left-3 w-6 h-px bg-recruitment-primary/30"
                initial={{ width: 0 }}
                whileInView={{ width: 24 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: 0.3 }}
              />
              <motion.div 
                className="absolute top-2/4 -right-3 w-6 h-px bg-recruitment-primary/30"
                initial={{ width: 0 }}
                whileInView={{ width: 24 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: 0.6 }}
              />
              <motion.div 
                className="absolute top-3/4 -left-3 w-6 h-px bg-recruitment-primary/30"
                initial={{ width: 0 }}
                whileInView={{ width: 24 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: 0.9 }}
              />
            </motion.div>
          </div>
          
          {/* Human Assets Cluster */}
          <motion.div 
            className="order-3"
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <motion.div 
              className="bg-white rounded-lg shadow-lg p-8 max-w-md"
              whileHover={{ y: -5, boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)" }}
              transition={{ type: "spring", stiffness: 400, damping: 17 }}
            >
              <h3 className="text-2xl font-bold text-recruitment-primary mb-4">Human Assets</h3>
              <p className="text-xl font-medium text-gray-700 mb-4">
                A full service agency supporting your business from the inside.
              </p>
              <p className="text-gray-600">
                Our Human Resources cluster specialises in ensuring you have the best team in place for your business to grow. A different approach to recruitment, which you will find so refreshing.
              </p>
              <motion.div 
                className="mt-6 bg-recruitment-primary/10 p-4 rounded-lg"
                whileHover={{ scale: 1.05 }}
                transition={{ type: "spring", stiffness: 400, damping: 17 }}
              >
                <Users className="h-12 w-12 text-recruitment-primary mb-2" />
                <h4 className="text-lg font-semibold text-recruitment-primary">Human Resources</h4>
              </motion.div>
            </motion.div>
          </motion.div>
          
          {/* Another plant outline for symmetry */}
          <div className="order-4 hidden md:flex justify-center">
            <motion.img 
              src="/placeholder-icon.svg" 
              alt="Stem Plant Outline" 
              className="w-16 h-16 opacity-50"
              animate={{ rotate: [0, -5, 0, 5, 0] }}
              transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 2 }}
            />
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default ServiceClusters;
