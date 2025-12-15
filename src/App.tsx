import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { VoiceChatProvider } from "@/contexts/VoiceChatContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { AdminRoute } from "@/components/AdminRoute";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import TermsOfUse from "./pages/TermsOfUse";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import Contact from "./pages/Contact";
import CookieSettings from "./pages/CookieSettings";
import Auth from "./pages/Auth";
import DemoLogin from "./pages/DemoLogin";
import AdminLogin from "./pages/AdminLogin";
import Admin from "./pages/Admin";
import Apply from "./pages/Apply";
import Applications from "./pages/Applications";
import Investors from "./pages/Investors";
import Enterprises from "./pages/Enterprises";
import CRM from "./pages/CRM";
import Voice from "./pages/Voice";
import CallAnalysis from "./pages/CallAnalysis";
import CallHistory from "./pages/CallHistory";
import MyCalls from "./pages/MyCalls";
import ScriptStudio from "./pages/ScriptStudio";
import AgentObservability from "./pages/AgentObservability";
import CRMDashboard from "./pages/crm/CRMDashboard";
import CRMContacts from "./pages/crm/CRMContacts";
import CRMContactProfile from "./pages/crm/CRMContactProfile";
import CRMContactFlows from "./pages/crm/CRMContactFlows";
import CRMTasks from "./pages/crm/CRMTasks";
import CRMTriggers from "./pages/crm/CRMTriggers";
import CRMFlowBuilder from "./pages/crm/CRMFlowBuilder";
import CRMFlows from "./pages/crm/CRMFlows";
import CRMCalls from "./pages/crm/CRMCalls";
import CRMApplications from "./pages/crm/CRMApplications";
import CRMIntegrations from "./pages/crm/CRMIntegrations";
import CRMROIDashboard from "./pages/crm/CRMROIDashboard";
import AICallingConsentModal from "./components/AICallingConsentModal";
import { CookieConsent } from "./components/CookieConsent";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <VoiceChatProvider>
            <AICallingConsentModal />
            <CookieConsent />
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/terms" element={<TermsOfUse />} />
              <Route path="/privacy" element={<PrivacyPolicy />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/cookies" element={<CookieSettings />} />
              <Route path="/auth" element={<Auth />} />
              <Route path="/demo-login" element={<DemoLogin />} />
              <Route path="/admin-login" element={<AdminLogin />} />
              <Route
                path="/admin"
                element={
                  <AdminRoute>
                    <Admin />
                  </AdminRoute>
                }
              />
              <Route path="/my-calls" element={<MyCalls />} />
              <Route path="/enterprises" element={<Enterprises />} />
              <Route path="/crm" element={<CRM />} />
              <Route path="/crm/dashboard" element={<AdminRoute><CRMDashboard /></AdminRoute>} />
              <Route path="/crm/contacts" element={<AdminRoute><CRMContacts /></AdminRoute>} />
              <Route path="/crm/contacts/:id" element={<AdminRoute><CRMContactProfile /></AdminRoute>} />
              <Route path="/crm/contacts/:id/flows" element={<AdminRoute><CRMContactFlows /></AdminRoute>} />
              <Route path="/crm/tasks" element={<AdminRoute><CRMTasks /></AdminRoute>} />
              <Route path="/crm/triggers" element={<AdminRoute><CRMTriggers /></AdminRoute>} />
              <Route path="/crm/flows" element={<AdminRoute><CRMFlows /></AdminRoute>} />
              <Route path="/crm/flow-builder" element={<AdminRoute><CRMFlowBuilder /></AdminRoute>} />
              <Route path="/crm/flow-builder/:flowId" element={<AdminRoute><CRMFlowBuilder /></AdminRoute>} />
              <Route path="/crm/calls" element={<AdminRoute><CRMCalls /></AdminRoute>} />
              <Route path="/crm/applications" element={<AdminRoute><CRMApplications /></AdminRoute>} />
              <Route path="/crm/integrations" element={<AdminRoute><CRMIntegrations /></AdminRoute>} />
              <Route path="/crm/roi" element={<AdminRoute><CRMROIDashboard /></AdminRoute>} />
              <Route path="/voice" element={<Voice />} />
              <Route path="/scripttoflowchart" element={<ScriptStudio />} />
              <Route path="/agentobservability" element={<AgentObservability />} />
              <Route
                path="/call-history"
                element={
                  <ProtectedRoute>
                    <CallHistory />
                  </ProtectedRoute>
                }
              />
              <Route path="/call-analysis/:id" element={<CallAnalysis />} />
              <Route
                path="/applications"
                element={
                  <ProtectedRoute>
                    <Applications />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/apply/:applicationId"
                element={
                  <ProtectedRoute>
                    <Apply />
                  </ProtectedRoute>
                }
              />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </VoiceChatProvider>
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
