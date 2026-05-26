import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from './ui/dialog';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { useAuth } from '../../context/AuthContext';
import { Users, Activity, Mail, MapPin, Instagram, Youtube, Twitter, Hash, Link as LinkIcon, ExternalLink } from 'lucide-react';
import { apiUrl } from '@/lib/api';

interface ChatProfileModalProps {
  userId: string;
  isOpen: boolean;
  onClose: () => void;
}

export default function ChatProfileModal({ userId, isOpen, onClose }: ChatProfileModalProps) {
  const { currentUser } = useAuth();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      if (!userId || !isOpen || !currentUser) return;
      
      setLoading(true);
      setError(null);
      try {
        const token = await currentUser.getIdToken();
        const response = await fetch(apiUrl(`/users/${userId}`), {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        const data = await response.json();
        if (data.success) {
          setProfile(data.data);
        } else {
          setError(data.message || 'Failed to fetch profile');
        }
      } catch (err) {
        console.error('Error fetching profile:', err);
        setError('Connection error. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [userId, isOpen]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-center">User Profile</DialogTitle>
        </DialogHeader>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-12 space-y-4">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            <p className="text-foreground text-sm animate-pulse">Fetching details...</p>
          </div>
        ) : error ? (
          <div className="py-12 text-center">
            <div className="bg-background text-foreground p-4 rounded-lg inline-block border border-border">
              {error}
            </div>
          </div>
        ) : profile ? (
          <div className="space-y-6 animate-in fade-in zoom-in duration-300">
            {/* Header Section */}
            <div className="flex flex-col items-center gap-4">
              <div className="relative">
                <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-border shadow-lg bg-[#2b2635] text-foreground flex items-center justify-center">
                  {profile.profileImage ? (
                    <img src={profile.profileImage} alt={profile.name} className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-3xl font-bold text-primary uppercase">
                      {profile.name?.charAt(0)}
                    </span>
                  )}
                </div>
                <div className="absolute bottom-0 right-0 w-6 h-6 bg-background border-2 border-border rounded-full"></div>
              </div>
              
              <div className="text-center">
                <h3 className="text-2xl font-bold text-foreground">{profile.fullName || profile.name}</h3>
                <p className="text-primary font-medium">@{profile.displayName || profile.name?.toLowerCase().replace(/\s+/g, '')}</p>
                <div className="flex justify-center flex-wrap gap-2 mt-2">
                  <Badge variant="secondary" className="bg-primary/10 text-primary border-none capitalize">{profile.role}</Badge>
                  {profile.category && (
                    <Badge className="bg-background text-foreground border-none capitalize">{profile.category}</Badge>
                  )}
                </div>
              </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 gap-3">
              <Card className="p-4 flex items-center gap-3 bg-background hover:bg-background transition-colors border-none shadow-sm">
                <div className="bg-primary/20 p-2 rounded-lg">
                  <Users className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-xs text-foreground font-medium uppercase tracking-wider">Followers</p>
                  <p className="text-lg font-bold text-foreground">{profile.followers || '0'}</p>
                </div>
              </Card>
              <Card className="p-4 flex items-center gap-3 bg-background hover:bg-background transition-colors border-none shadow-sm">
                <div className="bg-background p-2 rounded-lg">
                  <Activity className="w-5 h-5 text-foreground" />
                </div>
                <div>
                  <p className="text-xs text-foreground font-medium uppercase tracking-wider">Engagement</p>
                  <p className="text-lg font-bold text-foreground">{profile.engagementRate || '0%'}</p>
                </div>
              </Card>
            </div>

            {/* Info Section */}
            <div className="space-y-4">
              {profile.bio && (
                <div>
                  <h4 className="text-sm font-bold text-foreground flex items-center gap-2 mb-2 uppercase tracking-tight">
                    About
                  </h4>
                  <div className="bg-background p-4 rounded-xl border border-border italic text-foreground text-sm leading-relaxed">
                    {profile.bio}
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <h4 className="text-sm font-bold text-foreground uppercase tracking-tight">Contact & Location</h4>
                <div className="grid gap-2">
                   <div className="flex items-center gap-3 p-3 bg-background rounded-xl text-foreground hover:bg-background transition-colors">
                      <Mail className="w-4 h-4" />
                      <span className="text-sm font-medium">{profile.email}</span>
                   </div>
                   {profile.location && (
                     <div className="flex items-center gap-3 p-3 bg-background rounded-xl text-foreground">
                        <MapPin className="w-4 h-4" />
                        <span className="text-sm font-medium">{profile.location}</span>
                     </div>
                   )}
                </div>
              </div>

              {/* Social Media Links */}
              {profile.socialMedia && Object.values(profile.socialMedia).some(v => v) && (
                <div className="space-y-3">
                  <h4 className="text-sm font-bold text-foreground uppercase tracking-tight">Social Networks</h4>
                  <div className="grid grid-cols-2 gap-2">
                    {profile.socialMedia.instagram && (
                      <a href={`https://instagram.com/${profile.socialMedia.instagram}`} target="_blank" rel="noreferrer" 
                        className="flex items-center gap-2 p-2 rounded-lg border border-border bg-background text-foreground hover:bg-background transition-all group">
                        <Instagram className="w-4 h-4" />
                        <span className="text-xs font-semibold truncate">Instagram</span>
                        <ExternalLink className="w-3 h-3 ml-auto opacity-0 group-hover:opacity-100" />
                      </a>
                    )}
                    {profile.socialMedia.youtube && (
                      <a href={`https://youtube.com/@${profile.socialMedia.youtube}`} target="_blank" rel="noreferrer"
                        className="flex items-center gap-2 p-2 rounded-lg border border-border bg-background text-foreground hover:bg-background transition-all group">
                        <Youtube className="w-4 h-4" />
                        <span className="text-xs font-semibold truncate">YouTube</span>
                        <ExternalLink className="w-3 h-3 ml-auto opacity-0 group-hover:opacity-100" />
                      </a>
                    )}
                    {profile.socialMedia.twitter && (
                      <a href={`https://twitter.com/${profile.socialMedia.twitter}`} target="_blank" rel="noreferrer"
                        className="flex items-center gap-2 p-2 rounded-lg border border-primary/20 bg-primary/10 text-primary hover:bg-primary/10 transition-all group">
                        <Twitter className="w-4 h-4" />
                        <span className="text-xs font-semibold truncate">Twitter</span>
                        <ExternalLink className="w-3 h-3 ml-auto opacity-0 group-hover:opacity-100" />
                      </a>
                    )}
                    {profile.socialMedia.tiktok && (
                      <a href={`https://tiktok.com/@${profile.socialMedia.tiktok}`} target="_blank" rel="noreferrer"
                        className="flex items-center gap-2 p-2 rounded-lg border border-border bg-background text-foreground hover:bg-background transition-all group">
                        <Hash className="w-4 h-4" />
                        <span className="text-xs font-semibold truncate">TikTok</span>
                        <ExternalLink className="w-3 h-3 ml-auto opacity-0 group-hover:opacity-100" />
                      </a>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}
