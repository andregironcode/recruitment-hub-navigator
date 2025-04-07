
import React from 'react';
import Layout from '@/components/layout/Layout';
import HeroBanner from '@/components/home/HeroBanner';
import AboutSection from '@/components/home/AboutSection';
import TeamSection from '@/components/home/TeamSection';
import VisionSection from '@/components/home/VisionSection';
import CallToAction from '@/components/home/CallToAction';
import CompanyStats from '@/components/home/CompanyStats';
import IndustryCards from '@/components/home/IndustryCards';
import Testimonials from '@/components/home/Testimonials';
import RecentJobs from '@/components/home/RecentJobs';
import ValueProposition from '@/components/home/ValueProposition';

const Index = () => {
  return (
    <Layout>
      <HeroBanner />
      <CompanyStats />
      <AboutSection />
      <RecentJobs />
      <IndustryCards />
      <TeamSection />
      <Testimonials />
      <VisionSection />
      <CallToAction />
    </Layout>
  );
};

export default Index;
