// Manual test script for RTDN webhook
// Usage: node test.js [notification_type] [purchase_token]

const WEBHOOK_URL = 'https://acsqneuzkukmvtfmbphb.supabase.co/functions/v1/rtdn-webhook';

// Available test purchase tokens from the database
const TEST_PURCHASE_TOKENS = [
  'mock_token_1753945443671',
  'mock_token_1756217736649', 
  'mock_token_1757084026403'
];

// Notification types
const NOTIFICATION_TYPES = {
  1: 'SUBSCRIPTION_RECOVERED',
  2: 'SUBSCRIPTION_RENEWED', 
  3: 'SUBSCRIPTION_CANCELED',
  4: 'SUBSCRIPTION_PURCHASED',
  5: 'SUBSCRIPTION_ON_HOLD',
  6: 'SUBSCRIPTION_IN_GRACE_PERIOD',
  7: 'SUBSCRIPTION_RESTARTED',
  8: 'SUBSCRIPTION_PRICE_CHANGE_CONFIRMED',
  9: 'SUBSCRIPTION_DEFERRED',
  10: 'SUBSCRIPTION_PAUSED',
  11: 'SUBSCRIPTION_PAUSE_SCHEDULE_CHANGED',
  12: 'SUBSCRIPTION_REVOKED',
  13: 'SUBSCRIPTION_EXPIRED'
};

function createTestMessage(notificationType = 2, purchaseToken = TEST_PURCHASE_TOKENS[0]) {
  const rtdnMessage = {
    version: "1.0",
    packageName: "com.kolayfit.app", // This should match GOOGLE_PACKAGE_NAME secret
    eventTimeMillis: Date.now().toString(),
    subscriptionNotification: {
      version: "1.0",
      notificationType: parseInt(notificationType),
      purchaseToken: purchaseToken,
      subscriptionId: "kolay_fit_premium_monthly"
    }
  };

  // Encode as base64 (as Google Pub/Sub does)
  const encodedData = Buffer.from(JSON.stringify(rtdnMessage)).toString('base64');
  
  return {
    message: {
      data: encodedData,
      messageId: `test-message-${Date.now()}`,
      publishTime: new Date().toISOString(),
      attributes: {}
    },
    subscription: "projects/kolayfitai-v2/subscriptions/play-rtdn-sub"
  };
}

async function testWebhook(notificationType = 2, purchaseToken = TEST_PURCHASE_TOKENS[0]) {
  const testPayload = createTestMessage(notificationType, purchaseToken);
  
  console.log('\n=== RTDN Webhook Manual Test ===');
  console.log(`Notification Type: ${notificationType} (${NOTIFICATION_TYPES[notificationType]})`);
  console.log(`Purchase Token: ${purchaseToken}`);
  console.log('\nTest Payload:');
  console.log(JSON.stringify(testPayload, null, 2));

  // Create a simple JWT token for testing (bypass Google verification)
  const testJwtHeader = Buffer.from(JSON.stringify({alg: "RS256", typ: "JWT"})).toString('base64');
  const testJwtPayload = Buffer.from(JSON.stringify({
    iss: "https://accounts.google.com",
    aud: "kolayfitai-v2",
    exp: Math.floor(Date.now() / 1000) + 3600
  })).toString('base64');
  const testJwtSignature = "test_signature";
  const testJwt = `${testJwtHeader}.${testJwtPayload}.${testJwtSignature}`;

  console.log('\n=== Making Request ===');
  
  try {
    const response = await fetch(WEBHOOK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${testJwt}`,
        'User-Agent': 'Google-Cloud-Pub-Sub'
      },
      body: JSON.stringify(testPayload)
    });

    console.log(`Response Status: ${response.status}`);
    console.log(`Response Headers:`, Object.fromEntries(response.headers));
    
    const responseText = await response.text();
    console.log(`Response Body: ${responseText}`);

    if (response.ok) {
      console.log('\n✅ Test completed successfully!');
    } else {
      console.log('\n❌ Test failed');
    }

  } catch (error) {
    console.error('\n❌ Request failed:', error.message);
  }
}

// Parse command line arguments
const args = process.argv.slice(2);
const notificationType = args[0] ? parseInt(args[0]) : 2;
const purchaseToken = args[1] || TEST_PURCHASE_TOKENS[0];

// Validate notification type
if (!NOTIFICATION_TYPES[notificationType]) {
  console.error(`Invalid notification type: ${notificationType}`);
  console.log('Valid types:', Object.entries(NOTIFICATION_TYPES).map(([k,v]) => `${k}: ${v}`).join('\n'));
  process.exit(1);
}

// Run test
testWebhook(notificationType, purchaseToken);

console.log('\n=== Usage Examples ===');
console.log('node test.js 2 mock_token_1757084026403  # Test renewal');
console.log('node test.js 3 mock_token_1757084026403  # Test cancellation'); 
console.log('node test.js 4 mock_token_1757084026403  # Test new purchase');