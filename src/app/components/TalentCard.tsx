
import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { CheckCircle, MapPin, Users, TrendingUp, Bookmark } from 'lucide-react';
import { Link } from 'react-router';
import { motion } from 'motion/react';
import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'sonner';
import { apiUrl } from '@/lib/api';

interface TalentCardProps {
  talent: any;
  isConnected?: boolean;
  isPending?: boolean;
}

export default function TalentCard({ talent, isConnected = false, isPending = false }: TalentCardProps) {
  const [saved, setSaved] = useState(false);
  const [inviting, setInviting] = useState(false);
  const [inviteSent, setInviteSent] = useState(false);
  const { currentUser } = useAuth();

  const handleInvite = async () => {
    if (!currentUser) {
      toast.error('Please login to send invites');
      return;
    }

    setInviting(true);
    try {
      const token = await currentUser.getIdToken();
      const response = await fetch(apiUrl('/invites'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ receiverId: talent.firebaseUid || talent.uid || talent._id || talent.id })
      });

      const data = await response.json();
      if (data.success) {
        setInviteSent(true);
        toast.success('Invite Sent!', {
          description: `You've invited ${talent.name} to collaborate.`
        });
      } else {
        toast.error(data.message || 'Failed to send invite');
      }
    } catch (error) {
      console.error('Invite error:', error);
      toast.error('Something went wrong');
    } finally {
      setInviting(false);
    }
  };

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
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      whileHover={{ y: -4 }}
    >
      <Card className="overflow-hidden glass-card border-0 rounded-[20px] hover:shadow-[0_0_30px_rgba(192,255,0,0.08)] transition-all duration-300 group">
        <div className="relative">
          <div className="w-full h-44 md:h-48 bg-[#342e40] flex items-center justify-center overflow-hidden">
            {talent.profileImage ? (
              <img
                src={talent.profileImage}
                alt={talent.name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
            ) : (
              <span className="text-4xl font-bold text-[#c0ff00] uppercase">{talent.name?.charAt(0) || 'T'}</span>
            )}
          </div>
          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#1a1520]/60 via-transparent to-transparent" />
          <button
            onClick={() => setSaved(!saved)}
            className="absolute top-3 right-3 w-8 h-8 bg-[#1a1520]/50 backdrop-blur-sm rounded-full flex items-center justify-center hover:scale-110 transition-transform border border-white/10"
          >
            <Bookmark
              className={`w-4 h-4 ${saved ? 'fill-[#c0ff00] text-[#c0ff00]' : 'text-white/70'}`}
            />
          </button>
          {talent.verified && (
            <div className="absolute top-3 left-3">
              <Badge className="bg-[#c0ff00] text-[#1a1520] gap-1 text-[10px] font-semibold border-0 rounded-full py-0.5">
                <CheckCircle className="w-3 h-3" />
                Verified
              </Badge>
            </div>
          )}
        </div>

        <div className="p-4 md:p-5">
          <div className="mb-3">
            <h3 className="font-semibold text-base md:text-lg mb-0.5 text-[#e8e6ed] group-hover:text-[#c0ff00] transition-colors truncate">{talent.name}</h3>
            <p className="text-xs md:text-sm text-[#9d97a8]">{talent.subCategory}</p>
          </div>

          <div className="flex items-center gap-3 md:gap-4 mb-3 text-xs md:text-sm">
            <div className="flex items-center gap-1 text-[#9d97a8]">
              <Users className="w-3.5 h-3.5 text-[#c0ff00]/50" />
              <span>{formatFollowers(talent.followers)}</span>
            </div>
            <div className="flex items-center gap-1 text-[#9d97a8]">
              <TrendingUp className="w-3.5 h-3.5 text-[#c0ff00]/50" />
              <span>{talent.engagementRate || 'N/A'}{talent.engagementRate && !talent.engagementRate.includes('%') ? '%' : ''}</span>
            </div>
            <div className="flex items-center gap-1 text-[#9d97a8]">
              <MapPin className="w-3.5 h-3.5 text-[#c0ff00]/50" />
              <span className="truncate">{talent.location ? talent.location.split(',')[0] : 'Remote'}</span>
            </div>
          </div>

          <div className="flex flex-wrap gap-1.5 mb-4">
            {(talent.tags || talent.portfolio || []).slice(0, 3).map((tag: string, idx: number) => (
              <Badge key={idx} className="text-[10px] bg-[#3d3549] text-[#9d97a8] border-0 rounded-full truncate max-w-[100px]">
                {tag}
              </Badge>
            ))}
          </div>

          <div className="flex gap-2">
            {!isConnected ? (
              <>
                <Link to={`/talent/${talent._id || talent.id}`} className="flex-1">
                  <Button variant="outline" className="w-full border-[rgba(192,255,0,0.15)] text-[#e8e6ed] hover:bg-[#342e40] hover:border-[rgba(192,255,0,0.3)] rounded-xl text-sm">
                    View
                  </Button>
                </Link>
                <div className="flex-1">
                  <Button 
                    onClick={handleInvite} 
                    disabled={inviting || inviteSent || isPending}
                    className={`w-full rounded-xl text-sm ${(inviteSent || isPending) ? 'bg-[#342e40] text-[#9d97a8] hover:bg-[#342e40]' : 'bg-[#c0ff00] text-[#1a1520] hover:bg-[#a8e000]'}`}
                  >
                    {inviting ? 'Sending...' : (inviteSent || isPending) ? 'Sent ✓' : 'Invite'}
                  </Button>
                </div>
              </>
            ) : (
              <>
                <Button disabled variant="outline" className="flex-1 bg-[#342e40] text-[#9d97a8] border-0 rounded-xl text-sm">
                  <CheckCircle className="w-3.5 h-3.5 mr-1.5" />
                  Connected
                </Button>
                <Link to="/chat" className="flex-1">
                  <Button className="w-full bg-[#c0ff00] text-[#1a1520] hover:bg-[#a8e000] rounded-xl text-sm">
                    Message
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </Card>
    </motion.div>
  );
}
