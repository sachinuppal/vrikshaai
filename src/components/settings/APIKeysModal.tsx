import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Key, Plus, Trash2, Eye, EyeOff, Check, AlertCircle, Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

interface APIKeysModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface APIKey {
  id: string;
  provider: string;
  key_name: string | null;
  is_active: boolean;
  created_at: string;
  masked_key: string;
}

const PROVIDERS = [
  { id: "openai", name: "OpenAI", description: "GPT-4, GPT-5 models", icon: "🤖" },
  { id: "google", name: "Google AI", description: "Gemini models", icon: "✨" },
  { id: "anthropic", name: "Anthropic", description: "Claude models", icon: "🧠" },
];

export const APIKeysModal = ({ open, onOpenChange }: APIKeysModalProps) => {
  const { user } = useAuth();
  const [keys, setKeys] = useState<APIKey[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newProvider, setNewProvider] = useState("");
  const [newKeyName, setNewKeyName] = useState("");
  const [newKeyValue, setNewKeyValue] = useState("");
  const [showKey, setShowKey] = useState(false);

  useEffect(() => {
    if (open && user) {
      loadKeys();
    }
  }, [open, user]);

  const loadKeys = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("user_api_keys")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;

      // Mask the keys for display
      const maskedKeys: APIKey[] = (data || []).map((key) => ({
        ...key,
        masked_key: key.encrypted_key ? `...${key.encrypted_key.slice(-4)}` : "***",
      }));

      setKeys(maskedKeys);
    } catch (error) {
      console.error("Failed to load API keys:", error);
      toast.error("Failed to load API keys");
    } finally {
      setLoading(false);
    }
  };

  const handleAddKey = async () => {
    if (!user || !newProvider || !newKeyValue) {
      toast.error("Please fill in all required fields");
      return;
    }

    setSaving(true);
    try {
      // Check if key already exists for this provider
      const existing = keys.find((k) => k.provider === newProvider);
      if (existing) {
        // Update existing key
        const { error } = await supabase
          .from("user_api_keys")
          .update({
            encrypted_key: newKeyValue,
            key_name: newKeyName || null,
            is_active: true,
            updated_at: new Date().toISOString(),
          })
          .eq("id", existing.id);

        if (error) throw error;
        toast.success("API key updated successfully");
      } else {
        // Insert new key
        const { error } = await supabase.from("user_api_keys").insert({
          user_id: user.id,
          provider: newProvider,
          encrypted_key: newKeyValue,
          key_name: newKeyName || null,
          is_active: true,
        });

        if (error) throw error;
        toast.success("API key added successfully");
      }

      // Reset form and reload
      setNewProvider("");
      setNewKeyName("");
      setNewKeyValue("");
      setShowAddForm(false);
      await loadKeys();
    } catch (error) {
      console.error("Failed to save API key:", error);
      toast.error("Failed to save API key");
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteKey = async (keyId: string) => {
    try {
      const { error } = await supabase.from("user_api_keys").delete().eq("id", keyId);

      if (error) throw error;
      toast.success("API key deleted");
      await loadKeys();
    } catch (error) {
      console.error("Failed to delete API key:", error);
      toast.error("Failed to delete API key");
    }
  };

  const handleToggleKey = async (keyId: string, isActive: boolean) => {
    try {
      const { error } = await supabase
        .from("user_api_keys")
        .update({ is_active: !isActive })
        .eq("id", keyId);

      if (error) throw error;
      toast.success(isActive ? "API key disabled" : "API key enabled");
      await loadKeys();
    } catch (error) {
      console.error("Failed to toggle API key:", error);
      toast.error("Failed to toggle API key");
    }
  };

  const getProviderInfo = (providerId: string) => {
    return PROVIDERS.find((p) => p.id === providerId) || { name: providerId, icon: "🔑", description: "" };
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Key className="h-5 w-5" />
            API Keys Management
          </DialogTitle>
          <DialogDescription>
            Add your own API keys to use your credits instead of Lovable AI credits.
            Your keys are securely stored and only used for AI requests.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Existing Keys */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-medium">Your API Keys</h4>
              <Button size="sm" variant="outline" onClick={() => setShowAddForm(true)}>
                <Plus className="mr-1 h-4 w-4" />
                Add Key
              </Button>
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : keys.length === 0 ? (
              <Card className="border-dashed">
                <CardContent className="flex flex-col items-center justify-center py-8 text-center">
                  <Key className="mb-2 h-8 w-8 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">No API keys configured</p>
                  <p className="text-xs text-muted-foreground">
                    Using Lovable AI credits by default
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-2">
                {keys.map((key) => {
                  const provider = getProviderInfo(key.provider);
                  return (
                    <motion.div
                      key={key.id}
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="flex items-center justify-between rounded-lg border bg-card p-3"
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-xl">{provider.icon}</span>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{provider.name}</span>
                            {key.key_name && (
                              <span className="text-sm text-muted-foreground">({key.key_name})</span>
                            )}
                            <Badge variant={key.is_active ? "default" : "secondary"} className="text-xs">
                              {key.is_active ? "Active" : "Disabled"}
                            </Badge>
                          </div>
                          <p className="text-xs text-muted-foreground font-mono">{key.masked_key}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleToggleKey(key.id, key.is_active)}
                        >
                          {key.is_active ? "Disable" : "Enable"}
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-destructive hover:text-destructive"
                          onClick={() => handleDeleteKey(key.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Add Key Form */}
          <AnimatePresence>
            {showAddForm && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
              >
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base">Add New API Key</CardTitle>
                    <CardDescription>
                      Enter your API key from the provider's dashboard
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="space-y-2">
                        <Label>Provider</Label>
                        <Select value={newProvider} onValueChange={setNewProvider}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select provider" />
                          </SelectTrigger>
                          <SelectContent>
                            {PROVIDERS.map((provider) => (
                              <SelectItem key={provider.id} value={provider.id}>
                                <span className="flex items-center gap-2">
                                  <span>{provider.icon}</span>
                                  {provider.name}
                                </span>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label>Name (optional)</Label>
                        <Input
                          placeholder="e.g., Production Key"
                          value={newKeyName}
                          onChange={(e) => setNewKeyName(e.target.value)}
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label>API Key</Label>
                      <div className="relative">
                        <Input
                          type={showKey ? "text" : "password"}
                          placeholder="sk-..."
                          value={newKeyValue}
                          onChange={(e) => setNewKeyValue(e.target.value)}
                          className="pr-10"
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute right-1 top-1/2 h-7 w-7 -translate-y-1/2 p-0"
                          onClick={() => setShowKey(!showKey)}
                        >
                          {showKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </Button>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 rounded-lg border border-amber-500/30 bg-amber-500/10 p-3">
                      <AlertCircle className="h-4 w-4 shrink-0 text-amber-500" />
                      <p className="text-xs text-amber-700 dark:text-amber-300">
                        Your API key is stored securely and only used for AI requests from this application.
                      </p>
                    </div>

                    <div className="flex justify-end gap-2">
                      <Button variant="outline" onClick={() => setShowAddForm(false)}>
                        Cancel
                      </Button>
                      <Button onClick={handleAddKey} disabled={saving || !newProvider || !newKeyValue}>
                        {saving ? (
                          <>
                            <Loader2 className="mr-1 h-4 w-4 animate-spin" />
                            Saving...
                          </>
                        ) : (
                          <>
                            <Check className="mr-1 h-4 w-4" />
                            Save Key
                          </>
                        )}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Info Section */}
          <div className="rounded-lg border bg-muted/30 p-4">
            <h5 className="mb-2 text-sm font-medium">How API Keys Work</h5>
            <ul className="space-y-1 text-xs text-muted-foreground">
              <li>• When you add your API key, AI requests will use your credits instead of Lovable AI</li>
              <li>• You can switch between providers or disable keys anytime</li>
              <li>• If no key is configured, Lovable AI credits are used automatically</li>
              <li>• Token usage and costs are tracked for both your keys and Lovable AI</li>
            </ul>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
