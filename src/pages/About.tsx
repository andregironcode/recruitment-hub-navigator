
import React from 'react';
import Layout from '@/components/layout/Layout';
import { Card, CardContent } from '@/components/ui/card';
import { Award, Users, Target, Heart } from 'lucide-react';

const About = () => {
  return (
    <Layout>
      {/* Hero section */}
      <div className="bg-recruitment-primary text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <h1 className="text-4xl font-bold mb-6">About Harries Recruitment</h1>
            <p className="text-xl opacity-90">
              Founded in 2005, Harries Recruitment has established itself as a leading recruitment agency, 
              connecting top talent with exceptional companies across multiple industries.
            </p>
          </div>
        </div>
      </div>

      {/* Our story section */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold mb-6 text-recruitment-dark">Our Story</h2>
              <p className="text-gray-600 mb-4">
                Harries Recruitment was founded by Jane Harries, who after 15 years in corporate HR, 
                recognized a gap in the recruitment market. She envisioned a recruitment agency that 
                would focus not just on matching skills and experience, but on understanding company 
                cultures and candidates' career aspirations to make truly successful placements.
              </p>
              <p className="text-gray-600 mb-4">
                Starting with just three employees specializing in the technology sector, we have since 
                grown to a team of over 50 recruitment specialists covering multiple industries including 
                finance, healthcare, engineering, marketing, and retail.
              </p>
              <p className="text-gray-600">
                Today, Harries Recruitment operates internationally, with offices in London, Manchester, 
                Edinburgh, and Dublin, serving clients ranging from innovative startups to multinational 
                corporations.
              </p>
            </div>
            <div className="bg-recruitment-light rounded-lg p-8">
              <div className="space-y-6">
                <div>
                  <h3 className="text-xl font-semibold mb-2 text-recruitment-primary">2005</h3>
                  <p className="text-gray-600">Founded in London, focusing on technology recruitment</p>
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-2 text-recruitment-primary">2010</h3>
                  <p className="text-gray-600">Expanded to finance and healthcare sectors</p>
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-2 text-recruitment-primary">2013</h3>
                  <p className="text-gray-600">Opened offices in Manchester and Edinburgh</p>
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-2 text-recruitment-primary">2018</h3>
                  <p className="text-gray-600">Launched international operations with Dublin office</p>
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-2 text-recruitment-primary">Today</h3>
                  <p className="text-gray-600">50+ specialists covering 6 major industries</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Our values section */}
      <section className="py-16 bg-recruitment-light">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center mb-12 text-recruitment-dark">Our Values</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="bg-white border-t-4 border-t-recruitment-primary">
              <CardContent className="p-6">
                <div className="text-recruitment-primary mb-4">
                  <Target size={32} />
                </div>
                <h3 className="text-xl font-semibold mb-2 text-recruitment-dark">Excellence</h3>
                <p className="text-gray-600">
                  We strive for excellence in everything we do, from candidate screening to client service.
                </p>
              </CardContent>
            </Card>
            
            <Card className="bg-white border-t-4 border-t-recruitment-primary">
              <CardContent className="p-6">
                <div className="text-recruitment-primary mb-4">
                  <Heart size={32} />
                </div>
                <h3 className="text-xl font-semibold mb-2 text-recruitment-dark">Integrity</h3>
                <p className="text-gray-600">
                  We operate with honesty and transparency, building trust with both clients and candidates.
                </p>
              </CardContent>
            </Card>
            
            <Card className="bg-white border-t-4 border-t-recruitment-primary">
              <CardContent className="p-6">
                <div className="text-recruitment-primary mb-4">
                  <Users size={32} />
                </div>
                <h3 className="text-xl font-semibold mb-2 text-recruitment-dark">Collaboration</h3>
                <p className="text-gray-600">
                  We work closely with our clients and candidates to understand their unique needs and goals.
                </p>
              </CardContent>
            </Card>
            
            <Card className="bg-white border-t-4 border-t-recruitment-primary">
              <CardContent className="p-6">
                <div className="text-recruitment-primary mb-4">
                  <Award size={32} />
                </div>
                <h3 className="text-xl font-semibold mb-2 text-recruitment-dark">Innovation</h3>
                <p className="text-gray-600">
                  We embrace new technologies and approaches to stay at the forefront of recruitment.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Team section */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center mb-12 text-recruitment-dark">Our Leadership Team</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-gray-200 w-48 h-48 rounded-full mx-auto mb-4 flex items-center justify-center">
                <span className="text-recruitment-primary text-5xl font-light">JH</span>
              </div>
              <h3 className="text-xl font-semibold text-recruitment-dark">Jane Harries</h3>
              <p className="text-recruitment-primary mb-2">Founder & CEO</p>
              <p className="text-gray-600 max-w-xs mx-auto">
                25+ years of recruitment and HR experience across multiple industries.
              </p>
            </div>
            
            <div className="text-center">
              <div className="bg-gray-200 w-48 h-48 rounded-full mx-auto mb-4 flex items-center justify-center">
                <span className="text-recruitment-primary text-5xl font-light">MT</span>
              </div>
              <h3 className="text-xl font-semibold text-recruitment-dark">Mark Thompson</h3>
              <p className="text-recruitment-primary mb-2">Operations Director</p>
              <p className="text-gray-600 max-w-xs mx-auto">
                15+ years of experience in recruitment operations and business development.
              </p>
            </div>
            
            <div className="text-center">
              <div className="bg-gray-200 w-48 h-48 rounded-full mx-auto mb-4 flex items-center justify-center">
                <span className="text-recruitment-primary text-5xl font-light">SP</span>
              </div>
              <h3 className="text-xl font-semibold text-recruitment-dark">Sarah Patel</h3>
              <p className="text-recruitment-primary mb-2">Technology Recruitment Lead</p>
              <p className="text-gray-600 max-w-xs mx-auto">
                Specialist in tech recruitment with expertise in AI and software development roles.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-recruitment-primary text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-6">Join Our Journey</h2>
          <p className="text-xl mb-8 max-w-3xl mx-auto opacity-90">
            Whether you're a candidate looking for your next opportunity or a company seeking top talent,
            we're here to help you succeed.
          </p>
          <div className="flex justify-center space-x-4">
            <a href="/contact" className="bg-white text-recruitment-primary px-6 py-3 rounded-md font-medium hover:bg-gray-100 transition-colors">
              Contact Us
            </a>
            <a href="/jobs" className="border border-white text-white px-6 py-3 rounded-md font-medium hover:bg-white/10 transition-colors">
              View Jobs
            </a>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default About;
