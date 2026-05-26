import { Link } from 'react-router';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import BottomNav from '../components/BottomNav';
import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { useAuth } from '../../context/AuthContext';
import { ArrowLeft, Mail, Bell } from 'lucide-react';

export default function SettingsPage() {
  const { userData } = useAuth();

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
            <h1 className="text-xl md:text-2xl font-bold text-[#e8e6ed]">Settings</h1>
            <p className="text-xs md:text-sm text-[#9d97a8]">Account and preferences</p>
          </div>
        </div>

        <Card className="p-4 md:p-6 glass-card border-0 rounded-[20px]">
          <div className="flex items-start gap-3 mb-4">
            <Mail className="w-5 h-5 text-[#c0ff00] mt-0.5" />
            <div>
              <h2 className="font-semibold text-[#e8e6ed]">Account</h2>
              <p className="text-sm text-[#9d97a8] mt-1">Signed in as</p>
              <p className="text-sm font-medium text-[#e8e6ed] mt-0.5">{userData?.email || '—'}</p>
            </div>
          </div>
          <Button variant="outline" size="sm" asChild className="border-[rgba(192,255,0,0.15)] text-[#e8e6ed] hover:bg-[#342e40] rounded-xl">
            <Link to="/profile">Edit profile</Link>
          </Button>
        </Card>

        <Card className="p-4 md:p-6 glass-card border-0 rounded-[20px]">
          <div className="flex items-start gap-3">
            <Bell className="w-5 h-5 text-[#c0ff00] mt-0.5" />
            <div>
              <h2 className="font-semibold text-[#e8e6ed]">Notifications</h2>
              <p className="text-sm text-[#9d97a8] mt-2">
                Invite and message alerts appear in the bell menu on your dashboard. More notification controls can be
                added here later.
              </p>
            </div>
          </div>
        </Card>
      </main>
      <Footer />
      <BottomNav />
    </div>
  );
}
