import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import Header from "@/components/layout/header";
import { 
  SearchIcon, 
  WandIcon, 
  DollarSignIcon, 
  ClockIcon, 
  UsersIcon,
  BuildingIcon,
  BookmarkIcon,
  ExternalLinkIcon
} from "lucide-react";

export default function JobSearch() {
  const [searchTerm, setSearchTerm] = useState("");
  const [location, setLocation] = useState("");
  const [experienceLevel, setExperienceLevel] = useState("");

  const [isSearching, setIsSearching] = useState(false);
  const [jobs, setJobs] = useState<any[]>([]);

  const handleSearch = async () => {
    if (!searchTerm.trim()) {
      return;
    }

    setIsSearching(true);
    try {
      const response = await fetch('/api/jobs/search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          keywords: searchTerm,
          location: location,
          experienceLevel: experienceLevel === 'any' ? '' : experienceLevel
        })
      });

      if (response.ok) {
        const jobData = await response.json();
        setJobs(jobData);
      } else {
        console.error('Failed to search jobs');
        setJobs([]);
      }
    } catch (error) {
      console.error('Error searching jobs:', error);
      setJobs([]);
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header 
        title="Job Search" 
        subtitle="AI-powered job discovery tailored to your profile"
        action={
          <Button className="bg-primary hover:bg-primary/90">
            <WandIcon className="h-4 w-4 mr-2" />
            Auto-Apply to Top 5
          </Button>
        }
      />

      <div className="p-6">
        {/* Search Filters */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <Label htmlFor="jobTitle">Job Title</Label>
                <Input
                  id="jobTitle"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Frontend Developer"
                />
              </div>

              <div>
                <Label htmlFor="location">Location</Label>
                <Input
                  id="location"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="San Francisco, CA"
                />
              </div>

              <div>
                <Label htmlFor="experience">Experience Level</Label>
                <Select value={experienceLevel} onValueChange={setExperienceLevel}>
                  <SelectTrigger>
                    <SelectValue placeholder="Any Experience" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="any">Any Experience</SelectItem>
                    <SelectItem value="entry">Entry Level</SelectItem>
                    <SelectItem value="mid">Mid Level</SelectItem>
                    <SelectItem value="senior">Senior Level</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-end">
                <Button onClick={handleSearch} className="w-full">
                  <SearchIcon className="h-4 w-4 mr-2" />
                  Search Jobs
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* AI Recommendations Banner */}
        <div className="bg-gradient-to-r from-primary to-accent rounded-xl p-6 mb-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl font-semibold mb-2">AI Job Discovery Ready!</h3>
              <p className="opacity-90">
                Complete your profile and upload your resume to get personalized job recommendations
              </p>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold">0</div>
              <div className="text-sm opacity-75">Jobs Found</div>
            </div>
          </div>
        </div>

        {/* Job Listings */}
        <div className="space-y-4">
          {isSearching ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
            </div>
          ) : jobs.length === 0 ? (
            <Card>
              <CardContent className="p-12 text-center">
                <SearchIcon className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-foreground mb-2">No Jobs Found</h3>
                <p className="text-muted-foreground mb-6">
                  We couldn't find any jobs matching your criteria. Try adjusting your search filters or complete your profile for better AI-powered recommendations.
                </p>
                <div className="flex gap-4 justify-center">
                  <Button onClick={() => window.location.href = '/profile'}>
                    Complete Profile
                  </Button>
                  <Button variant="outline" onClick={() => {
                    setSearchTerm("");
                    setLocation("");
                    setExperienceLevel("");
                  }}>
                    Clear Filters
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            // This would render actual job listings when available
            mockJobs.map((job) => (
              <Card key={job.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-4 flex-1">
                      <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                        <BuildingIcon className="h-6 w-6 text-primary" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h3 className="text-lg font-semibold text-foreground">{job.title}</h3>
                          <Badge className="bg-green-100 text-green-800">
                            {job.matchPercentage}% Match
                          </Badge>
                        </div>
                        <p className="text-muted-foreground mb-2">
                          {job.company} • {job.location} • {job.type}
                        </p>
                        <p className="text-foreground mb-3">{job.description}</p>
                        <div className="flex items-center space-x-4 text-sm text-muted-foreground mb-3">
                          <span className="flex items-center">
                            <DollarSignIcon className="h-4 w-4 mr-1" />
                            {job.salary}
                          </span>
                          <span className="flex items-center">
                            <ClockIcon className="h-4 w-4 mr-1" />
                            Posted {job.postedTime}
                          </span>
                          <span className="flex items-center">
                            <UsersIcon className="h-4 w-4 mr-1" />
                            {job.applicants} applicants
                          </span>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {job.skills?.map((skill: string) => (
                            <Badge key={skill} variant="secondary">
                              {skill}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-col space-y-2 ml-4">
                      <Button size="sm">
                        Auto-Apply
                      </Button>
                      <Button variant="outline" size="sm">
                        <ExternalLinkIcon className="h-4 w-4 mr-1" />
                        View Details
                      </Button>
                      <Button variant="ghost" size="sm">
                        <BookmarkIcon className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        {/* Load More Button */}
        {mockJobs.length > 0 && (
          <div className="text-center mt-8">
            <Button variant="outline">
              Load More Jobs
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
