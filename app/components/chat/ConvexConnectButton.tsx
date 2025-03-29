import { classNames } from '~/utils/classNames';
import { useState, useEffect } from 'react';
import { convexProjectConnected, convexProjectToken } from '~/lib/stores/convex';

const CLIENT_ID = '855ec8198b9c462d';

/**
 * OAuth button component for connecting to Convex.
 */
export function ConvexConnectButton() {
  const [isLoading, setIsLoading] = useState(false);
  const [pollInterval, setPollInterval] = useState<NodeJS.Timeout | null>(null);

  // Cleanup polling on unmount
  useEffect(() => {
    return () => {
      if (pollInterval) {
        clearInterval(pollInterval);
      }
    };
  }, [pollInterval]);

  const handleOAuthClick = async () => {
    console.log('Starting OAuth flow...');
    setIsLoading(true);

    try {
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

      const authUrl = `https://dashboard.convex.dev/oauth/authorize/project?${params.toString()}`;
      console.log('Opening auth popup:', authUrl);

      // Open popup
      window.open(authUrl, 'ConvexAuth', 'width=800,height=600');

      // Start polling for token
      const interval = setInterval(() => {
        const token = localStorage.getItem('convexProjectToken');

        if (token) {
          console.log('we got it!');
          clearInterval(interval);
          setPollInterval(null);
          setIsLoading(false);
          convexProjectConnected.set(true);
          convexProjectToken.set(token);
          localStorage.removeItem('convexProjectToken');
        }
      }, 500);

      setPollInterval(interval);
    } catch (error) {
      console.error('Error initiating OAuth flow:', error);
      setIsLoading(false);

      if (pollInterval) {
        clearInterval(pollInterval);
        setPollInterval(null);
      }
    }
  };

  return (
    <button
      onClick={handleOAuthClick}
      disabled={isLoading}
      className={classNames(
        'px-4 py-2 rounded-lg text-sm flex items-center gap-2',
        'bg-[#3ECF8E] text-white',
        'hover:bg-[#3BBF84]',
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
          Connect Project
        </>
      )}
    </button>
  );
}
