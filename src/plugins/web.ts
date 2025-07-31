import { WebPlugin } from '@capacitor/core';
import type { GoogleAuthPlugin } from './GoogleAuthPlugin';

export class GoogleAuthWeb extends WebPlugin implements GoogleAuthPlugin {
  async signIn(): Promise<{ idToken: string; accessToken: string }> {
    // Web implementation can fall back to standard OAuth flow
    throw new Error('Web implementation should use standard OAuth flow');
  }

  async signOut(): Promise<void> {
    // Web implementation
    throw new Error('Web implementation should use standard OAuth flow');
  }

  async isSignedIn(): Promise<{ isSignedIn: boolean }> {
    return { isSignedIn: false };
  }
}