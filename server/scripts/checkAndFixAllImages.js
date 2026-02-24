const mongoose = require('mongoose');
require('dotenv').config({ path: require('path').join(__dirname, '../.env') });

const MONGODB_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/kaltech';

const postSchema = new mongoose.Schema({}, { strict: false });
const Post = mongoose.model('Post', postSchema);

async function checkAndFixAllImages() {
  try {
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    // Find ALL posts
    const allPosts = await Post.find({});
    console.log(`📊 Total posts in database: ${allPosts.length}\n`);

    let needsFixing = 0;
    const placeholderImages = [
      'https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1488590528505-98d2b5aba04b?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1484417894907-623942c8ee29?w=800&h=600&fit=crop',
    ];

    for (let i = 0; i < allPosts.length; i++) {
      const post = allPosts[i];
      const imageUrl = post.image || '';
      
      console.log(`\n📝 Post ${i + 1}/${allPosts.length}`);
      console.log(`   ID: ${post._id}`);
      console.log(`   Title: ${post.title?.substring(0, 50)}...`);
      console.log(`   Current Image: ${imageUrl}`);

      let needsUpdate = false;
      let newUrl = imageUrl;

      // Check if image needs fixing
      if (!imageUrl || imageUrl === '') {
        console.log('   ⚠️  No image URL');
        newUrl = placeholderImages[i % placeholderImages.length];
        needsUpdate = true;
      } else if (imageUrl.includes('/uploads/') || imageUrl.includes('localhost') || imageUrl.includes('onrender.com')) {
        console.log('   ❌ Broken URL detected');
        newUrl = placeholderImages[i % placeholderImages.length];
        needsUpdate = true;
      } else if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
        console.log('   ✅ Valid URL');
      } else {
        console.log('   ⚠️  Invalid URL format');
        newUrl = placeholderImages[i % placeholderImages.length];
        needsUpdate = true;
      }

      if (needsUpdate) {
        console.log(`   🔧 Updating to: ${newUrl}`);
        await Post.updateOne(
          { _id: post._id },
          { $set: { image: newUrl } }
        );
        needsFixing++;
      }
    }

    console.log('\n' + '='.repeat(60));
    console.log('✨ Image Check Complete!');
    console.log('='.repeat(60));
    console.log(`📊 Total posts: ${allPosts.length}`);
    console.log(`🔧 Posts fixed: ${needsFixing}`);
    console.log(`✅ Posts already OK: ${allPosts.length - needsFixing}`);
    console.log('='.repeat(60));

    await mongoose.disconnect();
    console.log('\n✅ Disconnected from MongoDB');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

checkAndFixAllImages();
