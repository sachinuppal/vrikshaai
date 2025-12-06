import React, { useState } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { X, Trash2, RefreshCw, ExternalLink, Copy, Check, AlertTriangle } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

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

interface Connection {
  id: string;
  status: string;
  account_name: string | null;
  connected_at: string;
  metadata?: { webhook_url?: string };
}

interface IntegrationManageModalProps {
  integration: Integration | null;
  connection: Connection | null;
  isOpen: boolean;
  onClose: () => void;
  onDisconnect: () => void;
}

export const IntegrationManageModal: React.FC<IntegrationManageModalProps> = ({
  integration,
  connection,
  isOpen,
  onClose,
  onDisconnect
}) => {
  const [copied, setCopied] = useState(false);

  if (!integration || !connection) return null;

  const copyWebhookUrl = () => {
    const url = (connection.metadata as any)?.webhook_url;
    if (url) {
      navigator.clipboard.writeText(url);
      setCopied(true);
      toast.success('Webhook URL copied');
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
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
            <div>
              <span>{integration.name}</span>
              <Badge variant="outline" className="ml-2 text-emerald-600 border-emerald-500/30 bg-emerald-500/10">
                Connected
              </Badge>
            </div>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Connection Info */}
          <div className="space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Account</span>
              <span className="font-medium">{connection.account_name || 'Default'}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Connected</span>
              <span className="font-medium">
                {formatDistanceToNow(new Date(connection.connected_at), { addSuffix: true })}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Status</span>
              <Badge variant="outline" className="text-emerald-600">
                {connection.status}
              </Badge>
            </div>
          </div>

          <Separator />

          {/* Webhook URL for webhook integrations */}
          {integration.auth_type === 'webhook' && (connection.metadata as any)?.webhook_url && (
            <div className="space-y-2">
              <label className="text-sm font-medium">Webhook URL</label>
              <div className="flex gap-2">
                <code className="flex-1 p-2 text-xs bg-muted rounded-md truncate">
                  {(connection.metadata as any).webhook_url}
                </code>
                <Button variant="outline" size="icon" onClick={copyWebhookUrl}>
                  {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                </Button>
              </div>
            </div>
          )}

          {/* Features */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Available Features</label>
            <div className="flex flex-wrap gap-2">
              {integration.features?.map((feature) => (
                <Badge key={feature} variant="secondary" className="text-xs">
                  {feature.replace('_', ' ')}
                </Badge>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="space-y-2 pt-2">
            <Button variant="outline" className="w-full" asChild>
              <a
                href={`https://${integration.slug}.com`}
                target="_blank"
                rel="noopener noreferrer"
              >
                <ExternalLink className="w-4 h-4 mr-2" />
                Open {integration.name} Dashboard
              </a>
            </Button>

            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" className="w-full">
                  <Trash2 className="w-4 h-4 mr-2" />
                  Disconnect Integration
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle className="flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5 text-destructive" />
                    Disconnect {integration.name}?
                  </AlertDialogTitle>
                  <AlertDialogDescription>
                    This will remove the connection and any associated workflows will stop working.
                    You can reconnect at any time.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={onDisconnect}
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  >
                    Disconnect
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
