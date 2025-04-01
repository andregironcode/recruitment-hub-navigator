
import { Job } from '@/components/jobs/JobList';
import { JobSearchFilters } from '@/components/jobs/JobSearch';

// Mock data for categories
const categoriesData = [
  {
    id: 1,
    name: 'Information Technology',
    description: 'Software development, IT support, cybersecurity, and technical leadership roles.',
    jobCount: 4
  },
  {
    id: 2,
    name: 'Finance & Banking',
    description: 'Banking, accounting, financial analysis, and senior finance leadership positions.',
    jobCount: 2
  },
  {
    id: 3,
    name: 'Engineering',
    description: 'Civil, mechanical, electrical engineering and technical design positions.',
    jobCount: 2
  },
  {
    id: 4,
    name: 'Marketing & Sales',
    description: 'Sales executives, digital marketing specialists, and brand management roles.',
    jobCount: 1
  },
  {
    id: 5,
    name: 'Healthcare',
    description: 'Medical, nursing, administrative, and healthcare management positions.',
    jobCount: 1
  }
];

// Mock data for applications
const applicationsData = [
  {
    id: 1,
    jobId: 1,
    jobTitle: "Senior Full Stack Developer",
    applicantName: "John Smith",
    email: "john.smith@example.com",
    phone: "07712 345678",
    resumeUrl: "https://example.com/resume.pdf",
    coverLetter: "I am excited to apply for the Senior Full Stack Developer position at TechFusion Inc. With over 8 years of experience in full-stack development, I have a proven track record of building scalable web applications using React, Node.js, and cloud technologies.\n\nMy experience includes leading development teams, designing system architectures, and implementing CI/CD pipelines. I am particularly interested in working at TechFusion because of your commitment to innovation and your work in AI-driven applications.\n\nI look forward to discussing how my skills align with your team's needs.",
    status: "new",
    dateApplied: "2 days ago"
  },
  {
    id: 2,
    jobId: 1,
    jobTitle: "Senior Full Stack Developer",
    applicantName: "Emily Johnson",
    email: "emily.johnson@example.com",
    phone: "07723 456789",
    resumeUrl: "https://example.com/resume.pdf",
    coverLetter: "Dear Hiring Manager,\n\nI am writing to express my interest in the Senior Full Stack Developer position at TechFusion Inc. I have 6 years of experience developing web applications using modern JavaScript frameworks, with a focus on React and Node.js.\n\nIn my current role at InnoTech Solutions, I've led the development of an e-commerce platform that serves over 100,000 users monthly. I'm particularly proud of implementing a microservices architecture that improved system reliability by 40%.\n\nI am excited about the opportunity to bring my technical expertise and leadership skills to your innovative team.",
    status: "reviewed",
    dateApplied: "3 days ago"
  },
  {
    id: 3,
    jobId: 3,
    jobTitle: "Marketing Manager",
    applicantName: "David Williams",
    email: "david.williams@example.com",
    phone: "07734 567890",
    resumeUrl: "https://example.com/resume.pdf",
    coverLetter: "I am applying for the Marketing Manager position at Brand Innovators. With my 7+ years of experience in digital marketing and brand strategy, I believe I would be a valuable addition to your team.\n\nIn my current role at Global Marketing Associates, I've successfully increased our client's social media engagement by 150% and developed campaigns that generated a 35% increase in sales. I specialize in data-driven marketing strategies and have a proven ability to identify market trends and consumer behavior patterns.\n\nI'm particularly drawn to Brand Innovators because of your creative approach to marketing and your impressive client portfolio.",
    status: "interviewing",
    dateApplied: "1 week ago"
  },
  {
    id: 4,
    jobId: 7,
    jobTitle: "UX/UI Designer",
    applicantName: "Sarah Thompson",
    email: "sarah.thompson@example.com",
    phone: "07745 678901",
    resumeUrl: "https://example.com/resume.pdf",
    coverLetter: "I am excited to apply for the UX/UI Designer position at Digital Creations. As a designer with 5 years of experience creating user-centered digital experiences, I believe my skills align perfectly with your needs.\n\nMy portfolio includes work for clients across various industries, from fintech to e-commerce. I pride myself on creating designs that not only look beautiful but also solve real user problems and drive business results.\n\nI am particularly impressed by Digital Creations' focus on accessible design and your recent award-winning work for Charity Navigator. I would be thrilled to contribute to such meaningful projects.",
    status: "offered",
    dateApplied: "5 days ago"
  },
  {
    id: 5,
    jobId: 2,
    jobTitle: "Financial Analyst",
    applicantName: "Michael Brown",
    email: "michael.brown@example.com",
    phone: "07756 789012",
    resumeUrl: "https://example.com/resume.pdf",
    coverLetter: "I am writing to express my interest in the Financial Analyst position at Global Banking Group. With a master's degree in Finance and 3 years of experience in financial analysis and reporting, I am confident in my ability to contribute to your team.\n\nIn my current role at Investment Partners LLC, I develop financial models that have helped identify investment opportunities with a combined value of over £20 million. I am adept at analyzing complex financial data and presenting insights in a clear, actionable manner.\n\nI am particularly interested in joining Global Banking Group due to your reputation for excellence and your commitment to sustainable finance.",
    status: "rejected",
    dateApplied: "1 week ago"
  }
];

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
    featured: true,
    category: "Information Technology"
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
    featured: false,
    category: "Finance & Banking"
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
    featured: true,
    category: "Marketing & Sales"
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
    featured: false,
    category: "Healthcare"
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
    featured: false,
    category: "Engineering"
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
    featured: false,
    category: "Marketing & Sales"
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
    featured: true,
    category: "Information Technology"
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
    featured: false,
    category: "Engineering"
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
    featured: false,
    category: "Information Technology"
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
    featured: false,
    category: "Information Technology"
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

      // Filter by category
      if (filters.category) {
        filteredJobs = filteredJobs.filter(job => 
          job.category === filters.category
        );
      }
      
      resolve(filteredJobs);
    }, 500);
  });
};

// Get all categories
export const getAllCategories = (): Promise<any[]> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      // Update job counts
      const updatedCategories = categoriesData.map(category => {
        const count = jobsData.filter(job => job.category === category.name).length;
        return {...category, jobCount: count};
      });
      resolve(updatedCategories);
    }, 300);
  });
};

// Add a new category
export const addCategory = (category: Omit<any, 'id' | 'jobCount'>): Promise<any> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const newId = Math.max(...categoriesData.map(cat => cat.id), 0) + 1;
      const newCategory = { 
        ...category, 
        id: newId, 
        jobCount: 0 
      };
      categoriesData.push(newCategory);
      resolve(newCategory);
    }, 300);
  });
};

// Delete a category
export const deleteCategory = (id: number): Promise<boolean> => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const index = categoriesData.findIndex(category => category.id === id);
      if (index !== -1) {
        const categoryName = categoriesData[index].name;
        
        // Update jobs that have this category
        jobsData.forEach(job => {
          if (job.category === categoryName) {
            job.category = undefined;
          }
        });
        
        categoriesData.splice(index, 1);
        resolve(true);
      } else {
        reject(new Error('Category not found'));
      }
    }, 300);
  });
};

// Get all applications
export const getAllApplications = (): Promise<any[]> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(applicationsData);
    }, 300);
  });
};

// Update application status
export const updateApplicationStatus = (id: number, status: string): Promise<boolean> => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const index = applicationsData.findIndex(app => app.id === id);
      if (index !== -1) {
        applicationsData[index].status = status;
        resolve(true);
      } else {
        reject(new Error('Application not found'));
      }
    }, 300);
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
      
      // Update category job count
      if (job.category) {
        const categoryIndex = categoriesData.findIndex(cat => cat.name === job.category);
        if (categoryIndex !== -1) {
          categoriesData[categoryIndex].jobCount += 1;
        }
      }
      
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
        // If category changed, update category counts
        const oldCategory = jobsData[index].category;
        const newCategory = updatedJob.category;
        
        if (oldCategory !== newCategory) {
          // Decrease old category count
          if (oldCategory) {
            const oldCategoryIndex = categoriesData.findIndex(cat => cat.name === oldCategory);
            if (oldCategoryIndex !== -1 && categoriesData[oldCategoryIndex].jobCount > 0) {
              categoriesData[oldCategoryIndex].jobCount -= 1;
            }
          }
          
          // Increase new category count
          if (newCategory) {
            const newCategoryIndex = categoriesData.findIndex(cat => cat.name === newCategory);
            if (newCategoryIndex !== -1) {
              categoriesData[newCategoryIndex].jobCount += 1;
            }
          }
        }
        
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
        // Update category count if job had a category
        const category = jobsData[index].category;
        if (category) {
          const categoryIndex = categoriesData.findIndex(cat => cat.name === category);
          if (categoryIndex !== -1 && categoriesData[categoryIndex].jobCount > 0) {
            categoriesData[categoryIndex].jobCount -= 1;
          }
        }
        
        jobsData.splice(index, 1);
        resolve(true);
      } else {
        reject(new Error('Job not found'));
      }
    }, 300);
  });
};
