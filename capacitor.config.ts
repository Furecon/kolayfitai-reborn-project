
import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.kolayfit.app',
  appName: 'KolayFit',
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
    },
    GoogleAuth: {
      scopes: ['profile', 'email'],
      serverClientId: 'YOUR_GOOGLE_SERVER_CLIENT_ID',
      forceCodeForRefreshToken: true
    }
  },
  android: {
    allowMixedContent: true,
    captureInput: true,
    webContentsDebuggingEnabled: true,
    deepLinks: [
      {
        host: 'oauth-callback',
        scheme: 'com.kolayfit.app'
      }
    ]
  },
  ios: {
    scheme: 'com.kolayfit.app',
    deepLinks: [
      {
        host: 'oauth-callback',
        scheme: 'com.kolayfit.app'
      }
    ]
  }
};

export default config;
