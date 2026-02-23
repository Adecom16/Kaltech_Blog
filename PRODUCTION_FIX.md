# Production Issues Fix

## Issue 1: CORS Error ❌

**Error**: 
```
Access-Control-Allow-Origin' header has a value 'https://kaltech-blog-2.onrender.com' 
that is not equal to the supplied origin 'https://kaltech-blog.vercel.app'
```

**Solution**:
Update the environment variable on your Render.com backend:

1. Go to Render.com dashboard
2. Select your backend service (`kaltech-blog`)
3. Go to "Environment" tab
4. Update `CLIENT_URL` to:
   ```
   CLIENT_URL=https://kaltech-blog.vercel.app
   ```
5. Save and redeploy

## Issue 2: Avatar Error ❌

**Error**:
```
Cannot read properties of null (reading 'avatar')
```

**Cause**: Some blog posts have null/missing author data

**Solution**: Run the seed script to populate proper blog posts with authors:

```bash
cd server
npm run reset-blogs
```

This will:
- Clear all existing blogs
- Create 20 new blogs with proper author data
- Each blog will have images and complete author information

## Alternative: Update Existing Posts

If you want to keep existing posts, you can update them to have a default author:

1. Create a default author in MongoDB
2. Update all posts without authors to use this default author

## Quick Fix Steps:

1. **Update CORS** (on Render.com):
   - Environment → CLIENT_URL → `https://kaltech-blog.vercel.app`
   - Save & Redeploy

2. **Fix Blog Data** (locally):
   ```bash
   cd server
   npm run reset-blogs
   ```

3. **Verify**:
   - Visit https://kaltech-blog.vercel.app
   - Check browser console for errors
   - Verify blogs load with images and authors

## Environment Variables Checklist

### Backend (Render.com)
- ✅ `MONGO_URI` - MongoDB Atlas connection string
- ✅ `CLIENT_URL` - `https://kaltech-blog.vercel.app`
- ✅ `JWT_SECRET` - Your JWT secret
- ✅ `JWT_REFRESH_SECRET` - Your refresh token secret
- ✅ `PORT` - 8000

### Frontend (Vercel)
- ✅ `VITE_API_URL` - `https://kaltech-blog.onrender.com`

## Testing After Fix

1. Open https://kaltech-blog.vercel.app
2. Check browser console (F12)
3. Verify:
   - No CORS errors
   - Blogs load with images
   - Authors display correctly
   - Socket.io connects successfully
