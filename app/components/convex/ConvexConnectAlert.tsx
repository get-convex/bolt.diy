import { AnimatePresence, motion } from 'framer-motion';
import { classNames } from '~/utils/classNames';
import { ConvexConnection } from './ConvexConnection';

export function ConvexConnectAlert() {
  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.3 }}
        className={`rounded-lg border border-bolt-elements-borderColor bg-bolt-elements-background-depth-2 my-2`}
      >
        <div className="flex">
          <div className="w-1 flex rounded-l-lg flex-col overflow-hidden">
            <div className="bg-[#f1a71a] grow"></div>
            <div className="bg-[#eb2e29] grow"></div>
            <div className="bg-[#82226b] grow"></div>
          </div>

          {/* Content */}
          <div className="ml-1.5 flex-1 p-4">
            <motion.h3
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.1 }}
              className={`text-sm font-medium text-bolt-elements-textPrimary`}
            >
              Connect your project to Convex
            </motion.h3>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className={`mt-2 text-sm text-bolt-elements-textSecondary`}
            >
              <p>Deploy your project to a development backend.</p>
            </motion.div>

            {/* Actions */}
            <motion.div
              className="mt-4"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <div className={classNames('flex gap-2')}>
                <ConvexConnection size="full" />
              </div>
            </motion.div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
