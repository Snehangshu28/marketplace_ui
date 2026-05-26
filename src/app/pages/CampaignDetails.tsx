import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import BottomNav from '../components/BottomNav';
import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Separator } from '../components/ui/separator';
import { Calendar, DollarSign, Users, Briefcase, CheckCircle, ArrowLeft } from 'lucide-react';
import { apiUrl } from '@/lib/api';

interface Campaign {
  id: string;
  title: string;
  description: string;
  budget: number;
  category: string;
  status: string;
  createdAt: string;
  requirements?: string[];
  applicants?: number;
  brandInfo?: {
    name?: string;
    fullName?: string;
    displayName?: string;
  };
}

export default function CampaignDetails() {
  const { id } = useParams();
  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCampaign = async () => {
      try {
        const res = await fetch(apiUrl(`/campaigns/${id}`));
        const data = await res.json();
        if (data.success) {
          setCampaign(data.data);
        }
      } catch (error) {
        console.error('Error fetching campaign details:', error);
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchCampaign();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#2b2635] flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <p className="text-foreground">Loading campaign details...</p>
        </div>
        <Footer />
      </div>
    );
  }

  if (!campaign) {
    return (
      <div className="min-h-screen bg-[#2b2635] flex flex-col">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center flex-1">
          <h1 className="text-2xl font-bold mb-4">Campaign not found</h1>
          <Link to="/campaigns">
            <Button>Back to Campaigns</Button>
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  const brandName = campaign.brandInfo?.displayName || campaign.brandInfo?.fullName || campaign.brandInfo?.name || 'Unknown Brand';

  return (
    <div className="min-h-screen bg-[#2b2635] flex flex-col">
      <Navbar />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-4 md:py-8 flex-1 w-full pb-bottom-nav">
        <Link
          to="/campaigns"
          className="inline-flex items-center gap-2 text-foreground hover:text-foreground mb-6 w-fit"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Campaigns
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            <Card className="p-5 md:p-8 glass-card border-0 rounded-[20px] mb-4 md:mb-6">
              <div className="flex items-start justify-between mb-6">
                <div>
                  <h1 className="text-3xl font-bold mb-2">{campaign.title}</h1>
                  <div className="flex items-center gap-3 text-foreground">
                    <div className="w-10 h-10 bg-background rounded-lg flex items-center justify-center text-lg font-bold text-foreground">
                      {brandName.charAt(0)}
                    </div>
                    <span className="font-medium">{brandName}</span>
                  </div>
                </div>
                <Badge
                  className={
                    campaign.status === 'active' || campaign.status === 'open'
                      ? 'bg-background text-foreground'
                      : 'bg-background text-foreground'
                  }
                >
                  {campaign.status}
                </Badge>
              </div>

              <Separator className="my-6" />

              <div>
                <h2 className="text-xl font-semibold mb-4">Campaign Description</h2>
                <div className="text-foreground leading-relaxed whitespace-pre-wrap">{campaign.description}</div>
              </div>

              {campaign.requirements && campaign.requirements.length > 0 && (
                <>
                  <Separator className="my-6" />
                  <div>
                    <h2 className="text-xl font-semibold mb-4">Requirements</h2>
                    <ul className="space-y-3">
                      {campaign.requirements.map((req, index) => (
                        <li key={index} className="flex items-start gap-3">
                          <CheckCircle className="w-5 h-5 text-foreground flex-shrink-0 mt-0.5" />
                          <span className="text-foreground">{req}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </>
              )}
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <Card className="p-4 md:p-6 glass-card border-0 rounded-[20px]">
              <h3 className="font-semibold mb-4">Campaign Details</h3>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-primary/20 rounded-lg flex items-center justify-center">
                    <DollarSign className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <div className="text-sm text-foreground">Budget</div>
                    <div className="font-semibold">${campaign.budget}</div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-background rounded-lg flex items-center justify-center">
                    <Calendar className="w-5 h-5 text-foreground" />
                  </div>
                  <div>
                    <div className="text-sm text-foreground">Posted On</div>
                    <div className="font-semibold">
                      {new Date(campaign.createdAt).toLocaleDateString('en-US', {
                        month: 'long',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-background rounded-lg flex items-center justify-center">
                    <Users className="w-5 h-5 text-foreground" />
                  </div>
                  <div>
                    <div className="text-sm text-foreground">Applicants</div>
                    <div className="font-semibold">{campaign.applicants || 0}</div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-background rounded-lg flex items-center justify-center">
                    <Briefcase className="w-5 h-5 text-foreground" />
                  </div>
                  <div>
                    <div className="text-sm text-foreground">Category</div>
                    <div className="font-semibold">{campaign.category}</div>
                  </div>
                </div>
              </div>
            </Card>

            <Card className="p-4 md:p-6 glass-card border-0 rounded-[20px]">
              <Button className="w-full bg-[#c0ff00] text-[#1a1520] hover:bg-[#a8e000] mb-3 rounded-full font-semibold" size="lg">
                Apply Now
              </Button>
              <Button variant="outline" className="w-full border-[rgba(192,255,0,0.15)] text-[#e8e6ed] hover:bg-[#342e40] rounded-xl" size="lg">
                Contact Brand
              </Button>
            </Card>

            <Card className="p-6 rounded-2xl bg-primary/10 border-primary/20">
              <h3 className="font-semibold mb-2">Need Help?</h3>
              <p className="text-sm text-foreground mb-4">
                Have questions about this campaign? Our support team is here to help.
              </p>
              <Button variant="outline" className="w-full">
                Contact Support
              </Button>
            </Card>
          </div>
        </div>
      </div>

      <Footer />
      <BottomNav />
    </div>
  );
}
