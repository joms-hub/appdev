# Password Management System - Testing Guide

## Overview
This document explains how to test the comprehensive password management system that includes both **Change Password** and **Forgot Password** functionality for credentials-based authentication.

## Features Implemented

### 1. Change Password (`/change-password`)
- **Authentication Required**: Users must be logged in
- **Current Password Verification**: Validates existing password using bcrypt
- **New Password Requirements**: Minimum 8 characters
- **Security Flow**: Logs out user after successful password change for security
- **OAuth Detection**: Prevents password changes for OAuth-only accounts

#### Files Created:
- `app/(nav)/change-password/page.tsx` - Server component with auth guard
- `app/(nav)/change-password/ChangePasswordClient.tsx` - Client component with form
- `app/api/auth/change-password/route.ts` - API endpoint for password changes

### 2. Forgot Password (`/forgot-password`)
- **Email-Based Reset**: Send reset instructions to user's email
- **Token Security**: Cryptographically secure reset tokens with 1-hour expiry
- **Anti-Enumeration**: Same response regardless of email existence (security)
- **OAuth Protection**: Only works for accounts with credentials authentication

#### Files Created:
- `app/forgot-password/page.tsx` - Forgot password form
- `app/api/auth/forgot-password/route.ts` - API to generate reset tokens
- `app/api/auth/verify-reset-token/route.ts` - API to validate tokens

### 3. Reset Password (`/reset-password`)
- **Token Validation**: Verifies reset token and expiry
- **New Password Form**: Secure password entry with validation
- **Auto-Redirect**: Redirects to login after successful reset

#### Files Created:
- `app/reset-password/page.tsx` - Password reset form

## Database Changes

Added to `User` model in `prisma/schema.prisma`:
```prisma
resetToken    String?
resetTokenExpiry DateTime?
```

## How to Test

### Testing Change Password:
1. Log in with credentials (email/password)
2. Go to `/profile` and click "Change Password"
3. Enter current password and new password
4. Verify logout and reauthentication required

### Testing Forgot Password:
1. Go to `/login` and click "Forgot your password?"
2. Enter email address of a credentials account
3. Check console logs for reset URL (in development)
4. Copy reset URL and open in browser
5. Enter new password and verify redirect to login

## Security Features

### Password Requirements:
- Minimum 8 characters
- Passwords are hashed with bcrypt (12 salt rounds)
- Current password verification for changes

### Token Security:
- 32-byte cryptographically secure random tokens
- 1-hour expiry time
- Tokens are cleared after use
- Invalid/expired tokens rejected

### Anti-Enumeration:
- Same response whether email exists or not
- Prevents attackers from discovering valid email addresses

### OAuth Protection:
- Detects OAuth-only accounts
- Prevents password operations on social login accounts

## Development Notes

### Email Integration (TODO):
Currently, reset links are logged to console. To integrate email:

1. **Install email service** (e.g., Resend, SendGrid, Nodemailer)
2. **Replace console.log** in `forgot-password/route.ts` with actual email sending
3. **Add email templates** for password reset instructions
4. **Configure environment variables** for email service

Example email integration:
```typescript
// Replace the console.log section with:
await sendEmail({
  to: email,
  subject: 'Password Reset Request',
  html: `
    <h2>Password Reset Request</h2>
    <p>Click the link below to reset your password:</p>
    <a href="${resetUrl}">Reset Password</a>
    <p>This link expires in 1 hour.</p>
  `
});
```

### Environment Variables:
Ensure these are set:
- `DATABASE_URL` - PostgreSQL connection string
- `NEXTAUTH_URL` - Base URL for reset links
- `NEXTAUTH_SECRET` - JWT signing secret

## User Experience Flow

### Change Password Flow:
1. User Profile → "Change Password"
2. Enter current + new password
3. Validation and security checks
4. Automatic logout for security
5. Redirect to login with new password

### Forgot Password Flow:
1. Login Page → "Forgot your password?"
2. Enter email address
3. Check email for reset link (console in dev)
4. Click reset link
5. Enter new password
6. Automatic redirect to login

## Error Handling

### Change Password Errors:
- Invalid current password
- New password too short
- OAuth-only account detection
- Network/server errors

### Forgot Password Errors:
- Invalid email format
- Invalid/expired reset tokens
- Network/server errors

### UI Features:
- Password visibility toggles
- Real-time validation feedback
- Loading states during API calls
- Clear error messages
- Success confirmations

## Testing Checklist

- [ ] Change password with valid current password
- [ ] Try change password with invalid current password
- [ ] Test password length validation
- [ ] Verify logout after password change
- [ ] Request password reset with valid email
- [ ] Request password reset with invalid email
- [ ] Test reset token validation
- [ ] Reset password with valid token
- [ ] Try reset with expired/invalid token
- [ ] Test OAuth account protection
- [ ] Verify UI responsiveness and error states

## Next Steps

1. **Integrate Email Service**: Replace console logging with actual email sending
2. **Email Templates**: Create branded password reset email templates
3. **Rate Limiting**: Add rate limiting to prevent abuse
4. **Audit Logging**: Log password change events for security
5. **Multi-Factor**: Consider adding 2FA for sensitive operations
