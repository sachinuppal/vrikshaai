import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, RefreshCw } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { CRMLayout } from "@/components/crm/CRMLayout";
import { DynamicIndustryGraph } from "@/components/crm/DynamicIndustryGraph";
import { PredictiveTimeline } from "@/components/crm/PredictiveTimeline";
import { toast } from "sonner";
import {
  ContactHeader,
  CapturedVariablesCard,
  VoiceCallsCard,
  ContactInsightsCard,
  TasksCard,
} from "@/components/crm/contact-profile";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { ChevronDown, Network } from "lucide-react";

interface Contact360 {
  contact: any;
  variables: any[];
  variables_by_name: Record<string, any>;
  interactions: any[];
  timeline_summary: any;
  scores: any;
  predictions: any[];
  tasks: any[];
  industry: any;
}

interface VoiceCall {
  id: string;
  name: string;
  full_phone: string;
  created_at: string;
  call_status: string | null;
  call_duration: number | null;
  platform_analysis: unknown;
  client_analysis: unknown;
  observability_analysis: unknown;
}

export default function CRMContactProfile() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [data, setData] = useState<Contact360 | null>(null);
  const [loading, setLoading] = useState(true);
  const [scoresUpdating, setScoresUpdating] = useState(false);
  const [voiceCalls, setVoiceCalls] = useState<VoiceCall[]>([]);
  const [callsLoading, setCallsLoading] = useState(false);
  const [industryOpen, setIndustryOpen] = useState(false);

  // Fetch contact data
  useEffect(() => {
    if (id) {
      fetchContact360();
    }
  }, [id]);

  // Real-time subscription for score and contact updates
  useEffect(() => {
    if (!id) return;

    const contactChannel = supabase
      .channel(`contact-${id}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'crm_contacts',
          filter: `id=eq.${id}`,
        },
        (payload) => {
          console.log('Contact updated:', payload);
          setScoresUpdating(true);
          
          setData((prev) => {
            if (!prev) return prev;
            const newContact = payload.new as any;
            return {
              ...prev,
              contact: newContact,
              scores: {
                current: {
                  intent: newContact.intent_score,
                  urgency: newContact.urgency_score,
                  engagement: newContact.engagement_score,
                  ltv_prediction: newContact.ltv_prediction,
                  churn_risk: newContact.churn_risk,
                },
              },
            };
          });
          
          toast.success("Scores updated in real-time");
          setTimeout(() => setScoresUpdating(false), 1000);
        }
      )
      .subscribe();

    const tasksChannel = supabase
      .channel(`tasks-${id}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'crm_tasks',
          filter: `contact_id=eq.${id}`,
        },
        (payload) => {
          console.log('New task created:', payload);
          setData((prev) => {
            if (!prev) return prev;
            return {
              ...prev,
              tasks: [payload.new as any, ...prev.tasks],
            };
          });
          toast.success("New task created by automation");
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(contactChannel);
      supabase.removeChannel(tasksChannel);
    };
  }, [id]);

  const fetchContact360 = async () => {
    try {
      const [contactRes, variablesRes, interactionsRes, tasksRes] = await Promise.all([
        supabase.from("crm_contacts").select("*").eq("id", id).single(),
        supabase.from("crm_variables").select("*").eq("contact_id", id).eq("is_current", true),
        supabase.from("crm_interactions").select("*").eq("contact_id", id).order("occurred_at", { ascending: false }).limit(50),
        supabase.from("crm_tasks").select("*").eq("contact_id", id).in("status", ["pending", "in_progress"]).order("due_at", { ascending: true }),
      ]);

      if (contactRes.error) throw contactRes.error;

      const variablesByName: Record<string, any> = {};
      for (const v of variablesRes.data || []) {
        variablesByName[v.variable_name] = v;
      }

      const channelBreakdown: Record<string, number> = {};
      for (const i of interactionsRes.data || []) {
        channelBreakdown[i.channel] = (channelBreakdown[i.channel] || 0) + 1;
      }

      setData({
        contact: contactRes.data,
        variables: variablesRes.data || [],
        variables_by_name: variablesByName,
        interactions: interactionsRes.data || [],
        timeline_summary: {
          total_interactions: interactionsRes.data?.length || 0,
          channel_breakdown: channelBreakdown,
        },
        scores: {
          current: {
            intent: contactRes.data.intent_score,
            urgency: contactRes.data.urgency_score,
            engagement: contactRes.data.engagement_score,
            ltv_prediction: contactRes.data.ltv_prediction,
            churn_risk: contactRes.data.churn_risk,
          },
        },
        predictions: [],
        tasks: tasksRes.data || [],
        industry: null,
      });
    } catch (error) {
      console.error("Error fetching contact 360:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (data?.contact?.phone) {
      fetchVoiceCalls(data.contact.phone);
    }
  }, [data?.contact?.phone]);

  const fetchVoiceCalls = async (phone: string) => {
    setCallsLoading(true);
    try {
      const { data: calls, error } = await supabase
        .from("voice_widget_calls")
        .select("id, name, full_phone, created_at, call_status, call_duration, platform_analysis, client_analysis, observability_analysis")
        .eq("full_phone", phone)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setVoiceCalls(calls || []);
    } catch (error) {
      console.error("Error fetching voice calls:", error);
    } finally {
      setCallsLoading(false);
    }
  };

  if (loading) {
    return (
      <CRMLayout>
        <div className="space-y-6">
          <div className="flex items-center gap-4">
            <Skeleton className="h-9 w-32" />
          </div>
          <Skeleton className="h-48" />
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="space-y-6">
              <Skeleton className="h-40" />
              <Skeleton className="h-64" />
              <Skeleton className="h-48" />
            </div>
            <div className="lg:col-span-2">
              <Skeleton className="h-[500px]" />
            </div>
          </div>
        </div>
      </CRMLayout>
    );
  }

  if (!data?.contact) {
    return (
      <CRMLayout>
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold mb-4">Contact Not Found</h2>
          <Button onClick={() => navigate("/crm/contacts")}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Contacts
          </Button>
        </div>
      </CRMLayout>
    );
  }

  const { contact, variables, interactions, scores, tasks } = data;

  return (
    <CRMLayout>
      <div className="space-y-6">
        {/* Back Button */}
        <Button variant="ghost" size="sm" onClick={() => navigate("/crm/contacts")}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Contacts
        </Button>

        {/* Header Card - Full Width */}
        <ContactHeader
          contact={contact}
          scores={scores}
          scoresUpdating={scoresUpdating}
        />

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Key Information */}
          <div className="space-y-5">
            {/* AI Insights - Most Important */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <ContactInsightsCard
                contact={contact}
                scores={scores}
                interactions={interactions}
                tasks={tasks}
              />
            </motion.div>

            {/* Captured Variables */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
            >
              <CapturedVariablesCard variables={variables} />
            </motion.div>

            {/* Voice Calls */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <VoiceCallsCard calls={voiceCalls} loading={callsLoading} />
            </motion.div>
          </div>

          {/* Right Column - Timeline & Tasks */}
          <div className="lg:col-span-2 space-y-5">
            {/* Tasks Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
            >
              <TasksCard tasks={tasks} />
            </motion.div>

            {/* Predictive Timeline */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <PredictiveTimeline
                contactId={contact.id}
                interactions={interactions}
                tasks={tasks}
                contact={contact}
              />
            </motion.div>
          </div>
        </div>

        {/* Industry Graph - Collapsible at Bottom */}
        {contact.primary_industry && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Collapsible open={industryOpen} onOpenChange={setIndustryOpen}>
              <CollapsibleTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full justify-between h-12"
                >
                  <span className="flex items-center gap-2">
                    <Network className="h-4 w-4 text-primary" />
                    Industry Network Graph
                  </span>
                  <ChevronDown
                    className={`h-4 w-4 transition-transform duration-200 ${
                      industryOpen ? "rotate-180" : ""
                    }`}
                  />
                </Button>
              </CollapsibleTrigger>
              <CollapsibleContent className="mt-4">
                <DynamicIndustryGraph
                  primaryIndustry={contact.primary_industry}
                  contactId={contact.id}
                />
              </CollapsibleContent>
            </Collapsible>
          </motion.div>
        )}
      </div>
    </CRMLayout>
  );
}
