import { useState, useEffect, useRef, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext';
import Navbar from '../components/Navbar';
import BottomNav from '../components/BottomNav';
import { apiUrl } from '@/lib/api';
import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { ImagePlus, Plus, X, Heart, MessageCircle, Trash2, Loader2, Send, MoreVertical } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function SocialFeedPage() {
  const { currentUser, userData } = useAuth();
  
  // States
  const [posts, setPosts] = useState<any[]>([]);
  const [groupedStories, setGroupedStories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Story viewer states
  const [storyViewerOpen, setStoryViewerOpen] = useState(false);
  const [activeGroupIndex, setActiveGroupIndex] = useState(0);
  const [activeStoryIndex, setActiveStoryIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  
  // Upload Story States
  const [storyUploadModalOpen, setStoryUploadModalOpen] = useState(false);
  const [uploadingStory, setUploadingStory] = useState(false);
  const [storyFile, setStoryFile] = useState<File | null>(null);
  const [storyPreview, setStoryPreview] = useState<string | null>(null);
  const [storyCaption, setStoryCaption] = useState('');
  const [showStoryMenu, setShowStoryMenu] = useState(false);

  // Post states
  const [postCaption, setPostCaption] = useState('');
  const [postImageFile, setPostImageFile] = useState<File | null>(null);
  const [postImagePreview, setPostImagePreview] = useState<string | null>(null);
  const [uploadingPost, setUploadingPost] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const storyInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchData();
  }, [currentUser, userData]);

  const fetchData = async () => {
    setLoading(true);
    await Promise.all([fetchPosts(), fetchStories()]);
    setLoading(false);
  };

  const fetchPosts = async () => {
    try {
      const res = await fetch(apiUrl('/posts'));
      const data = await res.json();
      if (data.success) {
        setPosts(data.data);
      }
    } catch (error) {
      console.error('Failed to fetch posts:', error);
    }
  };

  const fetchStories = async () => {
    try {
      const token = await currentUser?.getIdToken();
      const res = await fetch(apiUrl('/stories'), {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      });
      const data = await res.json();
      if (data.success && userData) {
        const groupsMap = new Map();
        
        data.data.forEach((story: any) => {
          const uId = story.userId._id;
          if (!groupsMap.has(uId)) {
            groupsMap.set(uId, {
              user: story.userId,
              stories: [],
              hasUnseen: false,
              isCurrentUser: uId === userData._id,
              lastUpdated: new Date(story.createdAt).getTime()
            });
          }
          const group = groupsMap.get(uId);
          group.stories.push(story);
          
          const isSeen = story.viewers?.some((v: any) => v.userId === userData._id);
          if (!isSeen && uId !== userData._id) {
            group.hasUnseen = true;
          }
          const storyTime = new Date(story.createdAt).getTime();
          if (storyTime > group.lastUpdated) {
             group.lastUpdated = storyTime;
          }
        });
        
        // Sort stories within each group oldest to newest
        groupsMap.forEach(group => {
          group.stories.sort((a: any, b: any) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
        });
        
        const groupsArray = Array.from(groupsMap.values());
        
        groupsArray.sort((a, b) => {
          if (a.isCurrentUser) return -1;
          if (b.isCurrentUser) return 1;
          if (a.hasUnseen && !b.hasUnseen) return -1;
          if (!a.hasUnseen && b.hasUnseen) return 1;
          return b.lastUpdated - a.lastUpdated;
        });
        
        setGroupedStories(groupsArray);
      }
    } catch (error) {
      console.error('Failed to fetch stories:', error);
    }
  };

  // Upload helper
  const uploadImage = async (file: File) => {
    if (!currentUser) return null;
    const token = await currentUser.getIdToken();
    const formData = new FormData();
    formData.append('file', file);

    const res = await fetch(apiUrl('/upload'), {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`
      },
      body: formData
    });
    const data = await res.json();
    if (data.success) {
      return apiUrl(`/file/${data.data.fileId}`);
    }
    return null;
  };

  // Create Story
  const handleStoryImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setStoryFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setStoryPreview(reader.result as string);
        setStoryUploadModalOpen(true);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleShareStory = async () => {
    if (!storyFile || !currentUser) return;
    try {
      setUploadingStory(true);
      const imageUrl = await uploadImage(storyFile);
      if (!imageUrl) throw new Error('Upload failed');

      const token = await currentUser.getIdToken();
      const res = await fetch(apiUrl('/stories'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ image: imageUrl, caption: storyCaption })
      });
      const data = await res.json();
      if (data.success) {
        fetchStories();
        setStoryUploadModalOpen(false);
        setStoryFile(null);
        setStoryPreview(null);
        setStoryCaption('');
        if (storyInputRef.current) storyInputRef.current.value = '';
      }
    } catch (error) {
      console.error('Error creating story:', error);
    } finally {
      setUploadingStory(false);
    }
  };

  // Story Viewer Auto Progression
  useEffect(() => {
    let timer: any;
    if (storyViewerOpen && groupedStories.length > 0 && !isPaused && !showStoryMenu) {
      timer = setTimeout(() => {
        handleNextStory();
      }, 5000);
    }
    return () => clearTimeout(timer);
  }, [storyViewerOpen, activeGroupIndex, activeStoryIndex, groupedStories, isPaused, showStoryMenu]);

  // Mark viewed
  useEffect(() => {
    if (storyViewerOpen && groupedStories[activeGroupIndex]) {
      const currentStory = groupedStories[activeGroupIndex].stories[activeStoryIndex];
      if (currentStory && !groupedStories[activeGroupIndex].isCurrentUser) {
        const isSeen = currentStory.viewers?.some((v: any) => v.userId === userData?._id);
        if (!isSeen) {
          markAsViewed(currentStory._id);
        }
      }
    }
  }, [storyViewerOpen, activeGroupIndex, activeStoryIndex, groupedStories]);

  const markAsViewed = async (storyId: string) => {
    try {
      const token = await currentUser?.getIdToken();
      await fetch(apiUrl(`/stories/${storyId}/view`), {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setGroupedStories(prev => {
         const updated = [...prev];
         const group = updated[activeGroupIndex];
         const story = group.stories[activeStoryIndex];
         if (!story.viewers) story.viewers = [];
         story.viewers.push({ userId: userData?._id });
         
         group.hasUnseen = group.stories.some((s: any) => !s.viewers.some((v: any) => v.userId === userData?._id));
         return updated;
      });
    } catch (e) {
      console.error(e);
    }
  };

  const handleNextStory = useCallback(() => {
    if (!groupedStories[activeGroupIndex]) return;
    const currentGroup = groupedStories[activeGroupIndex];
    if (activeStoryIndex < currentGroup.stories.length - 1) {
      setActiveStoryIndex(prev => prev + 1);
    } else if (activeGroupIndex < groupedStories.length - 1) {
      setActiveGroupIndex(prev => prev + 1);
      setActiveStoryIndex(0);
    } else {
      setStoryViewerOpen(false);
    }
  }, [activeGroupIndex, activeStoryIndex, groupedStories]);

  const handlePrevStory = useCallback(() => {
    if (activeStoryIndex > 0) {
      setActiveStoryIndex(prev => prev - 1);
    } else if (activeGroupIndex > 0) {
      setActiveGroupIndex(prev => prev - 1);
      const prevGroup = groupedStories[activeGroupIndex - 1];
      setActiveStoryIndex(prevGroup.stories.length - 1);
    }
  }, [activeGroupIndex, activeStoryIndex, groupedStories]);

  const handleDeleteOwnStory = async () => {
    if (!currentUser) return;
    const currentStory = groupedStories[activeGroupIndex]?.stories[activeStoryIndex];
    if (!currentStory) return;

    try {
      const token = await currentUser.getIdToken();
      const res = await fetch(apiUrl(`/stories/${currentStory._id}`), {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        setShowStoryMenu(false);
        // Remove from local state
        const updated = [...groupedStories];
        updated[activeGroupIndex].stories.splice(activeStoryIndex, 1);
        if (updated[activeGroupIndex].stories.length === 0) {
          updated.splice(activeGroupIndex, 1);
          setStoryViewerOpen(false);
        } else {
          if (activeStoryIndex >= updated[activeGroupIndex].stories.length) {
            setActiveStoryIndex(updated[activeGroupIndex].stories.length - 1);
          }
        }
        setGroupedStories(updated);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleStoryReaction = async (emoji: string) => {
    const currentStory = groupedStories[activeGroupIndex]?.stories[activeStoryIndex];
    if (!currentStory || groupedStories[activeGroupIndex].isCurrentUser) return;
    
    try {
      const token = await currentUser?.getIdToken();
      await fetch(apiUrl(`/stories/${currentStory._id}/react`), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ emoji })
      });
      handleNextStory();
    } catch (e) {
      console.error(e);
    }
  };

  const openStoryViewer = (groupIndex: number) => {
    const group = groupedStories[groupIndex];
    let firstUnseenIdx = 0;
    if (!group.isCurrentUser) {
      const idx = group.stories.findIndex((s: any) => !s.viewers?.some((v: any) => v.userId === userData?._id));
      if (idx !== -1) firstUnseenIdx = idx;
    }
    setActiveGroupIndex(groupIndex);
    setActiveStoryIndex(firstUnseenIdx);
    setStoryViewerOpen(true);
  };

  // Create Post
  const handlePostImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setPostImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPostImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCreatePost = async () => {
    if ((!postCaption && !postImageFile) || !currentUser) return;
    try {
      setUploadingPost(true);
      let imageUrl = null;
      if (postImageFile) {
        imageUrl = await uploadImage(postImageFile);
      }

      const token = await currentUser.getIdToken();
      const res = await fetch(apiUrl('/posts'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          caption: postCaption,
          images: imageUrl ? [imageUrl] : []
        })
      });

      const data = await res.json();
      if (data.success) {
        setPosts([data.data, ...posts]);
        setPostCaption('');
        setPostImageFile(null);
        setPostImagePreview(null);
      }
    } catch (error) {
      console.error('Error creating post:', error);
    } finally {
      setUploadingPost(false);
    }
  };

  const handleDeletePost = async (postId: string) => {
    if (!currentUser) return;
    try {
      const token = await currentUser.getIdToken();
      const res = await fetch(apiUrl(`/posts/${postId}`), {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        setPosts(posts.filter(p => p._id !== postId));
      }
    } catch (error) {
      console.error('Error deleting post:', error);
    }
  };

  const hasCurrentUserStory = groupedStories.some(g => g.isCurrentUser);

  return (
    <div className="min-h-screen bg-[#2b2635] flex flex-col">
      <Navbar variant="dashboard" />
      
      <main className="flex-1 max-w-2xl w-full mx-auto px-4 py-4 md:py-8 pb-[100px] md:pb-8 relative">
        {/* Story Section */}
        <div className="mb-8">
          <div className="flex gap-4 overflow-x-auto hide-scrollbar pb-2 items-center">
            
            <input type="file" hidden accept="image/*" ref={storyInputRef} onChange={handleStoryImageSelect} />
            
            {/* Current User Story Bubble */}
            {currentUser && (
              <div className="flex flex-col items-center flex-shrink-0 cursor-pointer group relative">
                {hasCurrentUserStory ? (
                   <div 
                     className="w-16 h-16 md:w-20 md:h-20 rounded-full p-[3px] bg-[#9d97a8] mb-2 group-hover:scale-105 transition-transform"
                     onClick={() => openStoryViewer(0)}
                   >
                     <div className="w-full h-full rounded-full border-2 border-[#2b2635] overflow-hidden relative">
                       <img src={userData?.profileImage || 'https://ui-avatars.com/api/?name=U&background=342e40&color=c0ff00&size=150'} alt="Your Story" className="w-full h-full object-cover" />
                     </div>
                     <div 
                        className="absolute bottom-1 right-1 w-5 h-5 bg-[#c0ff00] rounded-full flex items-center justify-center border-2 border-[#2b2635] shadow-sm z-10 hover:scale-110 transition-transform"
                        onClick={(e) => { e.stopPropagation(); storyInputRef.current?.click(); }}
                     >
                       <Plus className="w-3 h-3 text-[#1a1520] font-bold" />
                     </div>
                   </div>
                ) : (
                  <div 
                    className="w-16 h-16 md:w-20 md:h-20 rounded-full p-[3px] bg-transparent border-2 border-dashed border-[#c0ff00]/50 mb-2 group-hover:border-[#c0ff00] transition-colors flex items-center justify-center"
                    onClick={() => storyInputRef.current?.click()}
                  >
                    <div className="w-full h-full rounded-full overflow-hidden relative bg-[#342e40]">
                       <img src={userData?.profileImage || 'https://ui-avatars.com/api/?name=U&background=342e40&color=c0ff00&size=150'} alt="Your Story" className="w-full h-full object-cover opacity-60" />
                       <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                         <Plus className="w-8 h-8 text-[#c0ff00]" />
                       </div>
                     </div>
                  </div>
                )}
                <span className="text-xs font-medium text-[#e8e6ed]">Your Story</span>
              </div>
            )}

            {/* Other Users' Stories */}
            {groupedStories.filter(g => !g.isCurrentUser).map((group, idx) => {
              const actualIndex = hasCurrentUserStory ? idx + 1 : idx;
              return (
                <div key={group.user._id} className="flex flex-col items-center flex-shrink-0 cursor-pointer group" onClick={() => openStoryViewer(actualIndex)}>
                  <div className={`w-16 h-16 md:w-20 md:h-20 rounded-full p-[3px] mb-2 group-hover:scale-105 transition-transform ${group.hasUnseen ? 'bg-gradient-to-tr from-[#c0ff00] to-[#7c3aed]' : 'bg-[#9d97a8]/50'}`}>
                    <div className="w-full h-full rounded-full border-2 border-[#2b2635] overflow-hidden">
                      <img src={group.user.profileImage || 'https://ui-avatars.com/api/?name=U&background=342e40&color=c0ff00&size=150'} alt={group.user.name} className="w-full h-full object-cover" />
                    </div>
                  </div>
                  <span className="text-xs font-medium text-[#e8e6ed] truncate w-16 text-center">
                    {group.user.name || group.user.fullName || 'User'}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Create Post Card */}
        {currentUser && (
          <Card className="p-4 md:p-5 glass-card border-0 rounded-[20px] mb-8 bg-[#342e40]/50 backdrop-blur-md">
            <div className="flex gap-3">
              <img src={userData?.profileImage || 'https://ui-avatars.com/api/?name=U&background=342e40&color=c0ff00&size=150'} alt="Profile" className="w-10 h-10 rounded-full object-cover border border-[#c0ff00]/20" />
              <div className="flex-1">
                <textarea
                  className="w-full bg-transparent text-[#e8e6ed] placeholder-[#9d97a8] resize-none outline-none min-h-[60px] text-lg mb-2"
                  placeholder="What would you like to share?"
                  value={postCaption}
                  onChange={(e) => setPostCaption(e.target.value)}
                />
                
                {postImagePreview && (
                  <div className="relative mb-4 rounded-xl overflow-hidden max-h-64">
                    <img src={postImagePreview} alt="Preview" className="w-full h-full object-cover" />
                    <button 
                      onClick={() => { setPostImagePreview(null); setPostImageFile(null); }}
                      className="absolute top-2 right-2 bg-black/50 p-1 rounded-full text-white hover:bg-black/80"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                )}
                
                <div className="flex items-center justify-between border-t border-[rgba(192,255,0,0.1)] pt-3">
                  <input type="file" hidden accept="image/*" ref={fileInputRef} onChange={handlePostImageSelect} />
                  <Button variant="ghost" size="sm" className="text-[#9d97a8] hover:text-[#c0ff00] hover:bg-[#c0ff00]/5 px-2" onClick={() => fileInputRef.current?.click()}>
                    <ImagePlus className="w-5 h-5 mr-2" />
                    Photo
                  </Button>
                  
                  <Button 
                    onClick={handleCreatePost}
                    disabled={(!postCaption && !postImageFile) || uploadingPost}
                    className="bg-[#c0ff00] text-[#1a1520] hover:bg-[#a8e000] rounded-full px-6 font-semibold"
                  >
                    {uploadingPost ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Send className="w-4 h-4 mr-2" />}
                    Post
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        )}

        {/* Global Feed */}
        <div className="space-y-6">
          {loading ? (
             [1, 2, 3].map(i => <div key={i} className="h-64 rounded-[20px] animate-pulse bg-[#342e40]/50" />)
          ) : posts.length === 0 ? (
            <div className="text-center py-12 text-[#9d97a8]">No posts yet. Be the first to share something!</div>
          ) : (
            posts.map((post, idx) => (
              <motion.div key={post._id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.05 }}>
                <Card className="glass-card border-0 rounded-[20px] overflow-hidden bg-[#342e40]/30 backdrop-blur-md pb-4">
                  {/* Post Header */}
                  <div className="p-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <img src={post.userId?.profileImage || 'https://ui-avatars.com/api/?name=U&background=342e40&color=c0ff00&size=150'} alt="User" className="w-10 h-10 rounded-full object-cover" />
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-semibold text-[#e8e6ed]">{post.userId?.name || post.userId?.fullName || 'User'}</h4>
                          <Badge variant="outline" className={`text-[10px] rounded-full px-2 py-0 h-4 border-0 ${post.role === 'brand' ? 'bg-[#c0ff00]/10 text-[#c0ff00]' : 'bg-[#7c3aed]/10 text-[#7c3aed]'}`}>
                            {post.role === 'brand' ? 'Brand' : 'Talent'}
                          </Badge>
                        </div>
                        <p className="text-[11px] text-[#9d97a8]">
                          {new Date(post.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                    </div>
                    {currentUser && currentUser.uid === post.userId?.firebaseUid && (
                      <Button variant="ghost" size="icon" className="text-[#9d97a8] hover:text-[#ff4d6a] hover:bg-[#ff4d6a]/10 h-8 w-8 rounded-full" onClick={() => handleDeletePost(post._id)}>
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                  
                  {/* Post Content */}
                  {post.caption && (
                    <div className="px-4 pb-3 text-[#e8e6ed] whitespace-pre-wrap text-sm">
                      {post.caption}
                    </div>
                  )}
                  {post.images && post.images.length > 0 && (
                    <div className="w-full max-h-[500px] bg-[#1a1520]">
                      <img src={post.images[0]} alt="Post content" className="w-full h-full object-contain max-h-[500px]" />
                    </div>
                  )}

                  {/* Post Actions */}
                  <div className="px-4 pt-4 flex items-center gap-6">
                    <button className="flex items-center gap-2 text-[#9d97a8] hover:text-[#ff4d6a] transition-colors">
                      <Heart className="w-5 h-5" />
                      <span className="text-xs font-medium">{post.likes?.length || 0}</span>
                    </button>
                    <button className="flex items-center gap-2 text-[#9d97a8] hover:text-[#c0ff00] transition-colors">
                      <MessageCircle className="w-5 h-5" />
                      <span className="text-xs font-medium">{post.comments?.length || 0}</span>
                    </button>
                  </div>
                </Card>
              </motion.div>
            ))
          )}
        </div>
      </main>

      {/* Story Upload Modal */}
      <AnimatePresence>
        {storyUploadModalOpen && storyPreview && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
            className="fixed inset-0 z-[200] bg-black/95 flex flex-col items-center justify-center p-4"
          >
            <div className="absolute top-4 right-4 z-10">
               <button onClick={() => { setStoryUploadModalOpen(false); setStoryPreview(null); setStoryFile(null); }} className="p-2 bg-black/50 text-white rounded-full hover:bg-black/80">
                 <X className="w-6 h-6" />
               </button>
            </div>
            <div className="relative w-full max-w-sm aspect-[9/16] bg-[#1a1520] rounded-[24px] overflow-hidden shadow-2xl">
              <img src={storyPreview} alt="Story Preview" className="w-full h-full object-cover" />
              <div className="absolute bottom-0 inset-x-0 p-4 bg-gradient-to-t from-black/80 to-transparent">
                 <input 
                   type="text"
                   placeholder="Add a caption..."
                   className="w-full bg-black/40 text-white placeholder-white/70 px-4 py-3 rounded-xl border border-white/20 mb-4 focus:outline-none focus:border-[#c0ff00] transition-colors"
                   value={storyCaption}
                   onChange={e => setStoryCaption(e.target.value)}
                 />
                 <Button 
                   className="w-full bg-[#c0ff00] text-[#1a1520] font-bold rounded-xl h-12"
                   onClick={handleShareStory}
                   disabled={uploadingStory}
                 >
                   {uploadingStory ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Share Story'}
                 </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Story Viewer Modal */}
      <AnimatePresence>
        {storyViewerOpen && groupedStories.length > 0 && groupedStories[activeGroupIndex] && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/95 flex items-center justify-center select-none"
            onPointerDown={() => setIsPaused(true)}
            onPointerUp={() => setIsPaused(false)}
            onPointerLeave={() => setIsPaused(false)}
          >
            {/* Progress Bars */}
            <div className="absolute top-4 left-4 right-4 flex gap-1 z-20 max-w-lg mx-auto">
              {groupedStories[activeGroupIndex].stories.map((_: any, i: number) => (
                <div key={i} className="h-1 flex-1 bg-white/30 rounded-full overflow-hidden">
                  <div 
                    className={`h-full bg-white transition-all ease-linear`}
                    style={{ 
                      width: i < activeStoryIndex ? '100%' : i === activeStoryIndex ? '100%' : '0%',
                      transitionDuration: i === activeStoryIndex && !isPaused && !showStoryMenu ? '5s' : '0s'
                    }}
                  />
                </div>
              ))}
            </div>

            {/* Header */}
            <div className="absolute top-8 left-4 right-4 max-w-lg mx-auto flex items-center justify-between z-20">
              <div className="flex items-center gap-3">
                <img src={groupedStories[activeGroupIndex].user.profileImage || 'https://ui-avatars.com/api/?name=U&background=342e40&color=c0ff00&size=150'} alt="User" className="w-8 h-8 rounded-full border border-white/20" />
                <span className="text-white font-semibold text-sm drop-shadow-md">
                  {groupedStories[activeGroupIndex].user.name || groupedStories[activeGroupIndex].user.fullName || 'User'}
                </span>
                <span className="text-white/80 text-xs drop-shadow-md">
                  {Math.round((new Date().getTime() - new Date(groupedStories[activeGroupIndex].stories[activeStoryIndex].createdAt).getTime()) / 3600000)}h
                </span>
              </div>
              <div className="flex items-center gap-2">
                {groupedStories[activeGroupIndex].isCurrentUser && (
                  <div className="relative">
                    <button onClick={(e) => { e.stopPropagation(); setShowStoryMenu(!showStoryMenu); setIsPaused(true); }} className="text-white p-1 hover:bg-white/10 rounded-full transition-colors">
                      <MoreVertical className="w-5 h-5" />
                    </button>
                    {showStoryMenu && (
                      <div className="absolute right-0 top-full mt-2 w-32 bg-[#2b2635] border border-white/10 rounded-lg shadow-xl py-1 z-50 overflow-hidden">
                         <button onClick={handleDeleteOwnStory} className="w-full text-left px-4 py-2 text-sm text-[#ff4d6a] hover:bg-white/5 flex items-center gap-2">
                           <Trash2 className="w-4 h-4" /> Delete
                         </button>
                      </div>
                    )}
                  </div>
                )}
                <button onClick={() => setStoryViewerOpen(false)} className="text-white p-2 hover:bg-white/10 rounded-full transition-colors">
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>

            {/* Tap areas for prev/next */}
            <div className="absolute inset-y-0 left-0 w-1/3 z-10 cursor-pointer" onClick={(e) => { e.stopPropagation(); handlePrevStory(); }} />
            <div className="absolute inset-y-0 right-0 w-2/3 z-10 cursor-pointer" onClick={(e) => { e.stopPropagation(); handleNextStory(); }} />

            {/* Image */}
            <div className="relative w-full h-full max-w-lg md:py-16 mx-auto flex flex-col justify-center">
              <div className="relative w-full h-full max-h-full bg-black md:rounded-[20px] overflow-hidden">
                <img 
                  src={groupedStories[activeGroupIndex].stories[activeStoryIndex].image} 
                  alt="Story" 
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/60 pointer-events-none" />
                
                {groupedStories[activeGroupIndex].stories[activeStoryIndex].caption && (
                  <div className="absolute bottom-24 left-0 right-0 text-center z-10 px-4">
                    <span className="bg-black/60 text-white px-5 py-2 rounded-xl text-[15px] font-medium max-w-full inline-block backdrop-blur-md">
                      {groupedStories[activeGroupIndex].stories[activeStoryIndex].caption}
                    </span>
                  </div>
                )}
              </div>

              {/* Bottom Actions */}
              <div className="absolute bottom-6 left-0 right-0 px-4 z-20 flex justify-between items-center max-w-lg mx-auto">
                {groupedStories[activeGroupIndex].isCurrentUser ? (
                  <div className="flex items-center gap-2 bg-black/50 backdrop-blur-md text-white px-4 py-2 rounded-full cursor-default">
                    <span className="text-sm font-medium">Seen by {groupedStories[activeGroupIndex].stories[activeStoryIndex].viewers?.length || 0}</span>
                  </div>
                ) : (
                  <div className="flex gap-3 justify-center w-full" onClick={e => e.stopPropagation()}>
                    {['❤️', '🔥', '👏', '😍', '😂'].map(emoji => (
                      <button 
                        key={emoji}
                        onClick={() => handleStoryReaction(emoji)}
                        className="text-2xl hover:scale-125 transition-transform bg-black/30 w-12 h-12 rounded-full flex items-center justify-center backdrop-blur-sm"
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <BottomNav />
    </div>
  );
}
