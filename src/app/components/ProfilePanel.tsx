import { useState, useEffect, useCallback } from 'react';
import { DialogTitle } from './ui/dialog';
import { useAuth } from '../../context/AuthContext';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Alert, AlertDescription, AlertTitle } from './ui/alert';
import {
  MapPin,
  Mail,
  Instagram,
  Youtube,
  Facebook,
  Twitter,
  Hash,
  Edit2,
  Users,
  Activity,
  Link as LinkIcon,
  Calendar,
  AlertCircle,
  RefreshCw,
  Image,
  MessageCircle,
  Heart,
  Trash2,
  MoreVertical
} from 'lucide-react';
import { apiUrl, fetchWithIdToken } from '@/lib/api';
import { cn } from './ui/utils';
import { motion } from 'motion/react';

interface ProfilePanelProps {
  /** When true, the main title uses Radix DialogTitle for accessibility inside a dialog. */
  inDialog?: boolean;
  /** Show the gradient “Your Profile” heading; set false when the page already has a title. */
  showHeading?: boolean;
  /** Load the latest user document from GET /api/users/me (MongoDB User collection). */
  fetchOnMount?: boolean;
  className?: string;
}

function formatAudienceCount(n: unknown): string | null {
  if (n == null || n === '') return null;
  const num = typeof n === 'number' ? n : parseInt(String(n), 10);
  if (!Number.isFinite(num) || num < 0) return null;
  if (num >= 1_000_000) return `${(num / 1_000_000).toFixed(1).replace(/\.0$/, '')}M`;
  if (num >= 1_000) return `${(num / 1_000).toFixed(1).replace(/\.0$/, '')}K`;
  return String(Math.round(num));
}

function formatMemberSince(value: unknown): string | null {
  if (value == null) return null;
  const d = typeof value === 'string' || typeof value === 'number' ? new Date(value) : value instanceof Date ? value : null;
  if (!d || Number.isNaN(d.getTime())) return null;
  return d.toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' });
}

export default function ProfilePanel({
  inDialog = false,
  showHeading = true,
  fetchOnMount = false,
  className,
}: ProfilePanelProps) {
  const { currentUser, userData: profileData, loading: authLoading, setUserData } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [remoteLoading, setRemoteLoading] = useState(() => !!fetchOnMount);
  const [remoteError, setRemoteError] = useState<string | null>(null);
  
  const [userPosts, setUserPosts] = useState<any[]>([]);
  const [postsLoading, setPostsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'about' | 'posts'>('about');

  const [formData, setFormData] = useState({
    name: '',
    fullName: '',
    displayName: '',
    brandName: '',
    bio: '',
    categories: '',
    subCategory: '',
    followers: '',
    engagementRate: '',
    location: '',
    portfolio: '',
    profileImage: '',
    instagram: '',
    youtube: '',
    facebook: '',
    twitter: '',
    tiktok: '',
  });

  const loadProfileFromApi = useCallback(async () => {
    if (!currentUser) return;
    setRemoteLoading(true);
    setRemoteError(null);
    try {
      const res = await fetchWithIdToken('/users/me', currentUser);
      const json = await res.json().catch(() => ({}));
      if (!res.ok) {
        setRemoteError((json && json.message) || `Could not load profile (${res.status})`);
        return;
      }
      const doc = json.data ?? json;
      setUserData(doc);
      
      // Fetch posts
      if (doc && doc._id) {
        setPostsLoading(true);
        try {
          const postsRes = await fetch(apiUrl(`/posts/user/${doc._id}`));
          const postsData = await postsRes.json();
          if (postsData.success) {
            setUserPosts(postsData.data);
          }
        } catch (err) {
          console.error('Failed to load posts:', err);
        } finally {
          setPostsLoading(false);
        }
      }
    } catch {
      setRemoteError('Network error while loading profile.');
    } finally {
      setRemoteLoading(false);
    }
  }, [currentUser, setUserData]);

  useEffect(() => {
    if (!fetchOnMount) {
      setRemoteLoading(false);
      return;
    }
    if (authLoading) return;
    if (!currentUser) {
      setRemoteLoading(false);
      return;
    }
    loadProfileFromApi();
  }, [fetchOnMount, currentUser?.uid, authLoading, loadProfileFromApi]);

  useEffect(() => {
    if (profileData) {
      const sm = profileData.socialMedia || {};
      setFormData({
        name: profileData.name || '',
        fullName: profileData.fullName || '',
        displayName: profileData.displayName || '',
        brandName: profileData.brandName || '',
        bio: profileData.bio || '',
        categories: profileData.categories ? profileData.categories.join(', ') : '',
        subCategory: profileData.subCategory || '',
        followers: profileData.followers || '',
        engagementRate: profileData.engagementRate || '',
        location: profileData.location || '',
        portfolio: profileData.portfolio ? profileData.portfolio.join(', ') : '',
        profileImage: profileData.profileImage || '',
        instagram: sm.instagram || '',
        youtube: sm.youtube || '',
        facebook: sm.facebook || '',
        twitter: sm.twitter || '',
        tiktok: sm.tiktok || '',
      });
    }
  }, [profileData]);

  const handleSave = async () => {
    if (!currentUser) return;
    try {
      setSaving(true);

      const payload = {
        name: formData.name,
        fullName: formData.fullName,
        displayName: formData.displayName,
        brandName: formData.brandName,
        bio: formData.bio,
        categories: formData.categories.split(',').map((s) => s.trim()).filter(Boolean),
        subCategory: formData.subCategory,
        location: formData.location,
        followers: formData.followers,
        engagementRate: formData.engagementRate,
        portfolio: formData.portfolio.split(',').map((s) => s.trim()).filter(Boolean),
        profileImage: formData.profileImage,
        instagram: formData.instagram,
        youtube: formData.youtube,
        facebook: formData.facebook,
        twitter: formData.twitter,
        tiktok: formData.tiktok,
      };

      const res = await fetchWithIdToken('/users/profile', currentUser, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        const data = await res.json();
        setUserData(data.data || data);
        setIsEditing(false);
      }
    } catch (err) {
      console.error('Failed to update profile:', err);
    } finally {
      setSaving(false);
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
        setUserPosts(userPosts.filter(p => p._id !== postId));
      }
    } catch (error) {
      console.error('Error deleting post:', error);
    }
  };

  const loading = authLoading || (fetchOnMount && remoteLoading);
  const titleClass =
    'text-2xl font-bold bg-clip-text text-transparent bg-[#2b2635] text-foreground';

  const displayTitle = profileData?.fullName || profileData?.name || 'Your profile';
  const displayHandle =
    profileData?.displayName ||
    (profileData?.name ? String(profileData.name).toLowerCase().replace(/\s+/g, '') : '');
  const memberSince = formatMemberSince(profileData?.createdAt);

  return (
    <div className={cn('space-y-6', className)}>
      {fetchOnMount && remoteError && profileData && (
        <Alert variant="destructive">
          <AlertCircle />
          <AlertTitle>Could not refresh profile</AlertTitle>
          <AlertDescription className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <span>{remoteError}</span>
            <Button type="button" variant="outline" size="sm" className="shrink-0 gap-1" onClick={() => loadProfileFromApi()}>
              <RefreshCw className="h-3.5 w-3.5" />
              Retry
            </Button>
          </AlertDescription>
        </Alert>
      )}

      <div
        className={cn(
          'flex flex-row items-center gap-2',
          showHeading ? 'justify-between' : 'justify-end',
        )}
      >
        {showHeading &&
          (inDialog ? (
            <DialogTitle className={titleClass}>
              {isEditing ? 'Edit Profile' : 'Your Profile'}
            </DialogTitle>
          ) : (
            <h2 className={titleClass}>{isEditing ? 'Edit Profile' : 'Your Profile'}</h2>
          ))}
        {!loading && profileData && !isEditing && (
          <Button variant="ghost" size="sm" onClick={() => setIsEditing(true)} className="gap-2 shrink-0">
            <Edit2 className="w-4 h-4" />
            Edit
          </Button>
        )}
      </div>

      <div className="space-y-6">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-12 gap-3 text-sm text-muted-foreground">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
            <span>Loading your profile from the server…</span>
          </div>
        ) : fetchOnMount && remoteError && !profileData ? (
          <div className="text-center py-10 px-4 rounded-xl border border-border bg-background space-y-4">
            <p className="text-foreground font-medium">{remoteError}</p>
            <p className="text-sm text-foreground">We could not load your user record. Check that you are logged in and the API is running.</p>
            <Button type="button" variant="outline" className="gap-2" onClick={() => loadProfileFromApi()}>
              <RefreshCw className="h-4 w-4" />
              Try again
            </Button>
          </div>
        ) : isEditing ? (
          <div className="space-y-4">
            <div className="grid grid-cols-1 gap-4">
              <div>
                <Label>Profile Photo</Label>
                <div className="flex items-center gap-4 mt-2 mb-4">
                  <div className="w-16 h-16 bg-background rounded-full flex items-center justify-center overflow-hidden border border-border">
                    {formData.profileImage ? (
                      <img src={formData.profileImage} alt="Profile" className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-foreground text-xs">No Photo</span>
                    )}
                  </div>
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        const reader = new FileReader();
                        reader.onloadend = () =>
                          setFormData({ ...formData, profileImage: reader.result as string });
                        reader.readAsDataURL(file);
                      }
                    }}
                    className="cursor-pointer flex-1"
                  />
                </div>
              </div>
              <div>
                <Label>Email (read-only)</Label>
                <Input value={profileData?.email || ''} disabled className="bg-background" />
              </div>
              <div>
                <Label>Account name</Label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Name on your account"
                />
              </div>
              {profileData?.role === 'brand' && (
                <div>
                  <Label>Brand Name</Label>
                  <Input
                    value={formData.brandName}
                    onChange={(e) => setFormData({ ...formData, brandName: e.target.value })}
                    placeholder="Your Brand Name"
                  />
                </div>
              )}
              <div>
                <Label>Full name</Label>
                <Input
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  placeholder="Public full name"
                />
              </div>
              <div>
                <Label>Display name / handle</Label>
                <Input
                  value={formData.displayName}
                  onChange={(e) => setFormData({ ...formData, displayName: e.target.value })}
                  placeholder="Shown as @handle"
                />
              </div>
              <div>
                <Label>Categories (comma-separated)</Label>
                <Input
                  value={formData.categories}
                  onChange={(e) => setFormData({ ...formData, categories: e.target.value })}
                  placeholder="e.g. Influencer, Athlete"
                />
              </div>
              <div>
                <Label>Sub-category</Label>
                <Input
                  value={formData.subCategory}
                  onChange={(e) => setFormData({ ...formData, subCategory: e.target.value })}
                  placeholder="e.g. Fitness, E-Sports"
                />
              </div>
              <div>
                <Label>Location</Label>
                <Input
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  placeholder="e.g. Los Angeles, CA"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Followers</Label>
                  <Input
                    value={formData.followers}
                    onChange={(e) => setFormData({ ...formData, followers: e.target.value })}
                    placeholder="e.g. 1.2M"
                  />
                </div>
                <div>
                  <Label>Engagement rate</Label>
                  <Input
                    value={formData.engagementRate}
                    onChange={(e) => setFormData({ ...formData, engagementRate: e.target.value })}
                    placeholder="e.g. 4.5%"
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label>Instagram</Label>
                  <Input
                    value={formData.instagram}
                    onChange={(e) => setFormData({ ...formData, instagram: e.target.value })}
                    placeholder="username"
                  />
                </div>
                <div>
                  <Label>YouTube</Label>
                  <Input
                    value={formData.youtube}
                    onChange={(e) => setFormData({ ...formData, youtube: e.target.value })}
                    placeholder="channel or @handle"
                  />
                </div>
                <div>
                  <Label>Facebook page</Label>
                  <Input
                    value={formData.facebook}
                    onChange={(e) => setFormData({ ...formData, facebook: e.target.value })}
                    placeholder="Page name (from Connect)"
                  />
                </div>
                <div>
                  <Label>X / Twitter</Label>
                  <Input
                    value={formData.twitter}
                    onChange={(e) => setFormData({ ...formData, twitter: e.target.value })}
                    placeholder="username"
                  />
                </div>
                <div>
                  <Label>TikTok</Label>
                  <Input
                    value={formData.tiktok}
                    onChange={(e) => setFormData({ ...formData, tiktok: e.target.value })}
                    placeholder="username"
                  />
                </div>
              </div>
              <div>
                <Label>Portfolio links (comma-separated)</Label>
                <Input
                  value={formData.portfolio}
                  onChange={(e) => setFormData({ ...formData, portfolio: e.target.value })}
                  placeholder="https://link1.com, https://link2.com"
                />
              </div>
              <div>
                <Label>Bio</Label>
                <Textarea
                  value={formData.bio}
                  onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                  placeholder="Tell us about yourself..."
                  className="h-24"
                />
              </div>
            </div>
            <div className="flex justify-end gap-3 pt-4">
              <Button variant="outline" onClick={() => setIsEditing(false)} disabled={saving}>
                Cancel
              </Button>
              <Button onClick={handleSave} disabled={saving} className="bg-primary text-[#2b2635] hover:bg-primary text-[#2b2635]">
                {saving ? 'Saving...' : 'Save changes'}
              </Button>
            </div>
          </div>
        ) : profileData ? (
          <div className="space-y-6">
            <div className="flex flex-col gap-4">
              <div className="flex items-center gap-4">
                <div className="w-20 h-20 bg-[#2b2635] text-foreground rounded-full overflow-hidden flex items-center justify-center text-primary font-bold text-2xl uppercase border-2 border-border shadow-sm shrink-0">
                  {profileData.profileImage ? (
                    <img src={profileData.profileImage} alt="" className="w-full h-full object-cover" />
                  ) : (
                    displayTitle.charAt(0) || '?'
                  )}
                </div>
                <div className="min-w-0">
                  <h3 className="text-xl font-bold text-foreground truncate">{displayTitle}</h3>
                  {displayHandle && (
                    <p className="text-foreground font-medium truncate">@{displayHandle}</p>
                  )}
                  {profileData.name && profileData.name !== displayTitle && (
                    <p className="text-sm text-foreground mt-1 truncate">Account: {profileData.name}</p>
                  )}
                  {profileData.role === 'brand' && profileData.brandName && (
                    <p className="text-sm font-semibold text-primary mt-1 truncate">Brand: {profileData.brandName}</p>
                  )}
                </div>
              </div>

              {/* Stats Bar */}
              <div className="flex flex-wrap gap-4 p-3 bg-primary/10 rounded-xl">
                {profileData.followers && (
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-primary shrink-0" />
                    <span className="font-semibold text-primary">{profileData.followers} followers</span>
                  </div>
                )}
                {profileData.engagementRate && (
                  <div className="flex items-center gap-2">
                    <Activity className="w-4 h-4 text-primary shrink-0" />
                    <span className="font-semibold text-primary">{profileData.engagementRate} engagement</span>
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <Image className="w-4 h-4 text-primary shrink-0" />
                  <span className="font-semibold text-primary">{userPosts.length} posts</span>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              <Badge variant="secondary" className="capitalize select-none">
                {profileData.role}
              </Badge>
              {profileData.categories && profileData.categories.map((cat: string) => (
                <Badge key={cat} className="bg-primary/20 text-primary hover:bg-background border-none select-none">
                  {cat}
                </Badge>
              ))}
              {profileData.subCategory && (
                <Badge variant="outline" className="border-primary/20 text-primary select-none">
                  {profileData.subCategory}
                </Badge>
              )}
            </div>

            {/* Tabs for About / Posts */}
            <div className="flex items-center gap-4 border-b border-border mb-4">
              <button
                onClick={() => setActiveTab('about')}
                className={cn('pb-2 text-sm font-semibold transition-colors', activeTab === 'about' ? 'text-primary border-b-2 border-primary' : 'text-muted-foreground')}
              >
                About
              </button>
              <button
                onClick={() => setActiveTab('posts')}
                className={cn('pb-2 text-sm font-semibold transition-colors', activeTab === 'posts' ? 'text-primary border-b-2 border-primary' : 'text-muted-foreground')}
              >
                Posts
              </button>
            </div>

            {activeTab === 'about' && (
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
                <Card className="p-4 bg-background border border-border shadow-sm">
                  <h4 className="text-xs font-semibold uppercase tracking-wide text-foreground mb-3">Account</h4>
              <div className="space-y-3">
                <div className="flex items-center gap-3 text-sm text-foreground">
                  <Mail className="w-4 h-4 text-foreground shrink-0" />
                  <span className="break-all">{profileData.email}</span>
                </div>
                {profileData.location && (
                  <div className="flex items-center gap-3 text-sm text-foreground">
                    <MapPin className="w-4 h-4 text-foreground shrink-0" />
                    <span>{profileData.location}</span>
                  </div>
                )}
                {memberSince && (
                  <div className="flex items-center gap-3 text-sm text-foreground">
                    <Calendar className="w-4 h-4 text-foreground shrink-0" />
                    <span>Member since {memberSince}</span>
                  </div>
                )}
              </div>
            </Card>

            {profileData.bio && (
              <div>
                <h4 className="text-sm font-semibold text-foreground mb-2">About</h4>
                <p className="text-sm text-foreground leading-relaxed bg-background p-3 rounded-lg whitespace-pre-wrap">
                  {profileData.bio}
                </p>
              </div>
            )}

            {profileData.portfolio && profileData.portfolio.length > 0 && (
              <div>
                <h4 className="text-sm font-semibold text-foreground mb-2">Portfolio</h4>
                <div className="space-y-2">
                  {profileData.portfolio.map((link: string, idx: number) => (
                    <a
                      key={idx}
                      href={link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-sm text-primary hover:underline p-2 border rounded-lg bg-background"
                    >
                      <LinkIcon className="w-4 h-4 shrink-0" />
                      <span className="truncate">{link}</span>
                    </a>
                  ))}
                </div>
              </div>
            )}

            {profileData.socialMedia &&
              (Object.entries(profileData.socialMedia).some(
                ([key, val]) =>
                  !['instagramFollowers', 'youtubeSubscribers', 'facebookPageFollowers', 'socialSyncedAt'].includes(
                    key,
                  ) && val,
              ) ||
                profileData.socialMedia.instagramFollowers != null ||
                profileData.socialMedia.youtubeSubscribers != null ||
                profileData.socialMedia.facebookPageFollowers != null) && (
              <div>
                <h4 className="text-sm font-semibold text-foreground mb-3">Social</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {profileData.socialMedia.instagram && (
                    <div className="flex items-center gap-2 text-sm text-foreground p-2 border rounded-lg hover:bg-background transition-colors">
                      <Instagram className="w-4 h-4 text-foreground shrink-0" />
                      <span className="truncate">@{profileData.socialMedia.instagram}</span>
                    </div>
                  )}
                  {profileData.socialMedia.youtube && (
                    <div className="flex flex-col gap-0.5 text-sm text-foreground p-2 border rounded-lg hover:bg-background transition-colors">
                      <div className="flex items-center gap-2 min-w-0">
                        <Youtube className="w-4 h-4 text-red-600 shrink-0" />
                        <span className="truncate">@{profileData.socialMedia.youtube}</span>
                      </div>
                      {formatAudienceCount(profileData.socialMedia.youtubeSubscribers) && (
                        <span className="text-xs text-muted-foreground pl-6">
                          ~{formatAudienceCount(profileData.socialMedia.youtubeSubscribers)} subscribers
                        </span>
                      )}
                    </div>
                  )}
                  {profileData.socialMedia.facebook && (
                    <div className="flex flex-col gap-0.5 text-sm text-gray-600 p-2 border rounded-lg hover:bg-gray-50 transition-colors">
                      <div className="flex items-center gap-2 min-w-0">
                        <Facebook className="w-4 h-4 text-[#1877F2] shrink-0" />
                        <span className="truncate">{profileData.socialMedia.facebook}</span>
                      </div>
                      {formatAudienceCount(profileData.socialMedia.facebookPageFollowers) && (
                        <span className="text-xs text-gray-500 pl-6">
                          ~{formatAudienceCount(profileData.socialMedia.facebookPageFollowers)} page followers
                        </span>
                      )}
                    </div>
                  )}
                  {profileData.socialMedia.twitter && (
                    <div className="flex items-center gap-2 text-sm text-foreground p-2 border rounded-lg hover:bg-background transition-colors">
                      <Twitter className="w-4 h-4 text-primary/70 shrink-0" />
                      <span className="truncate">@{profileData.socialMedia.twitter}</span>
                    </div>
                  )}
                  {profileData.socialMedia.tiktok && (
                    <div className="flex items-center gap-2 text-sm text-foreground p-2 border rounded-lg hover:bg-background transition-colors">
                      <Hash className="w-4 h-4 text-foreground shrink-0" />
                      <span className="truncate">@{profileData.socialMedia.tiktok}</span>
                    </div>
                  )}
                </div>
              </div>
            )}
              </div>
            )}

            {activeTab === 'posts' && (
              <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
                {postsLoading ? (
                  <div className="text-center py-6 text-muted-foreground">Loading posts...</div>
                ) : userPosts.length === 0 ? (
                  <div className="text-center py-10 bg-background rounded-xl border border-border">
                    <Image className="w-10 h-10 mx-auto text-muted-foreground mb-3 opacity-50" />
                    <p className="text-foreground">No posts yet</p>
                    <p className="text-sm text-muted-foreground">Share something to see it here.</p>
                  </div>
                ) : (
                  userPosts.map((post) => (
                    <Card key={post._id} className="p-4 bg-background border border-border shadow-sm relative group overflow-hidden">
                      <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button variant="destructive" size="icon" className="h-8 w-8 rounded-full" onClick={() => handleDeletePost(post._id)}>
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                      <div className="flex items-center gap-3 mb-3">
                        <img src={profileData.profileImage || 'https://ui-avatars.com/api/?name=U&background=342e40&color=c0ff00&size=150'} alt="Profile" className="w-8 h-8 rounded-full object-cover" />
                        <div>
                          <div className="text-sm font-semibold text-foreground">{profileData.name}</div>
                          <div className="text-xs text-muted-foreground">
                            {new Date(post.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                          </div>
                        </div>
                      </div>
                      {post.caption && <p className="text-sm text-foreground mb-3">{post.caption}</p>}
                      {post.images && post.images.length > 0 && (
                        <div className="rounded-xl overflow-hidden mb-3 max-h-64 bg-[#1a1520]">
                          <img src={post.images[0]} alt="Post" className="w-full h-full object-contain" />
                        </div>
                      )}
                      <div className="flex items-center gap-4 pt-2 border-t border-border">
                        <div className="flex items-center gap-1.5 text-muted-foreground">
                          <Heart className="w-4 h-4" />
                          <span className="text-xs">{post.likes?.length || 0}</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-muted-foreground">
                          <MessageCircle className="w-4 h-4" />
                          <span className="text-xs">{post.comments?.length || 0}</span>
                        </div>
                      </div>
                    </Card>
                  ))
                )}
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-8 text-foreground bg-background rounded-xl border border-border">
            <p>No profile data loaded.</p>
            <p className="text-sm mt-1">Try signing in again or complete profile setup.</p>
          </div>
        )}
      </div>
    </div>
  );
}
