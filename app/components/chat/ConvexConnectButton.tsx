import { classNames } from '~/utils/classNames';
import { useState, useEffect } from 'react';
import { convexProjectConnected, convexProjectToken } from '~/lib/stores/convex';
import { useStore } from '@nanostores/react';

// The Convex OAuth App which is allowed to use the callbacks
const CLIENT_ID = '855ec8198b9c462d';

export function ConvexConnectButton() {
  const [isLoading, setIsLoading] = useState(false);
  const [pollInterval, setPollInterval] = useState<NodeJS.Timeout | null>(null);

  useEffect(() => {
    return () => {
      if (pollInterval) {
        clearInterval(pollInterval);
      }
    };
  }, [pollInterval]);

  const handleOAuthClick = async () => {
    setIsLoading(true);

    const state = JSON.stringify({
      random: Math.random().toString(36).substring(2),
      extraState: 1,
    });
    localStorage.setItem('convexOAuthState', state);

    const params = new URLSearchParams({
      client_id: CLIENT_ID,
      redirect_uri: window.location.origin + '/convex/callback',
      response_type: 'code',
      state,
    });

    // Open our loading page first, which will then redirect to Convex
    const connectUrl = `/convex/connect?${params.toString()}`;
    window.open(connectUrl, 'ConvexAuth', 'width=600,height=600,top=200,left=200');

    // Poll for token in local storage because COOP + COEP headers make postMessage more involved.
    const interval = setInterval(() => {
      const token = localStorage.getItem('convexProjectToken');

      if (token) {
        clearInterval(interval);
        setPollInterval(null);
        setIsLoading(false);
        convexProjectConnected.set(true);
        convexProjectToken.set(token);
        localStorage.removeItem('convexProjectToken');
      }
    }, 500);

    setPollInterval(interval);
  };

  const isReconnecting = useStore(convexProjectConnected);

  return (
    <button
      onClick={handleOAuthClick}
      disabled={isLoading}
      className={classNames(
        'px-4 py-2 rounded-lg text-sm flex items-center gap-2',
        'bg-[#8B5CF6] text-white',
        'hover:bg-[#7C3AED]',
        'disabled:opacity-50 disabled:cursor-not-allowed',
      )}
    >
      {isLoading ? (
        <>
          <div className="i-ph:spinner-gap animate-spin" />
          Connecting...
        </>
      ) : (
        <>
          <div className="i-ph:plug-charging w-4 h-4" />
          {isReconnecting ? 'Connect a different project' : 'Connect'}
        </>
      )}
    </button>
  );
}
