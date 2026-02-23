# Cloudinary Setup Guide

The server now uses Cloudinary for image uploads instead of local file storage.

## Setup Instructions

### 1. Create a Cloudinary Account
- Go to [https://cloudinary.com/](https://cloudinary.com/)
- Sign up for a free account
- After signing in, go to your Dashboard

### 2. Get Your Credentials
From your Cloudinary Dashboard, you'll find:
- **Cloud Name**: Your unique cloud name
- **API Key**: Your API key
- **API Secret**: Your API secret (click "Reveal" to see it)

### 3. Update Environment Variables
Open `server/.env` and replace the placeholder values:

```env
CLOUDINARY_CLOUD_NAME=your_actual_cloud_name
CLOUDINARY_API_KEY=your_actual_api_key
CLOUDINARY_API_SECRET=your_actual_api_secret
```

### 4. Deploy to Production
When deploying to Render.com or any other hosting service:
1. Add the three Cloudinary environment variables in your hosting dashboard
2. Make sure to use the same values from your Cloudinary account

## Features

### Image Upload
- **Endpoint**: `POST /upload/image`
- **Max Size**: 5MB
- **Allowed Formats**: jpg, jpeg, png, gif, webp
- **Auto Resize**: Images larger than 1200x1200 are automatically resized
- **Storage**: All images are stored in the `kaltech-uploads` folder in Cloudinary

### Image Delete
- **Endpoint**: `DELETE /upload/:public_id`
- Deletes images from Cloudinary using their public_id

## Benefits of Cloudinary

1. **No Server Storage**: Images are stored in the cloud, not on your server
2. **CDN Delivery**: Fast image delivery worldwide
3. **Auto Optimization**: Images are automatically optimized for web
4. **Transformations**: Can resize, crop, and transform images on-the-fly
5. **Free Tier**: 25GB storage and 25GB bandwidth per month

## Migration Notes

- Old local uploads in `server/uploads/` are no longer served
- All new uploads will go to Cloudinary
- Image URLs will be Cloudinary URLs (e.g., `https://res.cloudinary.com/...`)
- No need to commit uploaded files to git anymore

## Testing

After setting up your credentials, test the upload:

```bash
curl -X POST http://localhost:8000/upload/image \
  -F "image=@/path/to/your/image.jpg"
```

You should receive a response with the Cloudinary URL:

```json
{
  "success": true,
  "url": "https://res.cloudinary.com/your-cloud/image/upload/v1234567890/kaltech-uploads/filename.jpg",
  "public_id": "kaltech-uploads/filename"
}
```
