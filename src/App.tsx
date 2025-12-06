import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { VoiceChatProvider } from "@/contexts/VoiceChatContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import TermsOfUse from "./pages/TermsOfUse";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import Contact from "./pages/Contact";
import CookieSettings from "./pages/CookieSettings";
import Auth from "./pages/Auth";
import DemoLogin from "./pages/DemoLogin";
import Apply from "./pages/Apply";
import Applications from "./pages/Applications";
import Investors from "./pages/Investors";
import Enterprises from "./pages/Enterprises";
import CRM from "./pages/CRM";
import Voice from "./pages/Voice";
import CallAnalysis from "./pages/CallAnalysis";
import CallHistory from "./pages/CallHistory";
import MyCalls from "./pages/MyCalls";
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
              <Route path="/my-calls" element={<MyCalls />} />
              <Route path="/enterprises" element={<Enterprises />} />
              <Route path="/crm" element={<CRM />} />
              <Route path="/voice" element={<Voice />} />
              <Route
                path="/call-history"
                element={
                  <ProtectedRoute>
                    <CallHistory />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/call-analysis/:id"
                element={
                  <ProtectedRoute>
                    <CallAnalysis />
                  </ProtectedRoute>
                }
              />
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
