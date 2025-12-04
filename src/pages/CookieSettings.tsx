import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Shield, BarChart3, Megaphone, Settings2, Check } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

const COOKIE_CONSENT_KEY = "vriksha-cookie-consent";

interface CookiePreferences {
  essential: boolean;
  functional: boolean;
  analytics: boolean;
  marketing: boolean;
}

interface ConsentData {
  accepted: boolean;
  timestamp: string;
  preferences: CookiePreferences;
}

const CookieSettings = () => {
  const { toast } = useToast();
  const [preferences, setPreferences] = useState<CookiePreferences>({
    essential: true,
    functional: false,
    analytics: false,
    marketing: false,
  });
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem(COOKIE_CONSENT_KEY);
    if (stored) {
      try {
        const data: ConsentData = JSON.parse(stored);
        setPreferences({
          essential: true,
          functional: data.preferences?.functional ?? false,
          analytics: data.preferences?.analytics ?? false,
          marketing: data.preferences?.marketing ?? false,
        });
      } catch (e) {
        console.error("Failed to parse cookie preferences");
      }
    }
  }, []);

  const handleToggle = (key: keyof CookiePreferences) => {
    if (key === "essential") return; // Essential cookies cannot be disabled
    setPreferences(prev => ({ ...prev, [key]: !prev[key] }));
    setHasChanges(true);
  };

  const handleSave = () => {
    localStorage.setItem(COOKIE_CONSENT_KEY, JSON.stringify({
      accepted: true,
      timestamp: new Date().toISOString(),
      preferences,
    }));
    setHasChanges(false);
    toast({
      title: "Preferences Saved",
      description: "Your cookie preferences have been updated successfully.",
    });
  };

  const handleAcceptAll = () => {
    const allEnabled: CookiePreferences = {
      essential: true,
      functional: true,
      analytics: true,
      marketing: true,
    };
    setPreferences(allEnabled);
    localStorage.setItem(COOKIE_CONSENT_KEY, JSON.stringify({
      accepted: true,
      timestamp: new Date().toISOString(),
      preferences: allEnabled,
    }));
    setHasChanges(false);
    toast({
      title: "All Cookies Accepted",
      description: "You have accepted all cookie categories.",
    });
  };

  const handleRejectAll = () => {
    const essentialOnly: CookiePreferences = {
      essential: true,
      functional: false,
      analytics: false,
      marketing: false,
    };
    setPreferences(essentialOnly);
    localStorage.setItem(COOKIE_CONSENT_KEY, JSON.stringify({
      accepted: true,
      timestamp: new Date().toISOString(),
      preferences: essentialOnly,
    }));
    setHasChanges(false);
    toast({
      title: "Non-Essential Cookies Rejected",
      description: "Only essential cookies are now enabled.",
    });
  };

  const cookieCategories = [
    {
      key: "essential" as const,
      icon: Shield,
      title: "Essential Cookies",
      description: "These cookies are necessary for the website to function and cannot be switched off. They are usually only set in response to actions made by you such as setting your privacy preferences, logging in or filling in forms.",
      required: true,
      examples: ["Session management", "Security tokens", "Load balancing"],
    },
    {
      key: "functional" as const,
      icon: Settings2,
      title: "Functional Cookies",
      description: "These cookies enable the website to provide enhanced functionality and personalization. They may be set by us or by third party providers whose services we have added to our pages.",
      required: false,
      examples: ["Language preferences", "Region selection", "Chat widgets"],
    },
    {
      key: "analytics" as const,
      icon: BarChart3,
      title: "Analytics Cookies",
      description: "These cookies allow us to count visits and traffic sources so we can measure and improve the performance of our site. They help us understand which pages are the most and least popular.",
      required: false,
      examples: ["Page view tracking", "User behavior analysis", "Performance metrics"],
    },
    {
      key: "marketing" as const,
      icon: Megaphone,
      title: "Marketing Cookies",
      description: "These cookies may be set through our site by our advertising partners. They may be used to build a profile of your interests and show you relevant adverts on other sites.",
      required: false,
      examples: ["Ad targeting", "Social media sharing", "Remarketing"],
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-6 py-12 max-w-4xl">
        {/* Back Link */}
        <Link 
          to="/" 
          className="inline-flex items-center gap-2 text-primary hover:text-primary/80 transition-colors mb-8"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Home
        </Link>

        {/* Header */}
        <div className="mb-12">
          <h1 className="text-4xl font-bold text-foreground mb-4">Cookie Settings</h1>
          <p className="text-muted-foreground text-lg">
            Manage your cookie preferences. You can enable or disable different types of cookies below.
          </p>
        </div>

        {/* Quick Actions */}
        <div className="bg-card border border-border rounded-xl p-6 mb-8 shadow-sm">
          <h2 className="text-lg font-semibold text-foreground mb-4">Quick Actions</h2>
          <div className="flex flex-wrap gap-4">
            <Button onClick={handleAcceptAll} className="bg-primary hover:bg-primary/90">
              <Check className="w-4 h-4 mr-2" />
              Accept All Cookies
            </Button>
            <Button onClick={handleRejectAll} variant="outline">
              Reject Non-Essential
            </Button>
          </div>
        </div>

        {/* Cookie Categories */}
        <div className="space-y-6 mb-8">
          {cookieCategories.map((category) => {
            const Icon = category.icon;
            return (
              <div 
                key={category.key}
                className="bg-card border border-border rounded-xl p-6 shadow-sm"
              >
                <div className="flex items-start gap-4">
                  <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <Icon className="h-6 w-6 text-primary" />
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-3">
                        <h3 className="text-lg font-semibold text-foreground">
                          {category.title}
                        </h3>
                        {category.required && (
                          <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full font-medium">
                            Always Active
                          </span>
                        )}
                      </div>
                      <Switch
                        checked={preferences[category.key]}
                        onCheckedChange={() => handleToggle(category.key)}
                        disabled={category.required}
                        className="data-[state=checked]:bg-primary"
                      />
                    </div>
                    
                    <p className="text-sm text-muted-foreground mb-4 leading-relaxed">
                      {category.description}
                    </p>
                    
                    <div className="flex flex-wrap gap-2">
                      {category.examples.map((example, index) => (
                        <span 
                          key={index}
                          className="text-xs bg-muted text-muted-foreground px-3 py-1 rounded-full"
                        >
                          {example}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Save Button */}
        {hasChanges && (
          <div className="sticky bottom-6 flex justify-center">
            <Button 
              onClick={handleSave}
              size="lg"
              className="bg-primary hover:bg-primary/90 shadow-lg"
            >
              Save Preferences
            </Button>
          </div>
        )}

        {/* Additional Info */}
        <div className="bg-muted/50 rounded-xl border border-border p-6 mt-8">
          <h2 className="text-lg font-semibold text-foreground mb-4">More Information</h2>
          <p className="text-sm text-muted-foreground mb-4">
            For more details about how we use cookies and process your data, please read our{" "}
            <Link to="/privacy" className="text-primary hover:underline">
              Privacy Policy
            </Link>.
          </p>
          <p className="text-sm text-muted-foreground">
            If you have any questions about our cookie practices, please{" "}
            <Link to="/contact" className="text-primary hover:underline">
              contact us
            </Link>.
          </p>
        </div>
      </div>
    </div>
  );
};

export default CookieSettings;
