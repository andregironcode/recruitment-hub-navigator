
import React from 'react';
import Layout from '@/components/layout/Layout';
import HeroBanner from '@/components/home/HeroBanner';
import IndustryCards from '@/components/home/IndustryCards';
import CompanyStats from '@/components/home/CompanyStats';
import Testimonials from '@/components/home/Testimonials';
import CallToAction from '@/components/home/CallToAction';
import RecentJobs from '@/components/home/RecentJobs';

const Index = () => {
  return (
    <Layout>
      <HeroBanner />
      <CompanyStats />
      <RecentJobs />
      <IndustryCards />
      <Testimonials />
      <CallToAction />
    </Layout>
  );
};

export default Index;
