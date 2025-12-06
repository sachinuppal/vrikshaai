import React from 'react';
import { motion } from 'framer-motion';
import { Check, Plus, Settings2, ExternalLink, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

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
}

interface IntegrationCardProps {
  integration: Integration;
  isConnected: boolean;
  connection?: Connection;
  onConnect: () => void;
  onManage: () => void;
  delay?: number;
}

const CATEGORY_COLORS: Record<string, string> = {
  crm: 'bg-blue-500/10 text-blue-600 border-blue-500/20',
  payments: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20',
  communication: 'bg-purple-500/10 text-purple-600 border-purple-500/20',
  calendar: 'bg-orange-500/10 text-orange-600 border-orange-500/20',
  ecommerce: 'bg-pink-500/10 text-pink-600 border-pink-500/20',
  automation: 'bg-amber-500/10 text-amber-600 border-amber-500/20',
};

export const IntegrationCard: React.FC<IntegrationCardProps> = ({
  integration,
  isConnected,
  connection,
  onConnect,
  onManage,
  delay = 0
}) => {
  const categoryColor = CATEGORY_COLORS[integration.category] || 'bg-slate-500/10 text-slate-600';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.3 }}
      className={cn(
        "group relative p-5 rounded-xl border bg-card transition-all duration-300",
        "hover:shadow-lg hover:border-primary/30",
        isConnected && "ring-2 ring-emerald-500/20 border-emerald-500/30"
      )}
    >
      {/* Connected Badge */}
      {isConnected && (
        <div className="absolute -top-2 -right-2">
          <div className="w-6 h-6 rounded-full bg-emerald-500 flex items-center justify-center shadow-lg">
            <Check className="w-3.5 h-3.5 text-white" />
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex items-start gap-4 mb-4">
        <div className="w-12 h-12 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center p-2 border">
          <img
            src={integration.logo_url}
            alt={integration.name}
            className="w-full h-full object-contain"
            onError={(e) => {
              (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${integration.name}&background=random&size=48`;
            }}
          />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-foreground truncate">{integration.name}</h3>
          <Badge variant="outline" className={cn("text-[10px] uppercase tracking-wider mt-1", categoryColor)}>
            {integration.category}
          </Badge>
        </div>
      </div>

      {/* Description */}
      <p className="text-sm text-muted-foreground line-clamp-2 mb-4 min-h-[40px]">
        {integration.description}
      </p>

      {/* Features */}
      <div className="flex flex-wrap gap-1.5 mb-4">
        {integration.features?.slice(0, 3).map((feature) => (
          <span
            key={feature}
            className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-medium bg-muted rounded-full text-muted-foreground"
          >
            <Zap className="w-2.5 h-2.5" />
            {feature.replace('_', ' ')}
          </span>
        ))}
        {(integration.features?.length || 0) > 3 && (
          <span className="px-2 py-0.5 text-[10px] font-medium bg-muted rounded-full text-muted-foreground">
            +{integration.features.length - 3} more
          </span>
        )}
      </div>

      {/* Connection Status or Action */}
      {isConnected ? (
        <div className="space-y-2">
          {connection?.account_name && (
            <p className="text-xs text-muted-foreground truncate">
              Connected as: <span className="font-medium text-foreground">{connection.account_name}</span>
            </p>
          )}
          <Button
            variant="outline"
            className="w-full"
            onClick={onManage}
          >
            <Settings2 className="w-4 h-4 mr-2" />
            Manage
          </Button>
        </div>
      ) : (
        <Button
          className="w-full"
          onClick={onConnect}
        >
          <Plus className="w-4 h-4 mr-2" />
          Connect
        </Button>
      )}

      {/* Auth type indicator */}
      <div className="absolute bottom-2 right-2">
        <span className="text-[10px] text-muted-foreground/50 uppercase">
          {integration.auth_type === 'oauth2' ? 'OAuth' : integration.auth_type === 'api_key' ? 'API Key' : 'Webhook'}
        </span>
      </div>
    </motion.div>
  );
};
