import { registerPlugin } from '@capacitor/core';

export interface GoogleAuthPlugin {
  signIn(): Promise<{ idToken: string; accessToken: string }>;
  signOut(): Promise<void>;
  isSignedIn(): Promise<{ isSignedIn: boolean }>;
}

const GoogleAuth = registerPlugin<GoogleAuthPlugin>('GoogleAuth', {
  web: () => import('./web').then(m => new m.GoogleAuthWeb()),
});

export default GoogleAuth;