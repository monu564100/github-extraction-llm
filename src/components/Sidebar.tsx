import { memo, useCallback } from "react";
import { LayoutGrid, Brush, HardDrive, Webhook, MessageSquareCode, Rocket, Github, History } from "lucide-react";
import { cn } from "@/lib/utils";

export type CategoryType = "architecture" | "ui" | "database" | "api" | "prompts" | "github" | "recents";

interface SidebarProps {
  activeCategory: CategoryType;
  onCategoryChange: (category: CategoryType) => void;
  collapsed?: boolean;
}

const categories = [
  {
    id: "architecture" as CategoryType,
    label: "System Architecture",
    icon: LayoutGrid,
    description: "Design your app structure",
  },
  {
    id: "ui" as CategoryType,
    label: "UI Packages",
    icon: Brush,
    description: "Get UI component ideas",
  },
  {
    id: "database" as CategoryType,
    label: "Database Schema",
    icon: HardDrive,
    description: "Design your data models",
  },
  {
    id: "api" as CategoryType,
    label: "API Design",
    icon: Webhook,
    description: "Plan your endpoints",
  },
  {
    id: "prompts" as CategoryType,
    label: "Prompt Templates",
    icon: MessageSquareCode,
    description: "Ready-to-use prompts",
  },
  {
    id: "github" as CategoryType,
    label: "GitHub Analyzer",
    icon: Github,
    description: "Analyze any repository",
  },
  {
    id: "recents" as CategoryType,
    label: "Recent Queries",
    icon: History,
    description: "View cached responses",
  },
] as const;

export const Sidebar = memo(function Sidebar({ activeCategory, onCategoryChange, collapsed = false }: SidebarProps) {
  const handleCategoryClick = useCallback((categoryId: CategoryType) => {
    onCategoryChange(categoryId);
  }, [onCategoryChange]);

  // Collapsed sidebar - just icons
  if (collapsed) {
    return (
      <aside className="w-16 bg-sidebar border-r border-border flex flex-col h-screen overflow-hidden transition-all duration-300">
        <div className="p-3 border-b border-border flex-shrink-0">
          <div className="w-10 h-10 rounded-2xl bg-primary/20 flex items-center justify-center mx-auto">
            <Rocket className="w-5 h-5 text-primary" />
          </div>
        </div>
        
        <nav className="flex-1 p-2 space-y-2 overflow-y-auto">
          {categories.map((category) => {
            const Icon = category.icon;
            const isActive = activeCategory === category.id;
            
            return (
              <button
                key={category.id}
                onClick={() => handleCategoryClick(category.id)}
                className={cn(
                  "w-full flex items-center justify-center p-2 rounded-xl transition-all duration-200",
                  isActive
                    ? "bg-primary/20 text-primary"
                    : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                )}
                title={category.label}
              >
                <div
                  className={cn(
                    "w-9 h-9 rounded-xl flex items-center justify-center transition-all",
                    isActive ? "bg-primary text-primary-foreground" : "bg-muted/50"
                  )}
                >
                  <Icon className="w-4 h-4" />
                </div>
              </button>
            );
          })}
        </nav>
      </aside>
    );
  }

  // Full sidebar
  return (
    <aside className="w-72 bg-sidebar border-r border-border flex flex-col h-screen overflow-hidden transition-all duration-300">
      <div className="p-6 border-b border-border flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-primary/20 flex items-center justify-center">
            <Rocket className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h1 className="font-bold text-lg text-foreground tracking-tight">PromptCraft</h1>
            <p className="text-xs text-muted-foreground">AI Assistant</p>
          </div>
        </div>
      </div>
      
      <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
        {categories.map((category) => {
          const Icon = category.icon;
          const isActive = activeCategory === category.id;
          
          return (
            <button
              key={category.id}
              onClick={() => handleCategoryClick(category.id)}
              className={cn(
                "w-full flex items-center gap-3 p-3 rounded-xl text-left transition-all duration-200",
                isActive
                  ? "bg-primary/20 text-primary shadow-[var(--shadow-glow)]"
                  : "text-muted-foreground hover:bg-secondary hover:text-foreground"
              )}
            >
              <div
                className={cn(
                  "w-9 h-9 rounded-xl flex items-center justify-center transition-all",
                  isActive ? "bg-primary text-primary-foreground" : "bg-muted/50"
                )}
              >
                <Icon className="w-4 h-4" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm truncate">{category.label}</p>
                <p className="text-xs opacity-70 truncate">{category.description}</p>
              </div>
            </button>
          );
        })}
      </nav>

      <div className="p-4 border-t border-border">
        <div className="bg-secondary/50 rounded-2xl p-4">
          <p className="text-xs text-muted-foreground mb-2">Pro Tip</p>
          <p className="text-sm text-foreground">
            Be specific about your tech stack for better suggestions! 🚀
          </p>
        </div>
      </div>
    </aside>
  );
});
