import { memo, useCallback } from "react";
import { Bot, User, Download, BookOpen } from "lucide-react";
import { cn } from "@/lib/utils";
import { MarkdownRenderer } from "./MarkdownRenderer";
import { Button } from "./ui/button";

export interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  category?: string;
  userPrompt?: string;
}

interface ChatMessageProps {
  message: Message;
}

export const ChatMessage = memo(function ChatMessage({ message }: ChatMessageProps) {
  const isAssistant = message.role === "assistant";

  const handleDownloadKnowledge = useCallback(() => {
    // Create knowledge JSON for AI agent training
    const knowledgeData = {
      metadata: {
        generated_at: message.timestamp.toISOString(),
        category: message.category || "general",
        source: "PromptCraft AI",
        version: "1.0",
      },
      training_data: {
        prompt: message.userPrompt || "User query",
        response: message.content,
        context: {
          domain: message.category || "system_design",
          type: "expert_knowledge",
        },
      },
      knowledge_base: {
        content: message.content,
        format: "markdown",
        topics: extractTopics(message.content),
      },
      usage_instructions: {
        description: "This JSON file contains AI-generated knowledge that can be used to train or fine-tune AI agents.",
        integration: [
          "Import this file into your AI training pipeline",
          "Use the 'training_data' section for prompt-response pairs",
          "Use 'knowledge_base.content' for RAG (Retrieval-Augmented Generation)",
          "Topics can be used for categorization and filtering",
        ],
      },
    };

    // Create and download the file
    const blob = new Blob([JSON.stringify(knowledgeData, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `ai_agent_knowledge_${message.category || "general"}_${Date.now()}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }, [message]);

  // User message style
  if (!isAssistant) {
    return (
      <div className="flex gap-4 p-5 rounded-2xl transition-all bg-transparent">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 bg-zinc-800/50 text-zinc-400">
          <User className="w-5 h-5" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-3">
            <span className="font-bold text-sm text-zinc-200">You</span>
            <span className="text-xs text-zinc-600">
              {message.timestamp.toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </span>
          </div>
          <div className="text-sm text-zinc-400 whitespace-pre-wrap leading-relaxed">
            {message.content}
          </div>
        </div>
      </div>
    );
  }

  // Assistant message - Kindle/Paper style
  return (
    <div className="flex gap-4 p-4">
      {/* Book Icon */}
      <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 bg-amber-900/30 text-amber-200/80">
        <BookOpen className="w-5 h-5" />
      </div>
      
      <div className="flex-1 min-w-0">
        {/* Header */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className="font-serif font-bold text-sm text-amber-200/90">
              PromptCraft AI
            </span>
            <span className="text-xs text-zinc-600">
              {message.timestamp.toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </span>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={handleDownloadKnowledge}
            className="flex items-center gap-2 text-xs border-amber-900/50 text-amber-200/70 hover:bg-amber-900/30 hover:text-amber-100"
          >
            <Download className="w-3 h-3" />
            Download Knowledge
          </Button>
        </div>
        
        {/* Paper/Kindle Style Content */}
        <div className="kindle-paper relative">
          {/* Paper texture background */}
          <div 
            className="rounded-lg overflow-hidden shadow-2xl"
            style={{
              background: 'linear-gradient(to bottom, #fef9f0 0%, #f9f3e3 50%, #f5edd6 100%)',
              boxShadow: `
                0 0 0 1px rgba(139, 90, 43, 0.1),
                0 2px 4px rgba(0, 0, 0, 0.1),
                0 8px 16px rgba(0, 0, 0, 0.1),
                0 16px 32px rgba(0, 0, 0, 0.15),
                inset 0 0 80px rgba(139, 90, 43, 0.03)
              `,
            }}
          >
            {/* Page curl effect */}
            <div 
              className="absolute top-0 right-0 w-8 h-8 pointer-events-none"
              style={{
                background: 'linear-gradient(135deg, transparent 50%, rgba(139, 90, 43, 0.1) 50%)',
                borderRadius: '0 8px 0 0',
              }}
            />
            
            {/* Content area with proper padding like a book page */}
            <div className="px-8 py-6 sm:px-10 sm:py-8 md:px-12 md:py-10">
              {/* Decorative top border */}
              <div className="flex items-center justify-center mb-6">
                <div className="h-px flex-1 bg-gradient-to-r from-transparent via-amber-800/20 to-transparent" />
                <div className="px-4 text-amber-800/40 text-xs font-serif">✦</div>
                <div className="h-px flex-1 bg-gradient-to-r from-transparent via-amber-800/20 to-transparent" />
              </div>
              
              {/* Markdown content */}
              <MarkdownRenderer content={message.content} paperMode />
              
              {/* Decorative bottom border */}
              <div className="flex items-center justify-center mt-8">
                <div className="h-px flex-1 bg-gradient-to-r from-transparent via-amber-800/20 to-transparent" />
                <div className="px-4 text-amber-800/40 text-xs font-serif">❧</div>
                <div className="h-px flex-1 bg-gradient-to-r from-transparent via-amber-800/20 to-transparent" />
              </div>
            </div>
          </div>
          
          {/* Subtle book spine shadow on left */}
          <div 
            className="absolute left-0 top-0 bottom-0 w-3 pointer-events-none rounded-l-lg"
            style={{
              background: 'linear-gradient(to right, rgba(0,0,0,0.08), transparent)',
            }}
          />
        </div>
      </div>
    </div>
  );
});

// Helper function to extract topics from content
function extractTopics(content: string): string[] {
  const topics: string[] = [];
  
  // Extract headers as topics
  const headerMatches = content.match(/^#{1,3}\s+(.+)$/gm);
  if (headerMatches) {
    headerMatches.forEach((match) => {
      const topic = match.replace(/^#{1,3}\s+/, "").replace(/[🎯📋🔧💾🔄📊🛡️🔐📈💰🚀⚠️🎨🔤📐✨📱♿🖼️💡📦⚡🧩🔍👥📘🧪❌📖]/g, "").trim();
      if (topic && topic.length > 2) {
        topics.push(topic);
      }
    });
  }
  
  // Extract keywords from content
  const keywords = ["architecture", "database", "api", "security", "scalability", "performance", "microservices", "design pattern", "caching", "authentication"];
  keywords.forEach((keyword) => {
    if (content.toLowerCase().includes(keyword) && !topics.some(t => t.toLowerCase().includes(keyword))) {
      topics.push(keyword.charAt(0).toUpperCase() + keyword.slice(1));
    }
  });
  
  return topics.slice(0, 15); // Limit to 15 topics
}
