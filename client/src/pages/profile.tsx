import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import Header from "@/components/layout/header";
import { 
  CloudUploadIcon, 
  FileTextIcon, 
  EyeIcon, 
  TrashIcon,
  PlusIcon,
  XIcon
} from "lucide-react";

const profileSchema = z.object({
  fullName: z.string().min(1, "Full name is required"),
  email: z.string().email("Invalid email address"),
  phone: z.string().optional(),
  linkedin: z.string().url("Invalid LinkedIn URL").optional().or(z.literal("")),
  desiredJobTitles: z.string().optional(),
  preferredLocations: z.string().optional(),
  industries: z.string().optional(),
});

export default function Profile() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [newSkill, setNewSkill] = useState("");

  const { data: user, isLoading } = useQuery({
    queryKey: ["/api/auth/user"],
  });

  const { data: resumes = [] } = useQuery({
    queryKey: ["/api/resumes"],
  });

  const form = useForm({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      fullName: user?.fullName || "",
      email: user?.email || "",
      phone: user?.phone || "",
      linkedin: user?.linkedin || "",
      desiredJobTitles: user?.desiredJobTitles || "",
      preferredLocations: user?.preferredLocations || "",
      industries: user?.industries || "",
    },
  });

  const updateProfileMutation = useMutation({
    mutationFn: (data: any) => apiRequest("PUT", "/api/user/profile", data),
    onSuccess: () => {
      toast({ title: "Profile updated successfully!" });
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
    },
    onError: (error: any) => {
      toast({ 
        title: "Error updating profile", 
        description: error.message,
        variant: "destructive" 
      });
    },
  });

  const uploadResumeMutation = useMutation({
    mutationFn: (formData: FormData) => {
      return fetch("/api/resumes/upload", {
        method: "POST",
        body: formData,
        credentials: "include",
      });
    },
    onSuccess: () => {
      toast({ title: "Resume uploaded successfully!" });
      queryClient.invalidateQueries({ queryKey: ["/api/resumes"] });
    },
    onError: (error: any) => {
      toast({ 
        title: "Error uploading resume", 
        description: error.message,
        variant: "destructive" 
      });
    },
  });

  const deleteResumeMutation = useMutation({
    mutationFn: (id: number) => apiRequest("DELETE", `/api/resumes/${id}`),
    onSuccess: () => {
      toast({ title: "Resume deleted successfully!" });
      queryClient.invalidateQueries({ queryKey: ["/api/resumes"] });
    },
    onError: (error: any) => {
      toast({ 
        title: "Error deleting resume", 
        description: error.message,
        variant: "destructive" 
      });
    },
  });

  const onSubmit = (data: any) => {
    const skills = user?.skills || [];
    updateProfileMutation.mutate({ ...data, skills });
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const formData = new FormData();
      formData.append("resume", file);
      uploadResumeMutation.mutate(formData);
    }
  };

  const addSkill = () => {
    if (newSkill.trim() && user) {
      const updatedSkills = [...(user.skills || []), newSkill.trim()];
      updateProfileMutation.mutate({ 
        ...form.getValues(), 
        skills: updatedSkills 
      });
      setNewSkill("");
    }
  };

  const removeSkill = (skillToRemove: string) => {
    if (user) {
      const updatedSkills = (user.skills || []).filter(skill => skill !== skillToRemove);
      updateProfileMutation.mutate({ 
        ...form.getValues(), 
        skills: updatedSkills 
      });
    }
  };

  // Calculate profile completion percentage
  const calculateProgress = () => {
    if (!user) return 0;
    const fields = [
      user.fullName,
      user.email,
      user.phone,
      user.linkedin,
      user.desiredJobTitles,
      user.preferredLocations,
      user.industries,
      user.skills?.length > 0,
      resumes.length > 0
    ];
    const completed = fields.filter(Boolean).length;
    return Math.round((completed / fields.length) * 100);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header title="Profile Setup" />

      <div className="p-6 max-w-4xl mx-auto">
        {/* Progress Indicator */}
        <div className="mb-8">
          <div className="flex items-center justify-between text-sm mb-2">
            <span className="text-primary font-medium">Profile Completion</span>
            <span className="text-muted-foreground">{calculateProgress()}% Complete</span>
          </div>
          <Progress value={calculateProgress()} className="h-2" />
        </div>

        {/* Profile Form */}
        <Card>
          <CardHeader>
            <CardTitle>Personal Information</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Personal Information */}
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="fullName">Full Name</Label>
                    <Input
                      id="fullName"
                      {...form.register("fullName")}
                      placeholder="John Doe"
                    />
                    {form.formState.errors.fullName && (
                      <p className="text-sm text-destructive mt-1">
                        {form.formState.errors.fullName.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      {...form.register("email")}
                      placeholder="john.doe@example.com"
                    />
                    {form.formState.errors.email && (
                      <p className="text-sm text-destructive mt-1">
                        {form.formState.errors.email.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input
                      id="phone"
                      type="tel"
                      {...form.register("phone")}
                      placeholder="+1 (555) 123-4567"
                    />
                  </div>

                  <div>
                    <Label htmlFor="linkedin">LinkedIn Profile</Label>
                    <Input
                      id="linkedin"
                      type="url"
                      {...form.register("linkedin")}
                      placeholder="https://linkedin.com/in/johndoe"
                    />
                    {form.formState.errors.linkedin && (
                      <p className="text-sm text-destructive mt-1">
                        {form.formState.errors.linkedin.message}
                      </p>
                    )}
                  </div>
                </div>

                {/* Resume Upload */}
                <div className="space-y-4">
                  <div>
                    <Label>Upload Resume</Label>
                    <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center hover:border-primary/50 transition-colors cursor-pointer">
                      <input
                        type="file"
                        accept=".pdf,.doc,.docx"
                        onChange={handleFileUpload}
                        className="hidden"
                        id="resume-upload"
                      />
                      <label htmlFor="resume-upload" className="cursor-pointer">
                        <CloudUploadIcon className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                        <p className="text-sm text-muted-foreground">
                          Drop your resume here or <span className="text-primary">browse files</span>
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">PDF, DOCX up to 10MB</p>
                      </label>
                    </div>
                  </div>

                  {/* Current Resumes */}
                  {resumes.length > 0 && (
                    <div className="space-y-2">
                      <Label>Your Resumes</Label>
                      {resumes.map((resume: any) => (
                        <div key={resume.id} className="bg-muted/30 rounded-lg p-4 flex items-center justify-between">
                          <div className="flex items-center">
                            <FileTextIcon className="h-5 w-5 text-primary mr-3" />
                            <div>
                              <p className="text-sm font-medium text-foreground">{resume.fileName}</p>
                              <p className="text-xs text-muted-foreground">
                                Uploaded {new Date(resume.uploadedAt).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            {resume.isActive && (
                              <Badge variant="default" className="bg-green-100 text-green-800">Active</Badge>
                            )}
                            <Button variant="ghost" size="sm">
                              <EyeIcon className="h-4 w-4" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => deleteResumeMutation.mutate(resume.id)}
                            >
                              <TrashIcon className="h-4 w-4 text-destructive" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Skills */}
                  <div>
                    <Label>Key Skills</Label>
                    <div className="flex flex-wrap gap-2 mb-3">
                      {user?.skills?.map((skill: string) => (
                        <Badge key={skill} variant="secondary" className="flex items-center gap-2">
                          {skill}
                          <XIcon 
                            className="h-3 w-3 cursor-pointer" 
                            onClick={() => removeSkill(skill)}
                          />
                        </Badge>
                      ))}
                    </div>
                    <div className="flex gap-2">
                      <Input
                        value={newSkill}
                        onChange={(e) => setNewSkill(e.target.value)}
                        placeholder="Add a skill"
                        onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addSkill())}
                      />
                      <Button type="button" onClick={addSkill} size="sm">
                        <PlusIcon className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Job Preferences */}
              <div className="pt-6 border-t border-border">
                <h3 className="text-lg font-semibold text-foreground mb-4">Job Preferences</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="desiredJobTitles">Desired Job Titles</Label>
                    <Input
                      id="desiredJobTitles"
                      {...form.register("desiredJobTitles")}
                      placeholder="e.g., Frontend Developer, React Developer"
                    />
                  </div>

                  <div>
                    <Label htmlFor="preferredLocations">Preferred Locations</Label>
                    <Input
                      id="preferredLocations"
                      {...form.register("preferredLocations")}
                      placeholder="e.g., San Francisco, Remote"
                    />
                  </div>

                  <div>
                    <Label htmlFor="industries">Industries</Label>
                    <Input
                      id="industries"
                      {...form.register("industries")}
                      placeholder="e.g., Technology, Healthcare"
                    />
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-between pt-6">
                <Button type="button" variant="outline">
                  Save as Draft
                </Button>
                <Button 
                  type="submit" 
                  disabled={updateProfileMutation.isPending}
                  className="bg-primary hover:bg-primary/90"
                >
                  {updateProfileMutation.isPending ? "Saving..." : "Save Profile"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
