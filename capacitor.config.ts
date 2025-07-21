
import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.kolayfitai.app',
  appName: 'KolayfitAI',
  webDir: 'dist',
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
    allowMixedContent: true,
    captureInput: true,
    webContentsDebuggingEnabled: true,
    deepLinks: [
      {
        host: 'oauth-callback',
        scheme: 'com.kolayfitai.app'
      }
    ]
  },
  ios: {
    scheme: 'com.kolayfitai.app',
    deepLinks: [
      {
        host: 'oauth-callback',
        scheme: 'com.kolayfitai.app'
      }
    ]
  }
};

export default config;
