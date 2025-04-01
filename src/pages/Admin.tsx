
import React, { useState, useEffect } from "react";
import { Layout } from "@/components/layout/Layout";
import { toast } from "@/hooks/use-toast";
import { 
  getAllApplications, 
  updateApplicationStatus 
} from "@/services/jobService";

// Update the Application interface to ensure status is properly typed
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

const Admin = () => {
  const [applications, setApplications] = useState<Application[]>([]);
  const [filteredApplications, setFilteredApplications] = useState<Application[]>([]);
  const [applicationsLoading, setApplicationsLoading] = useState<boolean>(false);
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // In the getAllApplications function, make sure to properly map the status to match the type
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

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>
        
        <div className="mb-6">
          <h2 className="text-xl font-semibold mb-3">Job Applications</h2>
          
          <div className="mb-4">
            <label htmlFor="statusFilter" className="block text-sm font-medium mb-1">
              Filter by Status
            </label>
            <select
              id="statusFilter"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full sm:w-1/3 md:w-1/4 p-2 border rounded-md"
            >
              <option value="all">All Applications</option>
              <option value="new">New</option>
              <option value="reviewed">Reviewed</option>
              <option value="interviewing">Interviewing</option>
              <option value="rejected">Rejected</option>
              <option value="offered">Offered</option>
              <option value="hired">Hired</option>
            </select>
          </div>
          
          {applicationsLoading ? (
            <p>Loading applications...</p>
          ) : filteredApplications.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full bg-white border border-gray-200 rounded-lg">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Job
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Applicant
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Contact
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date Applied
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredApplications.map((app) => (
                    <tr key={app.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{app.jobTitle}</div>
                        <div className="text-sm text-gray-500">ID: {app.jobId}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{app.applicantName}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{app.email}</div>
                        {app.phone && <div className="text-sm text-gray-500">{app.phone}</div>}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{app.dateApplied}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          app.status === 'new' ? 'bg-blue-100 text-blue-800' :
                          app.status === 'reviewed' ? 'bg-yellow-100 text-yellow-800' :
                          app.status === 'interviewing' ? 'bg-purple-100 text-purple-800' :
                          app.status === 'rejected' ? 'bg-red-100 text-red-800' :
                          app.status === 'offered' ? 'bg-green-100 text-green-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {app.status.charAt(0).toUpperCase() + app.status.slice(1)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <select
                          value={app.status}
                          onChange={(e) => handleStatusChange(app.id, e.target.value as "new" | "reviewed" | "interviewing" | "rejected" | "offered" | "hired")}
                          className="border rounded-md p-1"
                        >
                          <option value="new">New</option>
                          <option value="reviewed">Reviewed</option>
                          <option value="interviewing">Interviewing</option>
                          <option value="rejected">Rejected</option>
                          <option value="offered">Offered</option>
                          <option value="hired">Hired</option>
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p>No applications found.</p>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default Admin;
