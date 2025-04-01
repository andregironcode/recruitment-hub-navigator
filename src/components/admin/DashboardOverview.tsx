
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getAllJobs, getAllApplications, getAllCategories } from "@/services/jobService";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Briefcase, Users, BarChart3, FolderPlus, Filter } from "lucide-react";
import { Input } from "@/components/ui/input";

interface ApplicationCount {
  name: string;
  count: number;
}

const DashboardOverview = () => {
  const [jobCount, setJobCount] = useState(0);
  const [applicationCount, setApplicationCount] = useState(0);
  const [categoryCount, setCategoryCount] = useState(0);
  const [applicationsByStatus, setApplicationsByStatus] = useState<ApplicationCount[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState("");

  useEffect(() => {
    const loadDashboardData = async () => {
      setIsLoading(true);
      try {
        // Load all data in parallel
        const [jobs, applications, categories] = await Promise.all([
          getAllJobs(),
          getAllApplications(),
          getAllCategories()
        ]);
        
        setJobCount(jobs.length);
        setApplicationCount(applications.length);
        setCategoryCount(categories.length);
        
        // Calculate applications by status
        const statusCounts: Record<string, number> = {};
        applications.forEach(app => {
          const status = app.status || 'new';
          statusCounts[status] = (statusCounts[status] || 0) + 1;
        });
        
        // Convert to array format for chart
        const statusData = Object.entries(statusCounts).map(([name, count]) => ({
          name: name.charAt(0).toUpperCase() + name.slice(1),
          count
        }));
        
        setApplicationsByStatus(statusData);
      } catch (error) {
        console.error("Error loading dashboard data:", error);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadDashboardData();
  }, []);

  const filteredApplicationsByStatus = filter 
    ? applicationsByStatus.filter(status => 
        status.name.toLowerCase().includes(filter.toLowerCase())
      )
    : applicationsByStatus;

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <div className="relative w-[200px]">
          <Filter className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            placeholder="Filter charts..."
            className="pl-8"
          />
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Jobs</CardTitle>
            <Briefcase className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{isLoading ? "..." : jobCount}</div>
            <p className="text-xs text-muted-foreground">Active job postings</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Applications</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{isLoading ? "..." : applicationCount}</div>
            <p className="text-xs text-muted-foreground">Total applications received</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Categories</CardTitle>
            <FolderPlus className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{isLoading ? "..." : categoryCount}</div>
            <p className="text-xs text-muted-foreground">Job categories</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Hire Rate</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isLoading ? "..." : 
                applicationCount > 0 
                  ? `${Math.round((applicationsByStatus.find(s => s.name === "Hired")?.count || 0) / applicationCount * 100)}%` 
                  : "0%"
              }
            </div>
            <p className="text-xs text-muted-foreground">Applications leading to hire</p>
          </CardContent>
        </Card>
      </div>
      
      <Card className="col-span-full">
        <CardHeader>
          <CardTitle>Applications by Status</CardTitle>
          <CardDescription>
            Overview of job applications broken down by current status
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] w-full">
            {isLoading ? (
              <div className="flex h-full items-center justify-center">
                <p>Loading chart data...</p>
              </div>
            ) : filteredApplicationsByStatus.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={filteredApplicationsByStatus}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="count" fill="#8884d8" name="Applications" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-full items-center justify-center">
                <p className="text-muted-foreground">
                  {filter ? "No matching application data" : "No application data available"}
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DashboardOverview;
