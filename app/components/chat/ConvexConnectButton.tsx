import { classNames } from '~/utils/classNames';
import { useState, useEffect } from 'react';
import {
  convexProjectConnected,
  convexProjectDeploymentName,
  convexProjectToken,
  convexProjectDeploymentUrl,
} from '~/lib/stores/convex';

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

    const authUrl = `https://dashboard.convex.dev/oauth/authorize/project?${params.toString()}`;

    window.open(authUrl, 'ConvexAuth', 'width=600,height=600,top=200,left=200');

    // Poll for token in local storage because COOP + COEP headers make postMessage more involved.
    const interval = setInterval(() => {
      const token = localStorage.getItem('convexProjectToken');
      const deploymentName = localStorage.getItem('convexProjectDeploymentName');
      const deploymentUrl = localStorage.getItem('convexProjectDeploymentUrl');

      if (token && deploymentName && deploymentUrl) {
        clearInterval(interval);
        setPollInterval(null);
        setIsLoading(false);
        convexProjectConnected.set(true);
        convexProjectToken.set(token);
        convexProjectDeploymentName.set(deploymentName);
        convexProjectDeploymentUrl.set(deploymentUrl);
        localStorage.removeItem('convexProjectToken');
        localStorage.removeItem('convexProjectDeploymentName');
        localStorage.removeItem('convexProjectDeploymentUrl');
      }
    }, 500);

    setPollInterval(interval);
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
