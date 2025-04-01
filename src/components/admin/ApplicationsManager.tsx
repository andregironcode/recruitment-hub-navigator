
import React, { useState, useEffect } from "react";
import { 
  getAllApplications, 
  updateApplicationStatus 
} from "@/services/jobService";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { FileText, Mail, Phone } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

// Ensure the Application interface is properly typed
interface Application {
  id: number;
  jobId: number;
  jobTitle: string;
  applicantName: string;
  email: string;
  phone: string;
  resumeUrl: string;
  coverLetter: string;
  status: "new" | "reviewed" | "interviewing" | "rejected" | "offered" | "hired";
  dateApplied: string;
}

const ApplicationsManager = () => {
  const [applications, setApplications] = useState<Application[]>([]);
  const [filteredApplications, setFilteredApplications] = useState<Application[]>([]);
  const [applicationsLoading, setApplicationsLoading] = useState<boolean>(false);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const { toast } = useToast();

  const loadApplications = async () => {
    setApplicationsLoading(true);
    try {
      const data = await getAllApplications();
      // Ensure each application status matches the expected type
      const typedApplications = data.map(app => ({
        ...app,
        status: (app.status as "new" | "reviewed" | "interviewing" | "rejected" | "offered" | "hired") || "new"
      }));
      setApplications(typedApplications);
      setFilteredApplications(typedApplications);
      
      console.log("Loaded applications:", typedApplications); // Debug log
    } catch (error) {
      console.error('Error loading applications:', error);
      toast({
        title: "Error",
        description: "Failed to load applications",
        variant: "destructive"
      });
    } finally {
      setApplicationsLoading(false);
    }
  };

  useEffect(() => {
    loadApplications();
  }, []);

  useEffect(() => {
    if (statusFilter === 'all') {
      setFilteredApplications(applications);
    } else {
      setFilteredApplications(
        applications.filter(app => app.status === statusFilter)
      );
    }
  }, [statusFilter, applications]);

  const handleStatusChange = async (applicationId: number, newStatus: "new" | "reviewed" | "interviewing" | "rejected" | "offered" | "hired") => {
    try {
      await updateApplicationStatus(applicationId, newStatus);
      
      // Update local state to reflect the change
      const updatedApplications = applications.map(app => 
        app.id === applicationId ? { ...app, status: newStatus } : app
      );
      
      setApplications(updatedApplications);
      
      toast({
        title: "Status Updated",
        description: "Application status has been successfully updated.",
      });
    } catch (error) {
      console.error('Error updating status:', error);
      toast({
        title: "Error",
        description: "Failed to update application status",
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

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="w-full sm:w-1/3">
          <Select 
            value={statusFilter} 
            onValueChange={setStatusFilter}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Applications</SelectItem>
              <SelectItem value="new">New</SelectItem>
              <SelectItem value="reviewed">Reviewed</SelectItem>
              <SelectItem value="interviewing">Interviewing</SelectItem>
              <SelectItem value="rejected">Rejected</SelectItem>
              <SelectItem value="offered">Offered</SelectItem>
              <SelectItem value="hired">Hired</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <Button onClick={loadApplications} variant="outline">Refresh</Button>
      </div>
      
      {applicationsLoading ? (
        <div className="flex justify-center py-8">
          <p>Loading applications...</p>
        </div>
      ) : filteredApplications.length > 0 ? (
        <div className="overflow-x-auto rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Job</TableHead>
                <TableHead>Applicant</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredApplications.map((app) => (
                <TableRow key={app.id}>
                  <TableCell>
                    <div className="font-medium">{app.jobTitle}</div>
                    <div className="text-xs text-muted-foreground">ID: {app.jobId}</div>
                  </TableCell>
                  <TableCell>{app.applicantName}</TableCell>
                  <TableCell>
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-1 text-sm">
                        <Mail className="h-3 w-3" /> {app.email}
                      </div>
                      {app.phone && (
                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                          <Phone className="h-3 w-3" /> {app.phone}
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>{app.dateApplied}</TableCell>
                  <TableCell>
                    <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(app.status)}`}>
                      {app.status.charAt(0).toUpperCase() + app.status.slice(1)}
                    </span>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2 items-center">
                      {app.resumeUrl && (
                        <Button variant="ghost" size="sm" asChild>
                          <a href={app.resumeUrl} target="_blank" rel="noopener noreferrer">
                            <FileText className="h-4 w-4" />
                          </a>
                        </Button>
                      )}
                      <Select 
                        defaultValue={app.status}
                        onValueChange={(value) => handleStatusChange(app.id, value as any)}
                      >
                        <SelectTrigger className="h-8 w-[130px]">
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
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      ) : (
        <div className="text-center py-10 border rounded-md">
          <p className="text-muted-foreground">No applications found.</p>
        </div>
      )}
    </div>
  );
};

export default ApplicationsManager;
