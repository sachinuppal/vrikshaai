import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronDown,
  ChevronRight,
  Database,
  BadgeCheck,
  User,
  Briefcase,
  Heart,
  Settings,
  DollarSign,
  Calendar,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

interface Variable {
  id: string;
  variable_name: string;
  variable_value: string;
  source_channel: string;
  confidence: number;
  created_at: string;
  variable_type?: string;
}

interface CapturedVariablesCardProps {
  variables: Variable[];
}

// Categorize variables based on their names
const categorizeVariable = (name: string): string => {
  const lowerName = name.toLowerCase();
  
  if (lowerName.includes("invest") || lowerName.includes("amount") || lowerName.includes("budget") || lowerName.includes("fund") || lowerName.includes("portfolio")) {
    return "Investment";
  }
  if (lowerName.includes("team") || lowerName.includes("cofounder") || lowerName.includes("employee") || lowerName.includes("member")) {
    return "Team";
  }
  if (lowerName.includes("name") || lowerName.includes("email") || lowerName.includes("phone") || lowerName.includes("contact")) {
    return "Contact Info";
  }
  if (lowerName.includes("interest") || lowerName.includes("prefer") || lowerName.includes("like") || lowerName.includes("want")) {
    return "Preferences";
  }
  if (lowerName.includes("company") || lowerName.includes("business") || lowerName.includes("industry") || lowerName.includes("sector")) {
    return "Business";
  }
  if (lowerName.includes("date") || lowerName.includes("time") || lowerName.includes("schedule")) {
    return "Schedule";
  }
  return "Other";
};

const categoryIcons: Record<string, any> = {
  Investment: DollarSign,
  Team: User,
  "Contact Info": BadgeCheck,
  Preferences: Heart,
  Business: Briefcase,
  Schedule: Calendar,
  Other: Settings,
};

const categoryColors: Record<string, string> = {
  Investment: "text-emerald-500 bg-emerald-500/10",
  Team: "text-blue-500 bg-blue-500/10",
  "Contact Info": "text-purple-500 bg-purple-500/10",
  Preferences: "text-pink-500 bg-pink-500/10",
  Business: "text-amber-500 bg-amber-500/10",
  Schedule: "text-orange-500 bg-orange-500/10",
  Other: "text-muted-foreground bg-muted",
};

export function CapturedVariablesCard({ variables }: CapturedVariablesCardProps) {
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set(["Investment", "Business"]));
  const [showAll, setShowAll] = useState(false);

  // Deduplicate variables by name - keep most recent with highest confidence
  const deduplicatedVariables = useMemo(() => {
    const varMap = new Map<string, Variable>();
    
    for (const v of variables) {
      const existing = varMap.get(v.variable_name);
      if (!existing || v.confidence > existing.confidence) {
        varMap.set(v.variable_name, v);
      }
    }
    
    return Array.from(varMap.values());
  }, [variables]);

  // Group by category
  const groupedVariables = useMemo(() => {
    const groups: Record<string, Variable[]> = {};
    
    for (const v of deduplicatedVariables) {
      const category = categorizeVariable(v.variable_name);
      if (!groups[category]) groups[category] = [];
      groups[category].push(v);
    }
    
    // Sort categories by count
    return Object.entries(groups).sort((a, b) => b[1].length - a[1].length);
  }, [deduplicatedVariables]);

  const toggleCategory = (category: string) => {
    setExpandedCategories((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(category)) {
        newSet.delete(category);
      } else {
        newSet.add(category);
      }
      return newSet;
    });
  };

  const displayedGroups = showAll ? groupedVariables : groupedVariables.slice(0, 4);
  const hasMore = groupedVariables.length > 4;
  const totalVars = deduplicatedVariables.length;
  const duplicatesRemoved = variables.length - deduplicatedVariables.length;

  return (
    <Card className="border-none shadow-card">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2">
            <Database className="h-4 w-4 text-primary" />
            Captured Variables
          </CardTitle>
          <Badge variant="secondary" className="text-xs">
            {totalVars} unique
          </Badge>
        </div>
        {duplicatesRemoved > 0 && (
          <p className="text-xs text-muted-foreground mt-1">
            {duplicatesRemoved} duplicates merged
          </p>
        )}
      </CardHeader>
      <CardContent className="space-y-2">
        {deduplicatedVariables.length === 0 ? (
          <div className="text-center py-6 text-muted-foreground">
            <Database className="h-8 w-8 mx-auto mb-2 opacity-30" />
            <p className="text-sm">No variables captured yet</p>
            <p className="text-xs">Variables will appear as the contact interacts</p>
          </div>
        ) : (
          <>
            {displayedGroups.map(([category, vars], catIndex) => {
              const Icon = categoryIcons[category] || Settings;
              const isExpanded = expandedCategories.has(category);
              const colorClass = categoryColors[category] || categoryColors.Other;

              return (
                <motion.div
                  key={category}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: catIndex * 0.05 }}
                  className="border rounded-lg overflow-hidden"
                >
                  {/* Category Header */}
                  <button
                    onClick={() => toggleCategory(category)}
                    className="w-full flex items-center justify-between p-3 hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <div className={cn("w-7 h-7 rounded-md flex items-center justify-center", colorClass)}>
                        <Icon className="h-3.5 w-3.5" />
                      </div>
                      <span className="text-sm font-medium">{category}</span>
                      <Badge variant="outline" className="text-xs h-5">
                        {vars.length}
                      </Badge>
                    </div>
                    {isExpanded ? (
                      <ChevronDown className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <ChevronRight className="h-4 w-4 text-muted-foreground" />
                    )}
                  </button>

                  {/* Variables List */}
                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="overflow-hidden"
                      >
                        <div className="px-3 pb-3 space-y-2">
                          {vars.map((variable, idx) => (
                            <motion.div
                              key={variable.id}
                              initial={{ opacity: 0, x: -10 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: idx * 0.03 }}
                              className="p-2.5 rounded-md bg-muted/40 hover:bg-muted/60 transition-colors"
                            >
                              <div className="flex items-start justify-between gap-2 mb-1">
                                <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                                  {variable.variable_name.replace(/_/g, " ")}
                                </span>
                                <Badge variant="outline" className="text-[10px] h-4 px-1.5">
                                  {variable.source_channel}
                                </Badge>
                              </div>
                              <p className="text-sm font-medium text-foreground line-clamp-2">
                                {variable.variable_value}
                              </p>
                              <div className="flex items-center gap-2 mt-1.5">
                                <Progress 
                                  value={variable.confidence * 100} 
                                  className="h-1 flex-1 bg-muted" 
                                />
                                <span className="text-[10px] text-muted-foreground">
                                  {Math.round(variable.confidence * 100)}%
                                </span>
                              </div>
                            </motion.div>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })}

            {hasMore && (
              <Button
                variant="ghost"
                size="sm"
                className="w-full text-xs"
                onClick={() => setShowAll(!showAll)}
              >
                {showAll ? "Show Less" : `Show ${groupedVariables.length - 4} More Categories`}
              </Button>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}
