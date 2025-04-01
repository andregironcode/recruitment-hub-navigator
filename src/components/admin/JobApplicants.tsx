
import React, { useState, useEffect } from "react";
import { getApplicationsByJobId, updateApplicationStatus, getJobById } from "@/services/jobService";
import { getJobApplicationsAnalyses, analyzeResume, ResumeAnalysis } from "@/services/aiService";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FileText, Mail, Phone, ArrowLeft, Brain, Filter, Users, AlertTriangle, InfoIcon } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

interface JobApplicantsProps {
  jobId: number;
  jobTitle: string;
  onBack: () => void;
}

type ApplicationStatus = "new" | "reviewed" | "interviewing" | "rejected" | "offered" | "hired";
type GroupBy = "status" | "education" | "experience" | "match" | "none";

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
  analysis?: ResumeAnalysis;
}

const isValidStatus = (status: string): status is ApplicationStatus => {
  return ['new', 'reviewed', 'interviewing', 'rejected', 'offered', 'hired'].includes(status);
};

const JobApplicants = ({ jobId, jobTitle, onBack }: JobApplicantsProps) => {
  const [applicants, setApplicants] = useState<Applicant[]>([]);
  const [loading, setLoading] = useState(true);
  const [aiLoading, setAiLoading] = useState(false);
  const [jobDescription, setJobDescription] = useState("");
  const [groupBy, setGroupBy] = useState<GroupBy>("none");
  const [apiError, setApiError] = useState<string | null>(null);
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

        try {
          const analyses = await getJobApplicationsAnalyses(jobId);
          if (Object.keys(analyses).length > 0) {
            setApplicants(current => 
              current.map(app => ({
                ...app,
                analysis: analyses[app.id] || undefined
              }))
            );
          }
        } catch (error) {
          console.error("Error loading analyses:", error);
        }
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

  const runAiScreening = async () => {
    if (!jobDescription) {
      toast({
        title: "Error",
        description: "Job description is required for AI screening",
        variant: "destructive"
      });
      return;
    }

    setApiError(null);
    setAiLoading(true);
    toast({
      title: "AI Screening",
      description: "Starting AI analysis of resumes. This may take a moment..."
    });

    const applicantsWithResumes = applicants.filter(app => app.resumeUrl);
    const totalApplicants = applicantsWithResumes.length;
    let processedCount = 0;
    let errorCount = 0;

    try {
      const updatedApplicants = [...applicants];
      
      for (const applicant of applicantsWithResumes) {
        try {
          const analysis = await analyzeResume(
            applicant.resumeUrl,
            jobDescription,
            jobId,
            applicant.id
          );
          
          const index = updatedApplicants.findIndex(a => a.id === applicant.id);
          if (index !== -1) {
            updatedApplicants[index] = {
              ...updatedApplicants[index],
              analysis
            };
          }
          
          processedCount++;
          if (processedCount % 3 === 0 || processedCount === totalApplicants) {
            toast({
              title: "AI Screening Progress",
              description: `Analyzed ${processedCount} of ${totalApplicants} resumes`
            });
          }
        } catch (error) {
          console.error(`Error analyzing resume for applicant ${applicant.id}:`, error);
          errorCount++;
          
          if (error instanceof Error && 
             (error.message.includes("quota") || 
              error.message.includes("API key") || 
              error.message.includes("OpenAI"))) {
            setApiError("OpenAI API quota exceeded or invalid API key. Please check your API key settings.");
          }
        }
      }
      
      setApplicants(updatedApplicants);
      
      if (errorCount === totalApplicants) {
        toast({
          title: "AI Screening Failed",
          description: `All ${totalApplicants} resume analyses failed. Please check your API key and quota.`,
          variant: "destructive"
        });
      } else if (errorCount > 0) {
        toast({
          title: "AI Screening Partially Complete",
          description: `Successfully analyzed ${processedCount - errorCount} of ${totalApplicants} resumes. ${errorCount} failed.`,
          variant: "destructive"
        });
      } else {
        toast({
          title: "AI Screening Complete",
          description: `Successfully analyzed ${processedCount} of ${totalApplicants} resumes`
        });
      }
    } catch (error) {
      console.error("Error in AI screening process:", error);
      setApiError("An error occurred during AI screening. Please try again later.");
      toast({
        title: "Error",
        description: "An error occurred during AI screening",
        variant: "destructive"
      });
    } finally {
      setAiLoading(false);
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

  const getMatchColor = (match: string) => {
    switch(match?.toLowerCase()) {
      case 'high': return 'bg-green-100 text-green-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-red-100 text-red-800';
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

    if (groupBy === 'education') {
      const groups: Record<string, { title: string, applicants: Applicant[] }> = {};
      
      applicants.forEach(applicant => {
        const education = applicant.analysis?.educationLevel || 'Not Analyzed';
        if (!groups[education]) {
          groups[education] = { title: education, applicants: [] };
        }
        groups[education].applicants.push(applicant);
      });

      return Object.values(groups);
    }

    if (groupBy === 'experience') {
      const groups: Record<string, { title: string, applicants: Applicant[] }> = {};
      
      applicants.forEach(applicant => {
        const experience = applicant.analysis?.yearsExperience || 'Not Analyzed';
        if (!groups[experience]) {
          groups[experience] = { title: `${experience} Experience`, applicants: [] };
        }
        groups[experience].applicants.push(applicant);
      });

      return Object.values(groups);
    }

    if (groupBy === 'match') {
      const groups = {
        'high': { title: 'High Match (70-100%)', applicants: [] as Applicant[] },
        'medium': { title: 'Medium Match (40-69%)', applicants: [] as Applicant[] },
        'low': { title: 'Low Match (0-39%)', applicants: [] as Applicant[] },
        'not_analyzed': { title: 'Not Analyzed', applicants: [] as Applicant[] }
      };

      applicants.forEach(applicant => {
        if (!applicant.analysis) {
          groups.not_analyzed.applicants.push(applicant);
        } else {
          const score = applicant.analysis.overallScore;
          if (score >= 70) {
            groups.high.applicants.push(applicant);
          } else if (score >= 40) {
            groups.medium.applicants.push(applicant);
          } else {
            groups.low.applicants.push(applicant);
          }
        }
      });

      return Object.values(groups).filter(group => group.applicants.length > 0);
    }

    return [{ title: 'All Applicants', applicants }];
  };

  const groupedApplicants = groupApplicants();
  const hasAnyAnalysis = applicants.some(app => !!app.analysis);
  const hasFallbackAnalyses = applicants.some(app => app.analysis?.fallback);

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

      {hasFallbackAnalyses && (
        <Alert className="bg-amber-50 border-amber-200">
          <InfoIcon className="h-4 w-4 text-amber-500" />
          <AlertTitle className="text-amber-700">Some analyses may be limited</AlertTitle>
          <AlertDescription className="text-amber-600">
            Some of the resume analyses were generated using fallback algorithms due to API limitations.
            These analyses may be less accurate than full AI analyses.
          </AlertDescription>
        </Alert>
      )}

      <div className="flex flex-wrap gap-4 items-center justify-between">
        <div className="flex gap-3">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={runAiScreening} 
            disabled={aiLoading || !jobDescription}
          >
            <Brain className="h-4 w-4 mr-2" />
            {aiLoading ? "Analyzing..." : hasAnyAnalysis ? "Re-run AI Analysis" : "Run AI Analysis"}
          </Button>
          
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
                <SelectItem value="education" disabled={!hasAnyAnalysis}>Group by Education</SelectItem>
                <SelectItem value="experience" disabled={!hasAnyAnalysis}>Group by Experience</SelectItem>
                <SelectItem value="match" disabled={!hasAnyAnalysis}>Group by Match Score</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        
        <div className="text-sm text-muted-foreground">
          {applicants.length} applicant{applicants.length !== 1 ? 's' : ''} 
          {hasAnyAnalysis && ` • ${applicants.filter(a => !!a.analysis).length} analyzed`}
        </div>
      </div>

      {apiError && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>API Error</AlertTitle>
          <AlertDescription>
            {apiError}
          </AlertDescription>
        </Alert>
      )}

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
                      {hasAnyAnalysis && (
                        <>
                          <TableHead>Education</TableHead>
                          <TableHead>Experience</TableHead>
                          <TableHead>Match</TableHead>
                        </>
                      )}
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
                        
                        {hasAnyAnalysis && (
                          <>
                            <TableCell>
                              {applicant.analysis ? (
                                <span className="text-sm">
                                  {applicant.analysis.educationLevel}
                                </span>
                              ) : (
                                <span className="text-sm text-muted-foreground">Not analyzed</span>
                              )}
                            </TableCell>
                            <TableCell>
                              {applicant.analysis ? (
                                <span className="text-sm">
                                  {applicant.analysis.yearsExperience}
                                </span>
                              ) : (
                                <span className="text-sm text-muted-foreground">Not analyzed</span>
                              )}
                            </TableCell>
                            <TableCell>
                              {applicant.analysis ? (
                                <div className="space-y-1">
                                  <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getMatchColor(applicant.analysis.skillsMatch)}`}>
                                    {applicant.analysis.skillsMatch} ({applicant.analysis.overallScore}%) 
                                  </span>
                                  <Progress value={applicant.analysis.overallScore} className="h-1 w-16" />
                                </div>
                              ) : (
                                <span className="text-sm text-muted-foreground">Not analyzed</span>
                              )}
                            </TableCell>
                          </>
                        )}
                        
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

      {hasAnyAnalysis && !apiError && (
        <div className="mt-8">
          <Tabs defaultValue="overview">
            <TabsList>
              <TabsTrigger value="overview">Analysis Overview</TabsTrigger>
              <TabsTrigger value="details">Detailed Analysis</TabsTrigger>
            </TabsList>
            <TabsContent value="overview" className="mt-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Education Levels</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2 text-sm">
                      {Array.from(new Set(applicants.filter(a => a.analysis).map(a => a.analysis?.educationLevel))).map((level, i) => (
                        <li key={i} className="flex justify-between">
                          <span>{level}</span>
                          <span className="font-medium">{applicants.filter(a => a.analysis?.educationLevel === level).length}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Experience Levels</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2 text-sm">
                      {Array.from(new Set(applicants.filter(a => a.analysis).map(a => a.analysis?.yearsExperience))).map((level, i) => (
                        <li key={i} className="flex justify-between">
                          <span>{level}</span>
                          <span className="font-medium">{applicants.filter(a => a.analysis?.yearsExperience === level).length}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Match Quality</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2 text-sm">
                      <li className="flex justify-between">
                        <span>High Match (70-100%)</span>
                        <span className="font-medium">{applicants.filter(a => a.analysis && a.analysis.overallScore >= 70).length}</span>
                      </li>
                      <li className="flex justify-between">
                        <span>Medium Match (40-69%)</span>
                        <span className="font-medium">{applicants.filter(a => a.analysis && a.analysis.overallScore >= 40 && a.analysis.overallScore < 70).length}</span>
                      </li>
                      <li className="flex justify-between">
                        <span>Low Match (0-39%)</span>
                        <span className="font-medium">{applicants.filter(a => a.analysis && a.analysis.overallScore < 40).length}</span>
                      </li>
                    </ul>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
            <TabsContent value="details" className="mt-6">
              <div className="space-y-6">
                {applicants.filter(a => a.analysis).map((applicant) => (
                  <Card key={applicant.id}>
                    <CardHeader>
                      <CardTitle className="text-base">{applicant.applicantName}</CardTitle>
                      <CardDescription>
                        Applied on {applicant.dateApplied} • 
                        <span className={`ml-2 px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getMatchColor(applicant.analysis?.skillsMatch || '')}`}>
                          {applicant.analysis?.overallScore}% Match
                        </span>
                        {applicant.analysis?.fallback && (
                          <Badge variant="outline" className="ml-2 bg-amber-50">Fallback Analysis</Badge>
                        )}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <h4 className="font-semibold text-sm mb-2">Qualifications</h4>
                          <div className="space-y-2">
                            <div className="flex justify-between">
                              <span className="text-sm">Education:</span>
                              <span className="text-sm font-medium">{applicant.analysis?.educationLevel}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-sm">Experience:</span>
                              <span className="text-sm font-medium">{applicant.analysis?.yearsExperience}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-sm">Skills Match:</span>
                              <span className="text-sm font-medium">{applicant.analysis?.skillsMatch}</span>
                            </div>
                          </div>
                        </div>
                        <div>
                          <h4 className="font-semibold text-sm mb-2">Key Skills</h4>
                          <div className="flex flex-wrap gap-2">
                            {applicant.analysis?.keySkills.map((skill, idx) => (
                              <Badge key={idx} variant="outline" className="bg-blue-50">
                                {skill}
                              </Badge>
                            ))}
                          </div>
                          
                          {applicant.analysis?.missingRequirements.length ? (
                            <div className="mt-4">
                              <h4 className="font-semibold text-sm mb-2">Missing Requirements</h4>
                              <div className="flex flex-wrap gap-2">
                                {applicant.analysis?.missingRequirements.map((req, idx) => (
                                  <Badge key={idx} variant="outline" className="bg-amber-50">
                                    {req}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          ) : null}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      )}
    </div>
  );
};

export default JobApplicants;
