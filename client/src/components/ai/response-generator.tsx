import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { 
  Bot,
  WandIcon,
  CopyIcon,
  RefreshCwIcon,
  CheckIcon,
  AlertCircleIcon
} from "lucide-react";

interface ResponseGeneratorProps {
  jobTitle?: string;
  company?: string;
  jobDescription?: string;
  onResponseGenerated?: (response: string) => void;
}

export default function ResponseGenerator({ 
  jobTitle = "", 
  company = "", 
  jobDescription = "",
  onResponseGenerated 
}: ResponseGeneratorProps) {
  const { toast } = useToast();
  const [question, setQuestion] = useState("");
  const [generatedResponse, setGeneratedResponse] = useState("");
  const [copied, setCopied] = useState(false);

  const generateResponseMutation = useMutation({
    mutationFn: (data: {
      question: string;
      jobTitle?: string;
      company?: string;
      jobDescription?: string;
    }) => apiRequest("POST", "/api/ai/generate-response", data),
    onSuccess: async (response) => {
      const data = await response.json();
      setGeneratedResponse(data.response);
      onResponseGenerated?.(data.response);
      toast({
        title: "Response generated successfully!",
        description: "Your AI-powered response is ready to use.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error generating response",
        description: error.message || "Failed to generate AI response. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleGenerate = () => {
    if (!question.trim()) {
      toast({
        title: "Question required",
        description: "Please enter a question to generate a response.",
        variant: "destructive",
      });
      return;
    }

    generateResponseMutation.mutate({
      question: question.trim(),
      jobTitle,
      company,
      jobDescription,
    });
  };

  const handleCopy = async () => {
    if (!generatedResponse) return;
    
    try {
      await navigator.clipboard.writeText(generatedResponse);
      setCopied(true);
      toast({
        title: "Copied to clipboard!",
        description: "The response has been copied to your clipboard.",
      });
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast({
        title: "Copy failed",
        description: "Failed to copy to clipboard. Please select and copy manually.",
        variant: "destructive",
      });
    }
  };

  const commonQuestions = [
    "Why are you interested in this position?",
    "What makes you a good fit for this role?",
    "Tell us about your relevant experience.",
    "What are your greatest strengths?",
    "Why do you want to work at this company?",
    "Where do you see yourself in 5 years?",
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Bot className="h-5 w-5 mr-2 text-primary" />
          AI Response Generator
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Job Context */}
        {(jobTitle || company) && (
          <div className="bg-muted/30 rounded-lg p-4">
            <h4 className="text-sm font-medium text-foreground mb-2">Job Context</h4>
            <div className="flex flex-wrap gap-2">
              {jobTitle && (
                <Badge variant="secondary">{jobTitle}</Badge>
              )}
              {company && (
                <Badge variant="outline">{company}</Badge>
              )}
            </div>
          </div>
        )}

        {/* Common Questions */}
        <div>
          <Label className="text-sm font-medium text-foreground mb-3 block">
            Common Questions
          </Label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {commonQuestions.map((q, index) => (
              <Button
                key={index}
                variant="outline"
                size="sm"
                className="text-left justify-start h-auto py-2 px-3 text-xs"
                onClick={() => setQuestion(q)}
              >
                {q}
              </Button>
            ))}
          </div>
        </div>

        {/* Question Input */}
        <div>
          <Label htmlFor="question" className="text-sm font-medium text-foreground">
            Enter your question
          </Label>
          <Textarea
            id="question"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="e.g., Why are you interested in this position?"
            className="mt-2"
            rows={3}
          />
        </div>

        {/* Generate Button */}
        <Button
          onClick={handleGenerate}
          disabled={generateResponseMutation.isPending || !question.trim()}
          className="w-full bg-accent hover:bg-accent/90 text-accent-foreground"
        >
          {generateResponseMutation.isPending ? (
            <>
              <RefreshCwIcon className="h-4 w-4 mr-2 animate-spin" />
              Generating Response...
            </>
          ) : (
            <>
              <WandIcon className="h-4 w-4 mr-2" />
              Generate AI Response
            </>
          )}
        </Button>

        {/* Generated Response */}
        {generatedResponse && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-sm font-medium text-foreground">
                Generated Response
              </Label>
              <Button
                variant="outline"
                size="sm"
                onClick={handleCopy}
                className="text-xs"
              >
                {copied ? (
                  <>
                    <CheckIcon className="h-3 w-3 mr-1" />
                    Copied!
                  </>
                ) : (
                  <>
                    <CopyIcon className="h-3 w-3 mr-1" />
                    Copy
                  </>
                )}
              </Button>
            </div>
            <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
              <p className="text-sm text-foreground whitespace-pre-wrap">
                {generatedResponse}
              </p>
            </div>
          </div>
        )}

        {/* Error State */}
        {generateResponseMutation.isError && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
            <div className="flex items-center">
              <AlertCircleIcon className="h-5 w-5 text-red-600 mr-2" />
              <p className="text-sm text-red-700 dark:text-red-400">
                Failed to generate response. Please check your connection and try again.
              </p>
            </div>
          </div>
        )}

        {/* Tips */}
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
          <h4 className="text-sm font-medium text-blue-900 dark:text-blue-100 mb-2">
            💡 Tips for better responses:
          </h4>
          <ul className="text-xs text-blue-700 dark:text-blue-300 space-y-1">
            <li>• Be specific about the role and company when possible</li>
            <li>• Complete your profile for more personalized responses</li>
            <li>• Review and customize the generated response to match your voice</li>
            <li>• Use the response as a starting point, not a final answer</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}
