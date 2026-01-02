import { useMemo, useEffect } from "react";
import { X, BookOpen, Download } from "lucide-react";
import { MarkdownRenderer } from "./MarkdownRenderer";
import { Button } from "./ui/button";

interface BookReaderProps {
  content: string;
  category: string;
  userPrompt: string;
  timestamp: Date;
  onClose: () => void;
  onDownload: () => void;
}

interface Section {
  title: string;
  content: string;
}

export function BookReader({ content, category, userPrompt, timestamp, onClose, onDownload }: BookReaderProps) {
  // Parse content into sections
  const sections = useMemo(() => extractSections(content), [content]);

  // Keyboard navigation - only Escape to close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 bg-stone-800 flex flex-col overflow-hidden">
      {/* Header */}
      <div className="h-12 flex items-center justify-between px-4 sm:px-6 bg-stone-900/90 border-b border-stone-700 flex-shrink-0">
        <div className="flex items-center gap-3 text-stone-300">
          <BookOpen className="w-5 h-5" />
          <span className="font-serif text-lg">{getCategoryTitle(category)}</span>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={onDownload}
            className="text-stone-400 hover:text-stone-200 h-8 px-3"
          >
            <Download className="w-4 h-4 mr-2" />
            <span className="hidden sm:inline">Export</span>
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="text-stone-400 hover:text-stone-200 h-8 px-2"
          >
            <X className="w-5 h-5" />
          </Button>
        </div>
      </div>

      {/* Scrollable Book Content */}
      <div className="flex-1 overflow-y-auto custom-scrollbar">
        <div 
          className="max-w-4xl mx-auto"
          style={{
            background: "linear-gradient(to bottom, #fef9f0 0%, #f9f3e3 50%, #f5edd6 100%)",
            minHeight: "100%",
          }}
        >
          {/* Cover Section */}
          <div 
            className="min-h-[60vh] flex flex-col items-center justify-center p-8 sm:p-12 md:p-16 text-center relative"
            style={{
              background: "linear-gradient(135deg, #2d1f14 0%, #4a3728 50%, #2d1f14 100%)",
            }}
          >
            <div className="border-2 sm:border-4 border-amber-700/30 rounded-lg p-8 sm:p-12 md:p-16 w-full max-w-2xl">
              <div className="text-amber-200/40 text-sm sm:text-base tracking-[0.3em] uppercase mb-6">
                PromptCraft AI Presents
              </div>
              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-serif font-bold text-amber-100 mb-8 leading-tight">
                {getCategoryTitle(category)}
              </h1>
              <div className="w-24 sm:w-32 h-0.5 bg-amber-600/50 mx-auto mb-8" />
              <p className="text-amber-200/70 text-base sm:text-lg md:text-xl mb-10 italic max-w-lg mx-auto">
                "{userPrompt}"
              </p>
              <div className="text-amber-200/50 text-sm">
                Generated on {timestamp.toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </div>
            </div>
            <div className="absolute bottom-8 text-amber-200/30 text-sm">
              ✦ AI-Powered Knowledge ✦
            </div>
          </div>

          {/* Table of Contents */}
          <div className="p-8 sm:p-12 md:p-16 border-b border-amber-800/20 bg-gradient-to-b from-amber-50/50 to-transparent">
            <div className="text-center mb-8">
              <span className="text-amber-600 text-sm tracking-[0.3em] uppercase">Navigate</span>
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-serif font-bold text-amber-900 mt-2">
                Table of Contents
              </h2>
              <div className="w-24 h-1 bg-gradient-to-r from-transparent via-amber-600 to-transparent mx-auto mt-4"></div>
            </div>
            <div className="max-w-2xl mx-auto space-y-3">
              {sections.map((section, i) => (
                <a 
                  key={i} 
                  href={`#section-${i}`}
                  className="flex items-center text-stone-700 hover:text-amber-800 font-serif text-lg sm:text-xl transition-all hover:translate-x-2 group p-3 rounded-lg hover:bg-amber-100/50"
                >
                  <span className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center text-amber-700 font-semibold mr-4 group-hover:bg-amber-200 transition-colors">
                    {i + 1}
                  </span>
                  <span className="flex-1">{section.title}</span>
                  <span className="text-amber-400 group-hover:text-amber-600 transition-colors">→</span>
                </a>
              ))}
            </div>
          </div>

          {/* Content Sections */}
          {sections.map((section, i) => (
            <div 
              key={i} 
              id={`section-${i}`}
              className="p-8 sm:p-12 md:p-16 border-b border-amber-800/10 last:border-b-0"
            >
              {/* Section Header */}
              <div className="mb-10">
                <div className="flex items-center gap-4 mb-4">
                  <span className="text-5xl sm:text-6xl md:text-7xl font-serif text-amber-200 font-bold leading-none">
                    {(i + 1).toString().padStart(2, '0')}
                  </span>
                  <div className="flex-1">
                    <span className="text-amber-600 text-xs sm:text-sm tracking-[0.2em] uppercase">Chapter {i + 1}</span>
                    <h2 className="text-2xl sm:text-3xl md:text-4xl font-serif font-bold text-amber-900 leading-tight">
                      {section.title}
                    </h2>
                  </div>
                </div>
                <div className="h-1 bg-gradient-to-r from-amber-600 via-amber-400 to-transparent rounded-full"></div>
              </div>
              
              {/* Section Content */}
              <div className="prose-lg max-w-none">
                <MarkdownRenderer content={section.content} paperMode />
              </div>
            </div>
          ))}

          {/* Footer */}
          <div 
            className="p-8 sm:p-12 text-center"
            style={{
              background: "linear-gradient(135deg, #2d1f14 0%, #4a3728 50%, #2d1f14 100%)",
            }}
          >
            <div className="text-amber-200/50 text-sm mb-2">
              End of Document
            </div>
            <div className="text-amber-200/30 text-xs">
              Generated by PromptCraft AI • {timestamp.toLocaleDateString()}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Helper functions
function getCategoryTitle(category: string): string {
  const titles: Record<string, string> = {
    architecture: "System Architecture Guide",
    ui: "UI/UX Design Handbook",
    database: "Database Design Manual",
    api: "API Design Reference",
    prompts: "Prompt Engineering Guide",
  };
  return titles[category] || "Knowledge Guide";
}

function extractSections(content: string): Section[] {
  const sections: Section[] = [];
  
  // Split by h2 headers (##)
  const parts = content.split(/(?=^## )/gm);
  
  // Emoji pattern with unicode flag
  const emojiPattern = /[\u{1F300}-\u{1F9FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]/gu;
  
  parts.forEach((part) => {
    const lines = part.trim().split("\n");
    if (lines.length === 0) return;
    
    // Check if first line is a header
    const headerMatch = lines[0].match(/^##\s+(.+)/);
    if (headerMatch) {
      sections.push({
        title: headerMatch[1].replace(emojiPattern, "").trim(),
        content: lines.slice(1).join("\n").trim(),
      });
    } else if (part.trim() && sections.length === 0) {
      // Introduction content before first header
      sections.push({
        title: "Introduction",
        content: part.trim(),
      });
    }
  });

  // If no sections found, create one from entire content
  if (sections.length === 0) {
    sections.push({
      title: "Content",
      content: content,
    });
  }

  return sections;
}
