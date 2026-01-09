# Fix Email Redirect to Vercel URL

The email redirect links are going to localhost instead of your Vercel deployment URL. Here's how to fix it:

## Solution: Configure Redirect URL in Supabase Dashboard

Supabase requires you to whitelist redirect URLs in your project settings. This is a security feature.

### Steps to Fix:

1. **Go to your Supabase Dashboard**
   - Visit https://supabase.com/dashboard
   - Select your project

2. **Navigate to Authentication Settings**
   - Go to **Authentication** → **URL Configuration**
   - Or go to **Settings** → **Authentication** → **URL Configuration**

3. **Add Your Vercel URL to Site URL**
   - Find the **Site URL** field
   - Enter your Vercel deployment URL (e.g., `https://room-finder-xxxxx.vercel.app`)
   - Click **Save**

4. **Add Redirect URLs**
   - Scroll down to **Redirect URLs** section
   - Click **Add URL**
   - Add your Vercel URL: `https://room-finder-xxxxx.vercel.app/*`
   - Also add: `https://room-finder-xxxxx.vercel.app/`
   - Click **Save**

5. **For Local Development (Optional)**
   - Add `http://localhost:3000/*` to Redirect URLs if you want to test locally

### Important Notes:

- **Site URL** is the default redirect URL used when no specific redirect is provided
- **Redirect URLs** are the whitelisted URLs that Supabase will accept for redirects
- The wildcard `/*` allows all paths under that domain
- After making changes, wait a few minutes for them to take effect

### Example Configuration:

**Site URL:**
```
https://room-finder-xxxxx.vercel.app
```

**Redirect URLs:**
```
https://room-finder-xxxxx.vercel.app/*
https://room-finder-xxxxx.vercel.app/
http://localhost:3000/*  (for local development)
```

### Verify It's Working:

1. After updating Supabase settings, wait 2-3 minutes
2. Try signing up/signing in again
3. Check the email link - it should now redirect to your Vercel URL

If you're still having issues, make sure:
- Your Vercel deployment is live and accessible
- The URL in Supabase matches exactly (including https://)
- You've waited a few minutes after saving the settings

