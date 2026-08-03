const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';
const SESSION_KEY = 'ts-analytics-session';

function getSessionId() {
  let sessionId = localStorage.getItem(SESSION_KEY);
  if (!sessionId) {
    sessionId = crypto.randomUUID();
    localStorage.setItem(SESSION_KEY, sessionId);
  }
  return sessionId;
}

export function trackEvent(type, { productId, metadata } = {}) {
  fetch(`${API_URL}/analytics/events`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ type, productId, sessionId: getSessionId(), metadata }),
    keepalive: true,
  }).catch(() => {});
}
