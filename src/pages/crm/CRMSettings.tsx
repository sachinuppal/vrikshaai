import { useState } from "react";
import { CRMLayout } from "@/components/crm/CRMLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Key, CreditCard, Shield } from "lucide-react";
import { APIKeysModal } from "@/components/settings/APIKeysModal";
import { CreditsUsageCard } from "@/components/settings/CreditsUsageCard";
import { useAuth } from "@/contexts/AuthContext";

export default function CRMSettings() {
  const [apiKeysOpen, setApiKeysOpen] = useState(false);
  const { user } = useAuth();

  return (
    <CRMLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Settings</h1>
          <p className="text-muted-foreground">
            Manage your API keys and view AI usage statistics
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {/* API Keys Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Key className="h-5 w-5" />
                API Keys
              </CardTitle>
              <CardDescription>
                Configure your own OpenAI or Google API keys to use your own credits instead of Lovable AI
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                When you add your own API keys, AI requests will use your provider accounts directly, giving you more control over usage and costs.
              </p>
              <Button onClick={() => setApiKeysOpen(true)}>
                <Key className="h-4 w-4 mr-2" />
                Manage API Keys
              </Button>
            </CardContent>
          </Card>

          {/* Credits Usage Card */}
          <CreditsUsageCard />
        </div>

        {/* Additional Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Security & Privacy
            </CardTitle>
            <CardDescription>
              Your API keys are encrypted and stored securely
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="text-sm text-muted-foreground space-y-2">
              <li className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                API keys are encrypted before storage
              </li>
              <li className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                Keys are only accessible by your account
              </li>
              <li className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                All AI usage is logged for transparency
              </li>
            </ul>
          </CardContent>
        </Card>

        <APIKeysModal open={apiKeysOpen} onOpenChange={setApiKeysOpen} />
      </div>
    </CRMLayout>
  );
}
