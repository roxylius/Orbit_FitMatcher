# Auth Testing Guide

## Current Configuration
- **Backend URL**: `https://3d8cf71f0b79.ngrok-free.app` (from `.env`)
- **API Base**: `https://3d8cf71f0b79.ngrok-free.app/api`

## How to Test

### 1. Check Console Logs
Open browser DevTools (F12) → Console tab and look for:

**During Signup:**
```
[Auth] Attempting signup for: user@example.com
[Auth] Signup response: { status: 200, data: {...} }
[Auth] User signed up: user@example.com
```

**During Login:**
```
[Auth] Attempting login for: user@example.com
[Auth] Login response: { status: 200, data: {...} }
[Auth] User logged in: user@example.com
```

### 2. Test Signup Flow
1. Navigate to `/signup`
2. Fill in form:
   - Name: Test User
   - Email: test@example.com
   - Password: password123 (min 6 chars)
   - Confirm Password: password123
3. Click "Sign Up"
4. Check console for API call logs
5. Should redirect to `/search` on success

### 3. Test Login Flow
1. Navigate to `/login`
2. Enter credentials from signup
3. Click "Sign In"
4. Check console for API call logs
5. Should redirect to `/search` on success
6. Should see user name/email in sidebar

### 4. Test Logout
1. Click logout button in sidebar
2. Should redirect to `/login`
3. Should clear user session

### 5. Test Password Reset
1. Navigate to `/forgot-password`
2. Enter email address
3. Check email for 6-digit OTP
4. Navigate to `/reset-password`
5. Enter OTP + new password
6. Should redirect to `/login` with success message

## Network Tab Inspection

### Check Request Headers:
```
Content-Type: application/json
Cookie: connect.sid=... (should be present after login/signup)
```

### Check Request Body (Signup):
```json
{
  "email": "test@example.com",
  "password": "password123",
  "name": "Test User"
}
```

### Check Response (Signup Success):
```json
{
  "message": "User Authenticated!",
  "userObj": {
    "_id": "507f1f77bcf86cd799439011",
    "email": "test@example.com",
    "name": "Test User",
    "provider": "local"
  }
}
```

### Check Response (Login Success):
```json
{
  "message": "Login successful.",
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "email": "test@example.com",
    "name": "Test User",
    "role": "student"
  }
}
```

## Common Errors & Solutions

### Error: "Network request failed"
- **Cause**: Backend not running or wrong URL in `.env`
- **Solution**: Check backend is running at ngrok URL

### Error: "CORS error"
- **Cause**: Backend CORS not configured for frontend origin
- **Solution**: Add frontend origin to backend CORS config

### Error: "Invalid email or password"
- **Cause**: Wrong credentials or user doesn't exist
- **Solution**: Check database or try signing up first

### Error: "The email already exists"
- **Cause**: User already registered with that email
- **Solution**: Use different email or try logging in

### No console logs appearing
- **Cause**: Console filtering or logs disabled
- **Solution**: Clear console filters, refresh page

## Backend Requirements

Your backend must have these endpoints running:
- `POST /api/auth/signup`
- `POST /api/auth/login`
- `DELETE /api/auth/logout`
- `POST /api/auth/forgot-password`
- `POST /api/auth/reset-password`

Session configuration:
- Cookie name: `connect.sid`
- HttpOnly: true
- SameSite: 'lax' or 'none' (for ngrok)
- Secure: false (dev) or true (production)

## Environment Variables

Update `.env` for different environments:

**Local Development:**
```env
VITE_SERVER_URL=http://localhost:3000
```

**Ngrok (Current):**
```env
VITE_SERVER_URL=https://3d8cf71f0b79.ngrok-free.app
```

**Production:**
```env
VITE_SERVER_URL=https://api.yourdomain.com
```

After changing `.env`, restart Vite dev server:
```bash
npm run dev
```
