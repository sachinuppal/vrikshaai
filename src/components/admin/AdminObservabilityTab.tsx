import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Activity,
  Search,
  Eye,
  Loader2,
  AlertTriangle,
  CheckCircle,
  AlertCircle,
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { format } from "date-fns";

interface ObservabilitySession {
  id: string;
  overall_score: number | null;
  reliability_score: number | null;
  accuracy_score: number | null;
  adherence_score: number | null;
  outcome_score: number | null;
  risk_level: string | null;
  status: string | null;
  created_at: string | null;
  source: string | null;
}

const AdminObservabilityTab = () => {
  const navigate = useNavigate();
  const [sessions, setSessions] = useState<ObservabilitySession[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [riskFilter, setRiskFilter] = useState<string>("all");

  useEffect(() => {
    loadSessions();
  }, []);

  const loadSessions = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from("observability_sessions")
        .select(
          "id, overall_score, reliability_score, accuracy_score, adherence_score, outcome_score, risk_level, status, created_at, source"
        )
        .order("created_at", { ascending: false });

      if (error) throw error;
      setSessions(data || []);
    } catch (error) {
      console.error("Failed to load sessions:", error);
      toast.error("Failed to load observability sessions");
    } finally {
      setIsLoading(false);
    }
  };

  const filteredSessions = sessions.filter((session) => {
    const matchesSearch = session.id.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRisk = riskFilter === "all" || session.risk_level === riskFilter;
    return matchesSearch && matchesRisk;
  });

  const getRiskBadge = (risk: string | null) => {
    switch (risk) {
      case "high":
        return (
          <Badge variant="destructive" className="flex items-center gap-1">
            <AlertTriangle className="h-3 w-3" />
            High
          </Badge>
        );
      case "medium":
        return (
          <Badge className="flex items-center gap-1 bg-yellow-500/20 text-yellow-400">
            <AlertCircle className="h-3 w-3" />
            Medium
          </Badge>
        );
      case "low":
        return (
          <Badge className="flex items-center gap-1 bg-green-500/20 text-green-400">
            <CheckCircle className="h-3 w-3" />
            Low
          </Badge>
        );
      default:
        return <Badge variant="outline">{risk || "Unknown"}</Badge>;
    }
  };

  const getScoreColor = (score: number | null) => {
    if (score === null) return "text-muted-foreground";
    if (score >= 80) return "text-green-400";
    if (score >= 60) return "text-yellow-400";
    return "text-red-400";
  };

  const PillarScore = ({ label, score }: { label: string; score: number | null }) => (
    <div className="text-center">
      <div className={`text-sm font-medium ${getScoreColor(score)}`}>
        {score !== null ? `${score}%` : "—"}
      </div>
      <div className="text-xs text-muted-foreground">{label}</div>
    </div>
  );

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
            <Activity className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h2 className="text-xl font-semibold">Observability Sessions</h2>
            <p className="text-sm text-muted-foreground">
              {sessions.length} analysis sessions
            </p>
          </div>
        </div>
        <Button onClick={() => navigate("/agentobservability")}>
          Run New Analysis
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search by session ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={riskFilter} onValueChange={setRiskFilter}>
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="Risk Level" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Risks</SelectItem>
            <SelectItem value="low">Low</SelectItem>
            <SelectItem value="medium">Medium</SelectItem>
            <SelectItem value="high">High</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : filteredSessions.length === 0 ? (
        <div className="rounded-lg border border-dashed p-12 text-center">
          <Activity className="mx-auto h-12 w-12 text-muted-foreground/50" />
          <h3 className="mt-4 text-lg font-medium">No sessions found</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Run your first observability analysis
          </p>
          <Button className="mt-4" onClick={() => navigate("/agentobservability")}>
            Start Analysis
          </Button>
        </div>
      ) : (
        <div className="rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Session</TableHead>
                <TableHead>5 Pillars</TableHead>
                <TableHead>Overall</TableHead>
                <TableHead>Risk</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Created</TableHead>
                <TableHead className="w-[70px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredSessions.map((session) => (
                <TableRow key={session.id}>
                  <TableCell>
                    <div className="font-mono text-xs">
                      {session.id.slice(0, 8)}...
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {session.source || "manual"}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-3">
                      <PillarScore label="REL" score={session.reliability_score} />
                      <PillarScore label="ACC" score={session.accuracy_score} />
                      <PillarScore label="ADH" score={session.adherence_score} />
                      <PillarScore label="OUT" score={session.outcome_score} />
                    </div>
                  </TableCell>
                  <TableCell>
                    <div
                      className={`text-lg font-bold ${getScoreColor(
                        session.overall_score
                      )}`}
                    >
                      {session.overall_score !== null
                        ? `${session.overall_score}%`
                        : "—"}
                    </div>
                  </TableCell>
                  <TableCell>{getRiskBadge(session.risk_level)}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{session.status || "pending"}</Badge>
                  </TableCell>
                  <TableCell>
                    {session.created_at
                      ? format(new Date(session.created_at), "MMM d, HH:mm")
                      : "—"}
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => navigate(`/agentobservability?session=${session.id}`)}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
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

export default AdminObservabilityTab;
