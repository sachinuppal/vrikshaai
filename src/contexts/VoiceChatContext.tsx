import { createContext, useContext, useState, useCallback, useEffect, ReactNode } from "react";
import { VoiceCaptureModal } from "@/components/VoiceCaptureModal";
import { triggerVoiceWidget } from "@/lib/voiceChat";

interface VoiceChatContextType {
  openVoiceChat: () => void;
}

const VoiceChatContext = createContext<VoiceChatContextType | undefined>(undefined);

export const useVoiceChat = () => {
  const context = useContext(VoiceChatContext);
  if (!context) {
    throw new Error("useVoiceChat must be used within a VoiceChatProvider");
  }
  return context;
};

interface VoiceChatProviderProps {
  children: ReactNode;
}

export const VoiceChatProvider = ({ children }: VoiceChatProviderProps) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const openVoiceChat = useCallback(() => {
    // Check if we already captured the phone number in this session
    const alreadyCaptured = sessionStorage.getItem("voice_captured");
    
    if (alreadyCaptured === "true") {
      // Skip modal, trigger widget directly
      triggerVoiceWidget();
    } else {
      // Show capture modal
      setIsModalOpen(true);
    }
  }, []);

  const closeModal = useCallback(() => {
    setIsModalOpen(false);
  }, []);

  // Listen for legacy openVoiceChat() calls via custom event
  useEffect(() => {
    const handleLegacyOpen = () => {
      openVoiceChat();
    };

    window.addEventListener("open-voice-capture-modal", handleLegacyOpen);
    return () => {
      window.removeEventListener("open-voice-capture-modal", handleLegacyOpen);
    };
  }, [openVoiceChat]);

  return (
    <VoiceChatContext.Provider value={{ openVoiceChat }}>
      {children}
      <VoiceCaptureModal isOpen={isModalOpen} onClose={closeModal} />
    </VoiceChatContext.Provider>
  );
};
