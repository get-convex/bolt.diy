import { atom } from 'nanostores';

export const convexProjectConnected = atom(false);
export const convexProjectToken = atom<string | null>(null);
export const convexProjectDeploymentName = atom<string | null>(null);
export const convexProjectDeploymentUrl = atom<string | null>(null);
