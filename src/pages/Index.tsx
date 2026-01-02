import { useState, useRef, useEffect, useCallback } from "react";
import { useParams } from "react-router-dom";
import { Sidebar, CategoryType } from "@/components/Sidebar";
import { ChatMessage, Message } from "@/components/ChatMessage";
import { ChatInput } from "@/components/ChatInput";
import { WelcomeCard } from "@/components/WelcomeCard";
import { BlackHoleLoader } from "@/components/BlackHoleLoader";
import { BookReader } from "@/components/BookReader";
import { GitHubAnalyzer } from "@/components/GitHubAnalyzer";
import { Recents } from "@/components/Recents";
import { apiService } from "@/lib/api";

const Index = () => {
  const { owner, repo } = useParams();
  const [activeCategory, setActiveCategory] = useState<CategoryType>("architecture");
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [backendStatus, setBackendStatus] = useState<"connecting" | "connected" | "error">("connecting");
  const [bookMode, setBookMode] = useState(false);
  const [activeBookMessage, setActiveBookMessage] = useState<Message | null>(null);
  const [downloadId, setDownloadId] = useState<string | null>(null);
  const [autoGitHubUrl, setAutoGitHubUrl] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);

  // Detect GitHub repo from URL (githubxyz.com/owner/repo)
  useEffect(() => {
    if (owner && repo) {
      const githubUrl = `https://github.com/${owner}/${repo}`;
      setAutoGitHubUrl(githubUrl);
      setActiveCategory("github");
    }
  }, [owner, repo]);

  // Check if there's a response to show in book mode
  const hasResponse = messages.some(m => m.role === "assistant");

  // Scroll to bottom only when new messages are added, not on re-renders
  const scrollToBottom = useCallback(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth", block: "end" });
    }
  }, []);

  // Only scroll when messages change, with a small delay to ensure rendering is complete
  useEffect(() => {
    const timer = setTimeout(() => {
      scrollToBottom();
    }, 100);
    return () => clearTimeout(timer);
  }, [messages.length, scrollToBottom]);

  useEffect(() => {
    apiService.healthCheck().then((isHealthy) => {
      setBackendStatus(isHealthy ? "connected" : "error");
    });
  }, []);

  // Auto-open book mode when response is received
  useEffect(() => {
    const lastMessage = messages[messages.length - 1];
    if (lastMessage?.role === "assistant" && !isLoading) {
      setActiveBookMessage(lastMessage);
      setBookMode(true);
    }
  }, [messages, isLoading]);

  const handleCategoryChange = useCallback((category: CategoryType) => {
    setActiveCategory(category);
    setMessages([]);
    setBookMode(false);
    setActiveBookMessage(null);
    setDownloadId(null);
  }, []);

  const handleSend = useCallback(async (content: string) => {
    // GitHub and Recents categories are handled separately
    if (activeCategory === "github" || activeCategory === "recents") return;
    
    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content,
      timestamp: new Date(),
      category: activeCategory,
    };

    setMessages((prev) => [...prev, userMessage]);
    setIsLoading(true);
    setBookMode(false);

    try {
      const response = await apiService.chat(activeCategory, content);
      
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: response,
        timestamp: new Date(),
        category: activeCategory,
        userPrompt: content,
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: `⚠️ **Error connecting to backend**\n\nPlease make sure the backend server is running at http://localhost:8000\n\n\`\`\`\ncd backend\npython run.py\n\`\`\`\n\nError: ${error instanceof Error ? error.message : "Unknown error"}`,
        timestamp: new Date(),
        category: activeCategory,
        userPrompt: content,
      };
      setMessages((prev) => [...prev, errorMessage]);
      setBackendStatus("error");
    }

    setIsLoading(false);
  }, [activeCategory]);

  const handleGitHubAnalysis = useCallback((result: string, repoName: string, downloadId: string) => {
    const assistantMessage: Message = {
      id: Date.now().toString(),
      role: "assistant",
      content: result,
      timestamp: new Date(),
      category: "github",
      userPrompt: `GitHub Repository: ${repoName}`,
    };

    setMessages([assistantMessage]);
    setDownloadId(downloadId);
  }, []);

  const handleRecentSelect = useCallback((entry: any) => {
    const assistantMessage: Message = {
      id: Date.now().toString(),
      role: "assistant",
      content: entry.response,
      timestamp: new Date(entry.timestamp),
      category: entry.category,
      userPrompt: entry.prompt,
    };

    setMessages([assistantMessage]);
    setActiveCategory(entry.category);
  }, []);

  const handleExampleClick = useCallback((example: string) => {
    handleSend(example);
  }, [handleSend]);

  const handleCloseBook = useCallback(() => {
    setBookMode(false);
  }, []);

  const handleDownloadKnowledge = useCallback(() => {
    if (!activeBookMessage) return;
    
    const categoryTitle = {
      architecture: "System Architecture Guide",
      ui: "UI/UX Design Handbook",
      database: "Database Design Manual",
      api: "API Design Reference",
      prompts: "Prompt Engineering Guide",
    }[activeBookMessage.category || "architecture"] || "Knowledge Guide";
    
    // Extract sections from content for TOC
    const sections: { title: string; content: string }[] = [];
    const parts = activeBookMessage.content.split(/(?=^# )/gm);
    
    parts.forEach((part) => {
      const lines = part.trim().split("\n");
      if (lines.length === 0) return;
      const headerMatch = lines[0].match(/^#\s+(.+)/);
      if (headerMatch) {
        sections.push({
          title: headerMatch[1].replace(/[\u{1F300}-\u{1F9FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]/gu, "").trim(),
          content: lines.slice(1).join("\n").trim(),
        });
      }
    });
    
    // Generate professional markdown document
    const docContent = `# ${categoryTitle}

---

**Generated:** ${activeBookMessage.timestamp.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}
**Source:** PromptCraft AI
**Query:** ${activeBookMessage.userPrompt || "User query"}

---

## Table of Contents

${sections.map((s, i) => `${i + 1}. [${s.title}](#${s.title.toLowerCase().replace(/[^a-z0-9]+/g, "-")})`).join("\n")}

---

${activeBookMessage.content}

---

## Document Information

| Property | Value |
|----------|-------|
| Category | ${activeBookMessage.category || "General"} |
| Generated | ${activeBookMessage.timestamp.toISOString()} |
| Format | Markdown |
| Source | PromptCraft AI Knowledge Base |

---

*This document was automatically generated by PromptCraft AI. For best results, review and customize the recommendations for your specific use case.*
`;

    // Download as markdown file (better format than JSON)
    const blob = new Blob([docContent], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${categoryTitle.replace(/\s+/g, "_")}_${Date.now()}.md`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }, [activeBookMessage]);

  const categoryTitles: Record<CategoryType, string> = {
    architecture: "System Architecture Design",
    ui: "UI Package Suggestions",
    database: "Database Schema Design",
    api: "API Design Guidelines",
    prompts: "Prompt Templates",
    github: "GitHub Repository Analyzer",
    recents: "Recent Queries",
  };

  // Book Reader Mode (full screen)
  if (bookMode && activeBookMessage) {
    return (
      <BookReader
        content={activeBookMessage.content}
        category={activeBookMessage.category || activeCategory}
        userPrompt={activeBookMessage.userPrompt || ""}
        timestamp={activeBookMessage.timestamp}
        onClose={handleCloseBook}
        onDownload={handleDownloadKnowledge}
      />
    );
  }

  return (
    <div className="flex h-screen bg-background overflow-hidden font-sans">
      {/* Sidebar - narrower when loading or has response */}
      <div className={`flex-shrink-0 transition-all duration-300 ${
        isLoading || hasResponse ? "w-16" : "w-72"
      }`}>
        <Sidebar
          activeCategory={activeCategory}
          onCategoryChange={handleCategoryChange}
          collapsed={isLoading || hasResponse}
        />
      </div>
      
      <main className="flex-1 flex flex-col min-w-0 h-screen">
        {/* Header - shorter when loading */}
        <header className={`border-b border-border flex items-center justify-between px-6 bg-card/50 flex-shrink-0 transition-all duration-300 ${
          isLoading ? "h-10" : "h-14"
        }`}>
          <h2 className={`font-semibold text-foreground tracking-tight transition-all ${
            isLoading ? "text-sm" : "text-lg"
          }`}>
            {categoryTitles[activeCategory]}
          </h2>
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${
              backendStatus === "connected" ? "bg-green-500" : 
              backendStatus === "connecting" ? "bg-yellow-500 animate-pulse" : 
              "bg-red-500"
            }`} />
            <span className="text-xs text-muted-foreground">
              {backendStatus === "connected" ? "Connected" : 
               backendStatus === "connecting" ? "Connecting..." : 
               "Offline"}
            </span>
          </div>
        </header>

        <div ref={messagesContainerRef} className="flex-1 overflow-y-auto scroll-smooth">
          {messages.length === 0 && !isLoading ? (
            activeCategory === "github" ? (
              <div className="p-6">
                <GitHubAnalyzer 
                  onAnalysisComplete={handleGitHubAnalysis}
                  autoAnalyzeUrl={autoGitHubUrl || undefined}
                />
              </div>
            ) : activeCategory === "recents" ? (
              <Recents onSelectEntry={handleRecentSelect} />
            ) : (
              <WelcomeCard category={activeCategory} onExampleClick={handleExampleClick} />
            )
          ) : (
            <div className="p-6 space-y-4">
              {messages.map((message) => (
                <ChatMessage key={message.id} message={message} />
              ))}
              {isLoading && (
                <BlackHoleLoader />
              )}
              <div ref={messagesEndRef} style={{ height: "1px" }} />
            </div>
          )}
        </div>

        {/* Chat Input - hidden when loading or response exists or GitHub/Recents category */}
        {!isLoading && !hasResponse && activeCategory !== "github" && activeCategory !== "recents" && (
          <ChatInput
            onSend={handleSend}
            isLoading={isLoading}
            category={activeCategory}
          />
        )}

        {/* New Query Button when in response mode */}
        {hasResponse && !isLoading && (
          <div className="p-4 border-t border-border bg-card/50">
            <div className="flex gap-2">
              <button
                onClick={() => {
                  setMessages([]);
                  setBookMode(false);
                  setActiveBookMessage(null);
                  setDownloadId(null);
                }}
                className="flex-1 py-3 px-4 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 rounded-lg transition-colors font-medium"
              >
                Start New Query
              </button>
              {activeCategory === "github" && downloadId && (
                <button
                  onClick={() => {
                    window.open(`http://localhost:8002/api/download/${downloadId}`, '_blank');
                  }}
                  className="py-3 px-4 bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg transition-colors font-medium flex items-center gap-2"
                  title="Download Architecture Documentation"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                  Download
                </button>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default Index;
