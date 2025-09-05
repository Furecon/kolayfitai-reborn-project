#!/bin/bash

# RTDN Webhook Curl Test Script
# Usage: ./curl-test.sh [notification_type] [purchase_token]

WEBHOOK_URL="https://acsqneuzkukmvtfmbphb.supabase.co/functions/v1/rtdn-webhook"

# Default values
NOTIFICATION_TYPE=${1:-2}  # Default: SUBSCRIPTION_RENEWED
PURCHASE_TOKEN=${2:-"mock_token_1757084026403"}  # Latest test token

echo "=== RTDN Webhook Curl Test ==="
echo "Notification Type: $NOTIFICATION_TYPE"
echo "Purchase Token: $PURCHASE_TOKEN"
echo ""

# Create RTDN message
RTDN_MESSAGE='{
  "version": "1.0",
  "packageName": "com.kolayfit.app",
  "eventTimeMillis": "'$(date +%s000)'",
  "subscriptionNotification": {
    "version": "1.0", 
    "notificationType": '$NOTIFICATION_TYPE',
    "purchaseToken": "'$PURCHASE_TOKEN'",
    "subscriptionId": "kolay_fit_premium_monthly"
  }
}'

echo "RTDN Message:"
echo "$RTDN_MESSAGE" | jq '.'
echo ""

# Encode message as base64 (like Pub/Sub does)
ENCODED_DATA=$(echo "$RTDN_MESSAGE" | base64 -w 0)

# Create Pub/Sub message format
PUBSUB_MESSAGE='{
  "message": {
    "data": "'$ENCODED_DATA'",
    "messageId": "test-'$(date +%s)'",
    "publishTime": "'$(date -u +%Y-%m-%dT%H:%M:%S.%3NZ)'",
    "attributes": {}
  },
  "subscription": "projects/kolayfitai-v2/subscriptions/play-rtdn-sub"
}'

# Create simple test JWT (for testing only)
JWT_HEADER=$(echo -n '{"alg":"RS256","typ":"JWT"}' | base64 -w 0)
JWT_PAYLOAD=$(echo -n '{"iss":"https://accounts.google.com","aud":"kolayfitai-v2","exp":'$(($(date +%s) + 3600))'}' | base64 -w 0)
TEST_JWT="$JWT_HEADER.$JWT_PAYLOAD.test_signature"

echo "Making request..."
echo ""

# Make the curl request
curl -v -X POST "$WEBHOOK_URL" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TEST_JWT" \
  -H "User-Agent: Google-Cloud-Pub-Sub" \
  -d "$PUBSUB_MESSAGE"

echo ""
echo ""
echo "=== Test Complete ==="
echo ""
echo "Common notification types:"
echo "2 = SUBSCRIPTION_RENEWED (should keep active)"
echo "3 = SUBSCRIPTION_CANCELED (should set to cancelled)"  
echo "4 = SUBSCRIPTION_PURCHASED (should set to active)"
echo ""
echo "Available test tokens:"
echo "- mock_token_1753945443671"
echo "- mock_token_1756217736649"
echo "- mock_token_1757084026403"