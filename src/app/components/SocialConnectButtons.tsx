import { Button } from './ui/button';
import { Facebook, Instagram, Youtube } from 'lucide-react';
import { metaOAuthUrl } from '@/lib/api';
import { toast } from 'sonner';
import { cn } from './ui/utils';

interface SocialConnectButtonsProps {
  className?: string;
  layout?: 'row' | 'stack';
}

/**
 * Facebook + Instagram → GET /auth/meta (same Meta login; saves IG + linked Facebook Page stats).
 * YouTube → GET /auth/youtube — set VITE_YOUTUBE_OAUTH_URL to that URL (e.g. http://localhost:5001/auth/youtube).
 * After OAuth you are sent back to /profile and counts are saved automatically.
 */
export default function SocialConnectButtons({ className, layout = 'row' }: SocialConnectButtonsProps) {
  const connectMeta = () => {
    window.location.href = metaOAuthUrl();
  };

  const connectYouTube = () => {
    const raw = import.meta.env.VITE_YOUTUBE_OAUTH_URL;
    const url = typeof raw === 'string' ? raw.trim() : '';

    if (!url) {
      toast.error('YouTube sign-in is not configured', {
        description:
          'Create or edit the frontend .env file and set VITE_YOUTUBE_OAUTH_URL to your backend OAuth start URL (e.g. http://localhost:5001/auth/youtube). Restart the Vite dev server after saving.',
      });
      return;
    }

    let parsed: URL;
    try {
      parsed = new URL(url);
    } catch {
      toast.error('Invalid YouTube OAuth URL', {
        description:
          'VITE_YOUTUBE_OAUTH_URL must be a full URL (http:// or https://). Fix .env and restart Vite.',
      });
      return;
    }

    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
      toast.error('Invalid YouTube OAuth URL', {
        description: 'Only http: and https: URLs are allowed.',
      });
      return;
    }

    window.location.href = url;
  };

  return (
    <div
      className={cn(
        'flex flex-col gap-3',
        layout === 'row' && 'sm:flex-row sm:flex-wrap',
        className,
      )}
    >
      <Button
        type="button"
        variant="outline"
        className="gap-2 border-[#1877F2] text-[#1877F2] hover:bg-[#1877F2]/10"
        onClick={connectMeta}
      >
        <Facebook className="w-4 h-4 shrink-0" />
        Connect Facebook
      </Button>
      <Button
        type="button"
        variant="outline"
        className="gap-2 border-border text-foreground hover:bg-background"
        onClick={connectMeta}
      >
        <Instagram className="w-4 h-4 shrink-0" />
        Connect Instagram
      </Button>
      <Button
        type="button"
        variant="outline"
        className="gap-2 border-border text-foreground hover:bg-background"
        onClick={connectYouTube}
      >
        <Youtube className="w-4 h-4 shrink-0" />
        Connect YouTube
      </Button>
    </div>
  );
}
