import { Link, useSearchParams } from 'react-router';
import { useEffect } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import BottomNav from '../components/BottomNav';
import ProfilePanel from '../components/ProfilePanel';
import SocialConnectButtons from '../components/SocialConnectButtons';
import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { fetchWithIdToken } from '@/lib/api';
import { toast } from 'sonner';

function formatCount(n: number): string {
  if (!Number.isFinite(n) || n < 0) return '—';
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1).replace(/\.0$/, '')}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1).replace(/\.0$/, '')}K`;
  return String(Math.round(n));
}

export default function ProfilePage() {
  const { userData, userRole, currentUser, setUserData } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const isTalent = userData?.role === 'talent' || userRole === 'talent';

  useEffect(() => {
    const oauthErr = searchParams.get('oauth_error');
    const oauth = searchParams.get('oauth');
    const message = searchParams.get('message');

    if (oauthErr) {
      toast.error(
        oauthErr === 'meta' ? 'Facebook / Instagram connection failed' : 'YouTube connection failed',
        { description: message || undefined },
      );
      setSearchParams({}, { replace: true });
      return;
    }

    if (!oauth || !currentUser) return;

    const snap = new URLSearchParams(searchParams.toString());
    setSearchParams({}, { replace: true });

    const run = async () => {
      try {
        const body: Record<string, unknown> = {
          socialSyncedAt: new Date().toISOString(),
        };

        if (oauth === 'meta') {
          const igUser = snap.get('instagram_username');
          const igF = snap.get('instagram_followers');
          const fbPage = snap.get('facebook_page');
          const fbF = snap.get('facebook_followers');
          if (igUser) body.instagram = igUser.replace(/^@/, '').trim();
          if (igF != null && igF !== '') {
            const n = parseInt(igF, 10);
            if (!Number.isNaN(n)) body.instagramFollowers = n;
          }
          if (fbPage) body.facebook = fbPage.trim();
          if (fbF != null && fbF !== '') {
            const n = parseInt(fbF, 10);
            if (!Number.isNaN(n)) body.facebookPageFollowers = n;
          }
        } else if (oauth === 'youtube') {
          const sub = snap.get('youtube_subscribers');
          const handle = snap.get('youtube_handle');
          if (handle) body.youtube = handle.replace(/^@/, '').trim();
          if (sub != null && sub !== '') {
            const n = parseInt(sub, 10);
            if (!Number.isNaN(n)) body.youtubeSubscribers = n;
          }
        }

        const res = await fetchWithIdToken('/users/profile', currentUser, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
        });
        const json = await res.json().catch(() => ({}));
        if (!res.ok) {
          toast.error('Could not save connected account', {
            description: (json && json.message) || `HTTP ${res.status}`,
          });
          return;
        }

        const saved = json.data ?? json;
        setUserData(saved);
        if (oauth === 'meta') {
          const sm = saved.socialMedia || {};
          toast.success('Facebook & Instagram connected', {
            description: [
              sm.instagramFollowers != null
                ? `Instagram ~${formatCount(Number(sm.instagramFollowers))} followers`
                : null,
              sm.facebookPageFollowers != null
                ? `Facebook page ~${formatCount(Number(sm.facebookPageFollowers))}`
                : null,
            ]
              .filter(Boolean)
              .join(' · '),
          });
        } else {
          toast.success('YouTube connected', {
            description:
              saved.socialMedia?.youtubeSubscribers != null
                ? `~${formatCount(Number(saved.socialMedia.youtubeSubscribers))} subscribers`
                : undefined,
          });
        }
      } catch {
        toast.error('Network error while saving social connection');
      }
    };

    void run();
  }, [searchParams, currentUser, setSearchParams, setUserData]);

  return (
    <div className="min-h-screen bg-[#2b2635] flex flex-col">
      <Navbar variant="dashboard" />
      <main className="flex-1 max-w-2xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-4 md:py-8 pb-bottom-nav space-y-4 md:space-y-6">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" asChild className="shrink-0 hover:bg-[#342e40] rounded-xl">
            <Link to="/dashboard" aria-label="Back to dashboard">
              <ArrowLeft className="w-5 h-5 text-[#e8e6ed]" />
            </Link>
          </Button>
          <div>
            <h1 className="text-xl md:text-2xl font-bold text-[#e8e6ed]">Profile</h1>
            <p className="text-xs md:text-sm text-[#9d97a8]">View and edit how others see you</p>
          </div>
        </div>

        {isTalent && (
          <Card className="p-4 md:p-6 glass-card border-0 rounded-[20px]">
            <h2 className="text-base md:text-lg font-semibold text-[#e8e6ed] mb-1">Connect your social accounts</h2>
            <p className="text-xs md:text-sm text-[#9d97a8] mb-4">
              Link Facebook and Instagram through Meta, or connect YouTube. You can still add handles manually in your
              profile below.
            </p>
            <SocialConnectButtons layout="stack" className="sm:flex-row sm:flex-wrap" />
          </Card>
        )}

        <Card className="p-4 sm:p-6 md:p-8 glass-card border-0 rounded-[20px]">
          <ProfilePanel showHeading={false} fetchOnMount />
        </Card>
      </main>
      <Footer />
      <BottomNav />
    </div>
  );
}
