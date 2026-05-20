/**
 * Wake up the backend service (Render free tier sleeps after 15 min)
 */

import { API_BASE_URL } from './api';

let isWaking = false;
let isAwake = false;

export const wakeBackend = async () => {
  // If already awake or currently waking, skip
  if (isAwake || isWaking) {
    return true;
  }

  isWaking = true;
  console.log('🔄 Waking up backend service...');

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 60000); // 60 second timeout

    const response = await fetch(`${API_BASE_URL}/health`, {
      method: 'GET',
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    if (response.ok) {
      isAwake = true;
      isWaking = false;
      console.log('✅ Backend is awake!');
      return true;
    }
  } catch (error) {
    console.warn('⚠️ Backend wake-up check failed:', error.message);
  }

  isWaking = false;
  return false;
};

// Auto-wake on app load
if (typeof window !== 'undefined') {
  wakeBackend();
}

export default wakeBackend;
