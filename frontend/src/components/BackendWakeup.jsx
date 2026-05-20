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

  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-valentine-red text-white py-3 px-4 text-center shadow-lg">
      <div className="flex items-center justify-center space-x-3">
        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
        <p className="font-medium">
          {isWaking 
            ? '⏳ Waking up backend service... This may take 30-50 seconds (Render free tier)'
            : '🔄 Connecting to backend...'}
        </p>
      </div>
    </div>
  );
};

export default BackendWakeup;
