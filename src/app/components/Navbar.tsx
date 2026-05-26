import { Link } from 'react-router';
import { Button } from '../components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../components/ui/dropdown-menu';
import { Menu, X, User, LogOut, Settings, Search } from 'lucide-react';
import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import NotificationsPopover from './NotificationsPopover';
import logo from '../../assets/marketplace_logo.jpeg';

interface NavbarProps {
  variant?: 'default' | 'dashboard';
  showSearch?: boolean;
}

export default function Navbar({ variant = 'default', showSearch = false }: NavbarProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { currentUser, logout, userData } = useAuth();

  if (variant === 'dashboard') {
    return (
      <header className="sticky top-0 z-50 bg-[#1a1520]/80 backdrop-blur-xl border-b border-[rgba(192,255,0,0.06)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14 md:h-16">
            <Link to="/dashboard" className="flex items-center gap-2">
              <img src={logo} alt="TalentMatch Logo" className="w-32 h-7 md:w-35 md:h-8 rounded-lg object-cover" />
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-6 lg:gap-8">
              {userData?.role === 'talent' ? (
                <Link to="/explore-brands" className="text-sm text-[#9d97a8] hover:text-[#c0ff00] transition-colors font-medium">
                  Find Brands
                </Link>
              ) : (
                <Link to="/explore" className="text-sm text-[#9d97a8] hover:text-[#c0ff00] transition-colors font-medium">
                  Find Talents
                </Link>
              )}
              <Link to="/events" className="text-sm text-[#9d97a8] hover:text-[#c0ff00] transition-colors font-medium">
                Events
              </Link>
              <Link to="/feed" className="text-sm text-[#9d97a8] hover:text-[#c0ff00] transition-colors font-medium">
                Feed
              </Link>
              <Link to="/campaigns" className="text-sm text-[#9d97a8] hover:text-[#c0ff00] transition-colors font-medium">
                Campaigns
              </Link>
              <Link to="/#how-it-works" className="text-sm text-[#9d97a8] hover:text-[#c0ff00] transition-colors font-medium">
                How it Works
              </Link>
            </nav>

            <div className="flex items-center gap-2 sm:gap-3">
              <Link to="/dashboard" className="hidden md:block">
                <Button variant="ghost" size="sm" className="text-[#9d97a8] hover:text-[#c0ff00] hover:bg-[#c0ff00]/5">
                  Dashboard
                </Button>
              </Link>
              <NotificationsPopover />
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="overflow-hidden rounded-full border border-[rgba(192,255,0,0.15)] h-8 w-8 md:h-9 md:w-9 hover:border-[rgba(192,255,0,0.3)] transition-colors"
                    aria-label="Account menu"
                  >
                    {userData?.profileImage ? (
                      <img src={userData.profileImage} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <User className="w-4 h-4 md:w-5 md:h-5 text-[#9d97a8]" />
                    )}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-52 bg-[#342e40] border-[rgba(192,255,0,0.1)]">
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-0.5">
                      <span className="text-sm font-medium truncate text-[#e8e6ed]">
                        {userData?.fullName || userData?.name || 'Account'}
                      </span>
                      {userData?.email && (
                        <span className="text-xs text-[#9d97a8] truncate">{userData.email}</span>
                      )}
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator className="bg-[rgba(192,255,0,0.08)]" />
                  <DropdownMenuItem asChild>
                    <Link to="/profile" className="cursor-pointer text-[#e8e6ed] hover:text-[#c0ff00]">
                      <User className="mr-2 h-4 w-4" />
                      Profile
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/settings" className="cursor-pointer text-[#e8e6ed] hover:text-[#c0ff00]">
                      <Settings className="mr-2 h-4 w-4" />
                      Settings
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator className="bg-[rgba(192,255,0,0.08)]" />
                  <DropdownMenuItem
                    className="text-[#ff4d6a] focus:text-[#ff4d6a] cursor-pointer"
                    onClick={() => logout()}
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    Log out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </header>
    );
  }

  return (
    <header className="sticky top-0 z-50 bg-[#1a1520]/80 backdrop-blur-xl border-b border-[rgba(192,255,0,0.06)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14 md:h-16">
          <Link to="/" className="flex items-center gap-2">
            <img src={logo} alt="TalentMatch Logo" className="w-32 h-7 md:w-35 md:h-8 rounded-lg object-cover" />
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-6 lg:gap-8">
            {userData?.role === 'talent' ? (
              <Link to="/explore-brands" className="text-sm text-[#9d97a8] hover:text-[#c0ff00] transition-colors font-medium">
                Find Brands
              </Link>
            ) : (
              <Link to="/explore" className="text-sm text-[#9d97a8] hover:text-[#c0ff00] transition-colors font-medium">
                Find Talents
              </Link>
            )}
            <Link to="/events" className="text-sm text-[#9d97a8] hover:text-[#c0ff00] transition-colors font-medium">
              Events
            </Link>
            <Link to="/feed" className="text-sm text-[#9d97a8] hover:text-[#c0ff00] transition-colors font-medium">
              Feed
            </Link>
            {/* {currentUser && (
              <Link to="/my-events" className="text-sm text-[#9d97a8] hover:text-[#c0ff00] transition-colors font-medium">
                My Events
              </Link>
            )} */}
            <Link to="/campaigns" className="text-sm text-[#9d97a8] hover:text-[#c0ff00] transition-colors font-medium">
              Campaigns
            </Link>
            <Link to="/#how-it-works" className="text-sm text-[#9d97a8] hover:text-[#c0ff00] transition-colors font-medium">
              How it Works
            </Link>
            {currentUser ? (
              <div className="flex items-center gap-3">
                <Link to="/dashboard">
                  <Button variant="ghost" size="sm" className="text-[#9d97a8] hover:text-[#c0ff00] hover:bg-[#c0ff00]/5">
                    Dashboard
                  </Button>
                </Link>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => logout()}
                  className="border-[rgba(192,255,0,0.2)] text-[#9d97a8] hover:text-[#e8e6ed] hover:border-[rgba(192,255,0,0.3)]"
                >
                  Log Out
                </Button>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <Link to="/auth">
                  <Button variant="ghost" size="sm" className="text-[#9d97a8] hover:text-[#c0ff00]">Log In</Button>
                </Link>
                <Link to="/auth">
                  <Button size="sm" className="bg-[#c0ff00] text-[#1a1520] hover:bg-[#a8e000] font-semibold rounded-full px-5 shadow-[0_0_16px_rgba(192,255,0,0.2)]">
                    Get Started
                  </Button>
                </Link>
              </div>
            )}
          </nav>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2 rounded-xl hover:bg-[#342e40] transition-colors"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5 text-[#e8e6ed]" /> : <Menu className="w-5 h-5 text-[#e8e6ed]" />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-[rgba(192,255,0,0.06)] animate-in slide-in-from-top-2 duration-200">
            <nav className="flex flex-col gap-1">
              {userData?.role === 'talent' ? (
                <Link
                  to="/explore-brands"
                  className="text-[#e8e6ed] hover:text-[#c0ff00] transition-colors px-4 py-3 rounded-xl hover:bg-[#342e40]/50"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Find Brands
                </Link>
              ) : (
                <Link
                  to="/explore"
                  className="text-[#e8e6ed] hover:text-[#c0ff00] transition-colors px-4 py-3 rounded-xl hover:bg-[#342e40]/50"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Find Talents
                </Link>
              )}
              <Link
                to="/events"
                className="text-[#e8e6ed] hover:text-[#c0ff00] transition-colors px-4 py-3 rounded-xl hover:bg-[#342e40]/50"
                onClick={() => setMobileMenuOpen(false)}
              >
                Events
              </Link>
              <Link
                to="/feed"
                className="text-[#e8e6ed] hover:text-[#c0ff00] transition-colors px-4 py-3 rounded-xl hover:bg-[#342e40]/50"
                onClick={() => setMobileMenuOpen(false)}
              >
                Feed
              </Link>
              {currentUser && (
                <Link
                  to="/my-events"
                  className="text-[#e8e6ed] hover:text-[#c0ff00] transition-colors px-4 py-3 rounded-xl hover:bg-[#342e40]/50"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  My Events
                </Link>
              )}
              <Link
                to="/campaigns"
                className="text-[#e8e6ed] hover:text-[#c0ff00] transition-colors px-4 py-3 rounded-xl hover:bg-[#342e40]/50"
                onClick={() => setMobileMenuOpen(false)}
              >
                Campaigns
              </Link>
              <Link
                to="/#how-it-works"
                className="text-[#e8e6ed] hover:text-[#c0ff00] transition-colors px-4 py-3 rounded-xl hover:bg-[#342e40]/50"
                onClick={() => setMobileMenuOpen(false)}
              >
                How it Works
              </Link>
              <div className="flex flex-col gap-2 px-4 pt-3 mt-2 border-t border-[rgba(192,255,0,0.06)]">
                {currentUser ? (
                  <>
                    <Link to="/dashboard" onClick={() => setMobileMenuOpen(false)}>
                      <Button variant="ghost" className="w-full justify-start text-[#e8e6ed]">
                        Dashboard
                      </Button>
                    </Link>
                    <Button 
                      variant="outline" 
                      className="w-full border-[rgba(192,255,0,0.15)] text-[#9d97a8]" 
                      onClick={() => {
                        logout();
                        setMobileMenuOpen(false);
                      }}
                    >
                      Log Out
                    </Button>
                  </>
                ) : (
                  <>
                    <Link to="/auth" onClick={() => setMobileMenuOpen(false)}>
                      <Button variant="ghost" className="w-full text-[#e8e6ed]">
                        Log In
                      </Button>
                    </Link>
                    <Link to="/auth" onClick={() => setMobileMenuOpen(false)}>
                      <Button className="w-full bg-[#c0ff00] text-[#1a1520] hover:bg-[#a8e000] font-semibold rounded-full">
                        Get Started
                      </Button>
                    </Link>
                  </>
                )}
              </div>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}
