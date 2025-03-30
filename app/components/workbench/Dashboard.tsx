import { useStore } from '@nanostores/react';
import { memo, useEffect, useRef } from 'react';
import { convexProjectToken, convexProjectDeploymentUrl, convexProjectDeploymentName } from '~/lib/stores/convex';
import { IconButton } from '~/components/ui/IconButton';

export const Dashboard = memo(() => {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const deploymentUrl = useStore(convexProjectDeploymentUrl);
  const token = useStore(convexProjectToken);
  const deploymentName = useStore(convexProjectDeploymentName);

  const url = deploymentUrl ? 'https://dashboard-embedded.convex.dev' : null;

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

  const publicUrl = `https://dashboard.convex.dev/d/${deploymentName}/`;

  return (
    <div className="w-full h-full flex flex-col">
      {url !== null ? (
        <>
          <div className="bg-bolt-elements-background-depth-2 p-2 flex items-center gap-1.5">
            <div
              className="flex items-center gap-1 flex-grow bg-bolt-elements-preview-addressBar-background border border-bolt-elements-borderColor text-bolt-elements-preview-addressBar-text rounded-full px-3 py-1 text-sm hover:bg-bolt-elements-preview-addressBar-backgroundHover hover:focus-within:bg-bolt-elements-preview-addressBar-backgroundActive focus-within:bg-bolt-elements-preview-addressBar-backgroundActive
          focus-within-border-bolt-elements-borderColorActive focus-within:text-bolt-elements-preview-addressBar-textActive"
            >
              <input
                ref={inputRef}
                className="w-full bg-transparent outline-none"
                type="text"
                value={publicUrl}
                disabled
              />
            </div>
            <IconButton
              icon="i-ph:arrow-square-out"
              onClick={() => {
                window.open(publicUrl, '_blank');
              }}
              title={`Open dashboard in new tab`}
            />
          </div>
          <div className="flex-1 border-t border-bolt-elements-borderColor">
            <iframe ref={iframeRef} className="border-none w-full h-full bg-white" src={url} />
          </div>
        </>
      ) : (
        <div className="flex w-full h-full justify-center items-center bg-white">
          No dashboard has been loaded so far
        </div>
      )}
    </div>
  );
});
