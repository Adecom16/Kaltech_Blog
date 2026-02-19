import axios from 'axios';
import * as fs from 'fs';
import * as path from 'path';

// Configuration
const API_URL = 'http://localhost:8000';
const NUM_ARTICLES = 100;

// Sample data for generating articles
const topics = [
  'Technology', 'Programming', 'Web Development', 'AI & Machine Learning',
  'Data Science', 'Cybersecurity', 'Mobile Development', 'DevOps',
  'Cloud Computing', 'Blockchain', 'IoT', 'Design', 'UX/UI',
  'Business', 'Entrepreneurship', 'Marketing', 'Finance', 'Health',
  'Science', 'Education', 'Travel', 'Food', 'Lifestyle', 'Sports'
];

const titles = [
  'Getting Started with {topic}',
  'Advanced {topic} Techniques',
  'The Future of {topic}',
  'Best Practices in {topic}',
  '10 Tips for {topic} Success',
  'Understanding {topic} Fundamentals',
  'How to Master {topic}',
  'Common Mistakes in {topic}',
  'The Complete Guide to {topic}',
  '{topic}: A Beginner\'s Journey',
  'Why {topic} Matters in 2026',
  'Building Better {topic} Solutions',
  'The Art of {topic}',
  '{topic} Trends to Watch',
  'Scaling {topic} for Growth'
];

const contentTemplates = [
  `<h1>Introduction</h1>
<p>In today's rapidly evolving digital landscape, understanding {topic} has become more crucial than ever. This comprehensive guide will walk you through everything you need to know.</p>

<h2>Why This Matters</h2>
<p>The importance of {topic} cannot be overstated. Industry leaders and experts agree that mastering these concepts is essential for success in the modern world.</p>

<p>Here are some key reasons why you should care:</p>
<ul>
<li>Increased efficiency and productivity</li>
<li>Better decision-making capabilities</li>
<li>Competitive advantage in the market</li>
<li>Future-proof your skills</li>
</ul>

<h2>Getting Started</h2>
<p>The journey begins with understanding the fundamentals. Let's break down the core concepts that form the foundation of {topic}.</p>

<p>First, you need to grasp the basic principles. These include understanding the terminology, recognizing patterns, and developing a systematic approach to problem-solving.</p>

<h2>Best Practices</h2>
<p>After years of experience and research, we've identified several best practices that consistently lead to success:</p>

<ol>
<li>Start with a solid foundation</li>
<li>Practice regularly and consistently</li>
<li>Learn from mistakes and iterate</li>
<li>Stay updated with latest trends</li>
<li>Build a strong community network</li>
</ol>

<h2>Common Pitfalls to Avoid</h2>
<p>Even experienced professionals make mistakes. Here are some common pitfalls you should be aware of and how to avoid them.</p>

<blockquote>
"Success is not final, failure is not fatal: it is the courage to continue that counts." - Winston Churchill
</blockquote>

<h2>Advanced Techniques</h2>
<p>Once you've mastered the basics, it's time to explore more advanced concepts. These techniques will help you take your skills to the next level.</p>

<p>Advanced practitioners often use sophisticated methods that require deeper understanding and more practice. Don't be discouraged if these seem challenging at first.</p>

<h2>Real-World Applications</h2>
<p>Theory is important, but practical application is where the real learning happens. Let's look at some real-world scenarios where these concepts come into play.</p>

<p>Companies across various industries are leveraging these principles to drive innovation and achieve remarkable results.</p>

<h2>Conclusion</h2>
<p>Mastering {topic} is a journey, not a destination. Keep learning, stay curious, and don't be afraid to experiment. The future belongs to those who are willing to adapt and grow.</p>

<p>Remember, every expert was once a beginner. Your dedication and persistence will determine your success.</p>`,

  `<h1>The Complete Guide</h1>
<p>Welcome to this comprehensive exploration of {topic}. Whether you're a complete beginner or looking to refine your expertise, this guide has something for everyone.</p>

<h2>Understanding the Basics</h2>
<p>Before diving into complex concepts, let's establish a strong foundation. Understanding the basics is crucial for long-term success.</p>

<p>The fundamentals include:</p>
<ul>
<li>Core principles and concepts</li>
<li>Essential terminology</li>
<li>Historical context and evolution</li>
<li>Current state of the field</li>
</ul>

<h2>Step-by-Step Approach</h2>
<p>Learning {topic} doesn't have to be overwhelming. Follow this structured approach to make steady progress:</p>

<ol>
<li>Assess your current knowledge level</li>
<li>Set clear, achievable goals</li>
<li>Create a learning schedule</li>
<li>Practice with real projects</li>
<li>Seek feedback and iterate</li>
</ol>

<h2>Tools and Resources</h2>
<p>Having the right tools can make a significant difference in your learning journey. Here are some essential resources to get you started.</p>

<p>From online courses to community forums, there's a wealth of information available. The key is knowing where to look and how to filter quality content.</p>

<h2>Expert Insights</h2>
<blockquote>
"The only way to do great work is to love what you do." - Steve Jobs
</blockquote>

<p>Industry experts emphasize the importance of passion and dedication. Success in {topic} requires both technical skills and genuine interest.</p>

<h2>Practical Examples</h2>
<p>Let's examine some practical examples that demonstrate these concepts in action. Real-world case studies provide valuable insights.</p>

<p>These examples show how theory translates into practice and the impact it can have on outcomes.</p>

<h2>Measuring Success</h2>
<p>How do you know if you're making progress? Establishing metrics and milestones is essential for tracking your development.</p>

<p>Consider both quantitative and qualitative measures to get a complete picture of your growth.</p>

<h2>Next Steps</h2>
<p>Now that you have a solid understanding, it's time to take action. Start small, build momentum, and gradually tackle more challenging projects.</p>

<p>The journey of a thousand miles begins with a single step. Take that step today.</p>`
];

// Sample image URLs (using placeholder images)
const imageUrls = [
  'https://picsum.photos/800/400?random=1',
  'https://picsum.photos/800/400?random=2',
  'https://picsum.photos/800/400?random=3',
  'https://picsum.photos/800/400?random=4',
  'https://picsum.photos/800/400?random=5',
  'https://picsum.photos/800/400?random=6',
  'https://picsum.photos/800/400?random=7',
  'https://picsum.photos/800/400?random=8',
  'https://picsum.photos/800/400?random=9',
  'https://picsum.photos/800/400?random=10'
];

// Helper functions
function getRandomElement<T>(array: T[]): T {
  return array[Math.floor(Math.random() * array.length)];
}

function generateTitle(): string {
  const topic = getRandomElement(topics);
  const template = getRandomElement(titles);
  return template.replace('{topic}', topic);
}

function generateContent(): string {
  const topic = getRandomElement(topics);
  const template = getRandomElement(contentTemplates);
  let content = template.replace(/{topic}/g, topic);
  
  // Insert random images into content
  const numImages = Math.floor(Math.random() * 3) + 1; // 1-3 images per article
  for (let i = 0; i < numImages; i++) {
    const imageUrl = getRandomElement(imageUrls);
    const imageHtml = `<p><img src="${imageUrl}" alt="Article image ${i + 1}"></p>`;
    
    // Insert image at random position in content
    const paragraphs = content.split('</p>');
    const insertPosition = Math.floor(Math.random() * (paragraphs.length - 2)) + 1;
    paragraphs.splice(insertPosition, 0, imageHtml);
    content = paragraphs.join('</p>');
  }
  
  return content;
}

function generateTags(): string {
  const numTags = Math.floor(Math.random() * 3) + 2; // 2-4 tags
  const selectedTopics: string[] = [];
  for (let i = 0; i < numTags; i++) {
    const topic = getRandomElement(topics);
    if (!selectedTopics.includes(topic)) {
      selectedTopics.push(topic);
    }
  }
  return selectedTopics.join(',');
}

async function registerUser(email: string, password: string, name: string) {
  try {
    const response = await axios.post(`${API_URL}/auth/register`, {
      email,
      password,
      name
    });
    return response.data;
  } catch (error: any) {
    if (error.response?.status === 400) {
      // User might already exist, try logging in
      const loginResponse = await axios.post(`${API_URL}/auth/login`, {
        email,
        password
      });
      return loginResponse.data;
    }
    throw error;
  }
}

async function createArticle(token: string, title: string, content: string, tags: string) {
  try {
    const params = new URLSearchParams();
    params.append('title', title);
    params.append('markdown', content);
    params.append('tags', tags);
    
    const response = await axios.post(`${API_URL}/post/write`, params, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    });
    return response.data;
  } catch (error: any) {
    console.error('Error creating article:', error.response?.data || error.message);
    throw error;
  }
}

async function main() {
  console.log('🚀 Starting article generation...\n');
  
  // Register/login test user
  console.log('📝 Setting up test user...');
  const testUser = {
    email: 'testauthor@example.com',
    password: 'TestPassword123!',
    name: 'Test Author'
  };
  
  let authData;
  try {
    authData = await registerUser(testUser.email, testUser.password, testUser.name);
    console.log('✅ User authenticated successfully\n');
  } catch (error: any) {
    console.error('❌ Failed to authenticate user:', error.message);
    return;
  }
  
  const token = authData.access_token || authData.token;
  
  if (!token) {
    console.error('❌ No token received from authentication');
    return;
  }
  
  // Generate articles
  console.log(`📚 Generating ${NUM_ARTICLES} articles...\n`);
  
  let successCount = 0;
  let failCount = 0;
  
  for (let i = 1; i <= NUM_ARTICLES; i++) {
    try {
      const title = generateTitle();
      const content = generateContent();
      const tags = generateTags();
      
      await createArticle(token, title, content, tags);
      successCount++;
      
      console.log(`✅ [${i}/${NUM_ARTICLES}] Created: "${title}"`);
      
      // Add small delay to avoid overwhelming the server
      await new Promise(resolve => setTimeout(resolve, 100));
      
    } catch (error: any) {
      failCount++;
      console.error(`❌ [${i}/${NUM_ARTICLES}] Failed to create article:`, error.message);
    }
  }
  
  console.log('\n' + '='.repeat(50));
  console.log('📊 Summary:');
  console.log(`✅ Successfully created: ${successCount} articles`);
  console.log(`❌ Failed: ${failCount} articles`);
  console.log('='.repeat(50));
  console.log('\n🎉 Article generation complete!');
}

// Run the script
main().catch(error => {
  console.error('💥 Fatal error:', error);
  process.exit(1);
});
