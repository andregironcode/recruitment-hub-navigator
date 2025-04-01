
import React, { useState, useEffect } from "react";
import { 
  getAllJobs, 
  addJob, 
  updateJob, 
  deleteJob,
  getAllCategories
} from "@/services/jobService";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle,
  DialogTrigger 
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, Edit, Trash2 } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";

// Make sure we use the same Job interface from JobList
import { Job } from "@/components/jobs/JobList";

const JobsManager = () => {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [categories, setCategories] = useState<{id: number; name: string}[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [currentJob, setCurrentJob] = useState<Job | null>(null);
  const { toast } = useToast();
  
  // Form state
  const [formData, setFormData] = useState({
    title: "",
    company: "",
    location: "",
    salary: "",
    jobType: "full-time",
    industry: "",
    description: "",
    featured: false,
    category: ""
  });
  
  const loadJobs = async () => {
    setIsLoading(true);
    try {
      const jobData = await getAllJobs();
      setJobs(jobData);
    } catch (error) {
      console.error("Error loading jobs:", error);
      toast({
        title: "Error",
        description: "Failed to load job listings",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const loadCategories = async () => {
    try {
      const categoryData = await getAllCategories();
      setCategories(categoryData.map(cat => ({ id: cat.id, name: cat.name })));
    } catch (error) {
      console.error("Error loading categories:", error);
      toast({
        title: "Error",
        description: "Failed to load job categories",
        variant: "destructive"
      });
    }
  };
  
  useEffect(() => {
    loadJobs();
    loadCategories();
  }, []);
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleCheckboxChange = (checked: boolean) => {
    setFormData(prev => ({ ...prev, featured: checked }));
  };
  
  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const resetForm = () => {
    setFormData({
      title: "",
      company: "",
      location: "",
      salary: "",
      jobType: "full-time",
      industry: "",
      description: "",
      featured: false,
      category: ""
    });
    setCurrentJob(null);
  };
  
  const openEditDialog = (job: Job) => {
    setCurrentJob(job);
    setFormData({
      title: job.title,
      company: job.company,
      location: job.location,
      salary: job.salary || "",
      jobType: job.jobType,
      industry: job.industry,
      description: job.description,
      featured: job.featured || false,
      category: job.category || ""
    });
    setIsDialogOpen(true);
  };
  
  const openAddDialog = () => {
    resetForm();
    setIsDialogOpen(true);
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (currentJob) {
        // Update existing job
        await updateJob({
          ...formData,
          id: currentJob.id,
          postedDate: currentJob.postedDate
        });
        toast({
          title: "Success",
          description: "Job updated successfully",
        });
      } else {
        // Add new job
        await addJob(formData);
        toast({
          title: "Success",
          description: "Job created successfully",
        });
      }
      
      setIsDialogOpen(false);
      resetForm();
      loadJobs();
    } catch (error) {
      console.error("Error saving job:", error);
      toast({
        title: "Error",
        description: "Failed to save job",
        variant: "destructive"
      });
    }
  };
  
  const handleDelete = async (jobId: number) => {
    if (window.confirm("Are you sure you want to delete this job?")) {
      try {
        await deleteJob(jobId);
        toast({
          title: "Success",
          description: "Job deleted successfully",
        });
        loadJobs();
      } catch (error) {
        console.error("Error deleting job:", error);
        toast({
          title: "Error",
          description: "Failed to delete job",
          variant: "destructive"
        });
      }
    }
  };
  
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Job Listings</h2>
        <div className="flex gap-2">
          <Button onClick={loadJobs} variant="outline" size="sm">
            Refresh
          </Button>
          <Button onClick={openAddDialog} size="sm">
            <Plus className="mr-2 h-4 w-4" /> Add Job
          </Button>
        </div>
      </div>
      
      {isLoading ? (
        <div className="flex justify-center py-8">
          <p>Loading jobs...</p>
        </div>
      ) : jobs.length > 0 ? (
        <div className="overflow-x-auto rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Job Title</TableHead>
                <TableHead>Company</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Posted</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {jobs.map((job) => (
                <TableRow key={job.id}>
                  <TableCell>
                    <div className="font-medium">{job.title}</div>
                    {job.featured && <Badge variant="outline" className="mt-1">Featured</Badge>}
                  </TableCell>
                  <TableCell>{job.company}</TableCell>
                  <TableCell>{job.location}</TableCell>
                  <TableCell>{job.jobType}</TableCell>
                  <TableCell>{job.category || "—"}</TableCell>
                  <TableCell>{job.postedDate}</TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={() => openEditDialog(job)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={() => handleDelete(job.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      ) : (
        <div className="text-center py-10 border rounded-md">
          <p className="text-muted-foreground">No jobs found.</p>
          <Button onClick={openAddDialog} variant="outline" className="mt-4">
            Add Your First Job
          </Button>
        </div>
      )}
      
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>{currentJob ? "Edit Job" : "Add New Job"}</DialogTitle>
            <DialogDescription>
              Fill in the details below to {currentJob ? "update" : "create"} a job listing.
            </DialogDescription>
          </DialogHeader>
          
          <form onSubmit={handleSubmit} className="space-y-4 mt-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="title">Job Title *</Label>
                <Input 
                  id="title" 
                  name="title" 
                  value={formData.title} 
                  onChange={handleInputChange} 
                  required 
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="company">Company *</Label>
                <Input 
                  id="company" 
                  name="company" 
                  value={formData.company} 
                  onChange={handleInputChange} 
                  required 
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="location">Location *</Label>
                <Input 
                  id="location" 
                  name="location" 
                  value={formData.location} 
                  onChange={handleInputChange} 
                  required 
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="salary">Salary Range</Label>
                <Input 
                  id="salary" 
                  name="salary" 
                  value={formData.salary} 
                  onChange={handleInputChange} 
                  placeholder="e.g. $50,000 - $70,000"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="jobType">Job Type *</Label>
                <Select 
                  value={formData.jobType} 
                  onValueChange={(value) => handleSelectChange("jobType", value)}
                >
                  <SelectTrigger id="jobType">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="full-time">Full-Time</SelectItem>
                    <SelectItem value="part-time">Part-Time</SelectItem>
                    <SelectItem value="contract">Contract</SelectItem>
                    <SelectItem value="freelance">Freelance</SelectItem>
                    <SelectItem value="internship">Internship</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="industry">Industry *</Label>
                <Input 
                  id="industry" 
                  name="industry" 
                  value={formData.industry} 
                  onChange={handleInputChange} 
                  required 
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Select 
                  value={formData.category} 
                  onValueChange={(value) => handleSelectChange("category", value)}
                >
                  <SelectTrigger id="category">
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">None</SelectItem>
                    {categories.map((category) => (
                      <SelectItem key={category.id} value={category.name}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="flex items-center space-x-2 pt-6">
                <Checkbox 
                  id="featured" 
                  checked={formData.featured} 
                  onCheckedChange={handleCheckboxChange}
                />
                <label 
                  htmlFor="featured" 
                  className="text-sm font-medium leading-none cursor-pointer"
                >
                  Featured Job
                </label>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="description">Job Description *</Label>
              <Textarea 
                id="description" 
                name="description" 
                value={formData.description} 
                onChange={handleInputChange} 
                rows={6} 
                required 
              />
            </div>
            
            <DialogFooter>
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setIsDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit">
                {currentJob ? "Update Job" : "Create Job"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default JobsManager;
