import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { motion } from 'framer-motion';
const AboutSection = () => {
  const coreValues = [{
    title: 'Integrity',
    description: 'We maintain the highest ethical standards in all our dealings with clients, candidates, and partners.'
  }, {
    title: 'Innovation',
    description: 'Our creative thinking and fresh approaches deliver unique solutions to complex talent challenges.'
  }, {
    title: 'Partnership',
    description: 'We build lasting relationships based on trust, transparency, and mutual success.'
  }];
  return <section className="py-16 md:py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div className="flex flex-col lg:flex-row items-center gap-12 mb-16" initial={{
        opacity: 0
      }} whileInView={{
        opacity: 1
      }} viewport={{
        once: true
      }} transition={{
        duration: 0.7
      }}>
          <div className="lg:w-1/2">
          <motion.h2 className="text-3xl md:text-4xl font-bold text-recruitment-primary mb-6" initial={{
            opacity: 0,
            y: 20
          }} whileInView={{
            opacity: 1,
            y: 0
          }} viewport={{
            once: true
          }} transition={{
            duration: 0.5,
            delay: 0.1
          }}>About Harries Recruit</motion.h2>
            
            <motion.div className="space-y-4" initial={{
            opacity: 0,
            y: 20
          }} whileInView={{
            opacity: 1,
            y: 0
          }} viewport={{
            once: true
          }} transition={{
            duration: 0.5,
            delay: 0.2
          }}>
              <p className="text-lg text-gray-600">
                Founded by James Harries, Harries Recruitment was built from a passion for connecting exceptional talent with leading real estate firms across Dubai.
              </p>
              
              <div className="h-1 w-20 bg-recruitment-primary/30 rounded-full my-6"></div>
              
              <p className="text-lg text-gray-600">
                Having lived in Dubai for over 20 years, James brings a deep understanding of the city's real estate market and its people. With more than five years of experience in executive real estate recruitment, he has partnered with over 100 firms across the UAE — successfully placing candidates in roles ranging from administrative support to senior leadership and C-suite positions.
              </p>
              
              <p className="text-lg text-gray-600">
                What sets Harries Recruitment apart is our personal approach. We go beyond simply matching skills to job titles — we focus on understanding company culture, long-term potential, and the ambitions that drive both clients and candidates.
              </p>
              
              <p className="text-lg text-gray-600">
                We're proud to be a boutique recruitment partner that values relationships over transactions — helping firms find the talent that truly moves their business forward.
              </p>
            </motion.div>
          </div>
          
          <motion.div className="lg:w-1/2 relative" initial={{
          opacity: 0,
          scale: 0.9
        }} whileInView={{
          opacity: 1,
          scale: 1
        }} viewport={{
          once: true
        }} transition={{
          duration: 0.7,
          delay: 0.3
        }}>
            <div className="aspect-video bg-gradient-to-br from-recruitment-primary/10 to-recruitment-primary/30 rounded-2xl overflow-hidden shadow-lg relative">
              <div className="absolute inset-0 flex items-center justify-center">
                <img src="https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=2000&q=80" alt="Team of professionals collaborating" className="w-full h-full object-cover" />
              </div>
              <div className="absolute inset-0 bg-gradient-to-t from-recruitment-primary/40 to-transparent"></div>
              <div className="absolute bottom-6 left-6 right-6 text-white">
                <h3 className="text-2xl font-semibold mb-2">Our Mission</h3>
                <p className="text-white/90">Connecting exceptional talent with innovative organizations to create lasting partnerships.</p>
              </div>
            </div>
            <div className="absolute -bottom-4 -right-4 w-24 h-24 bg-recruitment-accent rounded-full opacity-30 blur-xl"></div>
          </motion.div>
        </motion.div>
        
        <motion.div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12" initial={{
        opacity: 0
      }} whileInView={{
        opacity: 1
      }} viewport={{
        once: true
      }} transition={{
        duration: 0.5,
        staggerChildren: 0.1
      }}>
          {coreValues.map((value, index) => <motion.div key={value.title} initial={{
          opacity: 0,
          y: 20
        }} whileInView={{
          opacity: 1,
          y: 0
        }} viewport={{
          once: true
        }} transition={{
          duration: 0.5,
          delay: index * 0.1
        }} whileHover={{
          y: -5,
          boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1)"
        }}>
              <Card className="h-full border-2 border-transparent hover:border-recruitment-primary/20 transition-all duration-300">
                <CardContent className="p-6 text-center h-full flex flex-col">
                  <h3 className="text-xl font-bold text-recruitment-primary mb-3">{value.title}</h3>
                  <div className="h-1 w-12 bg-recruitment-primary/40 mx-auto mb-4 rounded-full"></div>
                  <p className="text-gray-600 flex-grow">{value.description}</p>
                </CardContent>
              </Card>
            </motion.div>)}
        </motion.div>
      </div>
    </section>;
};
export default AboutSection;