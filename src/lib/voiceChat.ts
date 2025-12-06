// Triggers the Ringg voice widget directly
export const triggerVoiceWidget = () => {
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

// Legacy function - now managed by VoiceChatContext
// This is kept for backward compatibility but components should use useVoiceChat hook
export const openVoiceChat = () => {
  // Check if phone was already captured
  const alreadyCaptured = sessionStorage.getItem("voice_captured");
  
  if (alreadyCaptured === "true") {
    triggerVoiceWidget();
  } else {
    // Dispatch custom event that VoiceChatProvider can listen to
    window.dispatchEvent(new CustomEvent("open-voice-capture-modal"));
  }
};
