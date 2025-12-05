#!/bin/bash
set -e

DIST_ID="E15VHL1OX2Q42R"
FUNCTION_ARN="arn:aws:cloudfront::288761729262:function/kakraba-dev-uri-rewrite"

echo "📥 Getting current CloudFront distribution config..."
aws cloudfront get-distribution-config --id $DIST_ID > /tmp/cf-config.json

# Extract ETag
ETAG=$(jq -r '.ETag' /tmp/cf-config.json)
echo "   ETag: $ETAG"

# Extract and modify the distribution config
jq '.DistributionConfig' /tmp/cf-config.json > /tmp/cf-dist-config.json

# Add function association to default cache behavior
echo "🔧 Adding function to default cache behavior..."
jq '.DefaultCacheBehavior.FunctionAssociations = {
  "Quantity": 1,
  "Items": [{
    "FunctionARN": "'$FUNCTION_ARN'",
    "EventType": "viewer-request"
  }]
}' /tmp/cf-dist-config.json > /tmp/cf-dist-config-updated.json

# Add function association to /creator/* behavior
echo "🔧 Adding function to /creator/* cache behavior..."
jq '.CacheBehaviors.Items[0].FunctionAssociations = {
  "Quantity": 1,
  "Items": [{
    "FunctionARN": "'$FUNCTION_ARN'",
    "EventType": "viewer-request"
  }]
}' /tmp/cf-dist-config-updated.json > /tmp/cf-dist-config-updated2.json

# Add function association to /fan/* behavior
echo "🔧 Adding function to /fan/* cache behavior..."
jq '.CacheBehaviors.Items[1].FunctionAssociations = {
  "Quantity": 1,
  "Items": [{
    "FunctionARN": "'$FUNCTION_ARN'",
    "EventType": "viewer-request"
  }]
}' /tmp/cf-dist-config-updated2.json > /tmp/cf-dist-config-final.json

# Update the distribution
echo "☁️  Updating CloudFront distribution..."
aws cloudfront update-distribution \
  --id $DIST_ID \
  --distribution-config file:///tmp/cf-dist-config-final.json \
  --if-match $ETAG \
  --query 'Distribution.Status' \
  --output text

echo "✅ CloudFront distribution updated!"
echo "⏳ Changes will propagate in 1-5 minutes..."

# Clean up
rm /tmp/cf-*.json

echo ""
echo "🧪 Test after propagation:"
echo "   curl -I https://kakraba.thekloudwiz.com/creator/"
