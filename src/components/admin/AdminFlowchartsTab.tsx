import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  GitBranch,
  Plus,
  Search,
  Eye,
  Loader2,
  ArrowRight,
  Circle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { format } from "date-fns";

interface ScriptWithFlowchart {
  id: string;
  name: string;
  industry: string | null;
  flowchart_json: any;
  updated_at: string | null;
}

const AdminFlowchartsTab = () => {
  const navigate = useNavigate();
  const [scripts, setScripts] = useState<ScriptWithFlowchart[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    loadFlowcharts();
  }, []);

  const loadFlowcharts = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from("agent_scripts")
        .select("id, name, industry, flowchart_json, updated_at")
        .order("updated_at", { ascending: false });

      if (error) throw error;
      // Filter to only scripts with flowchart data
      const scriptsWithFlowcharts = (data || []).filter(
        (s) => s.flowchart_json && Object.keys(s.flowchart_json).length > 0
      );
      setScripts(scriptsWithFlowcharts);
    } catch (error) {
      console.error("Failed to load flowcharts:", error);
      toast.error("Failed to load flowcharts");
    } finally {
      setIsLoading(false);
    }
  };

  const filteredScripts = scripts.filter(
    (script) =>
      script.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      script.industry?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getNodeCount = (flowchartJson: any): number => {
    if (!flowchartJson) return 0;
    if (flowchartJson.nodes && Array.isArray(flowchartJson.nodes)) {
      return flowchartJson.nodes.length;
    }
    return 0;
  };

  const renderMiniFlowchart = (flowchartJson: any) => {
    if (!flowchartJson?.nodes || flowchartJson.nodes.length === 0) {
      return (
        <div className="flex h-32 items-center justify-center text-muted-foreground">
          <span className="text-xs">No nodes</span>
        </div>
      );
    }

    const nodes = flowchartJson.nodes.slice(0, 5);
    return (
      <div className="flex h-32 items-center justify-center gap-1 p-2">
        {nodes.map((node: any, idx: number) => (
          <div key={node.id || idx} className="flex items-center">
            <div
              className={`flex h-8 w-8 items-center justify-center rounded-full text-[10px] ${
                node.type === "start"
                  ? "bg-green-500/20 text-green-400"
                  : node.type === "end"
                  ? "bg-red-500/20 text-red-400"
                  : node.type === "decision"
                  ? "rotate-45 bg-yellow-500/20 text-yellow-400"
                  : "bg-primary/20 text-primary"
              }`}
            >
              {node.type === "start" ? (
                <Circle className="h-3 w-3" />
              ) : node.type === "end" ? (
                <Circle className="h-3 w-3" />
              ) : (
                (node.label || "").slice(0, 2).toUpperCase()
              )}
            </div>
            {idx < nodes.length - 1 && (
              <ArrowRight className="h-3 w-3 text-muted-foreground" />
            )}
          </div>
        ))}
        {flowchartJson.nodes.length > 5 && (
          <Badge variant="secondary" className="ml-1 text-[10px]">
            +{flowchartJson.nodes.length - 5}
          </Badge>
        )}
      </div>
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
            <GitBranch className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h2 className="text-xl font-semibold">Flowcharts</h2>
            <p className="text-sm text-muted-foreground">
              {scripts.length} flowcharts
            </p>
          </div>
        </div>
        <Button onClick={() => navigate("/scripttoflowchart")}>
          <Plus className="mr-2 h-4 w-4" />
          Create New Flowchart
        </Button>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search flowcharts..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-9"
        />
      </div>

      {/* Grid */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : filteredScripts.length === 0 ? (
        <div className="rounded-lg border border-dashed p-12 text-center">
          <GitBranch className="mx-auto h-12 w-12 text-muted-foreground/50" />
          <h3 className="mt-4 text-lg font-medium">No flowcharts found</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Create a script to generate a flowchart
          </p>
          <Button className="mt-4" onClick={() => navigate("/scripttoflowchart")}>
            <Plus className="mr-2 h-4 w-4" />
            Create Script
          </Button>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filteredScripts.map((script) => (
            <Card
              key={script.id}
              className="cursor-pointer transition-colors hover:border-primary/50"
              onClick={() => navigate(`/scripttoflowchart/${script.id}`)}
            >
              <CardHeader className="pb-2">
                <CardTitle className="line-clamp-1 text-base">
                  {script.name}
                </CardTitle>
                {script.industry && (
                  <Badge variant="secondary" className="w-fit text-xs">
                    {script.industry}
                  </Badge>
                )}
              </CardHeader>
              <CardContent className="border-y border-border/50 bg-muted/30">
                {renderMiniFlowchart(script.flowchart_json)}
              </CardContent>
              <CardFooter className="justify-between pt-3">
                <span className="text-xs text-muted-foreground">
                  {getNodeCount(script.flowchart_json)} nodes
                </span>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground">
                    {script.updated_at
                      ? format(new Date(script.updated_at), "MMM d")
                      : "—"}
                  </span>
                  <Eye className="h-4 w-4 text-muted-foreground" />
                </div>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </motion.div>
  );
};

export default AdminFlowchartsTab;
