#!/usr/bin/env node

/**
 * Patches @codetrix-studio/capacitor-google-auth podspec to use GoogleSignIn 7.1+
 * This is required for Apple's privacy manifest compliance (ITMS-91061)
 */

const fs = require('fs');
const path = require('path');

const podspecPath = path.join(
  __dirname,
  '..',
  'node_modules',
  '@codetrix-studio',
  'capacitor-google-auth',
  'CodetrixStudioCapacitorGoogleAuth.podspec'
);

if (!fs.existsSync(podspecPath)) {
  console.log('⚠️  GoogleAuth podspec not found, skipping patch');
  process.exit(0);
}

let content = fs.readFileSync(podspecPath, 'utf8');

// Update GoogleSignIn dependency from 6.2.4 to 7.1+
content = content.replace(
  /s\.dependency\s+'GoogleSignIn',\s+'~>\s*6\.2\.4'/,
  "s.dependency 'GoogleSignIn', '~> 7.1'"
);

// Update deployment target from 12.0 to 13.0 (required for GoogleSignIn 7.1+)
content = content.replace(
  /s\.ios\.deployment_target\s*=\s*'12\.0'/,
  "s.ios.deployment_target  = '13.0'"
);

fs.writeFileSync(podspecPath, content, 'utf8');
console.log('✅ Patched GoogleAuth podspec to use GoogleSignIn 7.1+ with iOS 13.0+');
