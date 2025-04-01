
import { Job } from '@/components/jobs/JobList';
import { JobSearchFilters } from '@/components/jobs/JobSearch';

// Mock data for jobs
const jobsData: Job[] = [
  {
    id: 1,
    title: "Senior Full Stack Developer",
    company: "TechFusion Inc.",
    location: "London, UK (Hybrid)",
    salary: "£75,000 - £90,000",
    jobType: "Full-Time",
    industry: "Technology",
    description: "We are seeking an experienced Full Stack Developer to join our growing team. You will be responsible for developing and maintaining web applications, working with both front-end and back-end technologies. The ideal candidate has experience with React, Node.js, and cloud platforms.",
    postedDate: "2 days ago",
    featured: true
  },
  {
    id: 2,
    title: "Financial Analyst",
    company: "Global Banking Group",
    location: "Manchester, UK",
    salary: "£45,000 - £55,000",
    jobType: "Full-Time",
    industry: "Finance",
    description: "As a Financial Analyst, you will be responsible for analyzing financial data, preparing reports, and providing insights to help drive business decisions. The ideal candidate will have strong analytical skills and experience with financial modeling.",
    postedDate: "3 days ago",
    featured: false
  },
  {
    id: 3,
    title: "Marketing Manager",
    company: "Brand Innovators",
    location: "Remote (UK-based)",
    salary: "£50,000 - £65,000",
    jobType: "Full-Time",
    industry: "Marketing",
    description: "We are looking for a talented Marketing Manager to lead our marketing efforts. You will be responsible for developing and implementing marketing strategies, managing campaigns, and analyzing results. The ideal candidate has experience with digital marketing and brand management.",
    postedDate: "1 week ago",
    featured: true
  },
  {
    id: 4,
    title: "Registered Nurse",
    company: "City Healthcare Trust",
    location: "Edinburgh, UK",
    salary: "£32,000 - £38,000",
    jobType: "Full-Time",
    industry: "Healthcare",
    description: "Join our dedicated team of healthcare professionals as a Registered Nurse. You will provide high-quality patient care, administer medications, and collaborate with other healthcare providers. The ideal candidate is compassionate, detail-oriented, and has relevant nursing qualifications.",
    postedDate: "2 weeks ago",
    featured: false
  },
  {
    id: 5,
    title: "Mechanical Engineer",
    company: "Engineering Solutions Ltd",
    location: "Birmingham, UK",
    salary: "£45,000 - £60,000",
    jobType: "Full-Time",
    industry: "Engineering",
    description: "We are looking for a Mechanical Engineer to join our team. You will be involved in designing, developing, and testing mechanical systems and components. The ideal candidate has experience with CAD software and a strong understanding of mechanical principles.",
    postedDate: "3 days ago",
    featured: false
  },
  {
    id: 6,
    title: "Part-Time Sales Associate",
    company: "Luxury Retail Group",
    location: "London, UK",
    salary: "£12 - £15 per hour",
    jobType: "Part-Time",
    industry: "Retail",
    description: "Join our team as a Part-Time Sales Associate. You will assist customers, process sales, and maintain the store's appearance. The ideal candidate has excellent customer service skills and is available to work weekends and evenings.",
    postedDate: "1 week ago",
    featured: false
  },
  {
    id: 7,
    title: "UX/UI Designer",
    company: "Digital Creations",
    location: "Remote (UK-based)",
    salary: "£50,000 - £65,000",
    jobType: "Contract",
    industry: "Technology",
    description: "We are seeking a talented UX/UI Designer to create engaging user experiences for our digital products. You will conduct user research, create wireframes and prototypes, and collaborate with developers to implement designs. The ideal candidate has a strong portfolio showcasing user-centered design principles.",
    postedDate: "5 days ago",
    featured: true
  },
  {
    id: 8,
    title: "Project Manager",
    company: "Construct Partners",
    location: "Leeds, UK",
    salary: "£55,000 - £70,000",
    jobType: "Full-Time",
    industry: "Engineering",
    description: "As a Project Manager, you will be responsible for planning, executing, and closing construction projects. You will coordinate with clients, contractors, and internal teams to ensure projects are delivered on time and within budget. The ideal candidate has experience in construction project management and strong leadership skills.",
    postedDate: "2 weeks ago",
    featured: false
  },
  {
    id: 9,
    title: "Data Scientist",
    company: "Analytics Solutions",
    location: "Cambridge, UK (Hybrid)",
    salary: "£65,000 - £80,000",
    jobType: "Full-Time",
    industry: "Technology",
    description: "We are looking for a skilled Data Scientist to join our analytics team. You will analyze complex data sets, develop predictive models, and communicate insights to stakeholders. The ideal candidate has experience with statistical analysis, machine learning, and data visualization tools.",
    postedDate: "4 days ago",
    featured: false
  },
  {
    id: 10,
    title: "HR Business Partner",
    company: "Corporate Services Inc.",
    location: "Glasgow, UK",
    salary: "£45,000 - £55,000",
    jobType: "Full-Time",
    industry: "Human Resources",
    description: "As an HR Business Partner, you will work closely with department leaders to develop and implement HR initiatives that support business objectives. You will provide guidance on employee relations, performance management, and talent development. The ideal candidate has experience in HR generalist roles and strong interpersonal skills.",
    postedDate: "1 week ago",
    featured: false
  }
];

// Get all jobs
export const getAllJobs = (): Promise<Job[]> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(jobsData);
    }, 300);
  });
};

// Get job by ID
export const getJobById = (id: number): Promise<Job | undefined> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const job = jobsData.find(job => job.id === id);
      resolve(job);
    }, 300);
  });
};

// Filter jobs based on search criteria
export const filterJobs = (filters: JobSearchFilters): Promise<Job[]> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      let filteredJobs = [...jobsData];
      
      // Filter by keyword (in title, company, or description)
      if (filters.keyword) {
        const keyword = filters.keyword.toLowerCase();
        filteredJobs = filteredJobs.filter(job => 
          job.title.toLowerCase().includes(keyword) ||
          job.company.toLowerCase().includes(keyword) ||
          job.description.toLowerCase().includes(keyword)
        );
      }
      
      // Filter by location
      if (filters.location) {
        const location = filters.location.toLowerCase();
        filteredJobs = filteredJobs.filter(job => 
          job.location.toLowerCase().includes(location)
        );
      }
      
      // Filter by industry
      if (filters.industry) {
        const industry = filters.industry.toLowerCase();
        filteredJobs = filteredJobs.filter(job => 
          job.industry.toLowerCase() === industry
        );
      }
      
      // Filter by job type
      if (filters.jobType) {
        const jobType = filters.jobType.toLowerCase();
        filteredJobs = filteredJobs.filter(job => 
          job.jobType.toLowerCase() === jobType
        );
      }
      
      resolve(filteredJobs);
    }, 500);
  });
};

// Admin functions for managing jobs

// Add a new job
export const addJob = (job: Omit<Job, 'id'>): Promise<Job> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const newId = Math.max(...jobsData.map(job => job.id)) + 1;
      const newJob = { ...job, id: newId };
      jobsData.push(newJob);
      resolve(newJob);
    }, 300);
  });
};

// Update an existing job
export const updateJob = (updatedJob: Job): Promise<Job> => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const index = jobsData.findIndex(job => job.id === updatedJob.id);
      if (index !== -1) {
        jobsData[index] = updatedJob;
        resolve(updatedJob);
      } else {
        reject(new Error('Job not found'));
      }
    }, 300);
  });
};

// Delete a job
export const deleteJob = (id: number): Promise<boolean> => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const index = jobsData.findIndex(job => job.id === id);
      if (index !== -1) {
        jobsData.splice(index, 1);
        resolve(true);
      } else {
        reject(new Error('Job not found'));
      }
    }, 300);
  });
};
