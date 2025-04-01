
import React, { useState, useEffect } from "react";
import { 
  getAllCategories, 
  addCategory, 
  deleteCategory
} from "@/services/jobService";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, Trash2, Filter } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";

// Define industry data that matches IndustryCards
const industryOptions = [
  { 
    id: 'technology', 
    name: 'Technology', 
    description: 'Software development, IT support, cybersecurity, and technical leadership roles.'
  },
  { 
    id: 'finance', 
    name: 'Finance & Accounting', 
    description: 'Banking, accounting, financial analysis, and senior finance leadership positions.'
  },
  { 
    id: 'engineering', 
    name: 'Engineering', 
    description: 'Civil, mechanical, electrical engineering and technical design positions.'
  },
  { 
    id: 'sales', 
    name: 'Sales & Marketing', 
    description: 'Sales executives, digital marketing specialists, and brand management roles.'
  },
  { 
    id: 'executive', 
    name: 'Executive Search', 
    description: 'C-suite, senior leadership, and board-level appointments across industries.'
  },
  { 
    id: 'manufacturing', 
    name: 'Manufacturing', 
    description: 'Production management, quality control, and operations leadership positions.'
  }
];

// Define category type
interface Category {
  id: number;
  name: string;
  description: string;
  jobCount: number;
}

const CategoriesManager = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [filter, setFilter] = useState("");
  const { toast } = useToast();
  
  // Form state
  const [formData, setFormData] = useState({
    name: "",
    description: ""
  });
  
  const loadCategories = async () => {
    setIsLoading(true);
    try {
      const data = await getAllCategories();
      setCategories(data);
    } catch (error) {
      console.error("Error loading categories:", error);
      toast({
        title: "Error",
        description: "Failed to load job categories",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  useEffect(() => {
    loadCategories();
  }, []);
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const resetForm = () => {
    setFormData({
      name: "",
      description: ""
    });
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      await addCategory(formData);
      toast({
        title: "Success",
        description: "Category created successfully",
      });
      
      setIsDialogOpen(false);
      resetForm();
      loadCategories();
    } catch (error) {
      console.error("Error saving category:", error);
      toast({
        title: "Error",
        description: "Failed to save category",
        variant: "destructive"
      });
    }
  };
  
  const handleDelete = async (categoryId: number, jobCount: number) => {
    if (jobCount > 0) {
      toast({
        title: "Cannot Delete",
        description: `This category has ${jobCount} jobs. Remove or reassign these jobs first.`,
        variant: "destructive"
      });
      return;
    }
    
    if (window.confirm("Are you sure you want to delete this category?")) {
      try {
        await deleteCategory(categoryId);
        toast({
          title: "Success",
          description: "Category deleted successfully",
        });
        loadCategories();
      } catch (error) {
        console.error("Error deleting category:", error);
        toast({
          title: "Error",
          description: "Failed to delete category",
          variant: "destructive"
        });
      }
    }
  };

  const addIndustryAsCategory = async (industry: typeof industryOptions[0]) => {
    try {
      await addCategory({
        name: industry.name,
        description: industry.description
      });
      toast({
        title: "Success",
        description: `Added ${industry.name} as a category`,
      });
      loadCategories();
    } catch (error) {
      console.error("Error adding industry as category:", error);
      toast({
        title: "Error",
        description: "Failed to add industry as category",
        variant: "destructive"
      });
    }
  };

  const filteredCategories = filter 
    ? categories.filter(category => 
        category.name.toLowerCase().includes(filter.toLowerCase()) ||
        category.description.toLowerCase().includes(filter.toLowerCase())
      )
    : categories;
  
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Job Categories</h2>
        <div className="flex gap-2">
          <div className="relative">
            <Filter className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              placeholder="Filter categories..."
              className="pl-8 w-[200px]"
            />
          </div>
          <Button onClick={loadCategories} variant="outline" size="sm">
            Refresh
          </Button>
          <Button onClick={() => setIsDialogOpen(true)} size="sm">
            <Plus className="mr-2 h-4 w-4" /> Add Category
          </Button>
        </div>
      </div>

      <div className="bg-muted/50 p-4 rounded-md mb-6">
        <h3 className="text-sm font-medium mb-2">Available Industry Templates</h3>
        <div className="flex flex-wrap gap-2">
          {industryOptions.map(industry => (
            <Button 
              key={industry.id}
              variant="outline" 
              size="sm"
              onClick={() => addIndustryAsCategory(industry)}
            >
              {industry.name}
            </Button>
          ))}
        </div>
        <p className="text-xs text-muted-foreground mt-2">
          Click on an industry to add it as a category
        </p>
      </div>
      
      {isLoading ? (
        <div className="flex justify-center py-8">
          <p>Loading categories...</p>
        </div>
      ) : filteredCategories.length > 0 ? (
        <div className="overflow-x-auto rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Jobs</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredCategories.map((category) => (
                <TableRow key={category.id}>
                  <TableCell className="font-medium">{category.name}</TableCell>
                  <TableCell>{category.description}</TableCell>
                  <TableCell>{category.jobCount}</TableCell>
                  <TableCell>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      onClick={() => handleDelete(category.id, category.jobCount)}
                      disabled={category.jobCount > 0}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      ) : (
        <div className="text-center py-10 border rounded-md">
          <p className="text-muted-foreground">No categories found.</p>
          <Button onClick={() => setIsDialogOpen(true)} variant="outline" className="mt-4">
            Add Your First Category
          </Button>
        </div>
      )}
      
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Add New Category</DialogTitle>
            <DialogDescription>
              Create a new job category to organize your listings.
            </DialogDescription>
          </DialogHeader>
          
          <form onSubmit={handleSubmit} className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label htmlFor="name">Category Name *</Label>
              <Input 
                id="name" 
                name="name" 
                value={formData.name} 
                onChange={handleInputChange} 
                required 
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="description">Description *</Label>
              <Textarea 
                id="description" 
                name="description" 
                value={formData.description} 
                onChange={handleInputChange} 
                rows={4} 
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
                Create Category
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CategoriesManager;
