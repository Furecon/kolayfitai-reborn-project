import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.kolayfit.app',
  appName: 'KolayFit',
  webDir: 'dist',
  server: {
    androidScheme: 'https',
    cleartext: true
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      backgroundColor: '#ffffff',
      showSpinner: false,
      androidSpinnerStyle: 'large',
      spinnerColor: '#10b981'
    },
    GoogleAuth: {
      scopes: ['profile', 'email'],
      serverClientId: '680638175809-ud31fspsid283q4tt7s9etok0nrb9e2g.apps.googleusercontent.com',
      forceCodeForRefreshToken: true
    }
  }
};

export default config;
