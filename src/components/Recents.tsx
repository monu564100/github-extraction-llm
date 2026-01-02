import { useState, useEffect } from "react";
import { History, Clock, Sparkles, Tag, Calendar, Loader2, RefreshCw } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface RecentEntry {
  entry_id: string;
  category: string;
  prompt: string;
  response: string;
  timestamp: string;
  similarity_score?: number;
}

interface RecentsProps {
  onSelectEntry: (entry: RecentEntry) => void;
}

export const Recents = ({ onSelectEntry }: RecentsProps) => {
  const [entries, setEntries] = useState<RecentEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const fetchRecents = async () => {
    setIsLoading(true);
    setError("");
    
    try {
      const response = await fetch("http://localhost:8001/api/data/entries/all");
      
      if (!response.ok) {
        throw new Error("Failed to fetch recent entries");
      }
      
      const data = await response.json();
      setEntries(data.entries || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load recent queries");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRecents();
  }, []);

  const filteredEntries = selectedCategory
    ? entries.filter((e) => e.category === selectedCategory)
    : entries;

  const categoryColors: Record<string, string> = {
    architecture: "bg-blue-500/10 text-blue-600 border-blue-500/20",
    ui: "bg-purple-500/10 text-purple-600 border-purple-500/20",
    database: "bg-green-500/10 text-green-600 border-green-500/20",
    api: "bg-orange-500/10 text-orange-600 border-orange-500/20",
    prompts: "bg-pink-500/10 text-pink-600 border-pink-500/20",
    github: "bg-gray-500/10 text-gray-600 border-gray-500/20",
  };

  const categories = ["architecture", "ui", "database", "api", "prompts", "github"];

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-full space-y-4 p-6">
        <Loader2 className="w-12 h-12 animate-spin text-primary" />
        <p className="text-muted-foreground">Loading recent queries...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-full space-y-4 p-6">
        <div className="w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center">
          <History className="w-8 h-8 text-red-500" />
        </div>
        <div className="text-center">
          <p className="text-lg font-semibold text-foreground mb-2">Failed to Load</p>
          <p className="text-sm text-muted-foreground mb-4">{error}</p>
          <Button onClick={fetchRecents} variant="outline" size="sm">
            <RefreshCw className="w-4 h-4 mr-2" />
            Retry
          </Button>
        </div>
      </div>
    );
  }

  if (entries.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full space-y-4 p-6">
        <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
          <History className="w-8 h-8 text-primary" />
        </div>
        <div className="text-center">
          <p className="text-lg font-semibold text-foreground mb-2">No Recent Queries</p>
          <p className="text-sm text-muted-foreground">
            Start a conversation in any category to see your query history here.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="p-6 border-b border-border bg-card/50">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center">
              <History className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-foreground">Recent Queries</h2>
              <p className="text-sm text-muted-foreground">
                {filteredEntries.length} cached {filteredEntries.length === 1 ? "response" : "responses"}
              </p>
            </div>
          </div>
          <Button onClick={fetchRecents} variant="outline" size="sm">
            <RefreshCw className="w-4 h-4" />
          </Button>
        </div>

        {/* Category Filter */}
        <div className="flex flex-wrap gap-2">
          <Button
            variant={selectedCategory === null ? "default" : "outline"}
            size="sm"
            onClick={() => setSelectedCategory(null)}
            className="h-8 text-xs"
          >
            All ({entries.length})
          </Button>
          {categories.map((cat) => {
            const count = entries.filter((e) => e.category === cat).length;
            if (count === 0) return null;
            return (
              <Button
                key={cat}
                variant={selectedCategory === cat ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedCategory(cat)}
                className="h-8 text-xs capitalize"
              >
                {cat} ({count})
              </Button>
            );
          })}
        </div>
      </div>

      {/* Entries List */}
      <div className="flex-1 overflow-y-auto p-6 space-y-3">
        {filteredEntries.map((entry) => {
          const date = new Date(entry.timestamp);
          const isToday = date.toDateString() === new Date().toDateString();
          const timeStr = isToday
            ? date.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })
            : date.toLocaleDateString("en-US", { month: "short", day: "numeric" });

          return (
            <Card
              key={entry.entry_id}
              className={cn(
                "p-4 cursor-pointer transition-all duration-200 hover:shadow-md hover:scale-[1.01] border-l-4",
                categoryColors[entry.category] || "border-l-primary"
              )}
              onClick={() => onSelectEntry(entry)}
            >
              <div className="flex items-start justify-between gap-3 mb-2">
                <div className="flex items-center gap-2 flex-wrap">
                  <Badge
                    variant="outline"
                    className={cn("text-xs capitalize", categoryColors[entry.category])}
                  >
                    <Tag className="w-3 h-3 mr-1" />
                    {entry.category}
                  </Badge>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Clock className="w-3 h-3" />
                    {timeStr}
                  </div>
                </div>
                <Sparkles className="w-4 h-4 text-primary flex-shrink-0" />
              </div>

              <p className="text-sm font-medium text-foreground mb-2 line-clamp-2">
                {entry.prompt}
              </p>

              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  <span>{date.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}</span>
                </div>
                <span className="text-xs bg-muted px-2 py-1 rounded">
                  {entry.response.length > 1000 ? `${(entry.response.length / 1000).toFixed(1)}k` : entry.response.length} chars
                </span>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
};
