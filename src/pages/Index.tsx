
import React from 'react';
import Layout from '@/components/layout/Layout';
import HeroBanner from '@/components/home/HeroBanner';
import AboutSection from '@/components/home/AboutSection';
import ServiceClusters from '@/components/home/ServiceClusters';
import TeamSection from '@/components/home/TeamSection';
import ValueProposition from '@/components/home/ValueProposition';
import VisionSection from '@/components/home/VisionSection';
import CallToAction from '@/components/home/CallToAction';

const Index = () => {
  return (
    <Layout>
      <HeroBanner />
      <AboutSection />
      <ServiceClusters />
      <TeamSection />
      <ValueProposition />
      <VisionSection />
      <CallToAction />
    </Layout>
  );
};

export default Index;
