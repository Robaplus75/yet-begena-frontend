
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Upload, FileText, Trash2 } from "lucide-react";
import { UserProfile } from "@/pages/Index";

interface CVUploadProps {
  user: UserProfile;
  onCVUploaded: (cvUrl: string) => void;
}

const CVUpload = ({ user, onCVUploaded }: CVUploadProps) => {
  const [uploading, setUploading] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const { toast } = useToast();

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile) {
      // Check file type
      const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
      if (!allowedTypes.includes(selectedFile.type)) {
        toast({
          title: "Invalid file type",
          description: "Please upload a PDF or Word document.",
          variant: "destructive",
        });
        return;
      }
      
      // Check file size (5MB limit)
      if (selectedFile.size > 5 * 1024 * 1024) {
        toast({
          title: "File too large",
          description: "Please upload a file smaller than 5MB.",
          variant: "destructive",
        });
        return;
      }
      
      setFile(selectedFile);
    }
  };

  const uploadCV = async () => {
    if (!file) return;

    setUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/cv.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage
        .from('cvs')
        .upload(fileName, file, { upsert: true });

      if (uploadError) {
        throw uploadError;
      }

      // Update user profile with CV URL
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ cv_url: fileName })
        .eq('id', user.id);

      if (updateError) {
        throw updateError;
      }

      toast({
        title: "CV uploaded successfully",
        description: "Your CV has been saved and will be attached to job applications.",
      });

      onCVUploaded(fileName);
      setFile(null);
    } catch (error) {
      console.error('Error uploading CV:', error);
      toast({
        title: "Upload failed",
        description: "There was an error uploading your CV. Please try again.",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  const deleteCV = async () => {
    if (!user.cv_url) return;

    try {
      const { error: deleteError } = await supabase.storage
        .from('cvs')
        .remove([user.cv_url]);

      if (deleteError) {
        throw deleteError;
      }

      // Update user profile to remove CV URL
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ cv_url: null })
        .eq('id', user.id);

      if (updateError) {
        throw updateError;
      }

      toast({
        title: "CV deleted",
        description: "Your CV has been removed.",
      });

      onCVUploaded('');
    } catch (error) {
      console.error('Error deleting CV:', error);
      toast({
        title: "Delete failed",
        description: "There was an error deleting your CV. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <FileText className="h-5 w-5" />
          <span>Your CV</span>
        </CardTitle>
        <CardDescription>
          Upload your CV to automatically attach it to job applications
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {user.cv_url ? (
          <div className="flex items-center justify-between p-3 border rounded-lg">
            <div className="flex items-center space-x-2">
              <FileText className="h-4 w-4 text-green-600" />
              <span className="text-sm">CV uploaded</span>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={deleteCV}
              className="text-red-600 hover:text-red-700"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="cv-file">Select CV (PDF or Word document)</Label>
              <Input
                id="cv-file"
                type="file"
                accept=".pdf,.doc,.docx"
                onChange={handleFileSelect}
              />
            </div>
            {file && (
              <div className="flex items-center justify-between p-3 border rounded-lg bg-blue-50">
                <div className="flex items-center space-x-2">
                  <FileText className="h-4 w-4 text-blue-600" />
                  <span className="text-sm">{file.name}</span>
                </div>
                <Button
                  onClick={uploadCV}
                  disabled={uploading}
                  size="sm"
                >
                  {uploading ? (
                    "Uploading..."
                  ) : (
                    <>
                      <Upload className="h-4 w-4 mr-1" />
                      Upload
                    </>
                  )}
                </Button>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default CVUpload;
