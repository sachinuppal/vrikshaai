import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  Play,
  Square,
  MessageSquare,
  GitBranch,
  Wrench,
  Shield,
  ChevronRight,
  Maximize2,
  Minimize2,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Sparkles,
  Loader2,
  HelpCircle,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { ScriptData, FlowchartNode } from "@/pages/ScriptStudio";

interface DynamicFlowchartRendererProps {
  nodes: FlowchartNode[];
  onNodesChange: (nodes: FlowchartNode[]) => void;
  scriptData: ScriptData;
  fullscreen?: boolean;
  isAnimating?: boolean;
  isGenerating?: boolean;
  onRegenerate?: () => void;
  isRegenerating?: boolean;
}

const NODE_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  start: Play,
  end: Square,
  step: MessageSquare,
  decision: GitBranch,
  action: ChevronRight,
  tool: Wrench,
  guardrail: Shield,
};

const NODE_COLORS: Record<string, string> = {
  start: "bg-green-500/20 border-green-500/50 text-green-400",
  end: "bg-red-500/20 border-red-500/50 text-red-400",
  step: "bg-blue-500/20 border-blue-500/50 text-blue-400",
  decision: "bg-amber-500/20 border-amber-500/50 text-amber-400",
  action: "bg-purple-500/20 border-purple-500/50 text-purple-400",
  tool: "bg-cyan-500/20 border-cyan-500/50 text-cyan-400",
  guardrail: "bg-orange-500/20 border-orange-500/50 text-orange-400",
};

const DEFAULT_ICON = HelpCircle;
const DEFAULT_COLOR = "bg-muted/20 border-muted-foreground/50 text-muted-foreground";

// Map unknown node types to valid types
const normalizeNodeType = (type: string): string => {
  if (type in NODE_ICONS) return type;
  
  const typeMap: Record<string, string> = {
    input: "action",
    output: "step",
    response: "step",
    api: "tool",
    api_call: "tool",
    condition: "decision",
    branch: "decision",
    check: "guardrail",
    safety: "guardrail",
    greeting: "step",
    goodbye: "end",
    terminate: "end",
    begin: "start",
  };
  
  const lowerType = type.toLowerCase();
  return typeMap[lowerType] || "step";
};

// Generate a basic flowchart from script sections
const generateFlowchartFromScript = (scriptData: ScriptData): FlowchartNode[] => {
  const nodes: FlowchartNode[] = [];
  let y = 50;
  const x = 200;
  const spacing = 120;

  // Start node
  nodes.push({
    id: "start",
    type: "start",
    label: "Call Starts",
    position: { x, y },
    connections: ["greeting"],
  });
  y += spacing;

  // Identity & Greeting
  if (scriptData.sections.find((s) => s.id === "identity_framing")?.isComplete) {
    nodes.push({
      id: "greeting",
      type: "step",
      label: "Identity & Greeting",
      description: "Agent introduces itself and states purpose",
      position: { x, y },
      connections: ["consent"],
    });
  } else {
    nodes.push({
      id: "greeting",
      type: "step",
      label: "Greeting",
      description: "Agent greets the user",
      position: { x, y },
      connections: ["consent"],
    });
  }
  y += spacing;

  // Consent
  nodes.push({
    id: "consent",
    type: "guardrail",
    label: "Consent & Disclosure",
    description: "Recording notice, purpose statement",
    position: { x, y },
    connections: ["intent_capture"],
  });
  y += spacing;

  // Intent Capture
  nodes.push({
    id: "intent_capture",
    type: "decision",
    label: "Capture Intent",
    description: "Understand user's primary need",
    position: { x, y },
    connections: ["intent_known", "intent_unclear"],
  });
  y += spacing;

  // Branch - Intent Known
  nodes.push({
    id: "intent_known",
    type: "action",
    label: "Process Request",
    description: "Handle the identified intent",
    position: { x: x - 100, y },
    connections: ["tool_call"],
  });

  // Branch - Intent Unclear
  nodes.push({
    id: "intent_unclear",
    type: "step",
    label: "Clarifying Question",
    description: "Ask for more details",
    position: { x: x + 100, y },
    connections: ["intent_capture"],
  });
  y += spacing;

  // Tool Call
  nodes.push({
    id: "tool_call",
    type: "tool",
    label: "API/Tool Call",
    description: "Fetch data or perform action",
    position: { x, y },
    connections: ["response"],
  });
  y += spacing;

  // Response
  nodes.push({
    id: "response",
    type: "step",
    label: "Deliver Response",
    description: "Provide information to user",
    position: { x, y },
    connections: ["followup"],
  });
  y += spacing;

  // Follow-up
  nodes.push({
    id: "followup",
    type: "decision",
    label: "Anything Else?",
    description: "Check if user needs more help",
    position: { x, y },
    connections: ["more_help", "wrap_up"],
  });
  y += spacing;

  // More help
  nodes.push({
    id: "more_help",
    type: "action",
    label: "Continue Conversation",
    position: { x: x - 100, y },
    connections: ["intent_capture"],
  });

  // Wrap up
  nodes.push({
    id: "wrap_up",
    type: "step",
    label: "Summary & Goodbye",
    position: { x: x + 100, y },
    connections: ["end"],
  });
  y += spacing;

  // End
  nodes.push({
    id: "end",
    type: "end",
    label: "Call Ends",
    position: { x, y },
    connections: [],
  });

  return nodes;
};

export const DynamicFlowchartRenderer = ({
  nodes,
  onNodesChange,
  scriptData,
  fullscreen = false,
  isAnimating = false,
  isGenerating = false,
  onRegenerate,
  isRegenerating = false,
}: DynamicFlowchartRendererProps) => {
  const [zoomLevel, setZoomLevel] = useState(1);
  const [isFullscreenOpen, setIsFullscreenOpen] = useState(false);

  // Use provided nodes or generate from script
  const displayNodes = useMemo(() => {
    if (nodes.length > 0) return nodes;
    return generateFlowchartFromScript(scriptData);
  }, [nodes, scriptData]);

  // Calculate SVG viewBox based on nodes
  const viewBox = useMemo(() => {
    if (displayNodes.length === 0) return "0 0 400 600";
    const minX = Math.min(...displayNodes.map((n) => n.position.x)) - 100;
    const maxX = Math.max(...displayNodes.map((n) => n.position.x)) + 200;
    const minY = Math.min(...displayNodes.map((n) => n.position.y)) - 50;
    const maxY = Math.max(...displayNodes.map((n) => n.position.y)) + 100;
    return `${minX} ${minY} ${maxX - minX} ${maxY - minY}`;
  }, [displayNodes]);

  // Create connection paths - defensive check for connections array
  const connections = useMemo(() => {
    const paths: { from: FlowchartNode; to: FlowchartNode; id: string }[] = [];
    displayNodes.forEach((node) => {
      // Defensive check: ensure connections is an array
      const nodeConnections = Array.isArray(node.connections) ? node.connections : [];
      nodeConnections.forEach((targetId) => {
        const target = displayNodes.find((n) => n.id === targetId);
        if (target) {
          paths.push({ from: node, to: target, id: `${node.id}-${targetId}` });
        }
      });
    });
    return paths;
  }, [displayNodes]);

  const handleZoomIn = () => {
    setZoomLevel((prev) => Math.min(prev + 0.25, 3));
  };

  const handleZoomOut = () => {
    setZoomLevel((prev) => Math.max(prev - 0.25, 0.25));
  };

  const handleResetZoom = () => {
    setZoomLevel(1);
  };

  const handleResetNodes = () => {
    onNodesChange(generateFlowchartFromScript(scriptData));
    setZoomLevel(1);
  };

  const renderFlowchart = (inFullscreen = false) => (
    <div 
      className="min-h-full p-4 origin-top-left transition-transform duration-200"
      style={{ transform: `scale(${zoomLevel})`, width: `${100 / zoomLevel}%` }}
    >
      {displayNodes.length === 0 && !isGenerating ? (
        <div className="flex h-full flex-col items-center justify-center py-12 text-center">
          <GitBranch className="mb-4 h-12 w-12 text-muted-foreground/50" />
          <h3 className="mb-2 text-lg font-medium">No Flowchart Yet</h3>
          <p className="text-sm text-muted-foreground">
            Use the chat to describe your voice agent and I'll generate a flowchart
          </p>
        </div>
      ) : (
        <svg
          viewBox={viewBox}
          className="h-auto w-full"
          style={{ minHeight: inFullscreen ? "70vh" : "500px" }}
        >
          <defs>
            <marker
              id="arrowhead"
              markerWidth="10"
              markerHeight="7"
              refX="9"
              refY="3.5"
              orient="auto"
            >
              <polygon
                points="0 0, 10 3.5, 0 7"
                fill="hsl(var(--muted-foreground))"
                opacity="0.5"
              />
            </marker>
          </defs>

          {/* Connection lines */}
          {connections.map(({ from, to, id }) => {
            const startX = from.position.x + 60;
            const startY = from.position.y + 20;
            const endX = to.position.x + 60;
            const endY = to.position.y;

            // Calculate curve
            const midY = (startY + endY) / 2;
            const path = `M ${startX} ${startY + 20} C ${startX} ${midY}, ${endX} ${midY}, ${endX} ${endY}`;

            return (
              <motion.path
                key={id}
                d={path}
                fill="none"
                stroke="hsl(var(--muted-foreground))"
                strokeWidth="2"
                strokeOpacity="0.3"
                markerEnd="url(#arrowhead)"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 0.5, delay: 0.2 }}
              />
            );
          })}

          {/* Nodes */}
          {displayNodes.map((node, index) => {
            const normalizedType = normalizeNodeType(node.type);
            const Icon = NODE_ICONS[normalizedType] || DEFAULT_ICON;
            const colorClass = NODE_COLORS[normalizedType] || DEFAULT_COLOR;

            return (
              <motion.g
                key={node.id}
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ 
                  delay: isAnimating ? index * 0.15 : index * 0.05,
                  type: isAnimating ? "spring" : "tween",
                  stiffness: 200,
                  damping: 15
                }}
              >
                <foreignObject
                  x={node.position.x}
                  y={node.position.y}
                  width="120"
                  height="60"
                >
                  <div
                    className={`flex h-full flex-col items-center justify-center rounded-lg border-2 px-2 py-1 text-center ${colorClass}`}
                  >
                    <Icon className="mb-1 h-4 w-4" />
                    <span className="line-clamp-2 text-[10px] font-medium leading-tight">
                      {node.label}
                    </span>
                  </div>
                </foreignObject>
              </motion.g>
            );
          })}
        </svg>
      )}
    </div>
  );

  const renderLegend = () => (
    <div className="flex flex-wrap gap-2 border-t border-border/50 px-4 py-2">
      {Object.entries(NODE_ICONS).map(([type, Icon]) => (
        <div key={type} className="flex items-center gap-1">
          <div
            className={`flex h-5 w-5 items-center justify-center rounded ${
              NODE_COLORS[type as keyof typeof NODE_COLORS]
            }`}
          >
            <Icon className="h-3 w-3" />
          </div>
          <span className="text-[10px] capitalize text-muted-foreground">{type}</span>
        </div>
      ))}
    </div>
  );

  const renderControls = (showFullscreenToggle = true) => (
    <div className="flex items-center gap-1">
      {onRegenerate && (
        <Button 
          variant="outline" 
          size="sm" 
          onClick={onRegenerate}
          disabled={isRegenerating}
          className="mr-2"
        >
          {isRegenerating ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Sparkles className="mr-2 h-4 w-4" />
          )}
          {isRegenerating ? "Generating..." : "Regenerate"}
        </Button>
      )}
      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={handleResetNodes} title="Reset flowchart">
        <RotateCcw className="h-4 w-4" />
      </Button>
      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={handleZoomOut} title="Zoom out">
        <ZoomOut className="h-4 w-4" />
      </Button>
      <span className="text-xs text-muted-foreground w-12 text-center">{Math.round(zoomLevel * 100)}%</span>
      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={handleZoomIn} title="Zoom in">
        <ZoomIn className="h-4 w-4" />
      </Button>
      {showFullscreenToggle && !fullscreen && (
        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setIsFullscreenOpen(true)} title="Fullscreen">
          <Maximize2 className="h-4 w-4" />
        </Button>
      )}
    </div>
  );

  return (
    <>
      <Card
        className={`flex flex-col overflow-hidden border-border/50 bg-card/50 backdrop-blur ${
          fullscreen ? "h-full" : "h-full"
        }`}
      >
        <CardHeader className="flex flex-row items-center justify-between border-b border-border/50 pb-3">
          <div className="flex items-center gap-2">
            <CardTitle className="flex items-center gap-2 text-base">
              <GitBranch className="h-5 w-5 text-primary" />
              Conversation Flow
            </CardTitle>
            <Badge variant="outline" className="text-xs">
              {displayNodes.length} nodes
            </Badge>
          </div>
          {renderControls()}
        </CardHeader>

        <CardContent className="flex-1 overflow-hidden p-0 relative">
          {(isGenerating || isRegenerating) && (
            <div className="absolute inset-0 flex items-center justify-center bg-background/80 backdrop-blur-sm z-10">
              <div className="flex flex-col items-center gap-4">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                >
                  <GitBranch className="h-12 w-12 text-primary" />
                </motion.div>
                <p className="text-sm text-muted-foreground">Generating flowchart from script...</p>
              </div>
            </div>
          )}
          <ScrollArea className="h-full">
            {renderFlowchart()}
          </ScrollArea>
        </CardContent>

        {renderLegend()}
      </Card>

      {/* Fullscreen Dialog */}
      <Dialog open={isFullscreenOpen} onOpenChange={setIsFullscreenOpen}>
        <DialogContent className="max-w-[95vw] w-[95vw] h-[90vh] flex flex-col">
          <DialogHeader className="flex flex-row items-center justify-between border-b border-border/50 pb-3">
            <div className="flex items-center gap-2">
              <DialogTitle className="flex items-center gap-2 text-base">
                <GitBranch className="h-5 w-5 text-primary" />
                Conversation Flow (Fullscreen)
              </DialogTitle>
              <Badge variant="outline" className="text-xs">
                {displayNodes.length} nodes
              </Badge>
            </div>
            <div className="flex items-center gap-1">
              {renderControls(false)}
              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setIsFullscreenOpen(false)} title="Exit fullscreen">
                <Minimize2 className="h-4 w-4" />
              </Button>
            </div>
          </DialogHeader>
          <div className="flex-1 overflow-hidden">
            <ScrollArea className="h-full">
              {renderFlowchart(true)}
            </ScrollArea>
          </div>
          {renderLegend()}
        </DialogContent>
      </Dialog>
    </>
  );
};
