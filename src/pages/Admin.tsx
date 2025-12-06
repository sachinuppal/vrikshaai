import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { 
  Phone, 
  FileText,
  LogOut,
  Shield,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/contexts/AuthContext";
import AdminCallsTab from "@/components/admin/AdminCallsTab";
import AdminApplicationsTab from "@/components/admin/AdminApplicationsTab";

const Admin = () => {
  const [activeTab, setActiveTab] = useState("calls");
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await signOut();
    navigate("/admin-login");
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Admin Header */}
      <header className="sticky top-0 z-50 bg-background/95 backdrop-blur border-b border-border">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary/20 rounded-lg flex items-center justify-center">
                <Shield className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h1 className="font-bold text-lg text-foreground">Admin Dashboard</h1>
                <p className="text-sm text-muted-foreground">{user?.email}</p>
              </div>
            </div>
            
            <Button variant="outline" size="sm" onClick={handleLogout}>
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </header>
      
      <main className="py-8">
        <div className="container mx-auto px-4 max-w-7xl">
          {/* Tab Navigation */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-8"
            >
              <TabsList className="grid w-full max-w-md grid-cols-2">
                <TabsTrigger value="calls" className="flex items-center gap-2">
                  <Phone className="h-4 w-4" />
                  Voice Calls
                </TabsTrigger>
                <TabsTrigger value="applications" className="flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  Applications
                </TabsTrigger>
              </TabsList>
            </motion.div>

            <TabsContent value="calls">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-6"
              >
                <h2 className="text-2xl font-bold text-foreground flex items-center gap-3">
                  <Phone className="h-7 w-7 text-primary" />
                  All Calls
                </h2>
                <p className="text-muted-foreground mt-1">
                  View and manage all AI voice calls across the platform
                </p>
              </motion.div>
              <AdminCallsTab />
            </TabsContent>

            <TabsContent value="applications">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-6"
              >
                <h2 className="text-2xl font-bold text-foreground flex items-center gap-3">
                  <FileText className="h-7 w-7 text-primary" />
                  Accelerator Applications
                </h2>
                <p className="text-muted-foreground mt-1">
                  Review and manage accelerator program applications
                </p>
              </motion.div>
              <AdminApplicationsTab />
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
};

export default Admin;
