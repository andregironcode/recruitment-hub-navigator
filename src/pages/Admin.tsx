
import React, { useState } from "react";
import Layout from "@/components/layout/Layout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Briefcase, Users, FolderPlus, LayoutDashboard } from "lucide-react";
import ApplicationsManager from "@/components/admin/ApplicationsManager";
import JobsManager from "@/components/admin/JobsManager";
import CategoriesManager from "@/components/admin/CategoriesManager";
import DashboardOverview from "@/components/admin/DashboardOverview";

const Admin = () => {
  const [activeTab, setActiveTab] = useState("dashboard");
  const { toast } = useToast();

  return (
    <Layout>
      <div className="container mx-auto px-4 py-6">
        <div className="flex flex-col gap-4">
          <div>
            <h1 className="text-3xl font-bold mb-2">Admin Dashboard</h1>
            <p className="text-muted-foreground">Manage jobs, applications, and categories</p>
          </div>

          <Tabs defaultValue="dashboard" value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid grid-cols-4 mb-8">
              <TabsTrigger value="dashboard" className="flex items-center gap-2">
                <LayoutDashboard className="h-4 w-4" />
                <span className="hidden sm:inline">Dashboard</span>
              </TabsTrigger>
              <TabsTrigger value="applications" className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                <span className="hidden sm:inline">Applications</span>
              </TabsTrigger>
              <TabsTrigger value="jobs" className="flex items-center gap-2">
                <Briefcase className="h-4 w-4" />
                <span className="hidden sm:inline">Jobs</span>
              </TabsTrigger>
              <TabsTrigger value="categories" className="flex items-center gap-2">
                <FolderPlus className="h-4 w-4" />
                <span className="hidden sm:inline">Categories</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="dashboard">
              <DashboardOverview />
            </TabsContent>
            
            <TabsContent value="applications">
              <Card>
                <CardHeader>
                  <CardTitle>Job Applications</CardTitle>
                  <CardDescription>
                    Review and manage applicants for all positions
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ApplicationsManager />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="jobs">
              <Card>
                <CardHeader>
                  <CardTitle>Job Listings</CardTitle>
                  <CardDescription>
                    Create, edit, and remove job listings
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <JobsManager />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="categories">
              <Card>
                <CardHeader>
                  <CardTitle>Job Categories</CardTitle>
                  <CardDescription>
                    Manage job categories and classifications
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <CategoriesManager />
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </Layout>
  );
};

export default Admin;
