'use client';

import { useState } from 'react';
import Link from 'next/link';
import { MessageSquare, User, Clock, PlusCircle, Leaf } from 'lucide-react';

// Mock Data - In a real app, this would come from your backend API
const initialPosts = [
  {
    id: 1,
    title: 'Question about Tomato Leaf Blight',
    author: 'Sunita Sharma',
    date: 'September 18, 2025',
    replies: 3,
    content: 'I noticed some yellow spots with dark borders on my tomato plants. The diagnosis tool suggested it might be early blight. Can anyone share their experience with organic treatments for this? Looking for advice on neem oil concentration.'
  },
  {
    id: 2,
    title: 'Best fertilizer for Potato crop in sandy soil?',
    author: 'Rajesh Kumar',
    date: 'September 17, 2025',
    replies: 5,
    content: 'My farm has predominantly sandy soil. I\'m planning to plant potatoes next month. What NPK ratio for fertilizer works best in these conditions to get a good yield? Any specific brand recommendations are also welcome.'
  },
  {
    id: 3,
    title: 'Success Story: Overcame Powdery Mildew on my Mango Trees!',
    author: 'Anita Desai',
    date: 'September 16, 2025',
    replies: 8,
    content: 'Just wanted to share a success story! My mango orchard was affected by powdery mildew. Following the advice from the CDEWS app and some fellow farmers, I used a sulfur-based fungicide and proper pruning. My trees are healthy again! Thanks to this community.'
  }
];

export default function ForumPage() {
  const [posts, setPosts] = useState(initialPosts);
  const [newPostTitle, setNewPostTitle] = useState('');
  const [newPostContent, setNewPostContent] = useState('');
  const [isCreatingPost, setIsCreatingPost] = useState(false);

  const handleCreatePost = (e) => {
    e.preventDefault();
    if (!newPostTitle.trim() || !newPostContent.trim()) return;

    const newPost = {
      id: posts.length + 1,
      title: newPostTitle,
      author: 'Current User', // In a real app, get this from user session
      date: new Date().toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      }),
      replies: 0,
      content: newPostContent,
    };

    setPosts([newPost, ...posts]);
    setNewPostTitle('');
    setNewPostContent('');
    setIsCreatingPost(false);
  };

  return (
    <div className="bg-gradient-to-br from-gray-50 via-white to-emerald-50 min-h-screen">
      {/* Header */}
      <header className="w-full bg-white/95 backdrop-blur-md sticky top-0 z-50 shadow-lg border-b border-gray-200">
        <nav className="container mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            <Link href="/" className="flex items-center space-x-3 cursor-pointer group">
              <div className="p-2 bg-gradient-to-r from-emerald-500 to-green-600 rounded-lg group-hover:scale-110 transition-transform duration-300">
                <Leaf className="w-8 h-8 text-white" />
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-emerald-600 to-green-600 bg-clip-text text-transparent">
                CDEWS Forum
              </span>
            </Link>
            <Link href="/" className="px-6 py-3 text-white bg-gradient-to-r from-emerald-600 to-green-600 rounded-full hover:from-emerald-700 hover:to-green-700 transition-all duration-300 font-semibold shadow-lg hover:shadow-xl transform hover:scale-105">
              Back to Home
            </Link>
          </div>
        </nav>
      </header>

      <main className="container mx-auto px-6 py-12">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800">Community Discussions</h1>
          <button
            onClick={() => setIsCreatingPost(!isCreatingPost)}
            className="flex items-center gap-2 px-6 py-3 text-white bg-gradient-to-r from-emerald-600 to-green-600 rounded-full hover:from-emerald-700 hover:to-green-700 transition-all duration-300 font-semibold shadow-lg hover:shadow-xl transform hover:scale-105"
          >
            <PlusCircle size={20} />
            {isCreatingPost ? 'Cancel' : 'Create New Post'}
          </button>
        </div>

        {isCreatingPost && (
          <div className="bg-white p-8 rounded-2xl shadow-xl border border-gray-100 mb-12">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Start a New Discussion</h2>
            <form onSubmit={handleCreatePost} className="space-y-4">
              <input
                type="text"
                placeholder="Enter a descriptive title..."
                value={newPostTitle}
                onChange={(e) => setNewPostTitle(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                required
              />
              <textarea
                placeholder="Share your thoughts, questions, or success story..."
                value={newPostContent}
                onChange={(e) => setNewPostContent(e.target.value)}
                rows="5"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all resize-none"
                required
              ></textarea>
              <div className="flex justify-end">
                <button
                  type="submit"
                  className="px-8 py-3 bg-gradient-to-r from-emerald-600 to-green-600 text-white font-bold rounded-lg hover:from-emerald-700 hover:to-green-700 transform hover:scale-105 transition-all duration-300"
                >
                  Post Discussion
                </button>
              </div>
            </form>
          </div>
        )}

        <div className="space-y-6">
          {posts.map((post) => (
            <div key={post.id} className="bg-white p-6 rounded-xl shadow-lg border border-gray-100 transform hover:-translate-y-2 transition-all duration-300 hover:shadow-2xl">
              <h2 className="text-2xl font-bold text-gray-800 mb-3 hover:text-emerald-600 transition-colors">
                <Link href={`/forum/${post.id}`}>{post.title}</Link>
              </h2>
              <div className="flex items-center space-x-6 text-sm text-gray-500 mb-4">
                <div className="flex items-center gap-2"><User size={16} /><span>{post.author}</span></div>
                <div className="flex items-center gap-2"><Clock size={16} /><span>{post.date}</span></div>
                <div className="flex items-center gap-2"><MessageSquare size={16} /><span>{post.replies} Replies</span></div>
              </div>
              <p className="text-gray-600 leading-relaxed line-clamp-2">
                {post.content}
              </p>
              <div className="mt-4">
                <Link href={`/forum/${post.id}`} className="font-semibold text-emerald-600 hover:text-emerald-800 transition-colors">
                  Read More & Reply →
                </Link>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}