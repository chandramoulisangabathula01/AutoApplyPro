import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import Header from "@/components/layout/header";
import { 
  DownloadIcon, 
  FilterIcon, 
  BuildingIcon,
  EyeIcon,
  EditIcon,
  CalendarIcon,
  TrendingUpIcon,
  AlertCircleIcon,
  CheckIcon
} from "lucide-react";

export default function Applications() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedApplication, setSelectedApplication] = useState<any>(null);
  const [statusFilter, setStatusFilter] = useState("");
  const [isUpdateDialogOpen, setIsUpdateDialogOpen] = useState(false);

  const { data: applications = [], isLoading } = useQuery({
    queryKey: ["/api/applications"],
  });

  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status, notes }: { id: number; status: string; notes?: string }) =>
      apiRequest("PUT", `/api/applications/${id}/status`, { status, notes }),
    onSuccess: () => {
      toast({ title: "Application status updated successfully!" });
      queryClient.invalidateQueries({ queryKey: ["/api/applications"] });
      setIsUpdateDialogOpen(false);
    },
    onError: (error: any) => {
      toast({ 
        title: "Error updating status", 
        description: error.message,
        variant: "destructive" 
      });
    },
  });

  // Filter applications based on status
  const filteredApplications = applications.filter((app: any) => 
    statusFilter === "" || statusFilter === "all" || app.status === statusFilter
  );

  // Calculate summary stats
  const stats = {
    total: applications.length,
    pending: applications.filter((app: any) => app.status === 'pending').length,
    underReview: applications.filter((app: any) => app.status === 'under_review').length,
    interviews: applications.filter((app: any) => app.status === 'interview').length,
    rejected: applications.filter((app: any) => app.status === 'rejected').length,
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      'pending': { variant: 'outline' as const, label: 'Pending', className: 'border-yellow-300 text-yellow-700' },
      'applied': { variant: 'secondary' as const, label: 'Applied' },
      'under_review': { variant: 'default' as const, label: 'Under Review', className: 'bg-blue-100 text-blue-800' },
      'interview': { variant: 'default' as const, label: 'Interview', className: 'bg-green-100 text-green-800' },
      'rejected': { variant: 'destructive' as const, label: 'Rejected' },
      'offer': { variant: 'default' as const, label: 'Offer', className: 'bg-green-500 text-white' }
    };
    
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;
    return (
      <Badge variant={config.variant} className={config.className}>
        {config.label}
      </Badge>
    );
  };

  const handleUpdateStatus = (status: string, notes?: string) => {
    if (selectedApplication) {
      updateStatusMutation.mutate({
        id: selectedApplication.id,
        status,
        notes
      });
    }
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
      <Header 
        title="Applications" 
        subtitle="Track and manage all your job applications"
        action={
          <div className="flex space-x-3">
            <Button variant="outline">
              <DownloadIcon className="h-4 w-4 mr-2" />
              Export
            </Button>
            <Button variant="outline">
              <FilterIcon className="h-4 w-4 mr-2" />
              Filter
            </Button>
          </div>
        }
      />

      <div className="p-6">
        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-foreground">{stats.total}</div>
              <div className="text-sm text-muted-foreground">Total Applied</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-yellow-600">{stats.pending}</div>
              <div className="text-sm text-muted-foreground">Pending</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-blue-600">{stats.underReview}</div>
              <div className="text-sm text-muted-foreground">Under Review</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-green-600">{stats.interviews}</div>
              <div className="text-sm text-muted-foreground">Interviews</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-red-600">{stats.rejected}</div>
              <div className="text-sm text-muted-foreground">Rejected</div>
            </CardContent>
          </Card>
        </div>

        {/* Filter */}
        <div className="mb-6">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-64">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Applications</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="applied">Applied</SelectItem>
              <SelectItem value="under_review">Under Review</SelectItem>
              <SelectItem value="interview">Interview</SelectItem>
              <SelectItem value="rejected">Rejected</SelectItem>
              <SelectItem value="offer">Offer</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Applications Table */}
        <Card>
          <CardHeader>
            <CardTitle>
              {statusFilter ? `${statusFilter.replace('_', ' ').toUpperCase()} Applications` : 'All Applications'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {filteredApplications.length === 0 ? (
              <div className="text-center py-12">
                <AlertCircleIcon className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-foreground mb-2">No Applications Found</h3>
                <p className="text-muted-foreground mb-6">
                  {statusFilter 
                    ? `No applications with ${statusFilter.replace('_', ' ')} status found.`
                    : "You haven't applied to any jobs yet. Start your job search today!"
                  }
                </p>
                <Button onClick={() => window.location.href = '/job-search'}>
                  Start Job Search
                </Button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="border-b">
                    <tr>
                      <th className="text-left py-3 px-4 font-medium text-muted-foreground">Job & Company</th>
                      <th className="text-left py-3 px-4 font-medium text-muted-foreground">Applied Date</th>
                      <th className="text-left py-3 px-4 font-medium text-muted-foreground">Status</th>
                      <th className="text-left py-3 px-4 font-medium text-muted-foreground">Response</th>
                      <th className="text-left py-3 px-4 font-medium text-muted-foreground">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {filteredApplications.map((application: any) => (
                      <tr key={application.id} className="hover:bg-muted/30">
                        <td className="py-4 px-4">
                          <div className="flex items-center">
                            <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center mr-3">
                              <BuildingIcon className="h-5 w-5 text-primary" />
                            </div>
                            <div>
                              <div className="font-medium text-foreground">{application.jobTitle}</div>
                              <div className="text-sm text-muted-foreground">{application.company}</div>
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-4 text-foreground">
                          {new Date(application.appliedAt).toLocaleDateString()}
                        </td>
                        <td className="py-4 px-4">
                          {getStatusBadge(application.status)}
                        </td>
                        <td className="py-4 px-4 text-foreground">
                          {application.responseDate 
                            ? new Date(application.responseDate).toLocaleDateString()
                            : '-'
                          }
                        </td>
                        <td className="py-4 px-4">
                          <div className="flex space-x-2">
                            <Button variant="ghost" size="sm">
                              <EyeIcon className="h-4 w-4" />
                            </Button>
                            <Dialog open={isUpdateDialogOpen} onOpenChange={setIsUpdateDialogOpen}>
                              <DialogTrigger asChild>
                                <Button 
                                  variant="ghost" 
                                  size="sm"
                                  onClick={() => setSelectedApplication(application)}
                                >
                                  <EditIcon className="h-4 w-4" />
                                </Button>
                              </DialogTrigger>
                              <DialogContent>
                                <DialogHeader>
                                  <DialogTitle>Update Application Status</DialogTitle>
                                </DialogHeader>
                                <div className="space-y-4">
                                  <div>
                                    <Label>Job Title</Label>
                                    <p className="text-sm text-muted-foreground">
                                      {selectedApplication?.jobTitle} at {selectedApplication?.company}
                                    </p>
                                  </div>
                                  <div>
                                    <Label>Current Status</Label>
                                    <div className="mt-1">
                                      {selectedApplication && getStatusBadge(selectedApplication.status)}
                                    </div>
                                  </div>
                                  <div className="grid grid-cols-2 gap-2">
                                    <Button 
                                      variant="outline" 
                                      size="sm"
                                      onClick={() => handleUpdateStatus('under_review')}
                                    >
                                      Under Review
                                    </Button>
                                    <Button 
                                      variant="outline" 
                                      size="sm"
                                      onClick={() => handleUpdateStatus('interview')}
                                    >
                                      Interview
                                    </Button>
                                    <Button 
                                      variant="outline" 
                                      size="sm"
                                      onClick={() => handleUpdateStatus('offer')}
                                    >
                                      Offer
                                    </Button>
                                    <Button 
                                      variant="outline" 
                                      size="sm"
                                      onClick={() => handleUpdateStatus('rejected')}
                                    >
                                      Rejected
                                    </Button>
                                  </div>
                                </div>
                              </DialogContent>
                            </Dialog>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
