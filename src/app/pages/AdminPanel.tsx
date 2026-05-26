import Navbar from '../components/Navbar';
import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Badge } from '../components/ui/badge';
import {
  LayoutDashboard,
  Users,
  Briefcase,
  DollarSign,
  TrendingUp,
  Search,
  MoreVertical,
  CheckCircle,
  XCircle,
  Clock,
} from 'lucide-react';
import { Link } from 'react-router';

const stats = [
  { label: 'Total Users', value: '12,458', change: '+12%', icon: Users, color: 'blue' },
  { label: 'Active Campaigns', value: '342', change: '+8%', icon: Briefcase, color: 'green' },
  { label: 'Revenue', value: '$284K', change: '+24%', icon: DollarSign, color: 'purple' },
  { label: 'Growth Rate', value: '23.5%', change: '+5%', icon: TrendingUp, color: 'orange' },
];

const recentUsers = [
  {
    id: 1,
    name: 'Sarah Johnson',
    email: 'sarah@example.com',
    role: 'Talent',
    status: 'active',
    joined: '2026-03-28',
  },
  {
    id: 2,
    name: 'Nike Inc.',
    email: 'marketing@nike.com',
    role: 'Brand',
    status: 'active',
    joined: '2026-03-27',
  },
  {
    id: 3,
    name: 'Marcus Williams',
    email: 'marcus@example.com',
    role: 'Talent',
    status: 'pending',
    joined: '2026-03-26',
  },
  {
    id: 4,
    name: 'Emma Rodriguez',
    email: 'emma@example.com',
    role: 'Talent',
    status: 'active',
    joined: '2026-03-25',
  },
];

const recentCampaigns = [
  {
    id: 1,
    title: 'Summer Athletic Wear Launch',
    brand: 'Nike',
    budget: '$10K',
    status: 'active',
    applicants: 24,
  },
  {
    id: 2,
    title: 'Gaming Headset Launch',
    brand: 'Razer',
    budget: '$7K',
    status: 'active',
    applicants: 18,
  },
  {
    id: 3,
    title: 'Sustainable Fashion Campaign',
    brand: 'Patagonia',
    budget: '$8K',
    status: 'pending',
    applicants: 32,
  },
];

export default function AdminPanel() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar variant="dashboard" />

      <div className="flex">
        {/* Sidebar */}
        <aside className="hidden lg:block w-64 bg-background border-r border-border min-h-[calc(100vh-4rem)] sticky top-16">
          <nav className="p-4 space-y-1">
            <Link
              to="/admin"
              className="flex items-center gap-3 px-4 py-3 rounded-xl bg-primary/10 text-primary font-medium"
            >
              <LayoutDashboard className="w-5 h-5" />
              <span>Overview</span>
            </Link>
            <Link
              to="/admin/users"
              className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-background transition-colors"
            >
              <Users className="w-5 h-5" />
              <span>Users</span>
            </Link>
            <Link
              to="/admin/campaigns"
              className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-background transition-colors"
            >
              <Briefcase className="w-5 h-5" />
              <span>Campaigns</span>
            </Link>
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-6 lg:p-8">
          <div className="max-w-7xl mx-auto">
            {/* Header */}
            <div className="mb-8">
              <h1 className="text-3xl font-bold mb-2">Admin Dashboard</h1>
              <p className="text-foreground">Monitor and manage your platform</p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {stats.map((stat, index) => {
                const colorClasses = {
                  blue: 'bg-primary/20 text-primary',
                  green: 'bg-background text-foreground',
                  purple: 'bg-background text-foreground',
                  orange: 'bg-background text-foreground',
                };

                return (
                  <Card key={index} className="p-6 rounded-2xl">
                    <div className="flex items-center justify-between mb-4">
                      <div
                        className={`w-12 h-12 ${
                          colorClasses[stat.color as keyof typeof colorClasses]
                        } rounded-xl flex items-center justify-center`}
                      >
                        <stat.icon className="w-6 h-6" />
                      </div>
                      <Badge variant="secondary" className="text-xs">
                        {stat.change}
                      </Badge>
                    </div>
                    <div className="text-2xl font-bold mb-1">{stat.value}</div>
                    <div className="text-sm text-foreground">{stat.label}</div>
                  </Card>
                );
              })}
            </div>

            {/* Tables */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Recent Users */}
              <Card className="p-6 rounded-2xl">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="font-semibold text-lg">Recent Users</h3>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground" />
                    <Input type="text" placeholder="Search..." className="pl-9 h-9 w-48" />
                  </div>
                </div>

                <div className="space-y-3">
                  {recentUsers.map((user) => (
                    <div
                      key={user.id}
                      className="flex items-center justify-between p-3 hover:bg-background rounded-xl transition-colors"
                    >
                      <div className="flex-1">
                        <div className="font-medium text-sm">{user.name}</div>
                        <div className="text-xs text-foreground">{user.email}</div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Badge variant="secondary" className="text-xs">
                          {user.role}
                        </Badge>
                        {user.status === 'active' ? (
                          <CheckCircle className="w-4 h-4 text-foreground" />
                        ) : user.status === 'pending' ? (
                          <Clock className="w-4 h-4 text-foreground" />
                        ) : (
                          <XCircle className="w-4 h-4 text-foreground" />
                        )}
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreVertical className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>

                <Button variant="outline" className="w-full mt-4">
                  View All Users
                </Button>
              </Card>

              {/* Recent Campaigns */}
              <Card className="p-6 rounded-2xl">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="font-semibold text-lg">Recent Campaigns</h3>
                  <Button variant="ghost" size="sm">
                    View All
                  </Button>
                </div>

                <div className="space-y-4">
                  {recentCampaigns.map((campaign) => (
                    <div
                      key={campaign.id}
                      className="p-4 border border-border rounded-xl hover:border-primary transition-colors"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <div className="font-semibold text-sm mb-1">{campaign.title}</div>
                          <div className="text-xs text-foreground">{campaign.brand}</div>
                        </div>
                        <Badge
                          className={
                            campaign.status === 'active'
                              ? 'bg-background text-foreground'
                              : 'bg-background text-foreground'
                          }
                        >
                          {campaign.status}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-4 text-xs text-foreground">
                        <span>{campaign.budget}</span>
                        <span>•</span>
                        <span>{campaign.applicants} applicants</span>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
