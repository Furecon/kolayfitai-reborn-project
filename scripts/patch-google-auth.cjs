#!/usr/bin/env node

/**
 * Patches @codetrix-studio/capacitor-google-auth to be compatible with GoogleSignIn 7.1+
 * This is required for Apple's privacy manifest compliance (ITMS-91061)
 *
 * Changes:
 * 1. Podspec: GoogleSignIn 6.2.4 -> 7.1+, iOS 12.0 -> 13.0
 * 2. Swift code: Updated API calls for GoogleSignIn 7.x compatibility
 */

const fs = require('fs');
const path = require('path');

const pluginDir = path.join(
  __dirname,
  '..',
  'node_modules',
  '@codetrix-studio',
  'capacitor-google-auth'
);

const podspecPath = path.join(pluginDir, 'CodetrixStudioCapacitorGoogleAuth.podspec');
const swiftPath = path.join(pluginDir, 'ios', 'Plugin', 'Plugin.swift');

if (!fs.existsSync(podspecPath)) {
  console.log('⚠️  GoogleAuth podspec not found, skipping patch');
  process.exit(0);
}

// Patch 1: Update Podspec
let podspecContent = fs.readFileSync(podspecPath, 'utf8');

podspecContent = podspecContent.replace(
  /s\.dependency\s+'GoogleSignIn',\s+'~>\s*6\.2\.4'/,
  "s.dependency 'GoogleSignIn', '~> 7.1'"
);

podspecContent = podspecContent.replace(
  /s\.ios\.deployment_target\s*=\s*'12\.0'/,
  "s.ios.deployment_target  = '13.0'"
);

fs.writeFileSync(podspecPath, podspecContent, 'utf8');

// Patch 2: Update Swift code for GoogleSignIn 7.x API
if (fs.existsSync(swiftPath)) {
  let swiftContent = fs.readFileSync(swiftPath, 'utf8');

  // GoogleSignIn 7.x API changes:
  // - user.authentication.accessToken -> user.accessToken.tokenString
  // - user.authentication.idToken -> user.idToken.tokenString
  // - user.authentication.refreshToken -> user.refreshToken.tokenString
  // - user.serverAuthCode remains the same (but better null handling)

  swiftContent = swiftContent.replace(
    /"accessToken": user\.authentication\.accessToken,/g,
    '"accessToken": user.accessToken.tokenString,'
  );

  swiftContent = swiftContent.replace(
    /"idToken": user\.authentication\.idToken,/g,
    '"idToken": user.idToken?.tokenString ?? NSNull(),'
  );

  swiftContent = swiftContent.replace(
    /"refreshToken": user\.authentication\.refreshToken/g,
    '"refreshToken": user.refreshToken?.tokenString ?? NSNull()'
  );

  // serverAuthCode in GoogleSignIn 7.x requires different handling
  // For compatibility, we set it to NSNull() as the plugin architecture
  // doesn't support the new GIDSignInResult-based approach
  swiftContent = swiftContent.replace(
    /"serverAuthCode": user\.serverAuthCode \?\? NSNull\(\),/g,
    '"serverAuthCode": NSNull(), // GoogleSignIn 7.x: serverAuthCode requires config changes'
  );

  fs.writeFileSync(swiftPath, swiftContent, 'utf8');
  console.log('✅ Patched GoogleAuth for GoogleSignIn 7.1+ API compatibility');
} else {
  console.log('⚠️  Plugin.swift not found, skipping Swift patch');
}
