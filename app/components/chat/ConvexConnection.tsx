import { useState, useEffect } from 'react';
import { Dialog, DialogDescription, DialogRoot, DialogTitle } from '~/components/ui/Dialog';
import { classNames } from '~/utils/classNames';
import { ConvexConnectButton } from './ConvexConnectButton';
import { convexProjectConnected, convexProjectToken } from '~/lib/stores/convex';
import { useStore } from '@nanostores/react';
import { parseConvexToken } from '~/utils/convex';

export function ConvexConnection() {
  const [isOpen, setIsOpen] = useState(false);

  const isConnected = useStore(convexProjectConnected);
  const token = useStore(convexProjectToken);
  const projectInfo = token ? parseConvexToken(token) : null;

  useEffect(() => {
    // Check for token in localStorage
    const storedToken = localStorage.getItem('convexProjectToken');

    if (storedToken) {
      // Save both the connection state and token to global store
      convexProjectConnected.set(true);
      convexProjectToken.set(storedToken);

      // Remove from localStorage once we have it in the global store
      localStorage.removeItem('convexProjectToken');
    }
  }, []);

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className={classNames(
          'px-4 py-2 rounded-lg text-sm flex items-center gap-2',
          isConnected ? 'bg-green-500' : 'bg-gray-200',
        )}
      >
        <div className={isConnected ? 'i-ph:check' : 'i-ph:plug-charging'} />
        {isConnected ? 'Connected to Convex' : 'Connect to Convex'})
      </button>
      <DialogRoot open={isOpen} onOpenChange={setIsOpen}>
        {isOpen && (
          <Dialog className="max-w-[520px] p-6">
            <DialogTitle>Connect to Convex</DialogTitle>
            {isConnected && projectInfo ? (
              <>
                <DialogDescription>
                  Connected to project <span className="font-medium">{projectInfo.projectName}</span> in team{' '}
                  <span className="font-medium">{projectInfo.teamId}</span>
                </DialogDescription>
                <div className="mt-4 text-sm text-gray-500">
                  Project ID: <code className="bg-gray-100 px-2 py-1 rounded">{projectInfo.projectId}</code>
                </div>
              </>
            ) : (
              <DialogDescription>Connect your Convex project to enable chat functionality.</DialogDescription>
            )}

            {!isConnected && (
              <div className="flex justify-end mt-4">
                <ConvexConnectButton />
              </div>
            )}
          </Dialog>
        )}
      </DialogRoot>
    </>
  );
}
