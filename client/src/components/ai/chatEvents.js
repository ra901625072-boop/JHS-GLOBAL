/**
 * Lightweight chat event dispatcher decoupled from the heavy ChatWidget UI.
 * Allows buttons and drawers to trigger AI chat without pulling the full ChatWidget bundle into the critical path.
 */
export const openAiAssistant = (query = null) => {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('open-ai-chat', { detail: { query } }));
  }
};

export default {
  openAiAssistant,
};
