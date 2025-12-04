export const openVoiceChat = () => {
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
      return;
    }
  }
  
  console.warn('Voice chat widget not found');
};
