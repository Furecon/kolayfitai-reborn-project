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

// Support patching both node_modules and Pods
const nodeModulesDir = path.join(
  __dirname,
  '..',
  'node_modules',
  '@codetrix-studio',
  'capacitor-google-auth'
);

// Try multiple Pods locations
const podsDirs = [
  path.join(__dirname, '..', 'ios', 'App', 'Pods', 'CodetrixStudioCapacitorGoogleAuth'),
  path.join(__dirname, '..', 'ios', 'App', 'Pods', 'Development Pods', 'CodetrixStudioCapacitorGoogleAuth'),
  path.join(__dirname, '..', 'ios', 'App', 'Pods', 'Local Podspecs', 'CodetrixStudioCapacitorGoogleAuth'),
];

// Find existing Pods directory
let podsDir = null;
for (const dir of podsDirs) {
  if (fs.existsSync(dir)) {
    podsDir = dir;
    break;
  }
}

// If not found in standard locations, search entire Pods directory
if (!podsDir) {
  const { execSync } = require('child_process');
  try {
    const searchResult = execSync(
      'find ios/App/Pods -type d -name "CodetrixStudioCapacitorGoogleAuth" 2>/dev/null',
      { cwd: path.join(__dirname, '..'), encoding: 'utf8' }
    ).trim();
    if (searchResult) {
      podsDir = path.join(__dirname, '..', searchResult.split('\n')[0]);
    }
  } catch (e) {
    // Pods directory not found, will use node_modules
  }
}

// Determine which directory to patch
const pluginDir = podsDir && fs.existsSync(podsDir) ? podsDir : nodeModulesDir;
const isPods = pluginDir === podsDir;

const podspecPath = path.join(pluginDir, 'CodetrixStudioCapacitorGoogleAuth.podspec');
const swiftPath = isPods
  ? path.join(pluginDir, 'ios', 'Plugin', 'Plugin.swift')
  : path.join(pluginDir, 'ios', 'Plugin', 'Plugin.swift');

if (!fs.existsSync(podspecPath)) {
  console.log('⚠️  GoogleAuth podspec not found, skipping patch');
  console.log('   Looking in:', podspecPath);
  process.exit(0);
}

console.log(`🔧 Patching @codetrix-studio/capacitor-google-auth for GoogleSignIn 7.1+`);
console.log(`   Location: ${isPods ? 'ios/App/Pods' : 'node_modules'} (${isPods ? 'CocoaPods' : 'npm'})`);

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
console.log('   ✅ Updated Podspec: GoogleSignIn 7.1+, iOS 13.0+');

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
    '"idToken": (user.idToken?.tokenString ?? NSNull()) as Any,'
  );

  // Also fix if already patched (add as Any cast to suppress warning)
  swiftContent = swiftContent.replace(
    /"idToken": user\.idToken\?\.tokenString \?\? NSNull\(\),/g,
    '"idToken": (user.idToken?.tokenString ?? NSNull()) as Any,'
  );

  swiftContent = swiftContent.replace(
    /"refreshToken": user\.authentication\.refreshToken/g,
    '"refreshToken": user.refreshToken.tokenString'
  );

  // GoogleSignIn 7.x: refreshToken is no longer optional, remove optional chaining
  swiftContent = swiftContent.replace(
    /user\.refreshToken\?\.tokenString\s*\?\?\s*NSNull\(\)/g,
    'user.refreshToken.tokenString'
  );

  // Fix refresh method - complete replacement with exact string match (matches original code)
  const oldRefreshFunc = `    func refresh(_ call: CAPPluginCall) {
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

  const newRefreshFunc = `    func refresh(_ call: CAPPluginCall) {
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
                    "refreshToken": user.refreshToken.tokenString
                ]
                call.resolve(authenticationData)
            }
        }
    }`;

  swiftContent = swiftContent.replace(oldRefreshFunc, newRefreshFunc);

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

  // Fix deprecated getConfigValue for scopes
  swiftContent = swiftContent.replace(
    /getConfigValue\("scopes"\) as\? \[String\]/g,
    'getConfig().getArray("scopes") as? [String]'
  );

  // Remove any redundant ?? false after getConfig().getBoolean()
  swiftContent = swiftContent.replace(
    /getConfig\(\)\.getBoolean\("forceCodeForRefreshToken", false\)\s*\?\?\s*false/g,
    'getConfig().getBoolean("forceCodeForRefreshToken", false)'
  );

  // Swift 6 compatibility: Add missing [weak self] and guard statements
  // Only apply if not already patched
  if (!swiftContent.includes('[weak self] in')) {
    // Fix signIn method DispatchQueue
    swiftContent = swiftContent.replace(
      /@objc\s+func signIn\(_ call: CAPPluginCall\) \{\s*signInCall = call;\s*DispatchQueue\.main\.async \{/,
      `@objc
    func signIn(_ call: CAPPluginCall) {
        signInCall = call;
        DispatchQueue.main.async { [weak self] in
            guard let self = self else { return }`
    );

    // Fix signOut method DispatchQueue
    swiftContent = swiftContent.replace(
      /@objc\s+func signOut\(_ call: CAPPluginCall\) \{\s*DispatchQueue\.main\.async \{\s*self\.googleSignIn\.signOut\(\);/,
      `@objc
    func signOut(_ call: CAPPluginCall) {
        DispatchQueue.main.async { [weak self] in
            guard let self = self else { return }
            self.googleSignIn.signOut();`
    );
  }

  // Fix line 46: Remove unnecessary 'as? String' cast (Xcode 26.1 compatibility)
  swiftContent = swiftContent.replace(
    /guard let clientId = call\.getString\("clientId"\) \?\? getClientIdValue\(\) as\? String else \{/g,
    'guard let clientId = call.getString("clientId") ?? getClientIdValue() else {'
  );

  fs.writeFileSync(swiftPath, swiftContent, 'utf8');
  console.log('   ✅ Updated Plugin.swift:');
  console.log('      - Fixed accessToken, idToken, refreshToken API');
  console.log('      - Fixed getConfig().getBoolean() calls');
  console.log('      - Updated refresh() method for 7.x API');
  console.log('✅ GoogleAuth patched successfully for GoogleSignIn 7.1+');

  // Debug summary
  console.log('\n📊 Patch Summary:');
  console.log('   Patched:', swiftPath);
  console.log('   File exists:', fs.existsSync(swiftPath));
  console.log('   Contains [weak self]:', swiftContent.includes('[weak self] in'));
  console.log('   Contains tokenString:', swiftContent.includes('user.accessToken.tokenString'));
} else {
  console.log('⚠️  Plugin.swift not found, skipping Swift patch');
  console.log('   Looking in:', swiftPath);
}
