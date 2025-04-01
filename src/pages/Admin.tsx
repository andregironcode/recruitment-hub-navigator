import React, { useState, useEffect } from 'react';
import Layout from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue 
} from '@/components/ui/select';
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from '@/components/ui/tabs';
import { 
  Briefcase, 
  Plus, 
  Edit, 
  Trash2,
  CheckCircle,
  XCircle,
  Tag,
  Mail,
  User,
  FileText,
  Search,
  Filter
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Job } from '@/components/jobs/JobList';
import { Form, FormField, FormItem, FormLabel, FormControl } from '@/components/ui/form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { 
  getAllJobs, 
  addJob, 
  updateJob, 
  deleteJob, 
  getAllCategories,
  addCategory,
  deleteCategory,
  getAllApplications,
  updateApplicationStatus
} from '@/services/jobService';

// Application type
interface Application {
  id: number;
  jobId: number;
  jobTitle: string;
  applicantName: string;
  email: string;
  phone: string;
  resumeUrl: string;
  coverLetter: string;
  status: 'new' | 'reviewed' | 'interviewing' | 'rejected' | 'offered' | 'hired';
  dateApplied: string;
}

// Category type
interface Category {
  id: number;
  name: string;
  description: string;
  jobCount: number;
}

// Job filters schema
const jobFiltersSchema = z.object({
  searchTerm: z.string().optional(),
  jobType: z.string().optional(),
  industry: z.string().optional(),
  featured: z.string().optional(),
  category: z.string().optional(),
});

// Application filters schema
const applicationFiltersSchema = z.object({
  searchTerm: z.string().optional(),
  status: z.string().optional(),
  dateRange: z.string().optional(),
});

const Admin = () => {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [filteredJobs, setFilteredJobs] = useState<Job[]>([]);
  const [applications, setApplications] = useState<Application[]>([]);
  const [filteredApplications, setFilteredApplications] = useState<Application[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [job, setJob] = useState<Partial<Job>>({
    title: '',
    company: '',
    location: '',
    salary: '',
    jobType: 'Full-Time',
    industry: 'Technology',
    description: '',
    postedDate: 'Today',
    featured: false
  });
  const [category, setCategory] = useState<Partial<Category>>({
    name: '',
    description: ''
  });
  const [editingJob, setEditingJob] = useState<Job | null>(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [openCategoryDialog, setOpenCategoryDialog] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [deleteCategoryConfirmOpen, setDeleteCategoryConfirmOpen] = useState(false);
  const [jobToDelete, setJobToDelete] = useState<number | null>(null);
  const [categoryToDelete, setCategoryToDelete] = useState<number | null>(null);
  const [applicationViewOpen, setApplicationViewOpen] = useState(false);
  const [selectedApplication, setSelectedApplication] = useState<Application | null>(null);
  const [jobFiltersOpen, setJobFiltersOpen] = useState(false);
  const [applicationFiltersOpen, setApplicationFiltersOpen] = useState(false);
  const { toast } = useToast();
  
  const jobFiltersForm = useForm<z.infer<typeof jobFiltersSchema>>({
    resolver: zodResolver(jobFiltersSchema),
    defaultValues: {
      searchTerm: '',
      jobType: '',
      industry: '',
      featured: '',
      category: '',
    },
  });

  const applicationFiltersForm = useForm<z.infer<typeof applicationFiltersSchema>>({
    resolver: zodResolver(applicationFiltersSchema),
    defaultValues: {
      searchTerm: '',
      status: '',
      dateRange: '',
    },
  });
  
  // Simplified mock login for demo purposes
  const [credentials, setCredentials] = useState({
    email: '',
    password: ''
  });
  
  useEffect(() => {
    if (isAuthenticated) {
      loadJobs();
      loadCategories();
      loadApplications();
    }
  }, [isAuthenticated]);
  
  const loadJobs = async () => {
    setLoading(true);
    try {
      const jobsData = await getAllJobs();
      setJobs(jobsData);
      setFilteredJobs(jobsData);
    } catch (error) {
      console.error('Error loading jobs:', error);
      toast({
        title: 'Error',
        description: 'Failed to load jobs. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const loadCategories = async () => {
    try {
      const categoriesData = await getAllCategories();
      setCategories(categoriesData);
    } catch (error) {
      console.error('Error loading categories:', error);
      toast({
        title: 'Error',
        description: 'Failed to load categories. Please try again.',
        variant: 'destructive'
      });
    }
  };

  const loadApplications = async () => {
    try {
      const applicationsData = await getAllApplications();
      setApplications(applicationsData);
      setFilteredApplications(applicationsData);
    } catch (error) {
      console.error('Error loading applications:', error);
      toast({
        title: 'Error',
        description: 'Failed to load applications. Please try again.',
        variant: 'destructive'
      });
    }
  };
  
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // Mock login - in a real app, this would validate against a backend
    if (credentials.email === 'admin@harriesrecruitment.com' && credentials.password === 'admin123') {
      setIsAuthenticated(true);
      toast({
        title: 'Login Successful',
        description: 'Welcome to the admin dashboard!',
      });
    } else {
      toast({
        title: 'Login Failed',
        description: 'Invalid credentials. Please try again.',
        variant: 'destructive'
      });
    }
  };
  
  const handleInputChange = (field: string, value: string | boolean) => {
    if (editingJob) {
      setEditingJob({
        ...editingJob,
        [field]: value
      });
    } else {
      setJob({
        ...job,
        [field]: value
      });
    }
  };

  const handleCategoryInputChange = (field: string, value: string) => {
    setCategory({
      ...category,
      [field]: value
    });
  };
  
  const handleAddJob = async () => {
    try {
      // In a real app, these would be validated more thoroughly
      if (!job.title || !job.company || !job.location || !job.salary || !job.description) {
        toast({
          title: 'Validation Error',
          description: 'Please fill in all required fields.',
          variant: 'destructive'
        });
        return;
      }
      
      await addJob(job as Omit<Job, 'id'>);
      setJob({
        title: '',
        company: '',
        location: '',
        salary: '',
        jobType: 'Full-Time',
        industry: 'Technology',
        description: '',
        postedDate: 'Today',
        featured: false
      });
      setOpenDialog(false);
      loadJobs();
      
      toast({
        title: 'Job Added',
        description: 'The job has been successfully added.',
      });
    } catch (error) {
      console.error('Error adding job:', error);
      toast({
        title: 'Error',
        description: 'Failed to add job. Please try again.',
        variant: 'destructive'
      });
    }
  };

  const handleAddCategory = async () => {
    try {
      if (!category.name || !category.description) {
        toast({
          title: 'Validation Error',
          description: 'Please fill in all required fields.',
          variant: 'destructive'
        });
        return;
      }
      
      await addCategory(category as Omit<Category, 'id' | 'jobCount'>);
      setCategory({
        name: '',
        description: ''
      });
      setOpenCategoryDialog(false);
      loadCategories();
      
      toast({
        title: 'Category Added',
        description: 'The category has been successfully added.',
      });
    } catch (error) {
      console.error('Error adding category:', error);
      toast({
        title: 'Error',
        description: 'Failed to add category. Please try again.',
        variant: 'destructive'
      });
    }
  };
  
  const handleUpdateJob = async () => {
    if (!editingJob) return;
    
    try {
      // In a real app, these would be validated more thoroughly
      if (!editingJob.title || !editingJob.company || !editingJob.location || !editingJob.salary || !editingJob.description) {
        toast({
          title: 'Validation Error',
          description: 'Please fill in all required fields.',
          variant: 'destructive'
        });
        return;
      }
      
      await updateJob(editingJob);
      setEditingJob(null);
      setOpenDialog(false);
      loadJobs();
      
      toast({
        title: 'Job Updated',
        description: 'The job has been successfully updated.',
      });
    } catch (error) {
      console.error('Error updating job:', error);
      toast({
        title: 'Error',
        description: 'Failed to update job. Please try again.',
        variant: 'destructive'
      });
    }
  };

  const handleUpdateApplicationStatus = async (id: number, status: Application['status']) => {
    try {
      await updateApplicationStatus(id, status);
      loadApplications();
      
      if (selectedApplication?.id === id) {
        setSelectedApplication({
          ...selectedApplication,
          status
        });
      }
      
      toast({
        title: 'Status Updated',
        description: 'The application status has been successfully updated.',
      });
    } catch (error) {
      console.error('Error updating application status:', error);
      toast({
        title: 'Error',
        description: 'Failed to update application status. Please try again.',
        variant: 'destructive'
      });
    }
  };
  
  const handleDeleteJob = async () => {
    if (jobToDelete === null) return;
    
    try {
      await deleteJob(jobToDelete);
      setDeleteConfirmOpen(false);
      setJobToDelete(null);
      loadJobs();
      
      toast({
        title: 'Job Deleted',
        description: 'The job has been successfully deleted.',
      });
    } catch (error) {
      console.error('Error deleting job:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete job. Please try again.',
        variant: 'destructive'
      });
    }
  };

  const handleDeleteCategory = async () => {
    if (categoryToDelete === null) return;
    
    try {
      await deleteCategory(categoryToDelete);
      setDeleteCategoryConfirmOpen(false);
      setCategoryToDelete(null);
      loadCategories();
      
      toast({
        title: 'Category Deleted',
        description: 'The category has been successfully deleted.',
      });
    } catch (error) {
      console.error('Error deleting category:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete category. Please try again.',
        variant: 'destructive'
      });
    }
  };
  
  const openEditDialog = (job: Job) => {
    setEditingJob(job);
    setOpenDialog(true);
  };
  
  const openAddDialog = () => {
    setEditingJob(null);
    setOpenDialog(true);
  };
  
  const openDeleteConfirm = (jobId: number) => {
    setJobToDelete(jobId);
    setDeleteConfirmOpen(true);
  };

  const openDeleteCategoryConfirm = (categoryId: number) => {
    setCategoryToDelete(categoryId);
    setDeleteCategoryConfirmOpen(true);
  };

  const openAddCategoryDialog = () => {
    setOpenCategoryDialog(true);
  };

  const viewApplication = (application: Application) => {
    setSelectedApplication(application);
    setApplicationViewOpen(true);
  };

  const getStatusBadgeColor = (status: Application['status']) => {
    switch(status) {
      case 'new': return 'bg-blue-500';
      case 'reviewed': return 'bg-purple-500';
      case 'interviewing': return 'bg-amber-500';
      case 'rejected': return 'bg-red-500';
      case 'offered': return 'bg-green-500';
      case 'hired': return 'bg-teal-500';
      default: return 'bg-gray-500';
    }
  };

  // Filter jobs
  const filterJobs = (values: z.infer<typeof jobFiltersSchema>) => {
    let filtered = [...jobs];
    
    if (values.searchTerm) {
      const term = values.searchTerm.toLowerCase();
      filtered = filtered.filter(job => 
        job.title.toLowerCase().includes(term) || 
        job.company.toLowerCase().includes(term) ||
        job.description.toLowerCase().includes(term)
      );
    }
    
    if (values.jobType) {
      filtered = filtered.filter(job => job.jobType === values.jobType);
    }
    
    if (values.industry) {
      filtered = filtered.filter(job => job.industry === values.industry);
    }
    
    if (values.featured === 'true') {
      filtered = filtered.filter(job => job.featured);
    } else if (values.featured === 'false') {
      filtered = filtered.filter(job => !job.featured);
    }
    
    if (values.category) {
      filtered = filtered.filter(job => job.category === values.category);
    }
    
    setFilteredJobs(filtered);
    setJobFiltersOpen(false);
  };

  // Filter applications
  const filterApplications = (values: z.infer<typeof applicationFiltersSchema>) => {
    let filtered = [...applications];
    
    if (values.searchTerm) {
      const term = values.searchTerm.toLowerCase();
      filtered = filtered.filter(app => 
        app.applicantName.toLowerCase().includes(term) || 
        app.jobTitle.toLowerCase().includes(term) ||
        app.email.toLowerCase().includes(term)
      );
    }
    
    if (values.status) {
      filtered = filtered.filter(app => app.status === values.status);
    }
    
    // Date range filtering would be implemented here
    
    setFilteredApplications(filtered);
    setApplicationFiltersOpen(false);
  };

  // Reset filters
  const resetJobFilters = () => {
    jobFiltersForm.reset();
    setFilteredJobs(jobs);
    setJobFiltersOpen(false);
  };

  const resetApplicationFilters = () => {
    applicationFiltersForm.reset();
    setFilteredApplications(applications);
    setApplicationFiltersOpen(false);
  };

  // Admin login form
  if (!isAuthenticated) {
    return (
      <Layout>
        <div className="bg-recruitment-light min-h-screen py-16">
          <div className="max-w-md mx-auto px-4">
            <Card>
              <CardHeader className="space-y-1">
                <CardTitle className="text-2xl font-bold text-center">Admin Login</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleLogin}>
                  <div className="space-y-4">
                    <div>
                      <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                        Email
                      </label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="admin@harriesrecruitment.com"
                        value={credentials.email}
                        onChange={(e) => setCredentials({...credentials, email: e.target.value})}
                        required
                      />
                    </div>
                    <div>
                      <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                        Password
                      </label>
                      <Input
                        id="password"
                        type="password"
                        placeholder="••••••••"
                        value={credentials.password}
                        onChange={(e) => setCredentials({...credentials, password: e.target.value})}
                        required
                      />
                      <div className="text-sm text-gray-500 mt-1">
                        For demo: admin@harriesrecruitment.com / admin123
                      </div>
                    </div>
                    <Button 
                      type="submit" 
                      className="w-full bg-recruitment-primary hover:bg-recruitment-primary/90"
                    >
                      Sign In
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="bg-recruitment-light min-h-screen py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold text-recruitment-dark">Admin Dashboard</h1>
            <Button 
              className="bg-recruitment-primary hover:bg-recruitment-primary/90"
              onClick={() => setIsAuthenticated(false)}
            >
              Logout
            </Button>
          </div>
          
          <Tabs defaultValue="jobs">
            <TabsList className="mb-8">
              <TabsTrigger value="jobs">Jobs Management</TabsTrigger>
              <TabsTrigger value="applications">Applications</TabsTrigger>
              <TabsTrigger value="categories">Categories</TabsTrigger>
              <TabsTrigger value="users">Users</TabsTrigger>
              <TabsTrigger value="settings">Settings</TabsTrigger>
            </TabsList>
            
            <TabsContent value="jobs">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold text-recruitment-dark">Manage Jobs</h2>
                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    onClick={() => setJobFiltersOpen(true)}
                    className="flex items-center gap-2"
                  >
                    <Filter className="h-4 w-4" /> Filter
                  </Button>
                  <Button onClick={openAddDialog} className="bg-recruitment-primary hover:bg-recruitment-primary/90">
                    <Plus className="mr-2 h-4 w-4" /> Add New Job
                  </Button>
                </div>
              </div>
              
              {loading ? (
                <div className="animate-pulse space-y-4">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="h-20 bg-gray-200 rounded"></div>
                  ))}
                </div>
              ) : (
                <div className="bg-white rounded-lg overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Job Title</TableHead>
                        <TableHead>Company</TableHead>
                        <TableHead>Location</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Industry</TableHead>
                        <TableHead>Featured</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredJobs.map((job) => (
                        <TableRow key={job.id}>
                          <TableCell className="font-medium">{job.title}</TableCell>
                          <TableCell>{job.company}</TableCell>
                          <TableCell>{job.location}</TableCell>
                          <TableCell>{job.jobType}</TableCell>
                          <TableCell>{job.industry}</TableCell>
                          <TableCell>
                            {job.featured ? (
                              <CheckCircle className="text-green-500 h-5 w-5" />
                            ) : (
                              <XCircle className="text-gray-300 h-5 w-5" />
                            )}
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end space-x-2">
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => openEditDialog(job)}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button 
                                variant="destructive" 
                                size="sm"
                                onClick={() => openDeleteConfirm(job.id)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                      {filteredJobs.length === 0 && (
                        <TableRow>
                          <TableCell colSpan={7} className="text-center py-4 text-gray-500">
                            No jobs found. Add your first job!
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="applications">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold text-recruitment-dark">Job Applications</h2>
                <Button 
                  variant="outline" 
                  onClick={() => setApplicationFiltersOpen(true)}
                  className="flex items-center gap-2"
                >
                  <Filter className="h-4 w-4" /> Filter
                </Button>
              </div>
              
              <div className="bg-white rounded-lg overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Job Position</TableHead>
                      <TableHead>Date Applied</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredApplications.map((application) => (
                      <TableRow key={application.id}>
                        <TableCell className="font-medium">{application.applicantName}</TableCell>
                        <TableCell>{application.jobTitle}</TableCell>
                        <TableCell>{application.dateApplied}</TableCell>
                        <TableCell>
                          <span className={`px-2 py-1 rounded-full text-xs text-white ${getStatusBadgeColor(application.status)}`}>
                            {application.status.charAt(0).toUpperCase() + application.status.slice(1)}
                          </span>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => viewApplication(application)}
                          >
                            <FileText className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                    {filteredApplications.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center py-4 text-gray-500">
                          No applications received yet.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </TabsContent>

            <TabsContent value="categories">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold text-recruitment-dark">Manage Categories</h2>
                <Button onClick={openAddCategoryDialog} className="bg-recruitment-primary hover:bg-recruitment-primary/90">
                  <Plus className="mr-2 h-4 w-4" /> Add New Category
                </Button>
              </div>
              
              <div className="bg-white rounded-lg overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Category Name</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead>Job Count</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {categories.map((category) => (
                      <TableRow key={category.id}>
                        <TableCell className="font-medium">{category.name}</TableCell>
                        <TableCell>{category.description}</TableCell>
                        <TableCell>{category.jobCount}</TableCell>
                        <TableCell className="text-right">
                          <Button 
                            variant="destructive" 
                            size="sm"
                            onClick={() => openDeleteCategoryConfirm(category.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                    {categories.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={4} className="text-center py-4 text-gray-500">
                          No categories found. Add your first category!
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </TabsContent>
            
            <TabsContent value="users">
              <Card>
                <CardHeader>
                  <CardTitle>User Management</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-500">
                    This feature will be available in a future update. Here you'll be able to manage
                    admin users and their permissions.
                  </p>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="settings">
              <Card>
                <CardHeader>
                  <CardTitle>Admin Settings</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-500">
                    This feature will be available in a future update. Here you'll be able to configure
                    various system settings and preferences.
                  </p>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
      
      {/* Add/Edit Job Dialog */}
      <Dialog open={openDialog} onOpenChange={setOpenDialog}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>
              {editingJob ? 'Edit Job' : 'Add New Job'}
            </DialogTitle>
            <DialogDescription>
              {editingJob 
                ? 'Make changes to the job information below.' 
                : 'Enter the details for the new job posting.'}
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-4">
            <div className="space-y-4">
              <div>
                <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                  Job Title *
                </label>
                <Input
                  id="title"
                  placeholder="e.g. Senior Full Stack Developer"
                  value={editingJob ? editingJob.title : job.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                />
              </div>
              
              <div>
                <label htmlFor="company" className="block text-sm font-medium text-gray-700 mb-1">
                  Company *
                </label>
                <Input
                  id="company"
                  placeholder="e.g. TechFusion Inc."
                  value={editingJob ? editingJob.company : job.company}
                  onChange={(e) => handleInputChange('company', e.target.value)}
                />
              </div>
              
              <div>
                <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-1">
                  Location *
                </label>
                <Input
                  id="location"
                  placeholder="e.g. London, UK (Remote)"
                  value={editingJob ? editingJob.location : job.location}
                  onChange={(e) => handleInputChange('location', e.target.value)}
                />
              </div>
              
              <div>
                <label htmlFor="salary" className="block text-sm font-medium text-gray-700 mb-1">
                  Salary Range *
                </label>
                <Input
                  id="salary"
                  placeholder="e.g. £50,000 - £70,000"
                  value={editingJob ? editingJob.salary : job.salary}
                  onChange={(e) => handleInputChange('salary', e.target.value)}
                />
              </div>
            </div>
            
            <div className="space-y-4">
              <div>
                <label htmlFor="jobType" className="block text-sm font-medium text-gray-700 mb-1">
                  Job Type *
                </label>
                <Select 
                  value={editingJob ? editingJob.jobType : job.jobType}
                  onValueChange={(value) => handleInputChange('jobType', value)}
                >
                  <SelectTrigger id="jobType">
                    <SelectValue placeholder="Select job type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Full-Time">Full-Time</SelectItem>
                    <SelectItem value="Part-Time">Part-Time</SelectItem>
                    <SelectItem value="Contract">Contract</SelectItem>
                    <SelectItem value="Temporary">Temporary</SelectItem>
                    <SelectItem value="Remote">Remote</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <label htmlFor="industry" className="block text-sm font-medium text-gray-700 mb-1">
                  Industry *
                </label>
                <Select 
                  value={editingJob ? editingJob.industry : job.industry}
                  onValueChange={(value) => handleInputChange('industry', value)}
                >
                  <SelectTrigger id="industry">
                    <SelectValue placeholder="Select industry" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Technology">Technology</SelectItem>
                    <SelectItem value="Finance">Finance</SelectItem>
                    <SelectItem value="Healthcare">Healthcare</SelectItem>
                    <SelectItem value="Marketing">Marketing</SelectItem>
                    <SelectItem value="Engineering">Engineering</SelectItem>
                    <SelectItem value="Retail">Retail</SelectItem>
                    <SelectItem value="Human Resources">Human Resources</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
                  Category
                </label>
                <Select 
                  value={editingJob ? editingJob.category || "" : job.category || ""}
                  onValueChange={(value) => handleInputChange('category', value)}
                >
                  <SelectTrigger id="category">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">None</SelectItem>
                    {categories.map(cat => (
                      <SelectItem key={cat.id} value={cat.name}>{cat.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="featured"
                  className="h-4 w-4 border-gray-300 rounded text-recruitment-primary focus:ring-recruitment-primary"
                  checked={editingJob ? editingJob.featured : job.featured}
                  onChange={(e) => handleInputChange('featured', e.target.checked)}
                />
                <label htmlFor="featured" className="text-sm font-medium text-gray-700">
                  Featured Job
                </label>
              </div>
            </div>
          </div>
          
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
              Job Description *
            </label>
            <Textarea
              id="description"
              placeholder="Enter detailed job description..."
              className="min-h-[200px]"
              value={editingJob ? editingJob.description : job.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
            />
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpenDialog(false)}>Cancel</Button>
            <Button 
              className="bg-recruitment-primary hover:bg-recruitment-primary/90"
              onClick={editingJob ? handleUpdateJob : handleAddJob}
            >
              {editingJob ? 'Update Job' : 'Add Job'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Add Category Dialog */}
      <Dialog open={openCategoryDialog} onOpenChange={setOpenCategoryDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Category</DialogTitle>
            <DialogDescription>
              Create a new job category to help organize your listings.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div>
              <label htmlFor="categoryName" className="block text-sm font-medium text-gray-700 mb-1">
                Category Name *
              </label>
              <Input
                id="categoryName"
                placeholder="e.g. Engineering"
                value={category.name}
                onChange={(e) => handleCategoryInputChange('name', e.target.value)}
              />
            </div>
            
            <div>
              <label htmlFor="categoryDescription" className="block text-sm font-medium text-gray-700 mb-1">
                Description *
              </label>
              <Textarea
                id="categoryDescription"
                placeholder="Enter category description..."
                value={category.description}
                onChange={(e) => handleCategoryInputChange('description', e.target.value)}
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpenCategoryDialog(false)}>Cancel</Button>
            <Button 
              className="bg-recruitment-primary hover:bg-recruitment-primary/90"
              onClick={handleAddCategory}
            >
              Add Category
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Job Filter Dialog */}
      <Dialog open={jobFiltersOpen} onOpenChange={setJobFiltersOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Filter Jobs</DialogTitle>
            <DialogDescription>
              Apply filters to find specific job listings.
            </DialogDescription>
          </DialogHeader>
          
          <Form {...jobFiltersForm}>
            <form onSubmit={jobFiltersForm.handleSubmit(filterJobs)} className="space-y-4 py-4">
              <FormField
                control={jobFiltersForm.control}
                name="searchTerm"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Search</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                        <Input
                          type="search"
                          placeholder="Search jobs..."
                          className="pl-9"
                          {...field}
                        />
                      </div>
                    </FormControl>
                  </FormItem>
                )}
              />
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FormField
                  control={jobFiltersForm.control}
                  name="jobType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Job Type</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Any type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="">Any type</SelectItem>
                          <SelectItem value="Full-Time">Full-Time</SelectItem>
                          <SelectItem value="Part-Time">Part-Time</SelectItem>
                          <SelectItem value="Contract">Contract</SelectItem>
                          <SelectItem value="Temporary">Temporary</SelectItem>
                          <SelectItem value="Remote">Remote</SelectItem>
                        </SelectContent>
                      </Select>
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={jobFiltersForm.control}
                  name="industry"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Industry</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Any industry" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="">Any industry</SelectItem>
                          <SelectItem value="Technology">Technology</SelectItem>
                          <SelectItem value="Finance">Finance</SelectItem>
                          <SelectItem value="Healthcare">Healthcare</SelectItem>
                          <SelectItem value="Marketing">Marketing</SelectItem>
                          <SelectItem value="Engineering">Engineering</SelectItem>
                          <SelectItem value="Retail">Retail</SelectItem>
                          <SelectItem value="Human Resources">Human Resources</SelectItem>
                        </SelectContent>
                      </Select>
                    </FormItem>
                  )}
                />
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FormField
                  control={jobFiltersForm.control}
                  name="featured"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Featured</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Any" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="">Any</SelectItem>
                          <SelectItem value="true">Featured</SelectItem>
                          <SelectItem value="false">Not Featured</SelectItem>
                        </SelectContent>
                      </Select>
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={jobFiltersForm.control}
                  name="category"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Category</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Any category" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="">Any category</SelectItem>
                          {categories.map(cat => (
                            <SelectItem key={cat.id} value={cat.name}>{cat.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </FormItem>
                  )}
                />
              </div>
              
              <DialogFooter>
                <Button type="button" variant="outline" onClick={resetJobFilters}>
                  Reset
                </Button>
                <Button type="submit" className="bg-recruitment-primary hover:bg-recruitment-primary/90">
                  Apply Filters
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
      
      {/* Application Filter Dialog */}
      <Dialog open={applicationFiltersOpen} onOpenChange={setApplicationFiltersOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Filter Applications</DialogTitle>
            <DialogDescription>
              Apply filters to find specific job applications.
            </DialogDescription>
          </DialogHeader>
          
          <Form {...applicationFiltersForm}>
            <form onSubmit={applicationFiltersForm.handleSubmit(filterApplications)} className="space-y-4 py-4">
              <FormField
                control={applicationFiltersForm.control}
                name="searchTerm"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Search</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                        <Input
                          type="search"
                          placeholder="Search applicants or jobs..."
                          className="pl-9"
                          {...field}
                        />
                      </div>
                    </FormControl>
                  </FormItem>
                )}
              />
              
              <FormField
                control={applicationFiltersForm.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Any status" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="">Any status</SelectItem>
                        <SelectItem value="new">New</SelectItem>
                        <SelectItem value="reviewed">Reviewed</SelectItem>
                        <SelectItem value="interviewing">Interviewing</SelectItem>
                        <SelectItem value="rejected">Rejected</SelectItem>
                        <SelectItem value="offered">Offered</SelectItem>
                        <SelectItem value="hired">Hired</SelectItem>
                      </SelectContent>
                    </Select>
                  </FormItem>
                )}
              />
              
              <DialogFooter>
                <Button type="button" variant="outline" onClick={resetApplicationFilters}>
                  Reset
                </Button>
                <Button type="submit" className="bg-recruitment-primary hover:bg-recruitment-primary/90">
                  Apply Filters
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
      
      {/* Delete Job Confirmation */}
      <Dialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Delete</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this job? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteConfirmOpen(false)}>Cancel</Button>
            <Button variant="destructive" onClick={handleDeleteJob}>
              Delete Job
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Delete Category Confirmation */}
      <Dialog open={deleteCategoryConfirmOpen} onOpenChange={setDeleteCategoryConfirmOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Delete</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this category? This will not delete jobs in this category.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteCategoryConfirmOpen(false)}>Cancel</Button>
            <Button variant="destructive" onClick={handleDeleteCategory}>
              Delete Category
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* View Application Dialog */}
      <Dialog open={applicationViewOpen} onOpenChange={setApplicationViewOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>
              Application Details
            </DialogTitle>
            <DialogDescription>
              {selectedApplication?.jobTitle}
            </DialogDescription>
          </DialogHeader>
          
          {selectedApplication && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-4">
                <div>
                  <h3 className="text-lg font-semibold mb-4">Applicant Information</h3>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-500">Name</label>
                      <div className="flex items-center gap-2 mt-1">
                        <User className="h-4 w-4 text-gray-400" />
                        <span>{selectedApplication.applicantName}</span>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-500">Email</label>
                      <div className="flex items-center gap-2 mt-1">
                        <Mail className="h-4 w-4 text-gray-400" />
                        <a href={`mailto:${selectedApplication.email}`} className="text-blue-600 hover:underline">
                          {selectedApplication.email}
                        </a>
                      </div>
                    </div>
                    {selectedApplication.phone && (
                      <div>
                        <label className="block text-sm font-medium text-gray-500">Phone</label>
                        <div className="mt-1">
                          {selectedApplication.phone}
                        </div>
                      </div>
                    )}
                    <div>
                      <label className="block text-sm font-medium text-gray-500">Date Applied</label>
                      <div className="mt-1">
                        {selectedApplication.dateApplied}
                      </div>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h3 className="text-lg font-semibold mb-4">Status</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-500 mb-2">Current Status</label>
                      <div>
                        <span className={`px-2 py-1 rounded-full text-xs text-white ${getStatusBadgeColor(selectedApplication.status)}`}>
                          {selectedApplication.status.charAt(0).toUpperCase() + selectedApplication.status.slice(1)}
                        </span>
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-500 mb-2">Change Status</label>
                      <div className="flex flex-wrap gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          className={selectedApplication.status === 'new' ? 'bg-blue-100' : ''}
                          onClick={() => handleUpdateApplicationStatus(selectedApplication.id, 'new')}
                        >
                          New
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className={selectedApplication.status === 'reviewed' ? 'bg-purple-100' : ''}
                          onClick={() => handleUpdateApplicationStatus(selectedApplication.id, 'reviewed')}
                        >
                          Reviewed
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className={selectedApplication.status === 'interviewing' ? 'bg-amber-100' : ''}
                          onClick={() => handleUpdateApplicationStatus(selectedApplication.id, 'interviewing')}
                        >
                          Interviewing
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className={selectedApplication.status === 'rejected' ? 'bg-red-100' : ''}
                          onClick={() => handleUpdateApplicationStatus(selectedApplication.id, 'rejected')}
                        >
                          Rejected
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className={selectedApplication.status === 'offered' ? 'bg-green-100' : ''}
                          onClick={() => handleUpdateApplicationStatus(selectedApplication.id, 'offered')}
                        >
                          Offered
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className={selectedApplication.status === 'hired' ? 'bg-teal-100' : ''}
                          onClick={() => handleUpdateApplicationStatus(selectedApplication.id, 'hired')}
                        >
                          Hired
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              {selectedApplication.resumeUrl && (
                <div className="mb-6">
                  <h3 className="text-lg font-semibold mb-2">Résumé</h3>
                  <div className="flex items-center">
                    <a 
                      href={selectedApplication.resumeUrl} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline flex items-center gap-2"
                    >
                      <FileText className="h-4 w-4" />
                      View Résumé
                    </a>
                  </div>
                </div>
              )}
              
              {selectedApplication.coverLetter && (
                <div>
                  <h3 className="text-lg font-semibold mb-2">Cover Letter</h3>
                  <div className="bg-gray-50 p-4 rounded border">
                    <p className="whitespace-pre-line">{selectedApplication.coverLetter}</p>
                  </div>
                </div>
              )}
            </>
          )}
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setApplicationViewOpen(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Layout>
  );
};

export default Admin;
