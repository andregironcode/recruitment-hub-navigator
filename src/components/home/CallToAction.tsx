import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useIsMobile } from '@/hooks/use-mobile';
import { PhoneCall, Mail, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';
const CallToAction = () => {
  const isMobile = useIsMobile();
  return <section className="py-16 md:py-24 bg-recruitment-light relative overflow-hidden">
      <div className="absolute inset-0 opacity-5">
        <img src="/dots-pattern.svg" alt="" className="w-full h-full object-cover" />
      </div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <motion.div className="bg-white rounded-2xl shadow-xl overflow-hidden" initial={{
        opacity: 0,
        y: 20
      }} whileInView={{
        opacity: 1,
        y: 0
      }} viewport={{
        once: true
      }} transition={{
        duration: 0.5
      }}>
          <div className="p-8 md:p-12 lg:p-16 flex flex-col md:flex-row items-center">
            <motion.div className="md:w-2/3 mb-8 md:mb-0 md:pr-8" initial={{
            opacity: 0,
            x: -20
          }} whileInView={{
            opacity: 1,
            x: 0
          }} viewport={{
            once: true
          }} transition={{
            duration: 0.5,
            delay: 0.2
          }}>
              <h2 className="text-3xl md:text-4xl font-bold mb-4 text-recruitment-primary">
                Ready to Transform Your Business?
              </h2>
              <p className="text-lg text-gray-600 mb-6">Partner with the Harries Group to find exceptional talent that will drive your business forward. Our team of specialists is ready to help you achieve your goals.</p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link to="/about" className="w-full sm:w-auto">
                  <motion.div whileHover={{
                  scale: 1.03
                }} whileTap={{
                  scale: 0.97
                }}>
                    <Button size={isMobile ? "default" : "lg"} className="bg-recruitment-primary hover:bg-recruitment-primary/90 text-white w-full sm:w-auto group">
                      Learn More About Us
                      <ArrowRight className="ml-1 group-hover:translate-x-1 transition-transform" />
                    </Button>
                  </motion.div>
                </Link>
                <Link to="/contact" className="w-full sm:w-auto">
                  <motion.div whileHover={{
                  scale: 1.03
                }} whileTap={{
                  scale: 0.97
                }}>
                    <Button size={isMobile ? "default" : "lg"} variant="outline" className="border-recruitment-primary bg-white text-recruitment-primary hover:bg-recruitment-primary hover:text-white w-full sm:w-auto">
                      Contact Our Team
                    </Button>
                  </motion.div>
                </Link>
              </div>
            </motion.div>
            <motion.div className="md:w-1/3 bg-recruitment-primary/5 p-6 md:p-8 rounded-xl border border-recruitment-primary/10" initial={{
            opacity: 0,
            x: 20
          }} whileInView={{
            opacity: 1,
            x: 0
          }} viewport={{
            once: true
          }} transition={{
            duration: 0.5,
            delay: 0.4
          }} whileHover={{
            y: -5
          }}>
              <h3 className="text-xl font-semibold mb-4 text-recruitment-primary">
                Get in Touch
              </h3>
              <div className="space-y-4">
                <motion.div className="flex items-center" whileHover={{
                x: 3
              }} transition={{
                type: "spring",
                stiffness: 400,
                damping: 17
              }}>
                  <div className="bg-recruitment-primary/10 p-2 rounded-full mr-3">
                    <PhoneCall className="text-recruitment-primary" size={20} />
                  </div>
                  <span className="text-gray-700">04 267 2726</span>
                </motion.div>
                <motion.div className="flex items-center" whileHover={{
                x: 3
              }} transition={{
                type: "spring",
                stiffness: 400,
                damping: 17
              }}>
                  <div className="bg-recruitment-primary/10 p-2 rounded-full mr-3">
                    <Mail className="text-recruitment-primary" size={20} />
                  </div>
                  <a href="mailto:James@harriesgroup.com" className="text-gray-700 hover:text-recruitment-primary transition-colors">
                    James@harriesgroup.com
                  </a>
                </motion.div>
              </div>
              <div className="mt-6 pt-6 border-t border-gray-200">
                <p className="text-gray-600 text-sm">
                  Harries Centre<br />
                  Swansea Enterprise Park<br />
                  Swansea, SA6 8QF
                </p>
              </div>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>;
};
export default CallToAction;