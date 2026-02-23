# Environment Setup Guide

## Issue Fixed
The app was making infinite API calls and couldn't connect to the backend.

## Changes Made

### 1. React Query Configuration
Added these settings to prevent infinite re-fetches:
- `refetchOnWindowFocus: false` - Don't refetch when window regains focus
- `refetchOnMount: false` - Don't refetch on component mount
- `staleTime: 5 * 60 * 1000` - Cache data for 5 minutes

### 2. Environment Files

**Development** (`client/.env`):
```env
VITE_API_URL=http://localhost:8000
```

**Production** (`client/.env.production`):
```env
VITE_API_URL=https://kaltech-blog.onrender.com
```

## Running Locally

1. **Start the backend**:
```bash
cd server
npm run dev
```
Server runs on: http://localhost:8000

2. **Start the frontend**:
```bash
cd client
npm run dev
```
Client runs on: http://localhost:3000

3. **Access the app**:
Open http://localhost:3000 in your browser

## Building for Production

```bash
cd client
npm run build
```

This will use `.env.production` automatically.

## Deploying to Vercel

When you push to Vercel, make sure these environment variables are set:

1. Go to Vercel Dashboard → Your Project → Settings → Environment Variables
2. Add:
   - `VITE_API_URL` = `https://kaltech-blog.onrender.com`
   - `VITE_GOOGLE_OAUTH_REDIRECT_URL` = `https://kaltech-blog.onrender.com/auth/google/oauth`
   - `VITE_GOOGLE_CLIENT_ID` = `462946492256-dtug9keqn10b6m8bgkgdvhi2so8kqacr.apps.googleusercontent.com`

## Troubleshooting

### ERR_NAME_NOT_RESOLVED
- Check that backend is running on port 8000
- Verify `VITE_API_URL` in `.env` is correct
- Restart the frontend after changing `.env`

### Infinite API Calls
- Fixed by adding `refetchOnWindowFocus: false` and `staleTime`
- Clear browser cache if issue persists

### Images Not Loading
- Run the MongoDB query from `FIX_PRODUCTION_IMAGES.md`
- Or use the fallback images (already implemented)

### Empty Posts
- Run `npm run reset-blogs` in server directory
- This creates 20 sample posts with proper user references
