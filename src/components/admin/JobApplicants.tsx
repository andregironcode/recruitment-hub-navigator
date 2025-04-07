
import React, { useState, useEffect } from "react";
import { getApplicationsByJobId, updateApplicationStatus, getJobById, deleteApplication } from "@/services/jobService";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FileText, Mail, Phone, ArrowLeft, Filter, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface JobApplicantsProps {
  jobId: number;
  jobTitle: string;
  onBack: () => void;
}

type ApplicationStatus = "new" | "reviewed" | "interviewing" | "rejected" | "offered" | "hired";
type GroupBy = "status" | "none";

interface Applicant {
  id: number;
  jobId: number;
  jobTitle: string;
  applicantName: string;
  email: string;
  phone: string;
  resumeUrl: string;
  coverLetter: string;
  status: ApplicationStatus;
  dateApplied: string;
}

const isValidStatus = (status: string): status is ApplicationStatus => {
  return ['new', 'reviewed', 'interviewing', 'rejected', 'offered', 'hired'].includes(status);
};

const JobApplicants = ({ jobId, jobTitle, onBack }: JobApplicantsProps) => {
  const [applicants, setApplicants] = useState<Applicant[]>([]);
  const [loading, setLoading] = useState(true);
  const [jobDescription, setJobDescription] = useState("");
  const [groupBy, setGroupBy] = useState<GroupBy>("none");
  const { toast } = useToast();

  useEffect(() => {
    const loadJobDetails = async () => {
      try {
        const job = await getJobById(jobId);
        if (job) {
          setJobDescription(job.description);
        }
      } catch (error) {
        console.error("Error loading job details:", error);
      }
    };

    loadJobDetails();
  }, [jobId]);

  useEffect(() => {
    const loadApplicants = async () => {
      setLoading(true);
      try {
        const data = await getApplicationsByJobId(jobId);
        const validatedApplicants = data.map(app => ({
          ...app,
          status: isValidStatus(app.status) ? app.status : 'new' as ApplicationStatus
        }));
        setApplicants(validatedApplicants);
        console.log("Loaded applicants for job:", validatedApplicants);
      } catch (error) {
        console.error("Error loading applicants:", error);
        toast({
          title: "Error",
          description: "Failed to load applicants for this job",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };

    loadApplicants();
  }, [jobId, toast]);

  const handleStatusChange = async (id: number, newStatus: ApplicationStatus) => {
    try {
      await updateApplicationStatus(id, newStatus);
      setApplicants(current => 
        current.map(app => 
          app.id === id ? { ...app, status: newStatus } : app
        )
      );
      toast({
        title: "Status Updated",
        description: "Application status has been updated successfully"
      });
    } catch (error) {
      console.error("Error updating status:", error);
      toast({
        title: "Error",
        description: "Failed to update application status",
        variant: "destructive"
      });
    }
  };

  const handleDeleteApplication = async (applicationId: number, applicantName: string) => {
    try {
      await deleteApplication(applicationId);
      setApplicants(current => current.filter(app => app.id !== applicationId));
      toast({
        title: "Application Deleted",
        description: `${applicantName}'s application has been removed`
      });
    } catch (error) {
      console.error("Error deleting application:", error);
      toast({
        title: "Error",
        description: "Failed to delete application",
        variant: "destructive"
      });
    }
  };

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'new': return 'bg-blue-100 text-blue-800';
      case 'reviewed': return 'bg-yellow-100 text-yellow-800';
      case 'interviewing': return 'bg-purple-100 text-purple-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      case 'offered': return 'bg-green-100 text-green-800';
      case 'hired': return 'bg-teal-100 text-teal-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const groupApplicants = () => {
    if (groupBy === 'none') return [{ title: 'All Applicants', applicants }];

    if (groupBy === 'status') {
      const statusGroups = {
        'new': { title: 'New', applicants: [] as Applicant[] },
        'reviewed': { title: 'Reviewed', applicants: [] as Applicant[] },
        'interviewing': { title: 'Interviewing', applicants: [] as Applicant[] },
        'rejected': { title: 'Rejected', applicants: [] as Applicant[] },
        'offered': { title: 'Offered', applicants: [] as Applicant[] },
        'hired': { title: 'Hired', applicants: [] as Applicant[] },
      };

      applicants.forEach(applicant => {
        if (applicant.status in statusGroups) {
          statusGroups[applicant.status].applicants.push(applicant);
        }
      });

      return Object.values(statusGroups).filter(group => group.applicants.length > 0);
    }

    return [{ title: 'All Applicants', applicants }];
  };

  const groupedApplicants = groupApplicants();

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="sm" onClick={onBack}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Jobs
        </Button>
        <h2 className="text-xl font-semibold">
          Applicants for "{jobTitle}"
        </h2>
      </div>

      <div className="flex flex-wrap gap-4 items-center justify-between">
        <div className="flex gap-3">
          <div className="flex items-center">
            <Select 
              value={groupBy} 
              onValueChange={(value: GroupBy) => setGroupBy(value)}
            >
              <SelectTrigger className="w-[180px]">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Group by..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">No Grouping</SelectItem>
                <SelectItem value="status">Group by Status</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        
        <div className="text-sm text-muted-foreground">
          {applicants.length} applicant{applicants.length !== 1 ? 's' : ''} 
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-8">
          <p>Loading applicants...</p>
        </div>
      ) : applicants.length > 0 ? (
        <div className="space-y-8">
          {groupedApplicants.map((group, groupIndex) => (
            <div key={groupIndex} className="space-y-4">
              <h3 className="text-lg font-medium">{group.title} ({group.applicants.length})</h3>
              
              <div className="overflow-x-auto rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Applicant</TableHead>
                      <TableHead>Contact</TableHead>
                      <TableHead>Date Applied</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Resume</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {group.applicants.map((applicant) => (
                      <TableRow key={applicant.id}>
                        <TableCell className="font-medium">
                          {applicant.applicantName}
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-col gap-1">
                            <div className="flex items-center gap-1 text-sm">
                              <Mail className="h-3 w-3" /> {applicant.email}
                            </div>
                            {applicant.phone && (
                              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                                <Phone className="h-3 w-3" /> {applicant.phone}
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>{applicant.dateApplied}</TableCell>
                        <TableCell>
                          <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(applicant.status)}`}>
                            {applicant.status.charAt(0).toUpperCase() + applicant.status.slice(1)}
                          </span>
                        </TableCell>
                        
                        <TableCell>
                          {applicant.resumeUrl ? (
                            <Button variant="ghost" size="sm" asChild>
                              <a href={applicant.resumeUrl} target="_blank" rel="noopener noreferrer">
                                <FileText className="h-4 w-4 mr-2" />
                                View Resume
                              </a>
                            </Button>
                          ) : (
                            <span className="text-sm text-muted-foreground">No resume</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Select 
                              value={applicant.status} 
                              onValueChange={(value: string) => {
                                if (isValidStatus(value)) {
                                  handleStatusChange(applicant.id, value);
                                }
                              }}
                            >
                              <SelectTrigger className="w-[130px]">
                                <SelectValue placeholder="Change status" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="new">New</SelectItem>
                                <SelectItem value="reviewed">Reviewed</SelectItem>
                                <SelectItem value="interviewing">Interviewing</SelectItem>
                                <SelectItem value="rejected">Rejected</SelectItem>
                                <SelectItem value="offered">Offered</SelectItem>
                                <SelectItem value="hired">Hired</SelectItem>
                              </SelectContent>
                            </Select>
                            
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button variant="ghost" size="icon" className="text-red-500 hover:text-red-700">
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Delete Application</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Are you sure you want to delete {applicant.applicantName}'s application? 
                                    This action cannot be undone.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction 
                                    onClick={() => handleDeleteApplication(applicant.id, applicant.applicantName)}
                                    className="bg-red-500 hover:bg-red-700"
                                  >
                                    Delete
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-10 border rounded-md">
          <p className="text-muted-foreground">No applicants for this job yet.</p>
        </div>
      )}
    </div>
  );
};

export default JobApplicants;
