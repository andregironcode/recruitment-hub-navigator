import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import Layout from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  MapPin, 
  Briefcase, 
  Clock, 
  Building, 
  Share, 
  ArrowLeft,
  Send,
  FileUp,
  Loader2,
  AlertTriangle,
  InfoIcon
} from 'lucide-react';
import { getJobById, submitApplication } from '@/services/jobService';
import { Job } from '@/components/jobs/JobList';
import { useToast } from '@/components/ui/use-toast';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { supabase, checkStorageBuckets, RESUME_BUCKET_ID, uploadResumeFile } from '@/integrations/supabase/client';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

const JobDetail = () => {
  const { id } = useParams<{ id: string }>();
  const [job, setJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const [isApplyDialogOpen, setIsApplyDialogOpen] = useState(false);
  const [applicationData, setApplicationData] = useState({
    name: '',
    email: '',
    phone: '',
    coverLetter: ''
  });
  const [cvFile, setCvFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [fileUploading, setFileUploading] = useState(false);
  const [bucketAccessible, setBucketAccessible] = useState(false);
  const [bucketError, setBucketError] = useState<string | null>(null);
  const [bucketChecking, setBucketChecking] = useState(false);

  useEffect(() => {
    const checkBucket = async () => {
      setBucketChecking(true);
      const result = await checkStorageBuckets();
      setBucketAccessible(result.success);
      
      if (!result.success) {
        console.warn('Storage bucket check failed:', result.error);
        setBucketError(result.error?.message || 'Could not access storage bucket');
      } else {
        setBucketError(null);
        console.log('Bucket is accessible:', result.bucketInfo);
      }
      setBucketChecking(false);
    };
    
    checkBucket();

    const fetchJob = async () => {
      if (!id) return;
      
      setLoading(true);
      try {
        const jobData = await getJobById(parseInt(id, 10));
        if (jobData) {
          setJob(jobData);
        } else {
          toast({
            title: 'Job Not Found',
            description: 'The job you are looking for does not exist.',
            variant: 'destructive'
          });
        }
      } catch (error) {
        console.error('Error fetching job:', error);
        toast({
          title: 'Error',
          description: 'Failed to load job details. Please try again.',
          variant: 'destructive'
        });
      } finally {
        setLoading(false);
      }
    };

    fetchJob();
  }, [id, toast]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setApplicationData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setCvFile(e.target.files[0]);
    }
  };

  const handleApply = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!job || !id) return;
    
    setIsSubmitting(true);
    
    try {
      let resumeUrl = '';
      let resumeContent = '';
      
      if (cvFile) {
        try {
          setFileUploading(true);
          const uploadResult = await uploadResumeFile(cvFile);
          
          if (uploadResult.error) {
            throw uploadResult.error;
          }
          
          if (uploadResult.url) {
            resumeUrl = uploadResult.url;
            console.log('Uploaded CV file:', resumeUrl);
          }
          
          if (uploadResult.content) {
            resumeContent = uploadResult.content;
            console.log('Extracted content from CV, length:', resumeContent.length);
          }
          
          setFileUploading(false);
        } catch (uploadError) {
          setFileUploading(false);
          toast({
            title: 'Upload Error',
            description: uploadError instanceof Error ? uploadError.message : 'Failed to upload your resume. Please try again.',
            variant: 'destructive'
          });
          setIsSubmitting(false);
          return;
        }
      }
      
      await submitApplication({
        jobId: parseInt(id, 10),
        jobTitle: job.title,
        applicantName: applicationData.name,
        email: applicationData.email,
        phone: applicationData.phone,
        resumeUrl,
        resumeContent,
        coverLetter: applicationData.coverLetter
      });
      
      toast({
        title: 'Application Submitted',
        description: `Thank you for applying to ${job.title} at ${job.company}!`,
      });
      
      setIsApplyDialogOpen(false);
      setApplicationData({
        name: '',
        email: '',
        phone: '',
        coverLetter: ''
      });
      setCvFile(null);
    } catch (error) {
      console.error('Error submitting application:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to submit your application. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-3/4 mb-6"></div>
            <div className="h-6 bg-gray-200 rounded w-1/2 mb-6"></div>
            <div className="h-40 bg-gray-200 rounded mb-6"></div>
            <div className="h-6 bg-gray-200 rounded w-1/4 mb-2"></div>
            <div className="h-6 bg-gray-200 rounded w-1/3 mb-2"></div>
            <div className="h-6 bg-gray-200 rounded w-1/2 mb-6"></div>
            <div className="h-10 bg-gray-200 rounded w-1/4"></div>
          </div>
        </div>
      </Layout>
    );
  }

  if (!job) {
    return (
      <Layout>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 text-center">
          <h2 className="text-2xl font-bold text-gray-700 mb-4">Job Not Found</h2>
          <p className="text-gray-600 mb-6">The job you are looking for does not exist or has been removed.</p>
          <Link to="/jobs">
            <Button className="bg-recruitment-primary hover:bg-recruitment-primary/90">
              <ArrowLeft className="mr-2 h-4 w-4" /> Back to Jobs
            </Button>
          </Link>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="bg-recruitment-light min-h-screen py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-6">
            <Link to="/jobs" className="text-recruitment-primary hover:text-recruitment-primary/80 flex items-center">
              <ArrowLeft className="mr-1 h-4 w-4" /> Back to Jobs
            </Link>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <Card>
                <CardContent className="p-8">
                  <div className="mb-6">
                    <div className="flex items-start justify-between">
                      <h1 className="text-3xl font-bold text-recruitment-dark mb-2">{job?.title}</h1>
                      <Button variant="outline" size="sm" className="flex items-center gap-1">
                        <Share size={14} /> Share
                      </Button>
                    </div>
                    <div className="flex items-center text-gray-600 flex-wrap gap-y-2">
                      <Building size={16} className="mr-1" />
                      <span className="mr-4">{job?.company}</span>
                      <MapPin size={16} className="mr-1" />
                      <span className="mr-4">{job?.location}</span>
                      <Clock size={16} className="mr-1" />
                      <span>Posted {job?.postedDate}</span>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2 mb-6">
                    <Badge variant="outline" className="flex items-center">
                      <Briefcase size={14} className="mr-1" /> {job?.jobType}
                    </Badge>
                    <Badge variant="outline" className="flex items-center">
                      <Clock size={14} className="mr-1" /> {job?.industry}
                    </Badge>
                    {job?.featured && (
                      <Badge className="bg-recruitment-accent text-white">Featured</Badge>
                    )}
                  </div>

                  <div>
                    <h2 className="text-xl font-semibold mb-4 text-recruitment-dark">Job Description</h2>
                    <div 
                      className="text-gray-600 prose prose-sm max-w-none" 
                      dangerouslySetInnerHTML={{ __html: job?.description || '' }}
                    />
                  </div>
                </CardContent>
              </Card>
            </div>

            <div>
              <Card className="sticky top-6">
                <CardContent className="p-6">
                  <h2 className="text-xl font-semibold mb-4 text-recruitment-dark">Job Overview</h2>
                  
                  <div className="space-y-4 mb-6">
                    <div>
                      <div className="text-sm text-gray-500">Salary</div>
                      <div className="font-medium text-recruitment-primary">{job?.salary}</div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-500">Job Type</div>
                      <div>{job?.jobType}</div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-500">Location</div>
                      <div>{job?.location}</div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-500">Industry</div>
                      <div>{job?.industry}</div>
                    </div>
                  </div>
                  
                  <Button 
                    className="w-full bg-recruitment-primary hover:bg-recruitment-primary/90 mb-3"
                    onClick={() => setIsApplyDialogOpen(true)}
                  >
                    Apply Now
                  </Button>
                  
                  <Button variant="outline" className="w-full">
                    Save Job
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>

      <Dialog open={isApplyDialogOpen} onOpenChange={setIsApplyDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Apply for {job?.title}</DialogTitle>
            <DialogDescription>
              Submit your application for this position at {job?.company}.
            </DialogDescription>
          </DialogHeader>
          
          {bucketChecking && (
            <Alert className="mt-2">
              <InfoIcon className="h-4 w-4" />
              <AlertTitle>Checking storage...</AlertTitle>
              <AlertDescription>
                Verifying resume storage availability...
              </AlertDescription>
            </Alert>
          )}
          
          {bucketError && (
            <Alert variant="destructive" className="mt-2">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Storage Error</AlertTitle>
              <AlertDescription>
                {bucketError}
                <p className="text-xs mt-1">Resume uploads may not work. Your application can still be submitted without a resume.</p>
              </AlertDescription>
            </Alert>
          )}
          
          <form onSubmit={handleApply} className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name *</Label>
              <Input 
                id="name" 
                name="name" 
                value={applicationData.name}
                onChange={handleInputChange}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="email">Email *</Label>
              <Input 
                id="email" 
                name="email" 
                type="email"
                value={applicationData.email}
                onChange={handleInputChange}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="phone">Phone</Label>
              <Input 
                id="phone" 
                name="phone"
                value={applicationData.phone}
                onChange={handleInputChange}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="cv">CV/Resume</Label>
              <div className="flex items-center gap-2">
                <Input 
                  id="cv" 
                  name="cv"
                  type="file"
                  accept=".pdf,.doc,.docx"
                  onChange={handleFileChange}
                  className="flex-1"
                  disabled={bucketChecking || (!bucketAccessible && !bucketChecking)}
                />
                {cvFile && (
                  <Badge variant="outline" className="flex items-center gap-1">
                    <FileUp size={12} /> {cvFile.name.length > 20 ? `${cvFile.name.substring(0, 17)}...` : cvFile.name}
                  </Badge>
                )}
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Accepted formats: PDF, DOC, DOCX (Max 10MB)
                {!bucketAccessible && !bucketChecking && <span className="text-red-500 ml-2">Resume upload currently unavailable</span>}
              </p>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="coverLetter">Cover Letter</Label>
              <Textarea 
                id="coverLetter" 
                name="coverLetter"
                value={applicationData.coverLetter}
                onChange={handleInputChange}
                rows={5}
                placeholder="Tell us why you're a good fit for this role..."
              />
            </div>
            
            <DialogFooter className="pt-4">
              <Button 
                variant="outline" 
                type="button" 
                onClick={() => setIsApplyDialogOpen(false)}
                disabled={isSubmitting || fileUploading}
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={isSubmitting || fileUploading}
                className="bg-recruitment-primary hover:bg-recruitment-primary/90"
              >
                {(isSubmitting || fileUploading) ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> 
                    {fileUploading ? 'Uploading Resume...' : 'Submitting Application...'}
                  </>
                ) : (
                  <>
                    <Send className="mr-2 h-4 w-4" /> Submit Application
                  </>
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </Layout>
  );
};

export default JobDetail;
