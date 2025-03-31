import { atom } from 'nanostores';

type ConvexProject = {
  token: string;
  deploymentName: string;
  deploymentUrl: string;
};

export const convexStore = atom<ConvexProject | null>(null);

export function waitForConvexProjectConnection(): Promise<void> {
  return new Promise<void>((resolve) => {
    if (convexStore.get() !== null) {
      resolve();
      return;
    }

    const unsubscribe = convexStore.subscribe((project) => {
      if (project !== null) {
        unsubscribe();
        resolve();
      }
    });
  });
}
