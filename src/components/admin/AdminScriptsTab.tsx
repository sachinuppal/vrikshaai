import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  FileCode2,
  Plus,
  Search,
  Eye,
  Pencil,
  Trash2,
  Copy,
  MoreHorizontal,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { format } from "date-fns";

interface Script {
  id: string;
  name: string;
  description: string | null;
  industry: string | null;
  use_case: string | null;
  status: string | null;
  version: number | null;
  created_at: string | null;
  updated_at: string | null;
}

const AdminScriptsTab = () => {
  const navigate = useNavigate();
  const [scripts, setScripts] = useState<Script[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  useEffect(() => {
    loadScripts();
  }, []);

  const loadScripts = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from("agent_scripts")
        .select("*")
        .order("updated_at", { ascending: false });

      if (error) throw error;
      setScripts(data || []);
    } catch (error) {
      console.error("Failed to load scripts:", error);
      toast.error("Failed to load scripts");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this script?")) return;

    try {
      const { error } = await supabase.from("agent_scripts").delete().eq("id", id);
      if (error) throw error;
      setScripts((prev) => prev.filter((s) => s.id !== id));
      toast.success("Script deleted");
    } catch (error) {
      console.error("Failed to delete script:", error);
      toast.error("Failed to delete script");
    }
  };

  const handleDuplicate = async (script: Script) => {
    try {
      const { data: originalScript, error: fetchError } = await supabase
        .from("agent_scripts")
        .select("*")
        .eq("id", script.id)
        .single();

      if (fetchError) throw fetchError;

      const { error: insertError } = await supabase.from("agent_scripts").insert({
        name: `${originalScript.name} (Copy)`,
        description: originalScript.description,
        industry: originalScript.industry,
        use_case: originalScript.use_case,
        script_json: originalScript.script_json,
        flowchart_json: originalScript.flowchart_json,
        status: "draft",
        version: 1,
      });

      if (insertError) throw insertError;
      toast.success("Script duplicated");
      loadScripts();
    } catch (error) {
      console.error("Failed to duplicate script:", error);
      toast.error("Failed to duplicate script");
    }
  };

  const filteredScripts = scripts.filter((script) => {
    const matchesSearch =
      script.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      script.industry?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      script.use_case?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || script.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: string | null) => {
    switch (status) {
      case "active":
        return <Badge className="bg-green-500/20 text-green-400">Active</Badge>;
      case "draft":
        return <Badge variant="secondary">Draft</Badge>;
      case "archived":
        return <Badge variant="outline">Archived</Badge>;
      default:
        return <Badge variant="outline">{status || "Unknown"}</Badge>;
    }
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
            <FileCode2 className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h2 className="text-xl font-semibold">Agent Scripts</h2>
            <p className="text-sm text-muted-foreground">
              {scripts.length} scripts total
            </p>
          </div>
        </div>
        <Button onClick={() => navigate("/scripttoflowchart")}>
          <Plus className="mr-2 h-4 w-4" />
          Create New Script
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search scripts..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="draft">Draft</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="archived">Archived</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : filteredScripts.length === 0 ? (
        <div className="rounded-lg border border-dashed p-12 text-center">
          <FileCode2 className="mx-auto h-12 w-12 text-muted-foreground/50" />
          <h3 className="mt-4 text-lg font-medium">No scripts found</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            {searchQuery || statusFilter !== "all"
              ? "Try adjusting your filters"
              : "Create your first script to get started"}
          </p>
          {!searchQuery && statusFilter === "all" && (
            <Button className="mt-4" onClick={() => navigate("/scripttoflowchart")}>
              <Plus className="mr-2 h-4 w-4" />
              Create Script
            </Button>
          )}
        </div>
      ) : (
        <div className="rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Industry</TableHead>
                <TableHead>Use Case</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Version</TableHead>
                <TableHead>Updated</TableHead>
                <TableHead className="w-[70px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredScripts.map((script) => (
                <TableRow key={script.id}>
                  <TableCell className="font-medium">
                    <div className="max-w-[200px] truncate">{script.name}</div>
                  </TableCell>
                  <TableCell>{script.industry || "—"}</TableCell>
                  <TableCell>{script.use_case || "—"}</TableCell>
                  <TableCell>{getStatusBadge(script.status)}</TableCell>
                  <TableCell>v{script.version || 1}</TableCell>
                  <TableCell>
                    {script.updated_at
                      ? format(new Date(script.updated_at), "MMM d, yyyy")
                      : "—"}
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onClick={() => navigate(`/scripttoflowchart/${script.id}`)}
                        >
                          <Pencil className="mr-2 h-4 w-4" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => navigate(`/scripttoflowchart/${script.id}`)}
                        >
                          <Eye className="mr-2 h-4 w-4" />
                          View
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleDuplicate(script)}>
                          <Copy className="mr-2 h-4 w-4" />
                          Duplicate
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleDelete(script.id)}
                          className="text-destructive"
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </motion.div>
  );
};

export default AdminScriptsTab;
