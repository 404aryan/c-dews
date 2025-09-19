'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { User, Clock, MessageSquare, Send, Leaf } from 'lucide-react';

// Re-using the same mock data. In a real app, you would fetch this specific post from an API.
const initialPosts = [
  {
    id: 1,
    title: 'Question about Tomato Leaf Blight',
    author: 'Sunita Sharma',
    date: 'September 18, 2025',
    content: 'I noticed some yellow spots with dark borders on my tomato plants. The diagnosis tool suggested it might be early blight. Can anyone share their experience with organic treatments for this? Looking for advice on neem oil concentration.',
    replies: [
      { author: 'Vikram Singh', content: 'I had a similar issue. A 2% neem oil solution sprayed weekly in the evening worked well for me. Make sure to cover the undersides of the leaves.' },
      { author: 'Priya Mehta', content: 'Also, ensure good air circulation by pruning the lower branches. It helps reduce humidity and prevents the fungus from spreading.' },
      { author: 'Rajesh Kumar', content: 'Agreed with Vikram. I also added a bit of organic liquid soap to the neem oil mix to help it stick to the leaves better.' },
    ]
  },
  {
    id: 2,
    title: 'Best fertilizer for Potato crop in sandy soil?',
    author: 'Rajesh Kumar',
    date: 'September 17, 2025',
    content: 'My farm has predominantly sandy soil. I\'m planning to plant potatoes next month. What NPK ratio for fertilizer works best in these conditions to get a good yield? Any specific brand recommendations are also welcome.',
    replies: [
      { author: 'Expert Agri', content: 'For sandy soils, a balanced NPK like 10-10-10 or 12-12-12 is a good start. Sandy soils drain quickly, so consider split applications of Nitrogen to prevent leaching.' },
      { author: 'Sunita Sharma', content: 'I use organic compost and vermicompost to improve water retention in my sandy soil. It has helped a lot with my potato yield.' },
    ]
  },
   {
    id: 3,
    title: 'Success Story: Overcame Powdery Mildew on my Mango Trees!',
    author: 'Anita Desai',
    date: 'September 16, 2025',
    content: 'Just wanted to share a success story! My mango orchard was affected by powdery mildew. Following the advice from the CDEWS app and some fellow farmers, I used a sulfur-based fungicide and proper pruning. My trees are healthy again! Thanks to this community.',
    replies: []
  }
];


export default function PostPage() {
  const params = useParams();
  const postId = params.postId;

  const [post, setPost] = useState(null);
  const [newReply, setNewReply] = useState('');

  useEffect(() => {
    if (postId) {
      const foundPost = initialPosts.find(p => p.id.toString() === postId);
      // In a real app, you'd fetch the post: const data = await fetch(`/api/forum/${postId}`);
      setPost(foundPost);
    }
  }, [postId]);

  const handleAddReply = (e) => {
    e.preventDefault();
    if (!newReply.trim()) return;

    const reply = {
      author: 'Current User',
      content: newReply,
    };
    
    // This is a temporary update. In a real app, you'd send this to the backend
    // and then re-fetch the post or update the state optimistically.
    const updatedPost = { ...post, replies: [...post.replies, reply] };
    setPost(updatedPost);
    setNewReply('');
  };

  if (!post) {
    return <div className="text-center py-20">Loading post...</div>;
  }

  return (
    <div className="bg-gray-50 min-h-screen">
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
            <Link href="/forum" className="font-semibold text-emerald-600 hover:text-emerald-800 transition-colors">
              ← Back to All Posts
            </Link>
          </div>
        </nav>
      </header>

      <main className="container mx-auto px-6 py-12">
        <div className="max-w-4xl mx-auto">
          {/* Original Post */}
          <div className="bg-white p-8 rounded-2xl shadow-xl border border-gray-100 mb-10">
            <h1 className="text-4xl font-bold text-gray-800 mb-4">{post.title}</h1>
            <div className="flex items-center space-x-6 text-sm text-gray-500 mb-6 border-b pb-4">
              <div className="flex items-center gap-2"><User size={16} /><span>{post.author}</span></div>
              <div className="flex items-center gap-2"><Clock size={16} /><span>{post.date}</span></div>
            </div>
            <p className="text-lg text-gray-700 leading-loose">{post.content}</p>
          </div>

          {/* Replies Section */}
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-3">
              <MessageSquare size={24} />
              Replies ({post.replies.length})
            </h2>
            {post.replies.map((reply, index) => (
              <div key={index} className="bg-white p-6 rounded-xl shadow-md border border-gray-100 flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-600 flex-shrink-0 flex items-center justify-center font-bold">
                  {reply.author.charAt(0)}
                </div>
                <div>
                  <p className="font-bold text-gray-800">{reply.author}</p>
                  <p className="text-gray-600">{reply.content}</p>
                </div>
              </div>
            ))}
             {post.replies.length === 0 && (
                <div className="bg-white p-6 rounded-xl text-center text-gray-500">
                    Be the first to reply to this post!
                </div>
             )}
          </div>

          {/* Add Reply Form */}
          <div className="mt-12 bg-white p-8 rounded-2xl shadow-xl border border-gray-100">
            <h3 className="text-xl font-bold text-gray-800 mb-4">Add Your Reply</h3>
            <form onSubmit={handleAddReply} className="space-y-4">
              <textarea
                placeholder="Share your advice or ask a follow-up question..."
                value={newReply}
                onChange={(e) => setNewReply(e.target.value)}
                rows="4"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all resize-none"
                required
              ></textarea>
              <div className="flex justify-end">
                <button
                  type="submit"
                  className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-emerald-600 to-green-600 text-white font-bold rounded-lg hover:from-emerald-700 hover:to-green-700 transform hover:scale-105 transition-all duration-300"
                >
                  <Send size={18} />
                  Post Reply
                </button>
              </div>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
}