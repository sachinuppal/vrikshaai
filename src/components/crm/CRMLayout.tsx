import { ReactNode } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  CheckSquare,
  ArrowLeft,
  Zap,
  RefreshCw,
  Workflow,
  Phone,
  FileText,
  ChevronDown,
  LogOut,
  Plug,
  BarChart3,
  FileCode2,
  GitBranch,
  Activity,
  Settings,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { useState } from "react";
import { cn } from "@/lib/utils";

interface CRMLayoutProps {
  children: ReactNode;
}

const crmNavItems = [
  { title: "Dashboard", url: "/crm/dashboard", icon: LayoutDashboard },
  { title: "Contacts", url: "/crm/contacts", icon: Users },
  { title: "Tasks", url: "/crm/tasks", icon: CheckSquare },
  { title: "Triggers", url: "/crm/triggers", icon: Zap },
  { title: "Flows", url: "/crm/flows", icon: Workflow },
  { title: "Integrations", url: "/crm/integrations", icon: Plug },
];

const voiceNavItems = [
  { title: "All Calls", url: "/crm/calls", icon: Phone },
  { title: "Scripts", url: "/crm/scripts", icon: FileCode2 },
  { title: "Flowcharts", url: "/crm/flowcharts", icon: GitBranch },
  { title: "Observability", url: "/crm/observability", icon: Activity },
];

const acceleratorNavItems = [
  { title: "Applications", url: "/crm/applications", icon: FileText },
];

const systemNavItems = [
  { title: "Settings", url: "/crm/settings", icon: Settings },
];

export function CRMLayout({ children }: CRMLayoutProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const { user, signOut } = useAuth();
  const [syncing, setSyncing] = useState(false);
  const [crmOpen, setCrmOpen] = useState(true);
  const [voiceOpen, setVoiceOpen] = useState(location.pathname.includes('/crm/calls'));
  const [acceleratorOpen, setAcceleratorOpen] = useState(location.pathname.includes('/crm/applications'));
  const [systemOpen, setSystemOpen] = useState(location.pathname.includes('/crm/settings'));

  const handleLogout = async () => {
    try {
      await signOut();
      toast({
        title: "Signed out",
        description: "You have been signed out successfully",
      });
      navigate("/admin-login");
    } catch (error) {
      console.error("Logout error:", error);
      toast({
        title: "Error",
        description: "Failed to sign out",
        variant: "destructive",
      });
    }
  };

  const handleSync = async () => {
    setSyncing(true);
    try {
      const { data, error } = await supabase.functions.invoke("crm-sync-existing-data", {
        body: { dry_run: false },
      });

      if (error) throw error;

      toast({
        title: "Sync Complete",
        description: `Created ${data.stats.contacts_created} contacts, ${data.stats.interactions_created} interactions`,
      });
    } catch (error) {
      console.error("Sync error:", error);
      toast({
        title: "Sync Failed",
        description: error instanceof Error ? error.message : "Unknown error",
        variant: "destructive",
      });
    } finally {
      setSyncing(false);
    }
  };

  const isActive = (url: string) => location.pathname === url;
  const isSectionActive = (items: typeof crmNavItems) => items.some(item => location.pathname.startsWith(item.url.split('/').slice(0, 3).join('/')));

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <Sidebar className="border-r">
          <SidebarContent>
            {/* Header */}
            <div className="p-4 border-b">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
                  <Zap className="h-5 w-5 text-primary-foreground" />
                </div>
                <div>
                  <h2 className="font-bold text-foreground">Admin Console</h2>
                  <p className="text-xs text-muted-foreground">Vriksha.ai</p>
                </div>
              </div>
            </div>

            {/* ROI Dashboard - Top Level */}
            <SidebarGroup>
              <SidebarGroupContent>
                <SidebarMenu>
                  <SidebarMenuItem>
                    <SidebarMenuButton
                      asChild
                      isActive={isActive("/crm/roi")}
                    >
                      <button
                        onClick={() => navigate("/crm/roi")}
                        className="w-full flex items-center gap-2"
                      >
                        <BarChart3 className="h-4 w-4" />
                        <span>ROI Dashboard</span>
                      </button>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>

            {/* CRM Section */}
            <Collapsible open={crmOpen} onOpenChange={setCrmOpen}>
              <SidebarGroup>
                <CollapsibleTrigger className="flex items-center justify-between w-full px-3 py-2 text-sm font-semibold text-muted-foreground hover:text-foreground">
                  <span className="flex items-center gap-2">
                    <LayoutDashboard className="h-4 w-4" />
                    CRM
                  </span>
                  <ChevronDown className={cn("h-4 w-4 transition-transform", crmOpen && "rotate-180")} />
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <SidebarGroupContent>
                    <SidebarMenu>
                      {crmNavItems.map((item) => (
                        <SidebarMenuItem key={item.title}>
                          <SidebarMenuButton
                            asChild
                            isActive={isActive(item.url)}
                          >
                            <button
                              onClick={() => navigate(item.url)}
                              className="w-full flex items-center gap-2"
                            >
                              <item.icon className="h-4 w-4" />
                              <span>{item.title}</span>
                            </button>
                          </SidebarMenuButton>
                        </SidebarMenuItem>
                      ))}
                    </SidebarMenu>
                  </SidebarGroupContent>
                </CollapsibleContent>
              </SidebarGroup>
            </Collapsible>

            {/* Voice Calls Section */}
            <Collapsible open={voiceOpen} onOpenChange={setVoiceOpen}>
              <SidebarGroup>
                <CollapsibleTrigger className="flex items-center justify-between w-full px-3 py-2 text-sm font-semibold text-muted-foreground hover:text-foreground">
                  <span className="flex items-center gap-2">
                    <Phone className="h-4 w-4" />
                    Voice Calls
                  </span>
                  <ChevronDown className={cn("h-4 w-4 transition-transform", voiceOpen && "rotate-180")} />
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <SidebarGroupContent>
                    <SidebarMenu>
                      {voiceNavItems.map((item) => (
                        <SidebarMenuItem key={item.title}>
                          <SidebarMenuButton
                            asChild
                            isActive={isActive(item.url)}
                          >
                            <button
                              onClick={() => navigate(item.url)}
                              className="w-full flex items-center gap-2"
                            >
                              <item.icon className="h-4 w-4" />
                              <span>{item.title}</span>
                            </button>
                          </SidebarMenuButton>
                        </SidebarMenuItem>
                      ))}
                    </SidebarMenu>
                  </SidebarGroupContent>
                </CollapsibleContent>
              </SidebarGroup>
            </Collapsible>

            {/* Accelerator Section */}
            <Collapsible open={acceleratorOpen} onOpenChange={setAcceleratorOpen}>
              <SidebarGroup>
                <CollapsibleTrigger className="flex items-center justify-between w-full px-3 py-2 text-sm font-semibold text-muted-foreground hover:text-foreground">
                  <span className="flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    Accelerator
                  </span>
                  <ChevronDown className={cn("h-4 w-4 transition-transform", acceleratorOpen && "rotate-180")} />
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <SidebarGroupContent>
                    <SidebarMenu>
                      {acceleratorNavItems.map((item) => (
                        <SidebarMenuItem key={item.title}>
                          <SidebarMenuButton
                            asChild
                            isActive={isActive(item.url)}
                          >
                            <button
                              onClick={() => navigate(item.url)}
                              className="w-full flex items-center gap-2"
                            >
                              <item.icon className="h-4 w-4" />
                              <span>{item.title}</span>
                            </button>
                          </SidebarMenuButton>
                        </SidebarMenuItem>
                      ))}
                    </SidebarMenu>
                  </SidebarGroupContent>
                </CollapsibleContent>
              </SidebarGroup>
            </Collapsible>

            {/* System Section */}
            <Collapsible open={systemOpen} onOpenChange={setSystemOpen}>
              <SidebarGroup>
                <CollapsibleTrigger className="flex items-center justify-between w-full px-3 py-2 text-sm font-semibold text-muted-foreground hover:text-foreground">
                  <span className="flex items-center gap-2">
                    <Settings className="h-4 w-4" />
                    System
                  </span>
                  <ChevronDown className={cn("h-4 w-4 transition-transform", systemOpen && "rotate-180")} />
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <SidebarGroupContent>
                    <SidebarMenu>
                      {systemNavItems.map((item) => (
                        <SidebarMenuItem key={item.title}>
                          <SidebarMenuButton
                            asChild
                            isActive={isActive(item.url)}
                          >
                            <button
                              onClick={() => navigate(item.url)}
                              className="w-full flex items-center gap-2"
                            >
                              <item.icon className="h-4 w-4" />
                              <span>{item.title}</span>
                            </button>
                          </SidebarMenuButton>
                        </SidebarMenuItem>
                      ))}
                    </SidebarMenu>
                  </SidebarGroupContent>
                </CollapsibleContent>
              </SidebarGroup>
            </Collapsible>

            {/* Actions */}
            <SidebarGroup>
              <SidebarGroupLabel>Actions</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild>
                      <button
                        onClick={handleSync}
                        disabled={syncing}
                        className="w-full flex items-center gap-2"
                      >
                        <RefreshCw className={`h-4 w-4 ${syncing ? "animate-spin" : ""}`} />
                        <span>{syncing ? "Syncing..." : "Sync Voice Calls"}</span>
                      </button>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>

            {/* Footer with user info and logout */}
            <div className="mt-auto p-4 border-t space-y-2">
              {user?.email && (
                <p className="text-xs text-muted-foreground truncate px-2">
                  {user.email}
                </p>
              )}
              <Button
                variant="ghost"
                className="w-full justify-start"
                onClick={() => navigate("/")}
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Site
              </Button>
              <Button
                variant="ghost"
                className="w-full justify-start text-destructive hover:text-destructive hover:bg-destructive/10"
                onClick={handleLogout}
              >
                <LogOut className="h-4 w-4 mr-2" />
                Sign Out
              </Button>
            </div>
          </SidebarContent>
        </Sidebar>

        <main className="flex-1 overflow-auto">
          {/* Top bar */}
          <header className="h-14 border-b bg-card flex items-center px-4 sticky top-0 z-10">
            <SidebarTrigger />
          </header>

          {/* Content */}
          <div className="p-6">{children}</div>
        </main>
      </div>
    </SidebarProvider>
  );
}
