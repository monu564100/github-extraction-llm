import { useState, useEffect } from "react";
import { Github, Loader2, ExternalLink, Download, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { BlackHoleAnimation } from "./BlackHoleAnimation";

interface GitHubAnalyzerProps {
  onAnalysisComplete?: (result: string, repoName: string, downloadId: string) => void;
  autoAnalyzeUrl?: string;
}

export const GitHubAnalyzer = ({ onAnalysisComplete, autoAnalyzeUrl }: GitHubAnalyzerProps) => {
  const [githubUrl, setGithubUrl] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState("");
  const [progress, setProgress] = useState("");
  const [progressPercent, setProgressPercent] = useState(0);
  const [analysisComplete, setAnalysisComplete] = useState(false);
  const [downloadId, setDownloadId] = useState<string | null>(null);

  const validateGitHubUrl = (url: string): boolean => {
    const githubPattern = /^https?:\/\/(www\.)?github\.com\/[\w-]+\/[\w.-]+\/?$/;
    return githubPattern.test(url);
  };

  const handleAnalyze = async (urlToAnalyze?: string) => {
    const targetUrl = urlToAnalyze || githubUrl;
    
    if (!targetUrl.trim()) {
      setError("Please enter a GitHub repository URL");
      return;
    }

    if (!validateGitHubUrl(targetUrl)) {
      setError("Please enter a valid GitHub repository URL (e.g., https://github.com/owner/repo)");
      return;
    }

    setError("");
    setIsAnalyzing(true);
    setAnalysisComplete(false);
    setProgressPercent(10);
    setProgress("🔍 Validating repository...");

    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      setProgressPercent(20);
      setProgress("📥 Cloning repository...");

      // Call git_back backend
      const response = await fetch("http://localhost:8002/api/analyze", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ github_url: targetUrl }),
      });

      setProgressPercent(40);
      setProgress("📊 Analyzing code structure...");
      await new Promise(resolve => setTimeout(resolve, 800));

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ detail: "Analysis failed" }));
        throw new Error(errorData.detail || "Failed to analyze repository");
      }

      setProgressPercent(60);
      setProgress("🔐 Checking security vulnerabilities...");
      await new Promise(resolve => setTimeout(resolve, 800));
      
      setProgressPercent(80);
      setProgress("🤖 Generating architecture documentation...");
      const data = await response.json();

      if (data.success) {
        setProgressPercent(100);
        setProgress("✅ Analysis complete!");
        setAnalysisComplete(true);
        setDownloadId(data.download_id);
        
        // Auto-download after 1.5 seconds
        setTimeout(() => {
          window.open(`http://localhost:8002/api/download/${data.download_id}`, '_blank');
        }, 1500);
        
        if (onAnalysisComplete) {
          onAnalysisComplete(data.readme_content, data.repo_name, data.download_id);
        }
      } else {
        throw new Error(data.message || "Analysis failed");
      }

    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to analyze repository");
      setProgress("");
      setProgressPercent(0);
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Auto-analyze when URL is provided via route
  useEffect(() => {
    if (autoAnalyzeUrl && !isAnalyzing && !analysisComplete) {
      setGithubUrl(autoAnalyzeUrl);
      handleAnalyze(autoAnalyzeUrl);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoAnalyzeUrl]);

  const handleDownload = async (downloadId: string) => {
    try {
      window.open(`http://localhost:8002/api/download/${downloadId}`, '_blank');
    } catch (err) {
      console.error("Download failed:", err);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {isAnalyzing ? (
        <BlackHoleAnimation 
          progress={progressPercent}
          statusText={progress}
          repoName={githubUrl.replace('https://github.com/', '')}
        />
      ) : analysisComplete ? (
        <Card className="p-8 bg-gradient-to-br from-green-500/10 to-green-600/10 border-2 border-green-500/30">
          <div className="text-center space-y-4">
            <div className="flex justify-center">
              <CheckCircle className="w-16 h-16 text-green-500" />
            </div>
            <h2 className="text-2xl font-bold text-green-400">Analysis Complete!</h2>
            <p className="text-muted-foreground">Your architecture documentation is downloading...</p>
            {downloadId && (
              <Button
                onClick={() => window.open(`http://localhost:8002/api/download/${downloadId}`, '_blank')}
                className="bg-green-600 hover:bg-green-700"
              >
                <Download className="w-4 h-4 mr-2" />
                Download Again
              </Button>
            )}
          </div>
        </Card>
      ) : (
        <Card className="p-6 bg-gradient-to-br from-background to-secondary/20 border-2 border-primary/20">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center">
              <Github className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-foreground">GitHub Repository Analyzer</h2>
              <p className="text-sm text-muted-foreground">Analyze any public GitHub repository</p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="github-url" className="text-sm font-medium text-foreground">
                Repository URL
              </label>
              <div className="flex gap-2">
                <Input
                  id="github-url"
                  type="text"
                  placeholder="https://github.com/owner/repository"
                  value={githubUrl}
                  onChange={(e) => {
                    setGithubUrl(e.target.value);
                    setError("");
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !isAnalyzing) {
                      handleAnalyze();
                    }
                  }}
                  disabled={isAnalyzing}
                  className={cn(
                    "flex-1 transition-all",
                    error && "border-red-500 focus-visible:ring-red-500"
                  )}
                />
                <Button
                  onClick={() => handleAnalyze()}
                  disabled={isAnalyzing || !githubUrl.trim()}
                  className="min-w-[120px]"
                >
                  {isAnalyzing ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Analyzing
                    </>
                  ) : (
                    <>
                      <Github className="w-4 h-4 mr-2" />
                      Analyze
                    </>
                  )}
                </Button>
              </div>
              
              {error && (
                <p className="text-sm text-red-500 animate-in fade-in slide-in-from-top-1 duration-200">
                  {error}
                </p>
              )}
            </div>

            <div className="pt-4 border-t border-border">
              <p className="text-xs text-muted-foreground mb-2">✨ What you'll get:</p>
              <ul className="text-xs text-muted-foreground space-y-1 ml-4">
                <li>• Complete system architecture analysis</li>
                <li>• Security vulnerabilities & code issues</li>
                <li>• Performance optimization suggestions</li>
                <li>• Detailed improvement recommendations</li>
                <li>• Downloadable documentation (Markdown)</li>
              </ul>
            </div>

            <div className="flex items-center gap-2 pt-2">
              <ExternalLink className="w-3 h-3 text-muted-foreground" />
              <p className="text-xs text-muted-foreground">
                Only public repositories are supported. Private repos will fail.
              </p>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
};
