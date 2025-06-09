
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Search, Book, Calendar, User as UserIcon, Upload } from "lucide-react";
import { UserProfile } from "@/pages/Index";
import { supabase } from "@/integrations/supabase/client";
// import PaymentDialog from "./PaymentDialog";
import VideoDialog from "./PaymentDialog"

import { API_BASE_URL } from "../config";

interface Course {
  id: string;
  title: string;
  description: string;
  instructor_id: string;
  price: number;
  category: string;
  level: string;
  duration: string;
  created_at: string;
  is_active: boolean;
  pdf_url: string | null;
  profiles?: {
    full_name: string;
  };
}

interface CoursesPageProps {
  user: UserProfile;
  onBack: () => void;
}

const CoursesPage = ({ user, onBack }: CoursesPageProps) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedLevel, setSelectedLevel] = useState("all");
  const [activeTab, setActiveTab] = useState<"browse" | "my-courses" | "add-course">("browse");
  const [courses, setCourses] = useState<Course[]>([]);
  const [myCourses, setMyCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const { toast } = useToast();

  const categories = ["all", "tech", "business", "agriculture", "finance", "food"];
  const levels = ["all", "beginner", "intermediate", "advanced"];

  // const fetchCourses = async () => {
  //   try {
  //     const { data, error } = await supabase
  //       .from('courses')
  //       .select(`
  //         *,
  //         profiles (
  //           full_name
  //         )
  //       `)
  //       .eq('is_active', true)
  //       .order('created_at', { ascending: false });

  //     if (error) throw error;
  //     setCourses(data || []);
  //   } catch (error) {
  //     console.error('Error fetching courses:', error);
  //     toast({
  //       title: "Error loading courses",
  //       description: "Could not load course listings. Please try again.",
  //       variant: "destructive",
  //     });
  //   }
  // };

const fetchCourses = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/courses/`);
    if (!response.ok) {
      throw new Error("Failed to fetch courses");
    }

    const data = await response.json();
    setCourses(data || []);
    console.log("COURSE IS SET)")
  } catch (error) {
    console.log("Below is Error from fetching courses:");
    console.error("Error fetching courses:", error);
    toast({
      title: "Error loading courses",
      description: "Could not load course listings. Please try again.",
      variant: "destructive",
    });
  }
};



  const fetchMyCourses = async () => {
    try {
      const { data, error } = await supabase
        .from('purchases')
        .select(`
          *,
          courses (
            id,
            title,
            description,
            instructor_id,
            pdf_url,
            profiles (
              full_name
            )
          )
        `)
        .eq('user_id', user.id)
        .eq('is_verified', true)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setMyCourses(data || []);
    } catch (error) {
      console.error('Error fetching my courses:', error);
    }
  };

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await Promise.all([fetchCourses(), fetchMyCourses()]);
      setLoading(false);
    };
    loadData();
  }, [user.id]);

  const filteredCourses = courses.filter(course => {
    const matchesSearch = course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         course.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         course.profiles?.full_name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === "all" || course.category === selectedCategory;
    const matchesLevel = selectedLevel === "all" || course.level === selectedLevel;
    return matchesSearch && matchesCategory && matchesLevel;
  });

  // const handleAddCourse = async (e: React.FormEvent) => {
  //   e.preventDefault();
  //   const formData = new FormData(e.target as HTMLFormElement);
  //   const materialFile = formData.get('materials') as File;

  //   setUploading(true);
  //   try {
  //     let pdfUrl = null;
      
  //     // Upload PDF if provided
  //     if (materialFile && materialFile.size > 0) {
  //       const fileExt = materialFile.name.split('.').pop();
  //       const fileName = `${user.id}/${Date.now()}.${fileExt}`;
        
  //       const { error: uploadError } = await supabase.storage
  //         .from('course-materials')
  //         .upload(fileName, materialFile);

  //       if (uploadError) throw uploadError;
  //       pdfUrl = fileName;
  //     }

  //     // Create course
  //     const { error } = await supabase
  //       .from('courses')
  //       .insert({
  //         title: formData.get('title') as string,
  //         description: formData.get('description') as string,
  //         price: parseFloat(formData.get('price') as string),
  //         category: formData.get('category') as string,
  //         level: formData.get('level') as string,
  //         duration: formData.get('duration') as string,
  //         instructor_id: user.id,
  //         pdf_url: pdfUrl,
  //       });

  //     if (error) throw error;

  //     toast({
  //       title: "Course created successfully",
  //       description: "Your course is now live and visible to students.",
  //     });
      
  //     fetchCourses(); // Refresh the courses list
  //     (e.target as HTMLFormElement).reset();
  //   } catch (error) {
  //     console.error('Error creating course:', error);
  //     toast({
  //       title: "Error creating course",
  //       description: "Could not create the course. Please try again.",
  //       variant: "destructive",
  //     });
  //   } finally {
  //     setUploading(false);
  //   }
  // };

  // if (loading) {
  //   return (
  //     <div className="space-y-6 animate-fade-in">
  //       <div className="text-center py-8">Loading courses...</div>
  //     </div>
  //   );
  // }

  // return (

  const handleAddCourse = async (e: React.FormEvent) => {
  e.preventDefault();
  const formData = new FormData(e.target as HTMLFormElement);
  const materialFile = formData.get("materials") as File;

  setUploading(true);

  try {
    let pdfUrl = null;

    // Upload PDF if provided
    if (materialFile && materialFile.size > 0) {
      const fileExt = materialFile.name.split(".").pop();
      const fileName = `${user.id}/${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from("course-materials")
        .upload(fileName, materialFile);

      if (uploadError) throw uploadError;

      pdfUrl = fileName;
    }

    // Build the payload
    const coursePayload = {
      title: formData.get("title") as string,
      description: formData.get("description") as string,
      category: formData.get("category") as string,
      level: formData.get("level") as string,
      youtube_video_id: formData.get("youtube_video_id") as string,
      pdf_url: pdfUrl,
    };

    // Send POST request to your API
    const response = await fetch(`${API_BASE_URL}/courses/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(coursePayload),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Failed to create course");
    }

    toast({
      title: "Course created successfully",
      description: "Your course is now live and visible to students.",
    });

    fetchCourses(); // Refresh courses list
    (e.target as HTMLFormElement).reset();
  } catch (error) {
    console.error("Error creating course:", error);
    toast({
      title: "Error creating course",
      description: "Could not create the course. Please try again.",
      variant: "destructive",
    });
  } finally {
    setUploading(false);
  }
};
  if (loading) {
    return (
      <div className="space-y-6 animate-fade-in">
        <div className="text-center py-8">Loading courses...</div>
      </div>
    );
  }

  return (

    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold">Courses</h2>
          <p className="text-muted-foreground">Discover and learn new skills</p>
        </div>
        <Button onClick={onBack} variant="outline">
          ← Back to Dashboard
        </Button>
      </div>

      {/* Navigation Tabs */}
      <div className="flex space-x-4 border-b">
        <Button
          variant={activeTab === "browse" ? "default" : "ghost"}
          onClick={() => setActiveTab("browse")}
        >
          Browse Courses
        </Button>
        <Button
          variant={activeTab === "my-courses" ? "default" : "ghost"}
          onClick={() => setActiveTab("my-courses")}
        >
          My Courses ({myCourses.length})
        </Button>
        {user.role === "instructor" && (
          <Button
            variant={activeTab === "add-course" ? "default" : "ghost"}
            onClick={() => setActiveTab("add-course")}
          >
            Add Course
          </Button>
        )}
      </div>

      {/* Content based on active tab */}
      {activeTab === "browse" && (
        <div className="space-y-6">
          {/* Search and Filters */}
          <Card>
            <CardContent className="pt-6">
              <div className="grid md:grid-cols-4 gap-4">
                <div className="md:col-span-2">
                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search courses..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger>
                    <SelectValue placeholder="Category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map(category => (
                      <SelectItem key={category} value={category}>
                        {category === "all" ? "All Categories" : category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={selectedLevel} onValueChange={setSelectedLevel}>
                  <SelectTrigger>
                    <SelectValue placeholder="Level" />
                  </SelectTrigger>
                  <SelectContent>
                    {levels.map(level => (
                      <SelectItem key={level} value={level}>
                        {level === "all" ? "All Levels" : level}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
          {/* Course Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCourses.length === 0 ? (
              <div className="col-span-full">
                <Card>
                  <CardContent className="py-8 text-center text-muted-foreground">
                    No courses found. {user.role === "instructor" && "Be the first to create a course!"}
                  </CardContent>
                </Card>
              </div>
            ) : (
              filteredCourses.map(course => (
                <CourseCard key={course.id} course={course} user={user} />
              ))
            )}
          </div>
        </div>
      )}

      {activeTab === "my-courses" && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>My Enrolled Courses</CardTitle>
              <CardDescription>Access your purchased courses and materials</CardDescription>
            </CardHeader>
            <CardContent>
              {myCourses.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No courses enrolled yet. Browse courses to get started!
                </div>
              ) : (
                <div className="grid md:grid-cols-2 gap-4">
                  {myCourses.map((purchase) => (
                    <Card key={purchase.id} className="card-hover">
                      <CardHeader>
                        <CardTitle className="text-lg">{purchase.courses?.title}</CardTitle>
                        <CardDescription>
                          By {purchase.courses?.profiles?.full_name}
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-muted-foreground mb-4">
                          {purchase.courses?.description}
                        </p>
                        {purchase.courses?.pdf_url && (
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => {
                              const { data } = supabase.storage
                                .from('course-materials')
                                .getPublicUrl(purchase.courses.pdf_url);
                              window.open(data.publicUrl, '_blank');
                            }}
                          >
                            Download Materials
                          </Button>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {activeTab === "add-course" && user.role === "instructor" && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Add New Course</CardTitle>
              <CardDescription>Share your knowledge with the community</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleAddCourse} className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="title">Course Title</Label>
                    <Input name="title" placeholder="Enter course title" required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="price">Youtube Video ID</Label>
                    <Input name="youtube_video_id" type='text' required />
                  </div>
                </div>
                <div className="grid md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="category">Category</Label>
                    <Select name="category" required>
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.slice(1).map(category => (
                          <SelectItem key={category} value={category}>
                            {category}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="level">Level</Label>
                    <Select name="level" required>
                      <SelectTrigger>
                        <SelectValue placeholder="Select level" />
                      </SelectTrigger>
                      <SelectContent>
                        {levels.slice(1).map(level => (
                          <SelectItem key={level} value={level}>
                            {level}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  {/*<div className="space-y-2">
                    <Label htmlFor="duration">Duration</Label>
                    <Input name="duration" placeholder="e.g., 4 weeks" required />
                  </div>*/}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    name="description"
                    placeholder="Describe what students will learn..."
                    className="min-h-[100px]"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="materials">Course Materials (PDF)</Label>
                  <Input name="materials" type="file" accept=".pdf" />
                  <p className="text-sm text-muted-foreground">Optional: Upload course materials as PDF file</p>
                </div>
                <Button type="submit" className="w-full" disabled={uploading}>
                  {uploading ? (
                    <>
                      <Upload className="h-4 w-4 mr-2 animate-spin" />
                      Creating Course...
                    </>
                  ) : (
                    "Create Course"
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

interface CourseCardProps {
  course: Course;
  user: UserProfile;
}

const CourseCard = ({ course, user }: CourseCardProps) => {
  return (
    <Card className="card-hover">
      {/*<CardHeader>
        <div className="flex justify-between items-start">
          <div className="space-y-2">
            <CardTitle className="text-lg leading-tight">{course.title}</CardTitle>
            <div className="flex items-center space-x-2 text-sm text-muted-foreground">
              <UserIcon className="h-4 w-4" />
              <span>{course.profiles?.full_name || 'Instructor'}</span>
            </div>
          </div>
          <Badge variant="secondary">{course.level}</Badge>
        </div>
      </CardHeader>*/}
    <CardHeader>
      {course.youtube_video_id && (
        <img
          src={`https://img.youtube.com/vi/${course.youtube_video_id}/hqdefault.jpg`}
          alt={`${course.title} thumbnail`}
          className="w-full h-48 object-cover rounded-md mb-4"
        />
      )}
      <div className="flex justify-between items-start">
        <div className="space-y-2">
          <CardTitle className="text-lg leading-tight">{course.title}</CardTitle>
          <div className="flex items-center space-x-2 text-sm text-muted-foreground">
            <UserIcon className="h-4 w-4" />
            <span>{course.profiles?.full_name || 'Instructor'}</span>
          </div>
        </div>
        <Badge variant="secondary">{course.level}</Badge>
      </div>
    </CardHeader>

      <CardContent className="space-y-4">
        <CardDescription className="line-clamp-3">{course.description}</CardDescription>
        
        <div className="flex justify-between items-center text-sm text-muted-foreground">
          <div className="flex items-center space-x-1">
            <Calendar className="h-4 w-4" />
            <span>{course.duration}</span>
          </div>
          <div className="flex items-center space-x-1">
            <Book className="h-4 w-4" />
            <span>{course.category}</span>
          </div>
        </div>

        {/*<div className="flex justify-between items-center">
          <div className="text-2xl font-bold text-primary">
            {course.price} ETB
          </div>
        </div>
*/}
        <VideoDialog course={course} />
        {/*<PaymentDialog course={course} user={user} />*/}
      </CardContent>
    </Card>
  );
};

export default CoursesPage;
