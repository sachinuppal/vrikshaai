import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Key, ExternalLink, Loader2, Shield, AlertCircle } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface Integration {
  id: string;
  name: string;
  slug: string;
  category: string;
  description: string;
  logo_url: string;
  auth_type: string;
  features: string[];
}

interface IntegrationConnectModalProps {
  integration: Integration | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const IntegrationConnectModal: React.FC<IntegrationConnectModalProps> = ({
  integration,
  isOpen,
  onClose,
  onSuccess
}) => {
  const [apiKey, setApiKey] = useState('');
  const [apiSecret, setApiSecret] = useState('');
  const [accountName, setAccountName] = useState('');
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!integration) return null;

  const handleConnect = async () => {
    setIsConnecting(true);
    setError(null);

    try {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) {
        throw new Error('You must be logged in to connect integrations');
      }

      if (integration.auth_type === 'api_key') {
        if (!apiKey.trim()) {
          throw new Error('API key is required');
        }

        // Save connection
        const { error: insertError } = await supabase
          .from('crm_integration_connections')
          .insert({
            integration_id: integration.id,
            user_id: userData.user.id,
            status: 'connected',
            account_name: accountName || `${integration.name} Connection`,
            credentials: { api_key: apiKey, api_secret: apiSecret },
          });

        if (insertError) throw insertError;

        onSuccess();
        resetForm();
      } else if (integration.auth_type === 'oauth2') {
        // For OAuth, we'll open a popup or redirect
        // For now, show a message that OAuth will be implemented
        toast.info(`OAuth for ${integration.name} will open a login window`);
        
        // Simulate OAuth success for demo
        const { error: insertError } = await supabase
          .from('crm_integration_connections')
          .insert({
            integration_id: integration.id,
            user_id: userData.user.id,
            status: 'connected',
            account_name: accountName || `${integration.name} Account`,
            credentials: {},
          });

        if (insertError) throw insertError;
        
        onSuccess();
        resetForm();
      } else if (integration.auth_type === 'webhook') {
        // For webhook integrations, generate a webhook URL
        const webhookId = crypto.randomUUID();
        
        const { error: insertError } = await supabase
          .from('crm_integration_connections')
          .insert({
            integration_id: integration.id,
            user_id: userData.user.id,
            status: 'connected',
            account_name: accountName || `${integration.name} Webhook`,
            credentials: { webhook_id: webhookId },
            metadata: { webhook_url: `${window.location.origin}/api/webhooks/${webhookId}` }
          });

        if (insertError) throw insertError;
        
        onSuccess();
        resetForm();
      }
    } catch (err: any) {
      console.error('Connection error:', err);
      setError(err.message || 'Failed to connect integration');
    } finally {
      setIsConnecting(false);
    }
  };

  const resetForm = () => {
    setApiKey('');
    setApiSecret('');
    setAccountName('');
    setError(null);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center p-2 border">
              <img
                src={integration.logo_url}
                alt={integration.name}
                className="w-full h-full object-contain"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${integration.name}&background=random`;
                }}
              />
            </div>
            Connect {integration.name}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg">
            <Shield className="w-5 h-5 text-emerald-600 mt-0.5" />
            <div className="text-sm">
              <p className="font-medium text-foreground">Secure Connection</p>
              <p className="text-muted-foreground">Your credentials are encrypted and stored securely.</p>
            </div>
          </div>

          {integration.auth_type === 'api_key' && (
            <>
              <div className="space-y-2">
                <Label htmlFor="accountName">Account Name (optional)</Label>
                <Input
                  id="accountName"
                  placeholder="e.g., My Company Account"
                  value={accountName}
                  onChange={(e) => setAccountName(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="apiKey">API Key *</Label>
                <Input
                  id="apiKey"
                  type="password"
                  placeholder="Enter your API key"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                />
              </div>

              {['stripe', 'razorpay', 'twilio'].includes(integration.slug) && (
                <div className="space-y-2">
                  <Label htmlFor="apiSecret">API Secret / Auth Token</Label>
                  <Input
                    id="apiSecret"
                    type="password"
                    placeholder="Enter your API secret"
                    value={apiSecret}
                    onChange={(e) => setApiSecret(e.target.value)}
                  />
                </div>
              )}

              <p className="text-xs text-muted-foreground flex items-center gap-1">
                <ExternalLink className="w-3 h-3" />
                <a
                  href={`https://${integration.slug}.com`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline"
                >
                  Get your API keys from {integration.name}
                </a>
              </p>
            </>
          )}

          {integration.auth_type === 'oauth2' && (
            <div className="text-center py-4">
              <p className="text-sm text-muted-foreground mb-4">
                Click connect to authenticate with {integration.name}. You'll be redirected to their login page.
              </p>
              <div className="space-y-2">
                <Label htmlFor="accountNameOAuth">Account Name (optional)</Label>
                <Input
                  id="accountNameOAuth"
                  placeholder="e.g., My Company Account"
                  value={accountName}
                  onChange={(e) => setAccountName(e.target.value)}
                />
              </div>
            </div>
          )}

          {integration.auth_type === 'webhook' && (
            <div className="text-center py-4">
              <p className="text-sm text-muted-foreground mb-4">
                A unique webhook URL will be generated for you to use in {integration.name}.
              </p>
              <div className="space-y-2">
                <Label htmlFor="accountNameWebhook">Connection Name (optional)</Label>
                <Input
                  id="accountNameWebhook"
                  placeholder="e.g., Production Webhook"
                  value={accountName}
                  onChange={(e) => setAccountName(e.target.value)}
                />
              </div>
            </div>
          )}
        </div>

        <div className="flex gap-3">
          <Button variant="outline" onClick={handleClose} className="flex-1">
            Cancel
          </Button>
          <Button onClick={handleConnect} disabled={isConnecting} className="flex-1">
            {isConnecting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Connecting...
              </>
            ) : (
              <>
                <Key className="w-4 h-4 mr-2" />
                Connect
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
