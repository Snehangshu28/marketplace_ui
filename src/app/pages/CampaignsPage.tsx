import { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import BottomNav from '../components/BottomNav';
import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Input } from '../components/ui/input';
import { Link } from 'react-router';
import { Search, Plus, Calendar, DollarSign, X } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { auth } from '../../services/firebase';
import { apiUrl } from '@/lib/api';

interface Campaign {
  id: string;
  title: string;
  description: string;
  budget: number;
  category: string;
  campaignType: string;
  platform: string;
  status: string;
  createdAt: string;
  brandInfo?: {
    name?: string;
    fullName?: string;
    displayName?: string;
  };
}

export default function CampaignsPage() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const { userData } = useAuth();
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({ title: '', description: '', budget: '', category: '', campaignType: '', platform: '' });
  const [submitting, setSubmitting] = useState(false);

  const fetchCampaigns = async () => {
    try {
      const res = await fetch(apiUrl('/campaigns'));
      const data = await res.json();
      if (data.success) {
        setCampaigns(data.data);
      }
    } catch (error) {
      console.error('Error fetching campaigns:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCampaigns();
  }, []);

  const handleCreateCampaign = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const token = await auth.currentUser?.getIdToken();
      const res = await fetch(apiUrl('/campaigns'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          ...formData,
          budget: Number(formData.budget)
        })
      });
      const data = await res.json();
      if (data.success) {
        setShowModal(false);
        setFormData({ title: '', description: '', budget: '', category: '', campaignType: '', platform: '' });
        fetchCampaigns();
      } else {
        alert(data.message || 'Error creating campaign');
      }
    } catch (error) {
      console.error('Error creating campaign:', error);
      alert('Error creating campaign');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#2b2635]">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 md:py-8 pb-bottom-nav">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold mb-1 text-[#e8e6ed]">Campaigns</h1>
            <p className="text-sm text-[#9d97a8]">Browse active campaigns and opportunities</p>
          </div>
          {userData?.role === 'brand' && (
            <Button className="bg-[#c0ff00] text-[#1a1520] hover:bg-[#a8e000] mt-3 md:mt-0 rounded-full px-5 font-semibold" onClick={() => setShowModal(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Post Campaign
            </Button>
          )}
        </div>

        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#9d97a8]" />
            <Input
              type="text"
              placeholder="Search campaigns..."
              className="pl-12 h-12 bg-[#342e40] border-0 rounded-full text-[#e8e6ed] placeholder:text-[#9d97a8]"
            />
          </div>
        </div>

        {loading ? (
          <div className="text-center py-12">Loading campaigns...</div>
        ) : campaigns.length === 0 ? (
          <div className="text-center py-12 text-foreground">No campaigns found.</div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {campaigns.map((campaign) => (
              <Link key={campaign.id} to={`/campaigns/${campaign.id}`}>
                <Card className="p-5 md:p-6 glass-card border-0 rounded-[20px] hover:shadow-[0_0_30px_rgba(192,255,0,0.06)] transition-all duration-300 group">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-xl font-semibold mb-2">{campaign.title}</h3>
                      <div className="flex items-center gap-2 text-sm text-foreground mb-2">
                        <span className="font-medium">
                          {campaign.brandInfo?.displayName || campaign.brandInfo?.fullName || campaign.brandInfo?.name || 'Unknown Brand'}
                        </span>
                        <span>•</span>
                        <Badge variant="secondary">{campaign.category}</Badge>
                      </div>
                    </div>
                    <Badge
                      className={
                        campaign.status === 'open' || campaign.status === 'active'
                          ? 'bg-background text-foreground'
                          : 'bg-background text-foreground'
                      }
                    >
                      {campaign.status}
                    </Badge>
                  </div>

                  <p className="text-foreground mb-4 line-clamp-2">{campaign.description}</p>

                  <div className="flex flex-wrap gap-4 text-sm text-foreground mb-4">
                    <div className="flex items-center gap-1">
                      <DollarSign className="w-4 h-4" />
                      <span>{campaign.budget}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      <span>{new Date(campaign.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>

                  <Button className="w-full bg-[#342e40] text-[#e8e6ed] hover:bg-[#c0ff00] hover:text-[#1a1520] rounded-xl font-medium transition-all">
                    View Details
                  </Button>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-background flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-lg p-6 rounded-2xl shadow-xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold">Post New Campaign</h2>
              <button onClick={() => setShowModal(false)} className="p-2 hover:bg-background rounded-full">
                <X className="w-5 h-5 text-foreground" />
              </button>
            </div>

            <form onSubmit={handleCreateCampaign} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Title</label>
                <Input required value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} placeholder="Campaign Title" />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Category</label>
                <Input required value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} placeholder="e.g. Fashion, Tech, Sports" />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Campaign Type</label>
                <select 
                  required 
                  className="flex h-10 w-full rounded-md border border-border bg-background px-3 py-2 text-sm focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all"
                  value={formData.campaignType} 
                  onChange={e => setFormData({...formData, campaignType: e.target.value})}
                >
                  <option value="" disabled>Select a type...</option>
                  <option value="Sponsored Post">Sponsored Post</option>
                  <option value="Reel">Reel</option>
                  <option value="Story">Story</option>
                  <option value="Event">Event</option>
                  <option value="Promotion">Promotion</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Platform</label>
                <select 
                  required 
                  className="flex h-10 w-full rounded-md border border-border bg-background px-3 py-2 text-sm focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all"
                  value={formData.platform} 
                  onChange={e => setFormData({...formData, platform: e.target.value})}
                >
                  <option value="" disabled>Select a platform...</option>
                  <option value="Instagram">Instagram</option>
                  <option value="YouTube">YouTube</option>
                  <option value="Facebook">Facebook</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Budget ($)</label>
                <Input type="number" required min="1" value={formData.budget} onChange={e => setFormData({...formData, budget: e.target.value})} placeholder="5000" />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Description</label>
                <textarea 
                  required 
                  className="w-full min-h-[100px] p-3 border border-border rounded-xl focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all"
                  value={formData.description} 
                  onChange={e => setFormData({...formData, description: e.target.value})} 
                  placeholder="Describe the campaign requirements..."
                />
              </div>

              <div className="pt-4 flex justify-end gap-3">
                <Button type="button" variant="outline" onClick={() => setShowModal(false)}>Cancel</Button>
                <Button type="submit" disabled={submitting} className="bg-primary text-[#2b2635] hover:bg-primary text-[#2b2635]">
                  {submitting ? 'Posting...' : 'Post Campaign'}
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}

      <Footer />
      <BottomNav />
    </div>
  );
}
