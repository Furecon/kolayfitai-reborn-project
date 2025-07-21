
import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.lovable.b1d7ea18170b4e01986ac52642c4683a',
  appName: 'kolayfitai-reborn-project',
  webDir: 'dist',
  server: {
    url: 'https://b1d7ea18-170b-4e01-986a-c52642c4683a.lovableproject.com?forceHideBadge=true',
    cleartext: true
  },
  plugins: {
    Camera: {
      permissions: ['camera', 'photos']
    },
    SplashScreen: {
      launchShowDuration: 2000,
      backgroundColor: '#ffffff',
      showSpinner: false
    },
    StatusBar: {
      style: 'light',
      backgroundColor: '#ffffff'
    },
    PushNotifications: {
      presentationOptions: ['badge', 'sound', 'alert']
    }
  },
  android: {
    // Deep link configuration for OAuth redirects
    allowMixedContent: true,
    captureInput: true,
    webContentsDebuggingEnabled: true,
    // Enable deep linking for OAuth
    deepLinks: [
      {
        host: 'oauth-callback',
        scheme: 'app.lovable.b1d7ea18170b4e01986ac52642c4683a'
      }
    ]
  },
  ios: {
    // Deep link configuration for OAuth redirects
    scheme: 'app.lovable.b1d7ea18170b4e01986ac52642c4683a',
    // Enable deep linking for OAuth
    deepLinks: [
      {
        host: 'oauth-callback',
        scheme: 'app.lovable.b1d7ea18170b4e01986ac52642c4683a'
      }
    ]
  }
};

export default config;
