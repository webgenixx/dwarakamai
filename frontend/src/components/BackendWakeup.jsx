import { useState, useEffect } from 'react';
import { API_BASE_URL } from '../utils/api';

const BackendWakeup = () => {
  const [isWaking, setIsWaking] = useState(false);
  const [showMessage, setShowMessage] = useState(false);

  useEffect(() => {
    const checkBackend = async () => {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => {
          controller.abort();
          setIsWaking(true);
          setShowMessage(true);
        }, 3000); // Show message if response takes more than 3 seconds

        const response = await fetch(`${API_BASE_URL}/health`, {
          signal: controller.signal
        });

        clearTimeout(timeoutId);

        if (response.ok) {
          setIsWaking(false);
          setShowMessage(false);
        }
      } catch (error) {
        if (error.name !== 'AbortError') {
          console.error('Backend check failed:', error);
        }
      }
    };

    checkBackend();
  }, []);

  if (!showMessage) return null;

  return null;
};

export default BackendWakeup;
