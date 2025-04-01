
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
