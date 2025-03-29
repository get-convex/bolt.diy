import { useState } from 'react';
import { Dialog, DialogDescription, DialogRoot, DialogTitle, DialogButton, DialogClose } from '~/components/ui/Dialog';
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
            {!isConnected ? (
              <div className="space-y-4">
                <DialogTitle>
                  <div className="flex items-center gap-2">
                    <img className="w-5 h-5" height="24" width="24" src="/icons/Convex.svg" alt="Convex" />
                    Connect to Convex
                  </div>
                </DialogTitle>
                <DialogDescription>Connect your Convex project to enable chat functionality.</DialogDescription>
                <div className="flex justify-end gap-2 mt-6">
                  <DialogClose asChild>
                    <DialogButton type="secondary">Cancel</DialogButton>
                  </DialogClose>
                  <ConvexConnectButton />
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <DialogTitle>
                  <div className="flex items-center gap-2">
                    <img className="w-5 h-5" height="24" width="24" src="/icons/Convex.svg" alt="Convex" />
                    Convex Connection
                  </div>
                </DialogTitle>
                <div className="flex items-center gap-4 p-3 bg-[#F8F8F8] dark:bg-[#1A1A1A] rounded-lg">
                  <div>
                    <h4 className="text-sm font-medium text-bolt-elements-textPrimary">
                      Project: {projectInfo?.projectName}
                    </h4>
                    <p className="text-xs text-bolt-elements-textSecondary">Team: {projectInfo?.teamId}</p>
                  </div>
                </div>
                <div className="text-sm text-gray-500">
                  Project ID:{' '}
                  <code className="bg-[#F8F8F8] dark:bg-[#1A1A1A] px-2 py-1 rounded">{projectInfo?.projectId}</code>
                </div>
                <div className="flex justify-end gap-2 mt-6">
                  <DialogClose asChild>
                    <DialogButton type="secondary">Close</DialogButton>
                  </DialogClose>
                </div>
              </div>
            )}
          </Dialog>
        )}
      </DialogRoot>
    </div>
  );
}
