import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Cookie, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const COOKIE_CONSENT_KEY = "vriksha-cookie-consent";

export const CookieConsent = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem(COOKIE_CONSENT_KEY);
    if (!consent) {
      // Small delay for better UX
      const timer = setTimeout(() => setIsVisible(true), 1500);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleAcceptAll = () => {
    localStorage.setItem(COOKIE_CONSENT_KEY, JSON.stringify({ 
      accepted: true, 
      timestamp: new Date().toISOString(),
      preferences: { essential: true, functional: true, analytics: true, marketing: true }
    }));
    setIsVisible(false);
  };

  const handleAcceptEssential = () => {
    localStorage.setItem(COOKIE_CONSENT_KEY, JSON.stringify({ 
      accepted: true, 
      timestamp: new Date().toISOString(),
      preferences: { essential: true, functional: false, analytics: false, marketing: false }
    }));
    setIsVisible(false);
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
          className="fixed bottom-0 left-0 right-0 z-50 p-4 md:p-6"
        >
          <div className="container mx-auto max-w-4xl">
            <div className="bg-card border border-border rounded-2xl shadow-2xl p-6 backdrop-blur-sm">
              <div className="flex items-start gap-4">
                <div className="hidden sm:flex h-12 w-12 rounded-full bg-primary/10 items-center justify-center flex-shrink-0">
                  <Cookie className="h-6 w-6 text-primary" />
                </div>
                
                <div className="flex-1 space-y-4">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h3 className="text-lg font-semibold text-foreground mb-1">
                        We value your privacy
                      </h3>
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        We use cookies to enhance your browsing experience, serve personalized content, 
                        and analyze our traffic. By clicking "Accept All", you consent to our use of cookies. 
                        Read our{" "}
                        <Link to="/privacy" className="text-primary hover:underline">
                          Privacy Policy
                        </Link>{" "}
                        to learn more.
                      </p>
                    </div>
                    <button
                      onClick={handleAcceptEssential}
                      className="text-muted-foreground hover:text-foreground transition-colors p-1 -mt-1 -mr-1"
                      aria-label="Close cookie banner"
                    >
                      <X className="h-5 w-5" />
                    </button>
                  </div>
                  
                  <div className="flex flex-col sm:flex-row gap-3">
                    <Button
                      onClick={handleAcceptAll}
                      className="bg-primary hover:bg-primary/90 text-primary-foreground"
                    >
                      Accept All
                    </Button>
                    <Button
                      onClick={handleAcceptEssential}
                      variant="outline"
                      className="border-border hover:bg-muted"
                    >
                      Essential Only
                    </Button>
                    <Link to="/cookies" className="sm:ml-auto">
                      <Button variant="ghost" className="w-full text-muted-foreground hover:text-foreground">
                        Manage Preferences
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
