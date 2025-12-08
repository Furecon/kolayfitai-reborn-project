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
  // 1. user.authentication.accessToken -> user.accessToken.tokenString
  // 2. user.authentication.idToken -> user.idToken.tokenString
  // 3. user.authentication.refreshToken -> user.refreshToken.tokenString
  // 4. user.serverAuthCode -> NSNull() (architectural limitation)
  // 5. authentication.do callback -> direct token access
  // 6. getConfigValue -> getConfig().getBoolean

  // Fix resolveSignInCallWith method
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

  // Fix serverAuthCode
  swiftContent = swiftContent.replace(
    /"serverAuthCode": user\.serverAuthCode \?\? NSNull\(\),/g,
    '"serverAuthCode": NSNull(), // GoogleSignIn 7.x: serverAuthCode requires config changes'
  );

  // Fix deprecated getConfigValue in initialize method
  swiftContent = swiftContent.replace(
    /getConfigValue\("forceCodeForRefreshToken"\) as\? Bool/g,
    'getConfig().getBoolean("forceCodeForRefreshToken", false)'
  );

  // Fix refresh method - remove authentication.do callback
  // Replace the entire refresh method with GoogleSignIn 7.x compatible version
  const oldRefreshMethod = `    @objc
    func refresh(_ call: CAPPluginCall) {
        DispatchQueue.main.async {
            if self.googleSignIn.currentUser == nil {
                call.reject("User not logged in.");
                return
            }
            self.googleSignIn.currentUser!.authentication.do { (authentication, error) in
                guard let authentication = authentication else {
                    call.reject(error?.localizedDescription ?? "Something went wrong.");
                    return;
                }
                let authenticationData: [String: Any] = [
                    "accessToken": authentication.accessToken,
                    "idToken": authentication.idToken ?? NSNull(),
                    "refreshToken": authentication.refreshToken
                ]
                call.resolve(authenticationData);
            }
        }
    }`;

  const newRefreshMethod = `    @objc
    func refresh(_ call: CAPPluginCall) {
        DispatchQueue.main.async { [weak self] in
            guard let self = self else { return }
            guard let currentUser = self.googleSignIn.currentUser else {
                call.reject("User not logged in.")
                return
            }

            currentUser.refreshTokensIfNeeded { user, error in
                if let error = error {
                    call.reject(error.localizedDescription)
                    return
                }

                guard let user = user else {
                    call.reject("Failed to refresh tokens")
                    return
                }

                let authenticationData: [String: Any] = [
                    "accessToken": user.accessToken.tokenString,
                    "idToken": user.idToken?.tokenString ?? NSNull(),
                    "refreshToken": user.refreshToken?.tokenString ?? NSNull()
                ]
                call.resolve(authenticationData)
            }
        }
    }`;

  swiftContent = swiftContent.replace(oldRefreshMethod, newRefreshMethod);

  fs.writeFileSync(swiftPath, swiftContent, 'utf8');
  console.log('✅ Patched GoogleAuth for GoogleSignIn 7.1+ API compatibility');
} else {
  console.log('⚠️  Plugin.swift not found, skipping Swift patch');
}
