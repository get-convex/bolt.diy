import { useStore } from '@nanostores/react';
import { memo, useEffect, useRef } from 'react';
import { convexProjectToken, convexProjectDeploymentUrl, convexProjectDeploymentName } from '~/lib/stores/convex';

export const Dashboard = memo(() => {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const deploymentUrl = useStore(convexProjectDeploymentUrl);
  const token = useStore(convexProjectToken);
  const deploymentName = useStore(convexProjectDeploymentName);

  //const url = deploymentUrl ? 'https://dashboard-embedded.convex.dev' : null;
  // temp until that's deployed
  const url = deploymentUrl ? 'https://static-dashboard-beta.vercel.app' : null;

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (!deploymentUrl || !token || !deploymentName) {
        return;
      }

      if (event.data?.type === 'dashboard-credentials-request') {
        return;
      }

      const iframe = iframeRef.current;

      if (!iframe) {
        throw new Error('iframe ref not found');
      }

      iframeRef.current.contentWindow?.postMessage(
        {
          type: 'dashboard-credentials',
          adminKey: token,
          deploymentUrl,
          deploymentName,
        },
        '*',
      );
    };

    window.addEventListener('message', handleMessage);

    return () => window.removeEventListener('message', handleMessage);
  }, [deploymentUrl, token, deploymentName]);

  return (
    <div className="w-full h-full flex flex-col">
      <div className="bg-bolt-elements-background-depth-2 p-2 flex items-center gap-1.5">
        <div
          className="flex items-center gap-1 flex-grow bg-bolt-elements-preview-addressBar-background border border-bolt-elements-borderColor text-bolt-elements-preview-addressBar-text rounded-full px-3 py-1 text-sm hover:bg-bolt-elements-preview-addressBar-backgroundHover hover:focus-within:bg-bolt-elements-preview-addressBar-backgroundActive focus-within:bg-bolt-elements-preview-addressBar-backgroundActive
            focus-within-border-bolt-elements-borderColorActive focus-within:text-bolt-elements-preview-addressBar-textActive"
        >
          <input ref={inputRef} className="w-full bg-transparent outline-none" type="text" value={url ?? ''} disabled />
        </div>
      </div>
      <div className="flex-1 border-t border-bolt-elements-borderColor">
        {url !== null ? (
          <iframe ref={iframeRef} className="border-none w-full h-full bg-white" src={url} sandbox="allow-scripts" />
        ) : (
          <div className="flex w-full h-full justify-center items-center bg-white">
            No dashboard has been loaded so far
          </div>
        )}
      </div>
    </div>
  );
});
