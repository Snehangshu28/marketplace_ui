import { Link, useLocation } from 'react-router';
import { Home, Search, PlusCircle, Calendar, User } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function BottomNav() {
  const location = useLocation();
  const { currentUser, userData } = useAuth();
  const path = location.pathname;

  const explorePath = userData?.role === 'talent' ? '/explore-brands' : '/explore';

  const items = [
    { icon: Home, label: 'Home', href: currentUser ? '/dashboard' : '/' },
    { icon: Search, label: 'Explore', href: explorePath },
    { icon: PlusCircle, label: 'Create', href: '/events/create', isCreate: true },
    { icon: Calendar, label: 'Feed', href: '/feed' },
    { icon: User, label: 'Profile', href: currentUser ? '/profile' : '/auth' },
  ];

  const isActive = (href: string) => {
    if (href === '/dashboard' && path === '/dashboard') return true;
    if (href === '/' && path === '/') return true;
    if (href !== '/' && href !== '/dashboard' && path.startsWith(href)) return true;
    return false;
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 md:hidden">
      {/* Blur background */}
      <div className="absolute inset-0 bg-[#1a1520]/80 backdrop-blur-xl border-t border-[rgba(192,255,0,0.08)]" />
      
      <div className="relative flex items-end justify-around px-2 pb-[env(safe-area-inset-bottom)] h-[72px]">
        {items.map((item) => {
          const active = isActive(item.href);

          if (item.isCreate) {
            return (
              <Link
                key={item.label}
                to={currentUser ? item.href : '/auth'}
                className="flex flex-col items-center -mt-5 relative group"
              >
                {/* Glow ring */}
                <div className="absolute -inset-2 rounded-full bg-[#c0ff00]/10 blur-xl group-active:bg-[#c0ff00]/20 transition-all" />
                <div className="relative w-14 h-14 rounded-full bg-gradient-to-br from-[#c0ff00] to-[#a0e000] flex items-center justify-center shadow-[0_0_24px_rgba(192,255,0,0.35)] active:scale-95 transition-transform">
                  <PlusCircle className="w-7 h-7 text-[#1a1520] stroke-[2.5]" />
                </div>
                <span className="text-[10px] mt-1 font-medium text-[#c0ff00]">Create</span>
              </Link>
            );
          }

          return (
            <Link
              key={item.label}
              to={item.href}
              className="flex flex-col items-center pt-2 pb-1 px-3 relative group"
            >
              {/* Active indicator dot */}
              {active && (
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-5 h-[3px] rounded-full bg-[#c0ff00] shadow-[0_0_8px_rgba(192,255,0,0.5)]" />
              )}
              <item.icon
                className={`w-6 h-6 transition-colors ${
                  active ? 'text-[#c0ff00]' : 'text-[#9d97a8] group-active:text-[#c0ff00]'
                }`}
              />
              <span
                className={`text-[10px] mt-1 font-medium transition-colors ${
                  active ? 'text-[#c0ff00]' : 'text-[#9d97a8]'
                }`}
              >
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
