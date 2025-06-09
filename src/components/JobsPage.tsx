import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Search, MapPin, Clock, Building, FileText } from "lucide-react";
import { UserProfile } from "@/pages/Index";
import { supabase } from "@/integrations/supabase/client";
import CVUpload from "./CVUpload";
import { API_BASE_URL } from "../config";
import VideoDialog from "./PaymentDialog"

interface Job {
  id: string;
  title: string;
  company_name: string | null;
  location: string | null;
  job_type: string | null;
  salary_range: string | null;
  description: string;
  requirements: string | null;
  created_at: string;
  is_active: boolean;
}

interface JobsPageProps {
  user: UserProfile;
  onBack: () => void;
}

const JobsPage = ({ user, onBack }: JobsPageProps) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedLocation, setSelectedLocation] = useState("all");
  const [activeTab, setActiveTab] = useState<"browse" | "applied" | "post-job">("browse");
  const [jobs, setJobs] = useState<Job[]>([]);
  const [applications, setApplications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isPostJobOpen, setIsPostJobOpen] = useState(false);
  const [showCVUpload, setShowCVUpload] = useState(false);
  const [pendingJobId, setPendingJobId] = useState<string | null>(null);
  const { toast } = useToast();

  const [courseId, setCourseId] = useState("");
  const [courseInfo, setCourseInfo] = useState<{ title: string } | null>(null);
  const [courseError, setCourseError] = useState<string | null>(null);

  const locations = ["all", "addis ababa", "jimma", "bahir dar", "hawassa", "dire dawa", "mekelle"];

  const handleCourseIdChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
  const value = e.target.value;
    setCourseId(value);
    setCourseInfo(null);
    setCourseError(null);

    if (!value.trim()) return;

    try {
      const res = await fetch(`${API_BASE_URL}/courses/${value}/`);
      if (!res.ok) throw new Error("Course not found");

      const data = await res.json();
      setCourseInfo({ title: data.title });
    } catch (err) {
      setCourseError("No course found with this ID");
    }
  };

  // const fetchJobs = async () => {
  //   try {
  //     const { data, error } = await supabase
  //       .from('jobs')
  //       .select('*')
  //       .eq('is_active', true)
  //       .order('created_at', { ascending: false });

  //     if (error) throw error;
  //     setJobs(data || []);
  //   } catch (error) {
  //     console.error('Error fetching jobs:', error);
  //     toast({
  //       title: "Error loading jobs",
  //       description: "Could not load job listings. Please try again.",
  //       variant: "destructive",
  //     });
  //   }
  // };
  const fetchJobs = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/jobs/`);
      if (!response.ok) {
        throw new Error("Failed to fetch jobs");
      }

      const data = await response.json();
      const activeJobs = data.filter((job: any) => job.is_active); // filter only active jobs

      setJobs(activeJobs || []);
      console.log("JOBS ARE SET");
    } catch (error) {
      console.log("Below is Error from fetching jobs:");
      console.error("Error fetching jobs:", error);
      toast({
        title: "Error loading jobs",
        description: "Could not load job listings. Please try again.",
        variant: "destructive",
      });
    }
  };


  const fetchApplications = async () => {
    try {
      const { data, error } = await supabase
        .from('job_applications')
        .select(`
          *,
          jobs (
            title,
            company_name
          )
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setApplications(data || []);
    } catch (error) {
      console.error('Error fetching applications:', error);
    }
  };

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await Promise.all([fetchJobs(), fetchApplications()]);
      setLoading(false);
    };
    loadData();
  }, [user.id]);

  const filteredJobs = jobs.filter(job => {
    const matchesSearch = job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         job.company_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         job.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesLocation = selectedLocation === "all" || job.location === selectedLocation;
    return matchesSearch && matchesLocation;
  });

  // const handlePostJob = async (e: React.FormEvent) => {
  //   e.preventDefault();
  //   const formData = new FormData(e.target as HTMLFormElement);
    
  //   try {
  //     const { error } = await supabase
  //       .from('jobs')
  //       .insert({
  //         title: formData.get('job-title') as string,
  //         company_name: formData.get('company') as string,
  //         location: formData.get('location') as string,
  //         job_type: formData.get('job-type') as string,
  //         salary_range: formData.get('salary') as string,
  //         description: formData.get('description') as string,
  //         requirements: formData.get('requirements') as string,
  //       });

  //     if (error) throw error;

  //     toast({
  //       title: "Job posted successfully",
  //       description: "Your job posting is now live and visible to job seekers.",
  //     });
      
  //     setIsPostJobOpen(false);
  //     fetchJobs(); // Refresh the jobs list
  //     (e.target as HTMLFormElement).reset();
  //   } catch (error) {
  //     console.error('Error posting job:', error);
  //     toast({
  //       title: "Error posting job",
  //       description: "Could not post the job. Please try again.",
  //       variant: "destructive",
  //     });
  //   }
  // };

  const handlePostJob = async (e: React.FormEvent) => {
  e.preventDefault();
  const form = e.target as HTMLFormElement;
  const formData = new FormData(form);

  const payload = {
    title: formData.get("job-title"),
    company_name: formData.get("company"),
    location: formData.get("location"),
    job_type: formData.get("job-type"),
    salary_range: formData.get("salary"),
    description: formData.get("description"),
    requirements: formData.get("requirements"),
    course: formData.get("course-id"),  // Include the validated courseId if present
  };

  try {
    const response = await fetch(`${API_BASE_URL}/jobs/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        // Include authorization if required:
        // Authorization: `Bearer ${your_token}`,
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error("Failed to post job");
    }

    toast({
      title: "Job posted successfully",
      description: "Your job posting is now live and visible to job seekers.",
    });

    setIsPostJobOpen(false);
    fetchJobs(); // Refresh the jobs list
    form.reset();
    setCourseId("");
    setCourseInfo(null);
    setCourseError(null);
  } catch (error) {
    console.error("Error posting job:", error);
    toast({
      title: "Error posting job",
      description: "Could not post the job. Please try again.",
      variant: "destructive",
    });
  }
};


  const handleApplyJob = async (jobId: string) => {
    // Check if user has a CV
    if (!user.cv_url) {
      setPendingJobId(jobId);
      setShowCVUpload(true);
      return;
    }

    // Check if already applied
    const existingApplication = applications.find(app => app.job_id === jobId);
    if (existingApplication) {
      toast({
        title: "Already applied",
        description: "You have already applied for this job.",
        variant: "destructive",
      });
      return;
    }

    try {
      const { error } = await supabase
        .from('job_applications')
        .insert({
          job_id: jobId,
          user_id: user.id,
          resume_url: user.cv_url,
        });

      if (error) throw error;

      toast({
        title: "Application submitted",
        description: "Your job application has been sent to the employer.",
      });

      fetchApplications(); // Refresh applications
    } catch (error) {
      console.error('Error applying for job:', error);
      toast({
        title: "Application failed",
        description: "Could not submit your application. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleCVUploaded = async (cvUrl: string) => {
    // Update local user state
    user.cv_url = cvUrl;
    
    // If there was a pending job application, proceed with it
    if (pendingJobId) {
      setShowCVUpload(false);
      await handleApplyJob(pendingJobId);
      setPendingJobId(null);
    } else {
      setShowCVUpload(false);
      toast({
        title: "CV updated",
        description: "Your CV has been updated successfully.",
      });
    }
  };

  if (loading) {
    return (
      <div className="space-y-6 animate-fade-in">
        <div className="text-center py-8">Loading jobs...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold">Jobs</h2>
          <p className="text-muted-foreground">Find your next opportunity</p>
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
          Browse Jobs
        </Button>
        <Button
          variant={activeTab === "applied" ? "default" : "ghost"}
          onClick={() => setActiveTab("applied")}
        >
          Applied Jobs ({applications.length})
        </Button>
        {user.role === "employer" && (
          <Button
            variant={activeTab === "post-job" ? "default" : "ghost"}
            onClick={() => setActiveTab("post-job")}
          >
            Post a Job
          </Button>
        )}
      </div>

      {/* CV Upload Dialog */}
      <Dialog open={showCVUpload} onOpenChange={setShowCVUpload}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Upload Your CV</DialogTitle>
            <DialogDescription>
              You need to upload your CV before applying for jobs. It will be automatically attached to your applications.
            </DialogDescription>
          </DialogHeader>
          <CVUpload user={user} onCVUploaded={handleCVUploaded} />
        </DialogContent>
      </Dialog>

      {/* Content based on active tab */}
      {activeTab === "browse" && (
        <div className="space-y-6">
          {/* CV Status Alert */}
          {!user.cv_url && (
            <Card className="border-orange-200 bg-orange-50">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <FileText className="h-5 w-5 text-orange-600" />
                    <div>
                      <p className="font-medium text-orange-800">No CV uploaded</p>
                      <p className="text-sm text-orange-600">Upload your CV to apply for jobs</p>
                    </div>
                  </div>
                  <Button onClick={() => setShowCVUpload(true)} variant="outline">
                    Upload CV
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Search and Filters */}
          <Card>
            <CardContent className="pt-6">
              <div className="grid md:grid-cols-3 gap-4">
                <div className="md:col-span-2">
                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search jobs..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <Select value={selectedLocation} onValueChange={setSelectedLocation}>
                  <SelectTrigger>
                    <SelectValue placeholder="Location" />
                  </SelectTrigger>
                  <SelectContent>
                    {locations.map(location => (
                      <SelectItem key={location} value={location}>
                        {location === "all" ? "All Locations" : location}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Job Listings */}
          <div className="space-y-4">
            {filteredJobs.length === 0 ? (
              <Card>
                <CardContent className="py-8 text-center text-muted-foreground">
                  No jobs found. {user.role === "employer" && "Be the first to post a job!"}
                </CardContent>
              </Card>
            ) : (
              filteredJobs.map(job => (
                <JobCard 
                  key={job.id} 
                  job={job} 
                  onApply={handleApplyJob}
                  hasApplied={applications.some(app => app.job_id === job.id)}
                  userHasCV={!!user.cv_url}
                />
              ))
            )}
          </div>
        </div>
      )}

      {activeTab === "applied" && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>My Job Applications</CardTitle>
              <CardDescription>Track your application status</CardDescription>
            </CardHeader>
            <CardContent>
              {applications.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No applications yet. Browse jobs to get started!
                </div>
              ) : (
                <div className="space-y-4">
                  {applications.map((application) => (
                    <div key={application.id} className="border rounded-lg p-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-semibold">{application.jobs?.title}</h3>
                          <p className="text-sm text-muted-foreground">{application.jobs?.company_name}</p>
                          <p className="text-xs text-muted-foreground mt-1">
                            Applied on {new Date(application.created_at).toLocaleDateString()}
                          </p>
                        </div>
                        <Badge variant={application.status === 'pending' ? 'secondary' : 'default'}>
                          {application.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {activeTab === "post-job" && user.role === "employer" && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Post a New Job</CardTitle>
              <CardDescription>Find the right candidates for your organization</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handlePostJob} className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="job-title">Job Title</Label>
                    <Input name="job-title" placeholder="Enter job title" required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="company">Company</Label>
                    <Input name="company" placeholder="Your company name" required />
                  </div>
                </div>
                <div className="grid md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="location">Location</Label>
                    <Select name="location" required>
                      <SelectTrigger>
                        <SelectValue placeholder="Select location" />
                      </SelectTrigger>
                      <SelectContent>
                        {locations.slice(1).map(location => (
                          <SelectItem key={location} value={location}>
                            {location}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="job-type">Job Type</Label>
                    <Select name="job-type" required>
                      <SelectTrigger>
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="full-time">Full-time</SelectItem>
                        <SelectItem value="part-time">Part-time</SelectItem>
                        <SelectItem value="contract">Contract</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="salary">Salary Range (ETB)</Label>
                    <Input name="salary" placeholder="e.g., 15,000 - 25,000" required />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Job Description</Label>
                  <Textarea
                    name="description"
                    placeholder="Describe the role and responsibilities..."
                    className="min-h-[100px]"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="course-id">Course ID (linked to this job)</Label>
                  <Input
                    name="course-id"
                    value={courseId}
                    onChange={handleCourseIdChange}
                    placeholder="Enter course ID"
                    className={courseError ? "border-red-500 focus-visible:ring-red-500" : ""}
                    required
                  />
                  {courseInfo && (
                    <p className="text-green-600 text-sm">✓ {courseInfo.title}</p>
                  )}
                  {courseError && (
                    <p className="text-red-500 text-sm">{courseError}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="requirements">Requirements</Label>
                  <Textarea
                    name="requirements"
                    placeholder="List the qualifications and skills required..."
                    className="min-h-[80px]"
                    required
                  />
                </div>
                <Button type="submit" className="w-full">
                  Post Job
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

interface JobCardProps {
  job: Job;
  onApply: (jobId: string) => void;
  hasApplied: boolean;
  userHasCV: boolean;
}

const JobCard = ({ job, onApply, hasApplied, userHasCV }: JobCardProps) => {
  const [coursejob, setCourseJob] = useState<Course | null>(null);
  useEffect(() => {
    const fetchCourse = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/courses/${job.course}/`);
        if (!response.ok) {
          throw new Error("Failed to fetch course");
        }
        const data = await response.json();
        setCourseJob(data);
      } catch (error) {
        console.error("Error fetching course:", error);
        toast({
          title: "Error loading course",
          description: "Could not load course for this job.",
          variant: "destructive",
        });
      }
    };

    if (job.course) {
      fetchCourse();
    }
  }, [job.course]);

  return (
    <Card className="card-hover">
  <CardHeader>
    <div className="flex justify-between items-start">
      <div className="space-y-2">
        <CardTitle className="text-xl">{job.title}</CardTitle>
        <div className="flex items-center flex-wrap gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <Building className="h-4 w-4" />
            <span>{job.company_name || 'Company not specified'}</span>
          </div>
          {job.location && (
            <div className="flex items-center gap-1">
              <MapPin className="h-4 w-4" />
              <span>{job.location}</span>
            </div>
          )}
          {job.job_type && (
            <div className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              <span>{job.job_type}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  </CardHeader>

  <CardContent className="space-y-4">
    <CardDescription className="line-clamp-3">{job.description}</CardDescription>

    {job.requirements && (
      <div className="space-y-2">
        <h4 className="font-semibold text-sm">Requirements:</h4>
        <p className="text-sm text-muted-foreground">{job.requirements}</p>
      </div>
    )}

    <div className="grid grid-cols-1 md:grid-cols-3 items-center gap-4 pt-4 border-t">
      <div className="text-lg font-semibold text-primary col-span-1">
        {job.salary_range || 'Salary not specified'}
      </div>

      {coursejob && (
        <div className="col-span-1 flex justify-start md:justify-center">
          <VideoDialog course={coursejob} />
        </div>
      )}

      <div className="col-span-1 flex justify-end">
        <Button
          onClick={() => onApply(job.id)}
          disabled={hasApplied}
          variant={hasApplied ? "secondary" : "default"}
        >
          {hasApplied ? "Applied" : userHasCV ? "Apply Now" : "Upload CV to Apply"}
        </Button>
      </div>
    </div>
  </CardContent>
</Card>

  );
};

// const JobCard = ({ job }: JobCardProps) => {
//   const [course, setCourse] = useState<Course | null>(null);

//   useEffect(() => {
//     const fetchCourse = async () => {
//       try {
//         const response = await fetch(`${API_BASE_URL}/courses/${job.course}/`);
//         if (!response.ok) {
//           throw new Error("Failed to fetch course");
//         }
//         const data = await response.json();
//         setCourse(data);
//       } catch (error) {
//         console.error("Error fetching course:", error);
//         toast({
//           title: "Error loading course",
//           description: "Could not load course for this job.",
//           variant: "destructive",
//         });
//       }
//     };

//     if (job.course) {
//       fetchCourse();
//     }
//   }, [job.course]);

//   return (
//     <div className="border p-4 rounded-lg shadow-sm">
//       <h2 className="text-lg font-semibold">{job.title}</h2>
//       <p className="text-sm text-gray-600">{job.description}</p>
//       <p className="text-xs text-gray-400 mt-1">
//         Posted on {new Date(job.created_at).toLocaleDateString()}
//       </p>

//       {course && (
//         <div className="mt-4">
//           <VideoDialog course={course} />
//         </div>
//       )}
//     </div>
//   );
// };


export default JobsPage;
