import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Filter, Plus, Check, ExternalLink, RefreshCw, Settings2 } from 'lucide-react';
import { CRMLayout } from '@/components/crm/CRMLayout';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { IntegrationCard } from '@/components/crm/integrations/IntegrationCard';
import { IntegrationConnectModal } from '@/components/crm/integrations/IntegrationConnectModal';
import { IntegrationManageModal } from '@/components/crm/integrations/IntegrationManageModal';

interface Integration {
  id: string;
  name: string;
  slug: string;
  category: string;
  description: string;
  logo_url: string;
  auth_type: string;
  features: string[];
  is_active: boolean;
}

interface Connection {
  id: string;
  integration_id: string;
  status: string;
  account_name: string | null;
  connected_at: string;
  integration?: Integration;
}

const CATEGORIES = [
  { key: 'all', label: 'All Integrations' },
  { key: 'crm', label: 'CRM' },
  { key: 'payments', label: 'Payments' },
  { key: 'communication', label: 'Communication' },
  { key: 'calendar', label: 'Calendar' },
  { key: 'ecommerce', label: 'E-commerce' },
  { key: 'automation', label: 'Automation' },
];

const CRMIntegrations: React.FC = () => {
  const [integrations, setIntegrations] = useState<Integration[]>([]);
  const [connections, setConnections] = useState<Connection[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedIntegration, setSelectedIntegration] = useState<Integration | null>(null);
  const [selectedConnection, setSelectedConnection] = useState<Connection | null>(null);
  const [isConnectModalOpen, setIsConnectModalOpen] = useState(false);
  const [isManageModalOpen, setIsManageModalOpen] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      // Fetch integrations
      const { data: integrationsData, error: integrationsError } = await supabase
        .from('crm_integrations')
        .select('*')
        .eq('is_active', true)
        .order('name');

      if (integrationsError) throw integrationsError;

      // Fetch user's connections
      const { data: connectionsData, error: connectionsError } = await supabase
        .from('crm_integration_connections')
        .select('*');

      if (connectionsError && connectionsError.code !== 'PGRST116') {
        console.error('Connections error:', connectionsError);
      }

      setIntegrations((integrationsData || []) as Integration[]);
      setConnections((connectionsData || []) as Connection[]);
    } catch (error) {
      console.error('Error fetching integrations:', error);
      toast.error('Failed to load integrations');
    } finally {
      setLoading(false);
    }
  };

  const getConnectionForIntegration = (integrationId: string) => {
    return connections.find(c => c.integration_id === integrationId && c.status === 'connected');
  };

  const filteredIntegrations = integrations.filter(integration => {
    const matchesSearch = integration.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      integration.description?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || integration.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const connectedIntegrations = integrations.filter(i => getConnectionForIntegration(i.id));

  const handleConnect = (integration: Integration) => {
    setSelectedIntegration(integration);
    setIsConnectModalOpen(true);
  };

  const handleManage = (integration: Integration) => {
    const connection = getConnectionForIntegration(integration.id);
    if (connection) {
      setSelectedIntegration(integration);
      setSelectedConnection(connection);
      setIsManageModalOpen(true);
    }
  };

  const handleConnectionSuccess = () => {
    fetchData();
    setIsConnectModalOpen(false);
    toast.success('Integration connected successfully!');
  };

  const handleDisconnect = async () => {
    if (!selectedConnection) return;
    
    try {
      const { error } = await supabase
        .from('crm_integration_connections')
        .delete()
        .eq('id', selectedConnection.id);

      if (error) throw error;
      
      fetchData();
      setIsManageModalOpen(false);
      toast.success('Integration disconnected');
    } catch (error) {
      console.error('Error disconnecting:', error);
      toast.error('Failed to disconnect integration');
    }
  };

  return (
    <CRMLayout>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Integrations</h1>
            <p className="text-muted-foreground mt-1">
              Connect your favorite tools to automate workflows
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-sm">
              {connectedIntegrations.length} connected
            </Badge>
            <Button variant="outline" size="icon" onClick={fetchData}>
              <RefreshCw className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Connected Integrations Summary */}
        {connectedIntegrations.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-4 rounded-xl bg-gradient-to-r from-emerald-500/10 to-teal-500/10 border border-emerald-500/20"
          >
            <div className="flex items-center gap-3 mb-3">
              <div className="w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center">
                <Check className="w-4 h-4 text-emerald-600" />
              </div>
              <span className="font-medium text-foreground">Active Connections</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {connectedIntegrations.map(integration => (
                <button
                  key={integration.id}
                  onClick={() => handleManage(integration)}
                  className="flex items-center gap-2 px-3 py-1.5 bg-white dark:bg-slate-800 rounded-full border shadow-sm hover:shadow-md transition-shadow"
                >
                  <img 
                    src={integration.logo_url} 
                    alt={integration.name}
                    className="w-4 h-4 object-contain"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${integration.name}&background=random`;
                    }}
                  />
                  <span className="text-sm font-medium">{integration.name}</span>
                  <Settings2 className="w-3 h-3 text-muted-foreground" />
                </button>
              ))}
            </div>
          </motion.div>
        )}

        {/* Search and Filter */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search integrations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
        </div>

        {/* Category Tabs */}
        <Tabs value={selectedCategory} onValueChange={setSelectedCategory}>
          <TabsList className="flex-wrap h-auto gap-1 bg-transparent p-0">
            {CATEGORIES.map(category => (
              <TabsTrigger
                key={category.key}
                value={category.key}
                className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-full px-4"
              >
                {category.label}
              </TabsTrigger>
            ))}
          </TabsList>

          <TabsContent value={selectedCategory} className="mt-6">
            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {[1, 2, 3, 4, 5, 6].map(i => (
                  <div key={i} className="h-48 bg-muted animate-pulse rounded-xl" />
                ))}
              </div>
            ) : filteredIntegrations.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground">No integrations found</p>
              </div>
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
              >
                {filteredIntegrations.map((integration, index) => (
                  <IntegrationCard
                    key={integration.id}
                    integration={integration}
                    isConnected={!!getConnectionForIntegration(integration.id)}
                    connection={getConnectionForIntegration(integration.id)}
                    onConnect={() => handleConnect(integration)}
                    onManage={() => handleManage(integration)}
                    delay={index * 0.05}
                  />
                ))}
              </motion.div>
            )}
          </TabsContent>
        </Tabs>
      </div>

      {/* Connect Modal */}
      <IntegrationConnectModal
        integration={selectedIntegration}
        isOpen={isConnectModalOpen}
        onClose={() => setIsConnectModalOpen(false)}
        onSuccess={handleConnectionSuccess}
      />

      {/* Manage Modal */}
      <IntegrationManageModal
        integration={selectedIntegration}
        connection={selectedConnection}
        isOpen={isManageModalOpen}
        onClose={() => setIsManageModalOpen(false)}
        onDisconnect={handleDisconnect}
      />
    </CRMLayout>
  );
};

export default CRMIntegrations;
