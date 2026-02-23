# Production CORS and Image Upload Fix

## Issues Found

### 1. CORS Error
**Problem**: Your Vercel deployment has a typo in the URL
- Expected: `https://kaltech-blog.vercel.app`
- Actual: `https://kaltech-blogg.vercel.app` (double 'g')

The server was configured for the single 'g' version, causing CORS blocks.

### 2. Malformed Cloudinary URL
**Problem**: Image URLs were missing the colon after `https`
- Wrong: `https//res.cloudinary.com/...`
- Correct: `https://res.cloudinary.com/...`

## Fixes Applied

### 1. Updated SERVER CORS Configuration

**File**: `server/src/app.ts`

Now supports multiple origins:
```typescript
const allowedOrigins = env.CLIENT_URL.split(',').map(url => url.trim());
app.use(cors({
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));
```

### 2. Updated Socket.IO CORS

Now accepts both URLs:
```typescript
const io = new Server(server, {
  cors: {
    origin: env.CLIENT_URL.split(',').map(url => url.trim()),
    credentials: true
  },
});
```

### 3. Updated Environment Variable

**File**: `server/.env`
```env
CLIENT_URL=https://kaltech-blog.vercel.app,https://kaltech-blogg.vercel.app
```

## Deployment Steps

### 1. Update Render.com Environment Variables

Go to your Render.com dashboard → Backend service → Environment:

Update `CLIENT_URL` to:
```
https://kaltech-blog.vercel.app,https://kaltech-blogg.vercel.app
```

Or better yet, fix the Vercel URL typo and use only:
```
https://kaltech-blog.vercel.app
```

### 2. Verify Cloudinary Credentials

Make sure these are set in Render.com:
- `CLOUDINARY_CLOUD_NAME` = `dpld5dpgu`
- `CLOUDINARY_API_KEY` = `223871791811558`
- `CLOUDINARY_API_SECRET` = `GSALt8HETw3rO0BfRVmJC2BCy1k`

### 3. Deploy Backend

Push your changes to trigger a Render.com deployment, or manually redeploy.

### 4. Test Image Upload

1. Go to your production site
2. Click "Write"
3. Upload an image
4. Verify the image URL starts with `https://res.cloudinary.com/`

## Recommended: Fix Vercel URL Typo

Instead of supporting both URLs, fix the typo:

1. Go to Vercel Dashboard
2. Project Settings → Domains
3. Remove `kaltech-blogg.vercel.app`
4. Keep only `kaltech-blog.vercel.app`
5. Update `CLIENT_URL` in Render.com to just:
   ```
   https://kaltech-blog.vercel.app
   ```

## Troubleshooting

### Still Getting CORS Errors?

1. **Clear browser cache** and hard refresh (Ctrl+Shift+R)
2. **Check Render.com logs** to see what origin is being received
3. **Verify environment variable** was updated in Render.com
4. **Restart the backend** service on Render.com

### Images Still Not Showing?

1. **Check Cloudinary Dashboard** - verify images are being uploaded
2. **Check browser console** - look for the actual image URL
3. **Test upload endpoint** directly:
   ```bash
   curl -X POST https://kaltech-blog.onrender.com/upload/image \
     -H "Authorization: Bearer YOUR_TOKEN" \
     -F "image=@/path/to/image.jpg"
   ```

### Socket.IO Connection Failing?

This is normal if you're not using real-time features. The app will still work without Socket.IO for basic functionality.

## Success Indicators

✅ No CORS errors in browser console
✅ Images upload successfully
✅ Image URLs start with `https://res.cloudinary.com/`
✅ Images display correctly on posts
✅ Socket.IO connects (optional)
