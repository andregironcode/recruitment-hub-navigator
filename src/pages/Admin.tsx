
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
  FileText
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Job } from '@/components/jobs/JobList';
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

const Admin = () => {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [applications, setApplications] = useState<Application[]>([]);
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
  const { toast } = useToast();
  
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
                <Button onClick={openAddDialog} className="bg-recruitment-primary hover:bg-recruitment-primary/90">
                  <Plus className="mr-2 h-4 w-4" /> Add New Job
                </Button>
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
                      {jobs.map((job) => (
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
                      {jobs.length === 0 && (
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
                    {applications.map((application) => (
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
                    {applications.length === 0 && (
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
            <Button 
              variant="outline" 
              onClick={() => setOpenDialog(false)}
            >
              Cancel
            </Button>
            <Button 
              onClick={editingJob ? handleUpdateJob : handleAddJob}
              className="bg-recruitment-primary hover:bg-recruitment-primary/90"
            >
              <Briefcase className="mr-2 h-4 w-4" />
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
              Create a new job category to organize your job listings.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div>
              <label htmlFor="categoryName" className="block text-sm font-medium text-gray-700 mb-1">
                Category Name *
              </label>
              <Input
                id="categoryName"
                placeholder="e.g. Information Technology"
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
                placeholder="Brief description of this category..."
                value={category.description}
                onChange={(e) => handleCategoryInputChange('description', e.target.value)}
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setOpenCategoryDialog(false)}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleAddCategory}
              className="bg-recruitment-primary hover:bg-recruitment-primary/90"
            >
              <Tag className="mr-2 h-4 w-4" />
              Add Category
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* View Application Dialog */}
      <Dialog open={applicationViewOpen} onOpenChange={setApplicationViewOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Application Details</DialogTitle>
            <DialogDescription>
              Review the application and update its status.
            </DialogDescription>
          </DialogHeader>

          {selectedApplication && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Applicant Name</h3>
                  <p className="mt-1">{selectedApplication.applicantName}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Position</h3>
                  <p className="mt-1">{selectedApplication.jobTitle}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Email</h3>
                  <p className="mt-1">{selectedApplication.email}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Phone</h3>
                  <p className="mt-1">{selectedApplication.phone}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Date Applied</h3>
                  <p className="mt-1">{selectedApplication.dateApplied}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Status</h3>
                  <p className="mt-1">
                    <span className={`px-2 py-1 rounded-full text-xs text-white ${getStatusBadgeColor(selectedApplication.status)}`}>
                      {selectedApplication.status.charAt(0).toUpperCase() + selectedApplication.status.slice(1)}
                    </span>
                  </p>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-medium text-gray-500">Cover Letter</h3>
                <p className="mt-1 text-sm text-gray-600 whitespace-pre-line">{selectedApplication.coverLetter}</p>
              </div>

              <div>
                <h3 className="text-sm font-medium text-gray-500">Resume</h3>
                <div className="mt-1">
                  <Button variant="outline" size="sm" asChild>
                    <a href={selectedApplication.resumeUrl} target="_blank" rel="noopener noreferrer">
                      <FileText className="mr-2 h-4 w-4" /> View Resume
                    </a>
                  </Button>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-2">Update Status</h3>
                <div className="flex flex-wrap gap-2">
                  {(["new", "reviewed", "interviewing", "rejected", "offered", "hired"] as const).map((status) => (
                    <Button
                      key={status}
                      size="sm"
                      variant={selectedApplication.status === status ? "default" : "outline"}
                      className={selectedApplication.status === status ? "bg-recruitment-primary hover:bg-recruitment-primary/90" : ""}
                      onClick={() => handleUpdateApplicationStatus(selectedApplication.id, status)}
                    >
                      {status.charAt(0).toUpperCase() + status.slice(1)}
                    </Button>
                  ))}
                </div>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setApplicationViewOpen(false)}
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Delete Job Confirmation Dialog */}
      <Dialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this job? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setDeleteConfirmOpen(false)}
            >
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              onClick={handleDeleteJob}
            >
              Delete Job
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Category Confirmation Dialog */}
      <Dialog open={deleteCategoryConfirmOpen} onOpenChange={setDeleteCategoryConfirmOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Category Deletion</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this category? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setDeleteCategoryConfirmOpen(false)}
            >
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              onClick={handleDeleteCategory}
            >
              Delete Category
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
    </Layout>
  );
};

export default Admin;
