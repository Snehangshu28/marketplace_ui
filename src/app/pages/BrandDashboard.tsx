import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import BottomNav from '../components/BottomNav';
import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Link } from 'react-router';
import {
  LayoutDashboard,
  Users,
  Briefcase,
  MessageSquare,
  Bookmark,
  TrendingUp,
  Eye,
  UserPlus,
  Calendar,
  DollarSign,
  ArrowUpRight,
  ChevronRight,
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, AreaChart, Area } from 'recharts';
import { useState, useEffect } from 'react';
import InvitesList from '../components/InvitesList';
import { motion } from 'motion/react';

const performanceData = [
  { month: 'Jan', campaigns: 4, engagement: 3200 },
  { month: 'Feb', campaigns: 6, engagement: 4800 },
  { month: 'Mar', campaigns: 8, engagement: 6400 },
  { month: 'Apr', campaigns: 5, engagement: 5200 },
  { month: 'May', campaigns: 9, engagement: 7800 },
  { month: 'Jun', campaigns: 12, engagement: 9600 },
];

const savedTalents = [
  { name: 'Sarah Johnson', category: 'Influencer', followers: '850K', image: 'https://images.unsplash.com/photo-1615843644216-14d9b92a02ce?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=400' },
  { name: 'Marcus Williams', category: 'Athlete', followers: '1.2M', image: 'https://images.unsplash.com/photo-1671518707590-4900d05ad5e2?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=400' },
  { name: 'Emma Rodriguez', category: 'Player', followers: '650K', image: 'https://images.unsplash.com/photo-1758179761789-87792b6132a4?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=400' },
];

import { useAuth } from '../../context/AuthContext';
import { apiUrl, fetchWithIdToken } from '@/lib/api';

export default function BrandDashboard() {
  const { userData, currentUser, loading: authLoading } = useAuth();
  const [campaignCount, setCampaignCount] = useState<number | null>(null);
  const [connections, setConnections] = useState<any[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch(apiUrl('/campaigns/count?status=open'));
        const data = await res.json();
        if (data.success) {
          setCampaignCount(data.data.count);
        }
      } catch (error) {
        console.error('Error fetching campaign count:', error);
      }

      try {
        if (authLoading || !currentUser) return;
        const res = await fetchWithIdToken('/connections', currentUser);
        const data = await res.json();
        if (data.success) {
          setConnections(data.data);
        }
      } catch (error) {
        console.error('Error fetching connections:', error);
      }
    };
    fetchData();
  }, [currentUser, authLoading]);

  const statCards = [
    { icon: Briefcase, label: 'Campaigns', value: campaignCount !== null ? campaignCount : '...', change: '+12%', gradient: 'from-[#c0ff00]/20 to-[#c0ff00]/5' },
    { icon: Users, label: 'Collaborations', value: '156', change: '+8%', gradient: 'from-[#7c3aed]/20 to-[#7c3aed]/5' },
    { icon: TrendingUp, label: 'Total Reach', value: '4.8M', change: '+24%', gradient: 'from-[#06d6a0]/20 to-[#06d6a0]/5' },
    { icon: DollarSign, label: 'Total Spent', value: '$84K', change: '+16%', gradient: 'from-[#4cc9f0]/20 to-[#4cc9f0]/5' },
  ];

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-[#342e40] border border-[rgba(192,255,0,0.1)] rounded-xl p-3 shadow-xl">
          <p className="text-xs text-[#9d97a8]">{label}</p>
          {payload.map((p: any, i: number) => (
            <p key={i} className="text-sm font-semibold text-[#e8e6ed]">{p.value}</p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="min-h-screen bg-[#2b2635]">
      <Navbar variant="dashboard" />

      {/* No sidebar – modern mobile-first layout */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 md:py-8 pb-bottom-nav">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 md:mb-8">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold mb-1 text-[#e8e6ed]">
              Welcome back, {userData?.fullName || userData?.name || 'Creator'}! 👋
            </h1>
            <p className="text-sm text-[#9d97a8]">Here's what's happening with your campaigns</p>
          </div>
          {userData?.role !== 'talent' && (
            <Link to="/campaigns">
              <Button className="bg-[#c0ff00] text-[#1a1520] hover:bg-[#a8e000] mt-3 md:mt-0 rounded-full px-5 font-semibold shadow-[0_0_16px_rgba(192,255,0,0.2)]">
                <UserPlus className="w-4 h-4 mr-2" />
                Post Campaign
              </Button>
            </Link>
          )}
        </div>

        {/* Stats Cards – horizontal scroll on mobile */}
        <div className="flex gap-3 md:gap-4 overflow-x-auto hide-scrollbar pb-2 mb-6 md:mb-8 -mx-4 px-4 md:mx-0 md:px-0 md:grid md:grid-cols-4">
          {statCards.map((stat, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: idx * 0.08 }}
              className="flex-shrink-0 w-[160px] md:w-auto"
            >
              <Card className="p-4 md:p-5 glass-card border-0 rounded-[18px] md:rounded-[20px]">
                <div className="flex items-center justify-between mb-3">
                  <div className={`w-10 h-10 rounded-2xl bg-gradient-to-br ${stat.gradient} flex items-center justify-center`}>
                    <stat.icon className="w-5 h-5 text-[#e8e6ed]" />
                  </div>
                  <Badge className="bg-[#c0ff00]/10 text-[#c0ff00] border-0 text-[10px] font-semibold rounded-full">
                    {stat.change}
                  </Badge>
                </div>
                <div className="text-xl md:text-2xl font-bold text-[#e8e6ed] mb-0.5">{stat.value}</div>
                <div className="text-xs text-[#9d97a8]">{stat.label}</div>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6 mb-6 md:mb-8">
          <Card className="p-4 md:p-6 glass-card border-0 rounded-[20px]">
            <h3 className="font-semibold text-base md:text-lg mb-4 md:mb-6 text-[#e8e6ed]">Campaign Performance</h3>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={performanceData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(192,255,0,0.06)" />
                <XAxis dataKey="month" stroke="#9d97a8" fontSize={12} />
                <YAxis stroke="#9d97a8" fontSize={12} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="campaigns" fill="#c0ff00" radius={[6, 6, 0, 0]} fillOpacity={0.8} />
              </BarChart>
            </ResponsiveContainer>
          </Card>

          <Card className="p-4 md:p-6 glass-card border-0 rounded-[20px]">
            <h3 className="font-semibold text-base md:text-lg mb-4 md:mb-6 text-[#e8e6ed]">Engagement Trend</h3>
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={performanceData}>
                <defs>
                  <linearGradient id="engagementGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#c0ff00" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#c0ff00" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(192,255,0,0.06)" />
                <XAxis dataKey="month" stroke="#9d97a8" fontSize={12} />
                <YAxis stroke="#9d97a8" fontSize={12} />
                <Tooltip content={<CustomTooltip />} />
                <Area
                  type="monotone"
                  dataKey="engagement"
                  stroke="#c0ff00"
                  strokeWidth={2}
                  fill="url(#engagementGradient)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
          {/* Active Campaigns & Invites */}
          <div className="lg:col-span-2 space-y-4 md:space-y-6">
            <Card className="p-4 md:p-6 glass-card border-0 rounded-[20px]">
              <InvitesList />
            </Card>

            <Card className="p-4 md:p-6 glass-card border-0 rounded-[20px]">
              <div className="flex items-center justify-between mb-4 md:mb-6">
                <h3 className="font-semibold text-base md:text-lg text-[#e8e6ed]">Active Campaigns</h3>
                <Link to="/campaigns">
                  <Button variant="ghost" size="sm" className="text-[#c0ff00] hover:text-[#c0ff00] hover:bg-[#c0ff00]/5 rounded-full text-xs">
                    View All <ChevronRight className="w-3.5 h-3.5 ml-1" />
                  </Button>
                </Link>
              </div>
              <div className="space-y-3">
                {[
                  {
                    title: 'Summer Athletic Wear Launch',
                    applicants: 24,
                    deadline: 'May 15, 2026',
                    budget: '$5,000 - $10,000',
                    status: 'active',
                  },
                  {
                    title: 'Sustainable Fashion Campaign',
                    applicants: 32,
                    deadline: 'May 20, 2026',
                    budget: '$4,000 - $8,000',
                    status: 'active',
                  },
                  {
                    title: 'Beauty Product Review Series',
                    applicants: 45,
                    deadline: 'Apr 25, 2026',
                    budget: '$2,500 - $5,000',
                    status: 'pending',
                  },
                ].map((campaign, index) => (
                  <div
                    key={index}
                    className="p-3 md:p-4 bg-[#3d3549]/30 rounded-[14px] md:rounded-[16px] hover:bg-[#3d3549]/50 transition-colors cursor-pointer group"
                  >
                    <div className="flex items-start justify-between mb-2 md:mb-3">
                      <h4 className="font-semibold text-sm md:text-base text-[#e8e6ed] group-hover:text-[#c0ff00] transition-colors">{campaign.title}</h4>
                      <Badge
                        className={`text-[10px] rounded-full border-0 ${
                          campaign.status === 'active'
                            ? 'bg-[#c0ff00]/10 text-[#c0ff00]'
                            : 'bg-[#ff6b6b]/10 text-[#ff6b6b]'
                        }`}
                      >
                        {campaign.status}
                      </Badge>
                    </div>
                    <div className="flex flex-wrap items-center gap-3 md:gap-6 text-xs text-[#9d97a8]">
                      <div className="flex items-center gap-1">
                        <UserPlus className="w-3.5 h-3.5 text-[#c0ff00]/40" />
                        <span>{campaign.applicants} applicants</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5 text-[#c0ff00]/40" />
                        <span>{campaign.deadline}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <DollarSign className="w-3.5 h-3.5 text-[#c0ff00]/40" />
                        <span>{campaign.budget}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>

          {/* My Connections */}
          <Card className="p-4 md:p-6 glass-card border-0 rounded-[20px]">
            <div className="flex items-center justify-between mb-4 md:mb-6">
              <h3 className="font-semibold text-base md:text-lg text-[#e8e6ed]">Connections</h3>
              <Link to={userData?.role === 'talent' ? "/explore-brands" : "/explore"}>
                <Button variant="ghost" size="sm" className="text-[#c0ff00] hover:text-[#c0ff00] hover:bg-[#c0ff00]/5 rounded-full text-xs">
                  Find More <ChevronRight className="w-3.5 h-3.5 ml-1" />
                </Button>
              </Link>
            </div>
            <div className="space-y-3">
              {connections.length > 0 ? connections.map((conn, index) => (
                <div key={index} className="flex items-center gap-3 p-2 rounded-xl hover:bg-[#3d3549]/30 transition-colors">
                  {conn.profileImage ? (
                    <img
                      src={conn.profileImage}
                      alt={conn.name}
                      className="w-10 h-10 md:w-11 md:h-11 rounded-2xl object-cover border border-[rgba(192,255,0,0.1)]"
                    />
                  ) : (
                    <div className="w-10 h-10 md:w-11 md:h-11 bg-[#c0ff00]/10 rounded-2xl flex items-center justify-center text-[#c0ff00] font-bold uppercase text-sm">
                      {conn.name?.charAt(0) || 'U'}
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-sm text-[#e8e6ed] truncate">{conn.name}</div>
                    <div className="text-xs text-[#9d97a8]">{conn.role || 'User'}</div>
                  </div>
                  <Link to="/chat">
                    <Button size="icon" variant="ghost" className="text-[#c0ff00] hover:bg-[#c0ff00]/10 rounded-xl h-8 w-8">
                      <MessageSquare className="w-4 h-4" />
                    </Button>
                  </Link>
                </div>
              )) : (
                <p className="text-sm text-[#9d97a8] text-center py-6">No connections yet.</p>
              )}
              <Link to={userData?.role === 'talent' ? "/explore-brands" : "/explore"}>
                <Button variant="outline" className="w-full mt-2 border-[rgba(192,255,0,0.15)] text-[#e8e6ed] hover:bg-[#342e40] rounded-xl">
                  {userData?.role === 'talent' ? 'Find More Brands' : 'Find More Talents'}
                </Button>
              </Link>
            </div>
          </Card>
        </div>
      </main>

      <Footer />
      <BottomNav />
    </div>
  );
}
