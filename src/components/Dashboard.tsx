
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { User } from "lucide-react";
import { UserProfile } from "@/pages/Index";
import CoursesPage from "./CoursesPage";
import JobsPage from "./JobsPage";
import AdminDashboard from "./AdminDashboard";

interface DashboardProps {
  user: UserProfile;
  onLogout: () => void;
}

type ActivePage = "welcome" | "courses" | "jobs" | "admin";

const Dashboard = ({ user, onLogout }: DashboardProps) => {
  const [activePage, setActivePage] = useState<ActivePage>("welcome");

  const getUserTypeColor = (type: string) => {
    switch (type) {
      case "instructor": return "bg-green-100 text-green-800";
      case "employer": return "bg-blue-100 text-blue-800";
      case "admin": return "bg-purple-100 text-purple-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const renderContent = () => {
    switch (activePage) {
      case "courses":
        return <CoursesPage user={user} onBack={() => setActivePage("welcome")} />;
      case "jobs":
        return <JobsPage user={user} onBack={() => setActivePage("welcome")} />;
      case "admin":
        return <AdminDashboard user={user} onBack={() => setActivePage("welcome")} />;
      default:
        return <WelcomePage user={user} setActivePage={setActivePage} />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-green-50 to-yellow-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md shadow-sm border-b">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <h1 className="text-2xl font-bold gradient-text cursor-pointer" onClick={() => setActivePage("welcome")}>
              SkillBridge Ethiopia
            </h1>
            {activePage !== "welcome" && (
              <Button variant="outline" onClick={() => setActivePage("welcome")}>
                ← Dashboard
              </Button>
            )}
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <User className="h-5 w-5" />
              <span className="font-medium">{user.full_name}</span>
              <Badge className={getUserTypeColor(user.role)}>
                {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
              </Badge>
            </div>
            {user.role === "admin" && (
              <Button variant="outline" onClick={() => setActivePage("admin")}>
                Admin Panel
              </Button>
            )}
            <Button variant="outline" onClick={onLogout}>
              Logout
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {renderContent()}
      </main>
    </div>
  );
};

interface WelcomePageProps {
  user: UserProfile;
  setActivePage: (page: ActivePage) => void;
}

const WelcomePage = ({ user, setActivePage }: WelcomePageProps) => {
  return (
    <div className="space-y-8 animate-fade-in">
      {/* Welcome Message */}
      <div className="text-center space-y-4">
        <h2 className="text-4xl font-bold text-foreground">
          Welcome back, {user.full_name}! 👋
        </h2>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Ready to explore new opportunities? Choose what you'd like to do today.
        </p>
      </div>

      {/* Main Sections */}
      <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
        {/* Courses Section */}
        <Card className="card-hover cursor-pointer" onClick={() => setActivePage("courses")}>
          <CardHeader className="text-center pb-4">
            <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
              <span className="text-3xl">📚</span>
            </div>
            <CardTitle className="text-2xl">Courses</CardTitle>
            <CardDescription>
              Learn new skills and advance your knowledge
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 gap-3">
              <Button variant="outline" className="justify-start">
                🔍 Browse Courses
              </Button>
              <Button variant="outline" className="justify-start">
                📖 My Courses
              </Button>
              {user.role === "instructor" && (
                <Button variant="outline" className="justify-start">
                  ➕ Add Course
                </Button>
              )}
            </div>
            <div className="text-center pt-4 border-t">
              <div className="text-sm text-muted-foreground">
                <strong>1,247</strong> courses available
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Jobs Section */}
        <Card className="card-hover cursor-pointer" onClick={() => setActivePage("jobs")}>
          <CardHeader className="text-center pb-4">
            <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
              <span className="text-3xl">💼</span>
            </div>
            <CardTitle className="text-2xl">Jobs</CardTitle>
            <CardDescription>
              Find opportunities and advance your career
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 gap-3">
              <Button variant="outline" className="justify-start">
                🔍 Browse Jobs
              </Button>
              <Button variant="outline" className="justify-start">
                📋 Applied Jobs
              </Button>
              {user.role === "employer" && (
                <Button variant="outline" className="justify-start">
                  ➕ Post a Job
                </Button>
              )}
            </div>
            <div className="text-center pt-4 border-t">
              <div className="text-sm text-muted-foreground">
                <strong>456</strong> open positions
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
        <Card className="text-center">
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-primary">12</div>
            <div className="text-sm text-muted-foreground">Courses Enrolled</div>
          </CardContent>
        </Card>
        <Card className="text-center">
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-blue-600">5</div>
            <div className="text-sm text-muted-foreground">Jobs Applied</div>
          </CardContent>
        </Card>
        <Card className="text-center">
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-green-600">8</div>
            <div className="text-sm text-muted-foreground">Skills Earned</div>
          </CardContent>
        </Card>
        <Card className="text-center">
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-yellow-600">95%</div>
            <div className="text-sm text-muted-foreground">Profile Complete</div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
