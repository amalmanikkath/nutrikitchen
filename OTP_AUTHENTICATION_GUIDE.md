# OTP-Based Authentication Setup Guide

## Overview
The Nutri Kitchen application now supports OTP (One-Time Password) based verification for user registration via both **Email** and **Mobile SMS**. This ensures that only verified users can create accounts.

## Features
- **Two-Step Registration**: Users must verify their identifier (email or phone) with an OTP before completing registration
- **Multi-Channel Verification**: 
  - **Email**: 6-digit OTP sent via Gmail/SMTP
  - **Mobile**: 6-digit OTP sent via Twilio SMS
- **OTP Expiration**: OTPs expire after 10 minutes
- **Resend Functionality**: Users can request a new OTP if needed
- **Secure Storage**: OTPs are securely stored in the database with expiration timestamps

## Setup Instructions

### 1. Email Configuration (Gmail Example)
To enable OTP emails:
1. Update `.env` in the `server` directory:
   ```env
   EMAIL_USER=your_gmail@gmail.com
   EMAIL_PASS=your_app_specific_password
   ```

### 2. Mobile Configuration (Fast2SMS)
To enable mobile OTP via Fast2SMS (Indian Provider):
1. Sign up at [Fast2SMS](https://www.fast2sms.com/) and get your API Key.
2. Update `.env` in the `server` directory:
   ```env
   FAST2SMS_API_KEY=your_fast2sms_api_key
   ```

### 3. Database Schema
Updated models:

**User Model**:
- Added `phone` field (optional, unique)
- `isVerified` field (boolean, defaults to false)

**Otp Model**:
- `email`: Optional email address
- `phone`: Optional phone number
- `otp`: 6-digit verification code
- `expiresAt`: Expiration timestamp

## User Flow

### Registration Process:
1. User enters **Name**, **Email**, **Phone**, and **Password**
2. User clicks "**Send OTP**"
3. System sends OTP to BOTH email and phone (if provided)
4. User enters OTP in the verification step
5. User clicks "**Verify & Sign Up**"
6. Account created if valid

## API Endpoints

### POST `/api/auth/send-otp`
**Request Body**:
```json
{
  "email": "user@example.com",
  "phone": "+919876543210",
  "name": "John Doe"
}
```

### POST `/api/auth/verify-otp`
**Request Body**:
```json
{
  "email": "user@example.com",
  "phone": "+919876543210",
  "name": "John Doe",
  "password": "securePassword123",
  "otp": "123456"
}
```

### POST `/api/auth/resend-otp`
Same body as `send-otp`.

## Files Modified
- `server/prisma/schema.prisma` - Updated Otp and User models
- `server/routes/auth.js` - Integrated Twilio and updated OTP logic
- `signup.html` - Added phone number field and updated UI
- `js/auth.js` - Updated frontend logic to handle phone number
- `server/package.json` - Added `twilio` dependency
