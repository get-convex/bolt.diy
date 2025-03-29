import { useState } from 'react';
import { Dialog, DialogButton, DialogClose, DialogRoot, DialogTitle } from '~/components/ui/Dialog';
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

  const handleDisconnect = () => {
    convexProjectConnected.set(false);
    convexProjectToken.set(null);
  };

  return (
    <div className="relative">
      <div className="flex border border-bolt-elements-borderColor rounded-md overflow-hidden text-sm">
        <button
          onClick={() => setIsOpen(true)}
          className={classNames(
            'hover:bg-bolt-elements-item-backgroundActive flex items-center gap-2 p-1.5',
            isConnected
              ? 'bg-bolt-elements-item-backgroundDefault text-bolt-elements-item-contentAccent'
              : 'bg-bolt-elements-item-backgroundDefault text-bolt-elements-textTertiary',
          )}
        >
          <img className="w-4 h-4" height="20" width="20" src="/icons/Convex.svg" alt="Convex" />
          {isConnected && projectInfo && (
            <span className="ml-1 text-xs max-w-[100px] truncate">{projectInfo.projectName}</span>
          )}
        </button>
      </div>

      <DialogRoot open={isOpen} onOpenChange={setIsOpen}>
        {isOpen && (
          <Dialog className="max-w-[520px] p-6">
            <div className="space-y-4">
              <DialogTitle>
                <div className="flex items-center gap-2 px-3">
                  <img className="w-5 h-5" height="24" width="24" src="/icons/Convex.svg" alt="Convex" />
                  {projectInfo ? 'Connected Convex Project' : 'Connect a Convex Project'}
                </div>
              </DialogTitle>
              <div className="flex items-center justify-between bg-[#F8F8F8] dark:bg-[#1A1A1A] rounded-lg mx-3">
                <div>
                  {projectInfo ? (
                    <>
                      <h4 className="text-sm font-medium text-bolt-elements-textPrimary">
                        Project: {projectInfo.projectName}
                      </h4>
                      <p className="text-xs text-bolt-elements-textSecondary">Team: {projectInfo.teamId}</p>
                    </>
                  ) : (
                    <h4 className="text-sm font-medium text-bolt-elements-textSecondary">No project connected</h4>
                  )}
                </div>
                {projectInfo ? (
                  <button
                    onClick={handleDisconnect}
                    className="px-4 py-1.5 rounded-md bg-transparent hover:bg-red-200 dark:bg-red-900/20 dark:hover:bg-red-900/30 text-red-600 dark:text-red-400 text-sm transition-colors"
                  >
                    Disconnect
                  </button>
                ) : (
                  <ConvexConnectButton />
                )}
              </div>
              <div className="flex justify-end gap-2 mt-6 px-3">
                <DialogClose asChild>
                  <DialogButton type="secondary">Close</DialogButton>
                </DialogClose>
              </div>
            </div>
          </Dialog>
        )}
      </DialogRoot>
    </div>
  );
}
