// Types for Ringg widget
declare global {
  interface Window {
    loadAgent: (config: RinggConfig) => void;
    ringgLoaded?: boolean;
  }
}

interface RinggConfig {
  agentId: string;
  xApiKey: string;
  variables?: Record<string, string>;
  title?: string;
  description?: string;
  logoUrl?: string;
  logoStyles?: Record<string, string>;
  legalDisclaimer?: {
    text: string;
    links?: Record<string, string>;
  };
  buttons?: {
    modalTrigger?: {
      styles?: Record<string, string>;
    };
    call?: {
      textBeforeCall?: string;
      textDuringCall?: string;
      styles?: Record<string, string>;
    };
  };
}

const RINGG_CDN_VERSION = "latest";
const AGENT_ID = "1b0faabe-2256-47d3-9321-ab113091dc5d";
const API_KEY = "5c67d04f-3302-4d21-9fcd-8ca6eeb030f5";

// Load Ringg CDN dynamically
const loadRinggCDN = (): Promise<void> => {
  return new Promise((resolve, reject) => {
    // Check if already loaded
    if (window.ringgLoaded && typeof window.loadAgent === 'function') {
      resolve();
      return;
    }

    // Load CSS
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.type = "text/css";
    link.href = `https://cdn.jsdelivr.net/npm/@desivocal/agents-cdn@${RINGG_CDN_VERSION}/dist/style.css`;
    document.head.appendChild(link);

    // Load JS
    const script = document.createElement("script");
    script.type = "text/javascript";
    script.src = `https://cdn.jsdelivr.net/npm/@desivocal/agents-cdn@${RINGG_CDN_VERSION}/dist/dv-agent.es.js`;
    
    script.onload = () => {
      window.ringgLoaded = true;
      resolve();
    };
    
    script.onerror = () => {
      reject(new Error("Failed to load Ringg CDN"));
    };
    
    document.head.appendChild(script);
  });
};

// Initialize Ringg widget with personalized variables
export const initializeRinggWidget = async (callerName: string, callerPhone: string): Promise<void> => {
  try {
    await loadRinggCDN();
    
    // Small delay to ensure the script is fully initialized
    await new Promise(resolve => setTimeout(resolve, 100));
    
    if (typeof window.loadAgent !== 'function') {
      throw new Error("Ringg loadAgent function not available");
    }

    window.loadAgent({
      agentId: AGENT_ID,
      xApiKey: API_KEY,
      variables: {
        caller_name: callerName,
        caller_phone: callerPhone,
      },
      title: "Talk to Vriksha",
      description: "Ask me anything about our AI ventures and accelerator",
      logoUrl: "/images/vriksha-voice-logo.png",
      logoStyles: {
        width: "60px",
        height: "60px",
        borderRadius: "12px"
      },
      legalDisclaimer: {
        text: "By starting call you agree to our Terms & Privacy Policy",
        links: {
          "Terms & Privacy Policy": "/terms"
        }
      },
      buttons: {
        modalTrigger: {
          styles: {
            backgroundColor: "#FF4D00",
            color: "#FFFFFF",
            borderRadius: "50%",
          }
        },
        call: {
          textBeforeCall: "Start Call",
          textDuringCall: "End Call",
          styles: {
            backgroundColor: "#FF4D00",
            color: "#FFFFFF",
            borderRadius: "8px"
          }
        }
      }
    });
  } catch (error) {
    console.error("Error initializing Ringg widget:", error);
    throw error;
  }
};

// Trigger the widget to open
export const triggerRinggWidget = (): boolean => {
  const selectors = [
    '[data-dv-agent-trigger]',
    '.dv-agent-button',
    '.ringg-widget-button',
    'button[class*="dv-"]',
    'button[class*="ringg"]'
  ];
  
  for (const selector of selectors) {
    const trigger = document.querySelector(selector) as HTMLElement;
    if (trigger) {
      trigger.click();
      return true;
    }
  }
  
  console.warn('Voice chat widget not found');
  return false;
};
