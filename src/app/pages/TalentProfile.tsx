import { useParams, Link } from 'react-router';
import { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import BottomNav from '../components/BottomNav';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Separator } from '../components/ui/separator';
import {
  MapPin,
  Users,
  TrendingUp,
  CheckCircle,
  Instagram,
  Youtube,
  Twitter,
  MessageCircle,
  Bookmark,
  Share2,
  Calendar,
  Image as ImageIcon,
  Heart,
} from 'lucide-react';
import { motion } from 'motion/react';
import { apiUrl } from '@/lib/api';
import SocialConnectButtons from '../components/SocialConnectButtons';

export default function TalentProfile() {
  const { id } = useParams();
  const [talent, setTalent] = useState<any>(null);
  const [similarTalents, setSimilarTalents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saved, setSaved] = useState(false);
  const [userPosts, setUserPosts] = useState<any[]>([]);
  const { currentUser } = useAuth();

  const isOwnProfile =
    Boolean(currentUser?.uid && talent?.firebaseUid && currentUser.uid === talent.firebaseUid);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const token = await currentUser?.getIdToken();
        const headers: Record<string, string> = token ? { Authorization: `Bearer ${token}` } : {};

        // Fetch talent by id
        const res = await fetch(apiUrl(`/talents/${id}`), { headers });
        if (res.ok) {
          const data = await res.json();
          setTalent(data.data);

          // Fetch user posts
          if (data.data && data.data._id) {
            try {
              const postsRes = await fetch(apiUrl(`/posts/user/${data.data._id}`));
              const postsData = await postsRes.json();
              if (postsData.success) {
                setUserPosts(postsData.data);
              }
            } catch (e) {
              console.error('Failed to fetch user posts:', e);
            }
          }

          // Fetch similar talents
          const allRes = await fetch(apiUrl('/talents'), { headers });
          if (allRes.ok) {
            const allData = await allRes.json();
            setSimilarTalents(
              allData.data.filter((t: any) => t.category === data.data.category && t._id !== id).slice(0, 3)
            );
          }
        }
      } catch (err) {
        console.error('Failed to fetch talent:', err);
      } finally {
        setLoading(false);
      }
    };
    if (id) {
      fetchData();
    }
  }, [id, currentUser]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  if (!talent) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
          <h1 className="text-2xl font-bold mb-4">Talent not found</h1>
          <Link to="/explore">
            <Button>Back to Explore</Button>
          </Link>
        </div>
      </div>
    );
  }

  const formatFollowers = (count: any) => {
    if (!count) return 'N/A';
    if (typeof count === 'string') return count;
    if (count >= 1000000) {
      return `${(count / 1000000).toFixed(1)}M`;
    }
    if (count >= 1000) {
      return `${(count / 1000).toFixed(0)}K`;
    }
    return count.toString();
  };

  return (
    <div className="min-h-screen bg-[#2b2635]">
      <Navbar />

      {/* Cover Image */}
      <div className="relative h-56 md:h-80 bg-[#1a1520]">
        {talent.coverImage && (
          <img
            src={talent.coverImage}
            alt="Cover"
            className="w-full h-full object-cover opacity-50"
          />
        )}
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-32 relative z-10 pb-20">
        {/* Profile Header */}
        <Card className="p-8 mb-8 rounded-2xl">
          <div className="flex flex-col md:flex-row gap-6 items-start">
            <div className="relative">
              <div className="w-32 h-32 rounded-2xl border-4 border-border shadow-lg overflow-hidden bg-[#2b2635] text-foreground flex items-center justify-center">
                {talent.profileImage ? (
                  <img
                    src={talent.profileImage}
                    alt={talent.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-4xl font-bold text-primary uppercase">{talent.name?.charAt(0) || 'T'}</span>
                )}
              </div>
              {talent.verified && (
                <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-primary text-[#2b2635] rounded-full flex items-center justify-center border-4 border-border">
                  <CheckCircle className="w-5 h-5 text-foreground" />
                </div>
              )}
            </div>

            <div className="flex-1">
              <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-4">
                <div>
                  <h1 className="text-3xl font-bold mb-2">{talent.name}</h1>
                  <p className="text-lg text-foreground mb-2">{talent.subCategory}</p>
                  <div className="flex items-center gap-2 text-foreground">
                    <MapPin className="w-4 h-4" />
                    <span>{talent.location ? talent.location.split(',')[0] : 'Remote'}</span>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setSaved(!saved)}
                  >
                    <Bookmark
                      className={`w-5 h-5 ${
                        saved ? 'fill-primary text-primary' : ''
                      }`}
                    />
                  </Button>
                  <Button variant="outline" size="icon">
                    <Share2 className="w-5 h-5" />
                  </Button>
                  <Link to="/chat">
                    <Button className="bg-primary text-[#2b2635] hover:bg-primary text-[#2b2635]">
                      <MessageCircle className="w-4 h-4 mr-2" />
                      Invite for Collaboration
                    </Button>
                  </Link>
                </div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-background p-4 rounded-xl">
                  <div className="flex items-center gap-2 text-foreground mb-1">
                    <Users className="w-4 h-4" />
                    <span className="text-sm">Followers</span>
                  </div>
                  <div className="text-2xl font-bold">
                    {formatFollowers(talent.followers)}
                  </div>
                </div>
                <div className="bg-background p-4 rounded-xl">
                  <div className="flex items-center gap-2 text-foreground mb-1">
                    <TrendingUp className="w-4 h-4" />
                    <span className="text-sm">Engagement</span>
                  </div>
                  <div className="text-2xl font-bold">{talent.engagementRate || 'N/A'}{talent.engagementRate && !talent.engagementRate.includes('%') ? '%' : ''}</div>
                </div>
                <div className="bg-background p-4 rounded-xl">
                  <div className="flex items-center gap-2 text-foreground mb-1">
                    <ImageIcon className="w-4 h-4" />
                    <span className="text-sm">Posts</span>
                  </div>
                  <div className="text-2xl font-bold">
                    {userPosts.length || talent.stats?.posts?.toLocaleString() || '0'}
                  </div>
                </div>
                <div className="bg-background p-4 rounded-xl">
                  <div className="flex items-center gap-2 text-foreground mb-1">
                    <CheckCircle className="w-4 h-4" />
                    <span className="text-sm">Avg. Likes</span>
                  </div>
                  <div className="text-2xl font-bold">
                    {talent.stats?.avgLikes ? formatFollowers(talent.stats.avgLikes) : 'N/A'}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* About */}
            <Card className="p-6 rounded-2xl">
              <h2 className="text-xl font-semibold mb-4">About</h2>
              <p className="text-foreground leading-relaxed">{talent.bio || 'No bio provided.'}</p>

              <div className="mt-6 flex flex-wrap gap-2">
                {(talent.tags || []).map((tag: string) => (
                  <Badge key={tag} variant="secondary">
                    {tag}
                  </Badge>
                ))}
              </div>
            </Card>

            {/* Portfolio */}
            {talent.portfolio && talent.portfolio.length > 0 && (
              <Card className="p-6 rounded-2xl">
                <h2 className="text-xl font-semibold mb-4">Portfolio</h2>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {talent.portfolio.map((image: string, index: number) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <img
                        src={image}
                        alt={`Portfolio ${index + 1}`}
                        className="w-full h-48 object-cover rounded-xl hover:scale-105 transition-transform cursor-pointer"
                      />
                    </motion.div>
                  ))}
                </div>
              </Card>
            )}

            {/* Past Collaborations */}
            {talent.collaborations && talent.collaborations.length > 0 && (
              <Card className="p-6 rounded-2xl">
                <h2 className="text-xl font-semibold mb-4">Past Collaborations</h2>
                <div className="space-y-4">
                  {talent.collaborations.map((collab: any, index: number) => (
                    <div key={index}>
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 bg-background rounded-xl flex items-center justify-center flex-shrink-0">
                          <span className="text-xl">{collab.brand[0]}</span>
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold">{collab.brand}</h3>
                          <p className="text-foreground text-sm mb-1">
                            {collab.description}
                          </p>
                          <div className="flex items-center gap-1 text-foreground text-sm">
                            <Calendar className="w-4 h-4" />
                            <span>{collab.date}</span>
                          </div>
                        </div>
                      </div>
                      {index < talent.collaborations.length - 1 && (
                        <Separator className="my-4" />
                      )}
                    </div>
                  ))}
                </div>
              </Card>
            )}

            {/* Posts */}
            <Card className="p-6 rounded-2xl">
              <h2 className="text-xl font-semibold mb-4">Posts</h2>
              <div className="space-y-4">
                {userPosts.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground bg-background rounded-xl">
                    No posts yet.
                  </div>
                ) : (
                  userPosts.map((post) => (
                    <div key={post._id} className="p-4 bg-background border border-border shadow-sm rounded-xl">
                      <div className="flex items-center gap-3 mb-3">
                        <img src={talent.profileImage || 'https://ui-avatars.com/api/?name=U&background=342e40&color=c0ff00&size=150'} alt="Profile" className="w-8 h-8 rounded-full object-cover" />
                        <div>
                          <div className="text-sm font-semibold text-foreground">{talent.name}</div>
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
                    </div>
                  ))
                )}
              </div>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {isOwnProfile && (
              <Card className="p-6 rounded-2xl border-primary/20 bg-[#2b2635] text-foreground">
                <h3 className="font-semibold mb-1">Connect your accounts</h3>
                <p className="text-sm text-foreground mb-4">
                  Link Facebook, Instagram (via Meta), or YouTube. Manual handles stay on your profile too.
                </p>
                <SocialConnectButtons layout="stack" className="sm:flex-row sm:flex-wrap" />
              </Card>
            )}

            {/* Social Media */}
            {talent.socialMedia && (
              <Card className="p-6 rounded-2xl">
                <h3 className="font-semibold mb-4">Social Media</h3>
                <div className="space-y-3">
                  {talent.socialMedia.instagram && (
                    <a
                      href={`https://instagram.com/${talent.socialMedia.instagram}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 p-3 rounded-xl hover:bg-background transition-colors"
                  >
                    <Instagram className="w-5 h-5 text-foreground" />
                    <span className="text-sm">{talent.socialMedia.instagram}</span>
                  </a>
                )}
                {talent.socialMedia.youtube && (
                  <a
                    href={`https://youtube.com/@${talent.socialMedia.youtube}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 p-3 rounded-xl hover:bg-background transition-colors"
                  >
                    <Youtube className="w-5 h-5 text-foreground" />
                    <span className="text-sm">{talent.socialMedia.youtube}</span>
                  </a>
                )}
                {talent.socialMedia.twitter && (
                  <a
                    href={`https://twitter.com/${talent.socialMedia.twitter}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 p-3 rounded-xl hover:bg-background transition-colors"
                  >
                    <Twitter className="w-5 h-5 text-primary" />
                    <span className="text-sm">{talent.socialMedia.twitter}</span>
                  </a>
                )}
              </div>
              </Card>
            )}

            {/* Category */}
            <Card className="p-6 rounded-2xl">
              <h3 className="font-semibold mb-4">Category</h3>
              <Badge className="bg-primary text-[#2b2635] text-foreground">{talent.category}</Badge>
            </Card>

            {/* Recommended Talents */}
            {similarTalents.length > 0 && (
              <Card className="p-6 rounded-2xl">
                <h3 className="font-semibold mb-4">Similar Talents</h3>
                <div className="space-y-4">
                  {similarTalents.map((t) => (
                    <Link
                      key={t._id}
                      to={`/talent/${t._id}`}
                      className="flex items-center gap-3 hover:bg-background p-2 rounded-xl transition-colors"
                    >
                      <img
                        src={t.profileImage}
                        alt={t.name}
                        className="w-12 h-12 rounded-lg object-cover"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-sm truncate">{t.name}</div>
                        <div className="text-xs text-foreground truncate">
                          {formatFollowers(t.followers)} followers
                        </div>
                      </div>
                    </Link>
                  ))}
              </div>
            </Card>
            )}
          </div>
        </div>
      </div>

      <Footer />
      <BottomNav />
    </div>
  );
}
