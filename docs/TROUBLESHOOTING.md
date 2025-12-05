# Troubleshooting Guide

Comprehensive troubleshooting guide for the Kakraba platform covering common issues and solutions for developers, creators, and fans.

## Table of Contents

- [Development & Deployment](#development--deployment)
- [Creator Portal Issues](#creator-portal-issues)
- [Fan Portal Issues](#fan-portal-issues)
- [Infrastructure Issues](#infrastructure-issues)
- [Configuration Issues](#configuration-issues)
- [Getting Help](#getting-help)

---

## Development & Deployment

### Terraform Issues

#### State Lock Error

**Problem:** `Error acquiring the state lock`

**Solutions:**
1. Check if another Terraform process is running
2. Kill any stale Terraform processes:
   ```bash
   ps aux | grep terraform
   kill -9 <process-id>
   ```
3. Remove lock file (use with caution):
   ```bash
   rm -f .terraform.tfstate.lock.info
   ```
4. Force unlock:
   ```bash
   terraform force-unlock <lock-id>
   ```

#### Terraform Plan Fails

**Problem:** Validation errors or plan failures

**Solutions:**
1. Verify all required variables are set
2. Check Terraform version compatibility:
   ```bash
   terraform version
   ```
3. Re-initialize Terraform:
   ```bash
   terraform init -upgrade
   ```
4. Validate configuration:
   ```bash
   terraform validate
   ```
5. Check AWS credentials:
   ```bash
   aws sts get-caller-identity
   ```

### Lambda Deployment Issues

#### Deployment Fails

**Problem:** `ResourceConflictException: Function is being updated`

**Solutions:**
1. Wait for previous update to complete:
   ```bash
   aws lambda wait function-updated \
     --function-name <function-name> \
     --region <region>
   ```
2. Check function status:
   ```bash
   aws lambda get-function \
     --function-name <function-name> \
     --region <region>
   ```
3. Retry deployment after waiting

#### Lambda Package Too Large

**Problem:** Deployment package exceeds size limit

**Solutions:**
1. Remove unnecessary dependencies
2. Use Lambda layers for common dependencies
3. Exclude dev dependencies:
   ```bash
   npm ci --production
   ```
4. Compress node_modules:
   ```bash
   zip -r lambda.zip . -x "*.git*" "*.test.*" "*.spec.*"
   ```

#### Lambda Function Timeout

**Problem:** Function times out during execution

**Solutions:**
1. Increase timeout in Terraform:
   ```hcl
   timeout = 30  # seconds
   ```
2. Optimize code for performance
3. Check external API response times
4. Review CloudWatch logs for bottlenecks
5. Consider async processing for long operations

### CloudFront Issues

#### Cache Not Updating

**Problem:** Old content still being served

**Solutions:**
1. Create cache invalidation:
   ```bash
   aws cloudfront create-invalidation \
     --distribution-id <distribution-id> \
     --paths "/*" \
     --region us-east-1
   ```
2. Wait for invalidation to complete (5-10 minutes)
3. Clear browser cache
4. Try incognito/private browsing mode
5. Check cache policy settings

#### 403 Forbidden Error

**Problem:** CloudFront returns 403 for content

**Solutions:**
1. Verify S3 bucket policy allows CloudFront OAI
2. Check CloudFront distribution is enabled
3. Verify signed URL signature (for private content)
4. Check URL expiration time
5. Verify file exists in S3:
   ```bash
   aws s3 ls s3://<bucket-name>/<key>
   ```

### API Gateway Issues

#### CORS Errors

**Problem:** `Access-Control-Allow-Origin` errors in browser

**Solutions:**
1. Verify CORS configuration in API Gateway
2. Check allowed origins include your domain
3. Ensure preflight OPTIONS requests are handled
4. Verify response headers include CORS headers
5. Check CloudFront response headers policy
6. Test with curl to isolate browser issues:
   ```bash
   curl -H "Origin: https://your-domain.com" \
     -H "Access-Control-Request-Method: POST" \
     -X OPTIONS https://api-endpoint.com
   ```

#### 401 Unauthorized

**Problem:** API requests return 401

**Solutions:**
1. Verify JWT token is being sent:
   ```javascript
   headers: { Authorization: `Bearer ${token}` }
   ```
2. Check token hasn't expired
3. Verify Cognito authorizer configuration
4. Test token validity:
   ```bash
   aws cognito-idp get-user \
     --access-token <token> \
     --region <region>
   ```
5. Refresh token if expired

### Build Issues

#### Frontend Build Fails

**Problem:** Vite build errors

**Solutions:**
1. Clear node_modules and reinstall:
   ```bash
   rm -rf node_modules package-lock.json
   npm install
   ```
2. Check Node.js version (need 20.x):
   ```bash
   node --version
   ```
3. Clear Vite cache:
   ```bash
   rm -rf node_modules/.vite
   ```
4. Check for TypeScript errors:
   ```bash
   npm run type-check
   ```
5. Review build logs for specific errors

#### Backend Build Fails

**Problem:** TypeScript compilation errors

**Solutions:**
1. Check TypeScript version compatibility
2. Verify tsconfig.json is correct
3. Clear build directory:
   ```bash
   rm -rf dist/
   ```
4. Run type checking:
   ```bash
   npm run type-check
   ```
5. Check for missing type definitions:
   ```bash
   npm install --save-dev @types/<package>
   ```

---

## Creator Portal Issues

### Upload Issues

#### Upload Fails

**Problem:** Content upload doesn't complete

**Solutions:**
1. **Check file size limits:**
   - Video: Max 5GB
   - Audio: Max 500MB
   - PDF: Max 100MB
   - Images: Max 50MB

2. **Verify file format:**
   - Video: MP4, MOV, AVI
   - Audio: MP3, WAV, FLAC
   - PDF: PDF only
   - Images: JPG, PNG, GIF

3. **Check internet connection:**
   - Test speed: Need 5+ Mbps upload
   - Use wired connection if possible

4. **Try different browser:**
   - Chrome, Firefox, or Safari
   - Disable browser extensions

5. **Clear browser cache:**
   ```
   Chrome: Settings > Privacy > Clear browsing data
   Firefox: Settings > Privacy > Clear Data
   Safari: Develop > Empty Caches
   ```

#### Slow Upload

**Problem:** Upload takes too long

**Solutions:**
1. Check internet upload speed
2. Upload during off-peak hours
3. Compress large files before uploading
4. Use wired connection instead of WiFi
5. Close other bandwidth-heavy applications
6. Try uploading smaller batches

#### Upload Progress Stuck

**Problem:** Progress bar stops moving

**Solutions:**
1. Don't close or refresh the page
2. Wait 5-10 minutes (large files take time)
3. Check browser console for errors (F12)
4. If truly stuck, cancel and retry
5. Try different browser

### Product Issues

#### Product Not Visible to Fans

**Problem:** Fans can't see published product

**Solutions:**
1. **Check product status:**
   - Ensure "Active" toggle is ON
   - Verify product is published, not draft

2. **Verify content is published:**
   - All included content must be published
   - Check content status in library

3. **Ensure price is set:**
   - Product must have valid price
   - Price must be between $0.99 and $999.99

4. **Check product has description:**
   - Title and description are required
   - Add compelling description

5. **Wait for indexing:**
   - New products may take 1-2 minutes to appear
   - Refresh discovery page

#### Can't Edit Product

**Problem:** Edit button not working or changes not saving

**Solutions:**
1. Refresh the page
2. Verify you're the product owner
3. Check for browser console errors (F12)
4. Clear browser cache
5. Try different browser
6. Ensure all required fields are filled
7. Check internet connection

#### Product Sales Not Showing

**Problem:** Sales made but not reflected in analytics

**Solutions:**
1. Check date range in analytics
2. Wait 5-10 minutes for data to update
3. Verify transactions in Stripe dashboard
4. Refresh analytics page
5. Check if sales are in different time period
6. Contact support with transaction IDs

### Payment Issues

#### Payout Delayed

**Problem:** Expected payment not received

**Solutions:**
1. **Check payout schedule:**
   - Payouts are weekly
   - Processed on Mondays
   - Takes 2-3 business days

2. **Verify minimum threshold:**
   - Must have at least $25 to payout
   - Check current balance

3. **Confirm bank details:**
   - Verify bank account is correct
   - Check for any verification issues

4. **Check Stripe account status:**
   - Login to Stripe dashboard
   - Verify account is active
   - Check for any holds or issues

5. **Review payout history:**
   - Check if payout is pending
   - Look for failed payout attempts

6. **Contact support:**
   - Provide account email
   - Include expected payout amount
   - Mention last successful payout date

#### Revenue Mismatch

**Problem:** Revenue doesn't match expectations

**Solutions:**
1. **Check date range:**
   - Ensure correct time period selected
   - Account for timezone differences

2. **Account for platform fees:**
   - Stripe fees: 2.9% + $0.30 per transaction
   - Platform fee: (if applicable)

3. **Verify all transactions:**
   - Export transaction data
   - Compare with Stripe dashboard
   - Check for refunds or chargebacks

4. **Review analytics filters:**
   - Ensure no filters are applied
   - Check all product types included

5. **Export data for review:**
   - Download CSV from analytics
   - Reconcile with bank statements

### Account Issues

#### Can't Login

**Problem:** Login fails with correct credentials

**Solutions:**
1. **Verify email address:**
   - Check for typos
   - Ensure correct email used for registration

2. **Reset password:**
   - Click "Forgot Password"
   - Check email for reset link
   - Create new strong password

3. **Check email verification:**
   - Verify email must be confirmed
   - Check spam folder for verification email
   - Request new verification email

4. **Clear browser cookies:**
   - Clear site data for kakraba.thekloudwiz.com
   - Try incognito/private mode

5. **Try different browser:**
   - Test in Chrome, Firefox, or Safari
   - Disable browser extensions

6. **Check account status:**
   - Account may be locked after failed attempts
   - Wait 30 minutes and try again
   - Contact support if still locked

#### Profile Not Updating

**Problem:** Profile changes don't save

**Solutions:**
1. Check all required fields are filled
2. Verify image file size (max 5MB)
3. Ensure image format is JPG or PNG
4. Check internet connection
5. Look for error messages on page
6. Try uploading different image
7. Clear browser cache and retry
8. Try different browser

---

## Fan Portal Issues

### Purchase Issues

#### Payment Declined

**Problem:** Card payment fails at checkout

**Solutions:**
1. **Verify card details:**
   - Check card number is correct
   - Verify expiration date
   - Confirm CVV code
   - Ensure billing address matches

2. **Check sufficient funds:**
   - Verify account balance
   - Check credit limit

3. **Contact your bank:**
   - Bank may be blocking transaction
   - Verify card is enabled for online purchases
   - Check for fraud alerts

4. **Try different card:**
   - Use alternative payment method
   - Try debit card instead of credit

5. **Check billing address:**
   - Must match card billing address
   - Include apartment/unit number if applicable

6. **Disable VPN:**
   - VPN may trigger fraud detection
   - Try without VPN

#### Purchase Not in Library

**Problem:** Completed purchase not showing in library

**Solutions:**
1. **Refresh library page:**
   - Hard refresh: Ctrl+F5 (Windows) or Cmd+Shift+R (Mac)

2. **Check email confirmation:**
   - Verify purchase confirmation email received
   - Check spam folder

3. **Verify payment completed:**
   - Check bank statement or card activity
   - Look for charge from Kakraba/Stripe

4. **Wait and retry:**
   - Wait 5 minutes for processing
   - Refresh library again

5. **Check correct account:**
   - Ensure logged into correct account
   - Verify email address

6. **Contact support:**
   - Provide order confirmation number
   - Include transaction ID from email
   - Attach payment receipt

#### Charged Twice

**Problem:** Double billing for same purchase

**Solutions:**
1. **Check bank statement carefully:**
   - One charge may be pending authorization
   - Only completed charges are actual

2. **Verify only one purchase made:**
   - Check purchase history
   - Look for duplicate orders

3. **Check for pending vs completed:**
   - Pending charges drop off in 3-5 days
   - Only completed charges are final

4. **Review subscription renewals:**
   - Check if subscription renewed
   - Verify renewal date

5. **Contact support immediately:**
   - Provide both transaction IDs
   - Include bank statement screenshot
   - Request refund if truly duplicate

### Streaming Issues

#### Video Won't Play

**Problem:** Video doesn't load or play

**Solutions:**
1. **Check internet connection:**
   - Need at least 5 Mbps for HD streaming
   - Test speed at speedtest.net

2. **Refresh the page:**
   - Hard refresh: Ctrl+F5 or Cmd+Shift+R

3. **Try different browser:**
   - Test in Chrome, Firefox, or Safari
   - Update browser to latest version

4. **Clear browser cache:**
   - Clear cached images and files
   - Restart browser

5. **Disable browser extensions:**
   - Ad blockers may interfere
   - Try incognito/private mode

6. **Check content availability:**
   - Verify you still have access
   - Check if content was removed

7. **Update browser:**
   - Ensure latest version installed
   - Update video codecs

#### Buffering/Lag

**Problem:** Video keeps buffering or stuttering

**Solutions:**
1. **Check internet speed:**
   - Need 5+ Mbps for HD
   - Need 25+ Mbps for 4K
   - Test at speedtest.net

2. **Lower video quality:**
   - Click quality settings in player
   - Select lower resolution (720p or 480p)

3. **Pause and let buffer:**
   - Pause video for 30-60 seconds
   - Let it buffer ahead

4. **Close other tabs/apps:**
   - Close bandwidth-heavy applications
   - Stop other downloads/uploads

5. **Use wired connection:**
   - Connect via Ethernet instead of WiFi
   - Move closer to WiFi router

6. **Try different time:**
   - Internet may be congested
   - Try during off-peak hours

7. **Restart router:**
   - Unplug for 30 seconds
   - Plug back in and wait to reconnect

#### Audio Out of Sync

**Problem:** Audio doesn't match video

**Solutions:**
1. Refresh the page
2. Try different browser
3. Clear browser cache
4. Check browser is updated
5. Try different video quality
6. Report issue to support with:
   - Content name
   - Browser and version
   - When issue started

### Download Issues

#### Download Fails

**Problem:** Download doesn't complete

**Solutions:**
1. **Check internet connection:**
   - Ensure stable connection
   - Use wired connection if possible

2. **Verify download quota:**
   - Check remaining downloads
   - Some content has limits

3. **Check storage space:**
   - Ensure enough space on device
   - Free up space if needed

4. **Try different browser:**
   - Some browsers handle large files better
   - Try Chrome or Firefox

5. **Disable download managers:**
   - Browser extensions may interfere
   - Disable and retry

6. **Download in smaller chunks:**
   - If available, download individual files
   - Rather than entire bundle at once

#### Can't Find Downloaded File

**Problem:** Downloaded file is missing

**Solutions:**
1. **Check Downloads folder:**
   - Default location for most browsers
   - Windows: C:\Users\[Username]\Downloads
   - Mac: /Users/[Username]/Downloads

2. **Check browser download history:**
   - Chrome: Ctrl+J or Cmd+J
   - Firefox: Ctrl+Shift+Y or Cmd+Shift+Y
   - Shows download location

3. **Search computer:**
   - Search for filename
   - Check recent files

4. **Check browser settings:**
   - Verify download location setting
   - May be set to custom folder

5. **Re-download if needed:**
   - Check download quota
   - Download again to known location

#### Download Quota Exhausted

**Problem:** No downloads remaining

**Solutions:**
1. **Stream content instead:**
   - Streaming is unlimited
   - Doesn't count against quota

2. **Check quota details:**
   - View remaining downloads in library
   - See when quota resets (if applicable)

3. **Contact creator:**
   - Some creators may grant additional downloads
   - Explain your situation

4. **Purchase again:**
   - If you need more downloads
   - Consider subscription for unlimited

5. **Subscribe for unlimited:**
   - Many subscriptions include unlimited downloads
   - Check creator's subscription options

### Subscription Issues

#### Can't Cancel Subscription

**Problem:** Cancel button not working

**Solutions:**
1. **Refresh the page:**
   - Hard refresh: Ctrl+F5 or Cmd+Shift+R

2. **Try different browser:**
   - Test in Chrome, Firefox, or Safari

3. **Clear browser cache:**
   - Clear site data
   - Restart browser

4. **Check subscription status:**
   - May already be canceled
   - Check for "Canceled" status

5. **Contact support:**
   - Request manual cancellation
   - Provide subscription ID
   - Include creator name

#### Lost Access After Canceling

**Problem:** Access removed immediately after cancellation

**Solutions:**
1. **Check cancellation date:**
   - Access should remain until period ends
   - Verify current billing period end date

2. **Verify billing period ended:**
   - Check subscription details
   - Look at "Access Until" date

3. **Check subscription status:**
   - Should show "Canceled" not "Expired"
   - Verify in subscription management

4. **Contact support if access should remain:**
   - Provide subscription ID
   - Include cancellation date
   - Show proof of payment for current period

5. **Resubscribe if needed:**
   - Can reactivate immediately
   - Visit creator profile

#### Subscription Renewal Failed

**Problem:** Payment failed for subscription renewal

**Solutions:**
1. **Update payment method:**
   - Go to Subscriptions
   - Click "Update Payment Method"
   - Enter new card details

2. **Ensure sufficient funds:**
   - Check account balance
   - Verify credit limit

3. **Check card expiration:**
   - Update if card expired
   - Add new card

4. **Contact your bank:**
   - Verify card is active
   - Check for fraud blocks

5. **Reactivate subscription:**
   - If canceled due to failed payment
   - Visit creator profile to resubscribe

### Account Issues

#### Can't Login

**Problem:** Login fails

**Solutions:**
1. **Verify email address:**
   - Check for typos
   - Use email from registration

2. **Reset password:**
   - Click "Forgot Password"
   - Check email for reset link
   - Check spam folder

3. **Check email verification:**
   - Email must be verified
   - Request new verification email

4. **Clear browser cookies:**
   - Clear site data
   - Try incognito mode

5. **Try different browser:**
   - Test in another browser
   - Disable extensions

#### Forgot Password

**Problem:** Can't remember password

**Solutions:**
1. Click "Forgot Password" on login page
2. Enter your email address
3. Check email for reset link (check spam)
4. Click link in email
5. Create new strong password
6. Login with new password

**If email doesn't arrive:**
- Check spam/junk folder
- Verify correct email address
- Wait 5-10 minutes
- Request again
- Contact support if still no email

#### Account Locked

**Problem:** Too many failed login attempts

**Solutions:**
1. **Wait 30 minutes:**
   - Account auto-unlocks after 30 min
   - Don't attempt more logins

2. **Reset password:**
   - Use "Forgot Password" link
   - Creates new password and unlocks

3. **Contact support:**
   - If still locked after 30 minutes
   - Provide account email
   - Verify identity

---

## Infrastructure Issues

### AWS Service Issues

#### DynamoDB Throttling

**Problem:** DynamoDB throttle errors

**Solutions:**
1. Check current capacity mode (on-demand vs provisioned)
2. Review access patterns for hot partitions
3. Implement exponential backoff in code
4. Consider batch operations
5. Review and optimize queries
6. Check CloudWatch metrics for patterns

#### S3 Access Denied

**Problem:** Can't access S3 objects

**Solutions:**
1. Verify bucket policy allows access
2. Check IAM role permissions
3. Verify CloudFront OAI configuration
4. Check object ACLs
5. Verify bucket region matches configuration
6. Test with AWS CLI:
   ```bash
   aws s3 ls s3://bucket-name/
   ```

#### Cognito Authentication Fails

**Problem:** User authentication not working

**Solutions:**
1. Verify user pool ID is correct
2. Check app client ID and secret
3. Verify user email is confirmed
4. Check user pool domain configuration
5. Review Cognito logs in CloudWatch
6. Test with AWS CLI:
   ```bash
   aws cognito-idp admin-get-user \
     --user-pool-id <pool-id> \
     --username <email>
   ```

### Monitoring Issues

#### Alarms Not Triggering

**Problem:** CloudWatch alarms not sending notifications

**Solutions:**
1. **Verify SNS subscription:**
   - Check email subscription is confirmed
   - Look for confirmation email

2. **Check alarm threshold:**
   - May be set too high
   - Review metric values

3. **Verify metrics are published:**
   - Check CloudWatch metrics exist
   - Ensure services are running

4. **Check alarm state:**
   ```bash
   aws cloudwatch describe-alarms \
     --alarm-names <alarm-name> \
     --region <region>
   ```

5. **Test SNS topic:**
   ```bash
   aws sns publish \
     --topic-arn <topic-arn> \
     --message "Test" \
     --region <region>
   ```

#### Dashboards Show No Data

**Problem:** CloudWatch dashboards are empty

**Solutions:**
1. Wait 5-10 minutes for metrics to populate
2. Verify services are running
3. Check correct region is selected
4. Verify resources exist
5. Check time range in dashboard
6. Trigger some activity to generate metrics

---

## Configuration Issues

### Environment Variables

#### Variables Not Loading

**Problem:** Environment variables not available in application

**Solutions:**
1. **Check file name:**
   - Must be `.env` not `.env.txt`
   - Check for hidden file

2. **Restart development server:**
   - Stop server (Ctrl+C)
   - Start again: `npm run dev`

3. **Verify file location:**
   - Must be in package root
   - Not in subdirectory

4. **Check variable prefix:**
   - Frontend: Must start with `VITE_`
   - Backend: No prefix required

5. **Verify syntax:**
   ```bash
   # Correct
   VITE_API_ENDPOINT=https://api.example.com
   
   # Wrong (no spaces around =)
   VITE_API_ENDPOINT = https://api.example.com
   ```

#### Wrong Environment Configuration

**Problem:** Using dev config in production

**Solutions:**
1. **Use correct .env file:**
   - `.env.development` for dev
   - `.env.production` for prod

2. **Set NODE_ENV correctly:**
   ```bash
   NODE_ENV=production npm run build
   ```

3. **Verify build command:**
   - Check package.json scripts
   - Ensure correct environment

4. **Check deployment scripts:**
   - Verify environment variables set
   - Review CI/CD configuration

#### Secrets Not Found

**Problem:** Can't access AWS Secrets Manager

**Solutions:**
1. **Verify IAM permissions:**
   - Check Lambda execution role
   - Ensure `secretsmanager:GetSecretValue` permission

2. **Check secret name/ARN:**
   - Verify exact secret name
   - Check for typos

3. **Verify AWS region:**
   - Secret must be in same region
   - Or specify region in code

4. **Check secret exists:**
   ```bash
   aws secretsmanager describe-secret \
     --secret-id <secret-name> \
     --region <region>
   ```

5. **Test access:**
   ```bash
   aws secretsmanager get-secret-value \
     --secret-id <secret-name> \
     --region <region>
   ```

---

## Getting Help

### Before Contacting Support

Gather this information:
1. **Account Details:**
   - Email address
   - User type (Creator/Fan)

2. **Issue Details:**
   - What you were trying to do
   - What happened instead
   - Error messages (exact text)
   - When issue started

3. **Environment:**
   - Browser and version
   - Operating system
   - Device type

4. **Steps to Reproduce:**
   - Numbered steps to recreate issue
   - Screenshots if applicable

5. **What You've Tried:**
   - Solutions already attempted
   - Results of each attempt

### Support Channels

#### For Creators
- **Email:** creator-support@kakraba.com
- **Response Time:** 24-48 hours
- **Priority Support:** Available for Pro creators

#### For Fans
- **Email:** fan-support@kakraba.com
- **Response Time:** 24-48 hours
- **Live Chat:** 9am-5pm EST (when available)

#### For Developers
- **GitHub Issues:** Technical issues and bugs
- **Documentation:** Check docs first
- **Community Forum:** Ask other developers

### Self-Help Resources

- **Documentation:** [docs/](../docs/)
- **FAQ:** Common questions answered
- **Video Tutorials:** Step-by-step guides
- **Community Forum:** Connect with others
- **Status Page:** Check service status

### Reporting Bugs

When reporting bugs, include:
1. **Bug Description:** Clear description of issue
2. **Expected Behavior:** What should happen
3. **Actual Behavior:** What actually happens
4. **Steps to Reproduce:** Numbered steps
5. **Environment:** Browser, OS, device
6. **Screenshots:** Visual evidence
7. **Console Logs:** Browser console errors (F12)
8. **Network Logs:** Network tab from browser

### Feature Requests

Submit feature requests with:
1. **Use Case:** Why is this needed?
2. **Proposed Solution:** How should it work?
3. **Alternatives:** Other approaches considered
4. **Priority:** How important is this?
5. **Additional Context:** Any other information

---

## Quick Reference

### Common Error Codes

| Code | Meaning | Common Cause |
|------|---------|--------------|
| 400 | Bad Request | Invalid input data |
| 401 | Unauthorized | Missing/invalid token |
| 403 | Forbidden | Insufficient permissions |
| 404 | Not Found | Resource doesn't exist |
| 409 | Conflict | Duplicate resource |
| 429 | Too Many Requests | Rate limit exceeded |
| 500 | Server Error | Backend issue |
| 502 | Bad Gateway | Service unavailable |
| 503 | Service Unavailable | Temporary outage |

### Diagnostic Commands

```bash
# Check AWS credentials
aws sts get-caller-identity

# Test API endpoint
curl -I https://api-kakraba.thekloudwiz.com

# Check Lambda function
aws lambda get-function --function-name <name>

# View CloudWatch logs
aws logs tail /aws/lambda/<function-name> --follow

# Check DynamoDB table
aws dynamodb describe-table --table-name <name>

# Test Cognito
aws cognito-idp list-users --user-pool-id <id>

# Check S3 bucket
aws s3 ls s3://<bucket-name>/

# CloudFront invalidation status
aws cloudfront get-invalidation \
  --distribution-id <id> \
  --id <invalidation-id>
```

### Browser Console

Access browser console for debugging:
- **Chrome:** F12 or Ctrl+Shift+I (Cmd+Option+I on Mac)
- **Firefox:** F12 or Ctrl+Shift+K (Cmd+Option+K on Mac)
- **Safari:** Cmd+Option+C (enable in Preferences > Advanced)

Look for:
- Red error messages
- Network failures (Network tab)
- Console warnings
- Failed API requests

---

**Need More Help?**

If you can't find a solution here:
1. Check the specific guide for your role (Creator/Fan/Developer)
2. Search the documentation
3. Contact support with detailed information
4. Join the community forum

**Documentation Links:**
- [Creator Portal Guide](./CREATOR_PORTAL_GUIDE.md)
- [Fan Portal Guide](./FAN_PORTAL_GUIDE.md)
- [Usage & Contributing](./USAGE_AND_CONTRIBUTING.md)
- [Environment Variables](./ENVIRONMENT_VARIABLES.md)
