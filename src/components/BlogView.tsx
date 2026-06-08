import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { BlogPost, Locale } from '../types';
import { getTranslation } from '../lib/i18n';
import { Calendar, User, CornerDownRight, ArrowLeft, Layers, BookOpen, Clock } from 'lucide-react';

interface BlogViewProps {
  blogPosts: BlogPost[];
  currentLocale: Locale;
}

export default function BlogView({ blogPosts, currentLocale }: BlogViewProps) {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [activePost, setActivePost] = useState<BlogPost | null>(null);

  const isRtl = currentLocale === 'fa' || currentLocale === 'ar';
  const textDirectionClass = isRtl ? 'text-right' : 'text-left';

  useEffect(() => {
    if (slug) {
      const post = blogPosts.find(p => p.slug === slug || String(p.id) === slug);
      if (post) {
        setActivePost(post);
      } else {
        setActivePost(null);
      }
    } else {
      setActivePost(null);
    }
  }, [slug, blogPosts]);

  const handleReadPost = (post: BlogPost) => {
    navigate(`/blog/${post.slug || post.id}`);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleBackToBlog = () => {
    navigate('/blog');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-12 space-y-12 animate-fadeIn font-sans text-xs leading-relaxed font-light text-gray-400" dir={isRtl ? 'rtl' : 'ltr'}>
      
      {/* 1) ACTIVE DETAIL VIEW */}
      {activePost ? (
        <div className="space-y-8">
          
          <button
            onClick={handleBackToBlog}
            className="inline-flex items-center gap-1.5 uppercase tracking-widest text-[10px] text-[#C5A880] hover:text-[#EED6A3] transition-colors cursor-pointer"
          >
            <ArrowLeft className={`h-4 w-4 ${isRtl ? 'rotate-180' : ''}`} />
            <span>Return to Chronicles</span>
          </button>

          {/* Featured header card image */}
          <div className="h-64 sm:h-[400px] w-full rounded border border-[#231710] overflow-hidden relative shadow-2xl">
            <img src={activePost.image} alt="" className="w-full h-full object-cover opacity-80" referrerPolicy="no-referrer" />
            <div className="absolute top-4 right-4 bg-[#0A0A0A]/90 border border-[#C5A880]/30 px-3 py-1 text-[9px] uppercase font-bold text-[#EED6A3] rounded">
              {activePost.category}
            </div>
          </div>

          {/* Meta parameters line info */}
          <div className="flex flex-wrap items-center gap-4 text-[10px] text-gray-500 uppercase tracking-wider pb-4 border-b border-[#1F1611]">
            <div className="flex items-center gap-1">
              <Calendar className="h-3.5 w-3.5 text-[#C5A880]" />
              <span className="font-mono">{activePost.date}</span>
            </div>
            
            <div className="flex items-center gap-1">
              <User className="h-3.5 w-3.5 text-[#C5A880]" />
              <span>{activePost.author[currentLocale]}</span>
            </div>
            
            <div className="flex items-center gap-1">
              <Clock className="h-3.5 w-3.5 text-[#C5A880]" />
              <span>{currentLocale === 'en' ? '8 mins read' : '۸ دقیقه مطالعه'}</span>
            </div>
          </div>

          {/* Heading */}
          <div className={`space-y-4 ${textDirectionClass}`}>
            <h1 className="font-serif text-2xl sm:text-4xl uppercase tracking-widest text-gray-100 font-semibold leading-tight">
              {activePost.title[currentLocale]}
            </h1>
            <p className="text-[#C5A880] font-serif italic text-base leading-relaxed leading-[1.7] border-l-2 border-[#C5A880] pl-4">
              {activePost.excerpt[currentLocale]}
            </p>
          </div>

          {/* Post Body text */}
          <div className={`text-gray-300 leading-relaxed font-light text-[12.5px] space-y-6 ${textDirectionClass} whitespace-pre-wrap`}>
            {activePost.content[currentLocale].split('\n\n').map((para, pIdx) => (
              <p key={pIdx}>{para}</p>
            ))}
          </div>

          <div className="pt-10 border-t border-[#1C130D]">
            <button
              onClick={handleBackToBlog}
              className="inline-flex items-center gap-1.5 uppercase tracking-widest text-[10px] text-[#C5A880] hover:text-[#EED6A3] transition-colors cursor-pointer"
            >
              <ArrowLeft className={`h-4 w-4 ${isRtl ? 'rotate-180' : ''}`} />
              <span>Return to Chronicles</span>
            </button>
          </div>

        </div>
      ) : (
        // 2) BLOG LIST VIEW
        <div className="space-y-12">
          
          <div className="text-center space-y-3">
            <span className="text-[10px] uppercase tracking-[0.25em] text-[#C5A880] font-bold">literature, research, and conservation logs</span>
            <h1 className="font-serif text-3xl sm:text-5xl text-gray-200 uppercase tracking-widest leading-none">The Atelier Chronicles</h1>
            <p className="text-xs text-gray-500 max-w-xl mx-auto font-light leading-relaxed mt-2">
              Deep research into local astronomy, geometry linguistics of Kafiristan, wood treatment guides, and preservation milestones.
            </p>
            <div className="w-16 h-[1px] bg-[#C5A880] mx-auto mt-6" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {blogPosts.filter(p => p.status === 'published').map((post) => (
              <div
                key={post.id}
                onClick={() => handleReadPost(post)}
                className="bg-[#0C0C0C] border border-[#231711] hover:border-[#C5A880]/30 rounded-sm overflow-hidden group shadow-lg cursor-pointer transition-all duration-300 flex flex-col justify-between"
              >
                {/* Micro cover image wrapper */}
                <div className="h-56 relative overflow-hidden bg-black/40 shrink-0">
                  <img src={post.image} alt="" className="w-full h-full object-cover opacity-80 group-hover:scale-105 transition-transform duration-700" referrerPolicy="no-referrer" />
                  <div className="absolute top-3 right-3 bg-[#0A0A0A]/85 backdrop-blur-md border border-[#C5A880]/30 text-[9px] uppercase px-2 py-0.5 rounded text-gray-300 font-bold font-sans">
                    {post.category}
                  </div>
                </div>

                {/* Info block cards */}
                <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                  <div className={`space-y-2.5 ${textDirectionClass}`}>
                    <span className="text-[9px] text-gray-600 uppercase font-mono tracking-widest block leading-none">{post.date}</span>
                    <h3 className="font-serif text-gray-200 text-base group-hover:text-[#EED6A3] transition-colors leading-snug">
                      {post.title[currentLocale]}
                    </h3>
                    <p className="text-[11px] text-gray-500 leading-relaxed font-light line-clamp-3">
                      {post.excerpt[currentLocale]}
                    </p>
                  </div>

                  <div className="pt-3 border-t border-[#1C130D]">
                    <span className="text-[#C5A880] font-bold text-[10px] uppercase tracking-wider inline-flex items-center gap-1">
                      <span>Study chronicle</span>
                      <CornerDownRight className="h-3 w-3 shrink-0" />
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>

        </div>
      )}

    </div>
  );
}
