import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../.env') });

// MongoDB connection
const MONGODB_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/kaltech';

// Post schema
const postSchema = new mongoose.Schema({}, { strict: false });
const Post = mongoose.model('Post', postSchema);

async function fixImageUrls() {
  try {
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Find all posts with malformed image URLs
    const postsWithBrokenImages = await Post.find({
      image: { $regex: 'onrender.com' }
    });

    console.log(`\n📊 Found ${postsWithBrokenImages.length} posts with malformed image URLs\n`);

    if (postsWithBrokenImages.length === 0) {
      console.log('✨ No posts need fixing!');
      process.exit(0);
    }

    let fixedCount = 0;
    let replacedCount = 0;

    for (const post of postsWithBrokenImages) {
      const oldUrl = post.image;
      let newUrl = oldUrl;

      console.log(`\n📝 Processing post: ${post._id}`);
      console.log(`   Old URL: ${oldUrl}`);

      // Try to extract the Cloudinary URL
      if (oldUrl.includes('res.cloudinary.com')) {
        // Find the position of res.cloudinary.com
        const cloudinaryIndex = oldUrl.indexOf('res.cloudinary.com');
        
        // Check if there's https:// or https// before it
        let startIndex = oldUrl.lastIndexOf('https://', cloudinaryIndex);
        if (startIndex === -1) {
          startIndex = oldUrl.lastIndexOf('https//', cloudinaryIndex);
        }
        
        if (startIndex !== -1) {
          // Extract from https:// or https// onwards
          newUrl = oldUrl.substring(startIndex);
          // Fix missing colon if needed
          newUrl = newUrl.replace('https//', 'https://');
          
          console.log(`   ✅ Extracted Cloudinary URL`);
          fixedCount++;
        } else {
          // Can't extract, use placeholder
          newUrl = 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&h=600&fit=crop';
          console.log(`   ⚠️  Could not extract URL, using placeholder`);
          replacedCount++;
        }
      } else {
        // No Cloudinary URL found, use placeholder
        newUrl = 'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=800&h=600&fit=crop';
        console.log(`   ⚠️  No Cloudinary URL found, using placeholder`);
        replacedCount++;
      }

      console.log(`   New URL: ${newUrl}`);

      // Update the post
      await Post.updateOne(
        { _id: post._id },
        { $set: { image: newUrl } }
      );
    }

    console.log('\n' + '='.repeat(60));
    console.log('✨ Image URL Fix Complete!');
    console.log('='.repeat(60));
    console.log(`📊 Total posts processed: ${postsWithBrokenImages.length}`);
    console.log(`✅ URLs extracted and fixed: ${fixedCount}`);
    console.log(`🖼️  Replaced with placeholders: ${replacedCount}`);
    console.log('='.repeat(60) + '\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error fixing image URLs:', error);
    process.exit(1);
  }
}

fixImageUrls();
