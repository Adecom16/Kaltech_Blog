# Deployment Checklist

## Issues Fixed ✅

1. ✅ CORS errors - Now supports both Vercel URLs
2. ✅ Socket.IO CORS - Updated to accept multiple origins
3. ✅ Image upload fallbacks - Shows placeholder if image fails
4. ✅ Infinite API calls - Added React Query caching
5. ✅ Cloudinary integration - Fully configured
6. ✅ Empty posts handling - Graceful error messages

## Deploy to Production

### Step 1: Update Render.com (Backend)

1. Go to [Render.com Dashboard](https://dashboard.render.com)
2. Select your backend service
3. Go to **Environment** tab
4. Update/Add these variables:

```env
CLIENT_URL=https://kaltech-blog.vercel.app,https://kaltech-blogg.vercel.app
CLOUDINARY_CLOUD_NAME=dpld5dpgu
CLOUDINARY_API_KEY=223871791811558
CLOUDINARY_API_SECRET=GSALt8HETw3rO0BfRVmJC2BCy1k
```

5. Click **Save Changes**
6. Manually trigger a redeploy or push your code

### Step 2: Build and Deploy Frontend

```bash
cd client
npm run build
```

Then push to your Git repository. Vercel will auto-deploy.

### Step 3: Fix Database (If Needed)

If you still see empty posts or broken images, run this in MongoDB Atlas Shell:

```javascript
// Fix localhost image URLs
db.posts.updateMany(
  { image: { $regex: "localhost" } },
  { $set: { image: "https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&h=600&fit=crop" } }
)

// Fix null/empty images
db.posts.updateMany(
  { $or: [{ image: null }, { image: "" }, { image: { $exists: false } }] },
  { $set: { image: "https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=800&h=600&fit=crop" } }
)
```

### Step 4: Verify Production

1. **Test Homepage**: https://kaltech-blogg.vercel.app
   - Should load without errors
   - Posts should display
   - Images should show (or fallback placeholders)

2. **Test Image Upload**:
   - Sign in
   - Click "Write"
   - Upload an image
   - Verify URL starts with `https://res.cloudinary.com/`

3. **Check Browser Console**:
   - No CORS errors
   - No infinite API calls
   - Socket.IO may show warnings (that's okay)

## Optional: Fix Vercel URL Typo

Your Vercel URL has a typo: `kaltech-blogg.vercel.app` (double 'g')

To fix:
1. Go to Vercel Dashboard → Your Project → Settings → Domains
2. Add the correct domain: `kaltech-blog.vercel.app` (single 'g')
3. Remove the typo domain
4. Update Render.com `CLIENT_URL` to just: `https://kaltech-blog.vercel.app`

## Files Changed

- ✅ `server/src/app.ts` - CORS configuration
- ✅ `server/.env` - CLIENT_URL updated
- ✅ `client/src/pages/Home.tsx` - React Query caching
- ✅ `client/src/components/Post.tsx` - Image fallback
- ✅ `client/src/components/StoryCard.tsx` - Image fallback
- ✅ `client/.env` - Local development URL
- ✅ `client/.env.production` - Production URL

## Post-Deployment Testing

### Test Checklist

- [ ] Homepage loads without errors
- [ ] Posts display correctly
- [ ] Images show (or fallback)
- [ ] Can sign in
- [ ] Can create new post
- [ ] Can upload image
- [ ] Image appears in post
- [ ] No CORS errors in console
- [ ] No infinite API calls

### If Issues Persist

1. **Clear browser cache** (Ctrl+Shift+R)
2. **Check Render.com logs** for backend errors
3. **Check Vercel logs** for frontend errors
4. **Verify environment variables** are set correctly
5. **Test API directly** with curl/Postman

## Support

If you encounter issues:
1. Check the browser console for errors
2. Check Render.com logs
3. Verify all environment variables are set
4. Make sure Cloudinary credentials are correct
5. Test the upload endpoint directly

## Success! 🎉

Once deployed, your KALTECH platform should:
- Load quickly with cached data
- Display images from Cloudinary
- Handle uploads smoothly
- Work across both Vercel URLs
- Show graceful error messages
