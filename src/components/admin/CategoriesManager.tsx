
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
  DialogTitle,
  DialogTrigger 
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, Trash2 } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";

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
  
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Job Categories</h2>
        <div className="flex gap-2">
          <Button onClick={loadCategories} variant="outline" size="sm">
            Refresh
          </Button>
          <Button onClick={() => setIsDialogOpen(true)} size="sm">
            <Plus className="mr-2 h-4 w-4" /> Add Category
          </Button>
        </div>
      </div>
      
      {isLoading ? (
        <div className="flex justify-center py-8">
          <p>Loading categories...</p>
        </div>
      ) : categories.length > 0 ? (
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
              {categories.map((category) => (
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
