import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import BottomNav from '../components/BottomNav';
import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Label } from '../components/ui/label';
import { apiUrl } from '@/lib/api';
import { Calendar, MapPin, Briefcase, Tag, Clock, Send, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function EventDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  
  const [event, setEvent] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
  const [showApply, setShowApply] = useState(false);
  const [applyMessage, setApplyMessage] = useState('');
  const [applying, setApplying] = useState(false);
  const [applied, setApplied] = useState(false);

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        const res = await fetch(apiUrl(`/events/${id}`));
        const data = await res.json();
        if (data.success) {
          setEvent(data.data);
          
          if (currentUser) {
            const userId = currentUser.uid;
            const hasApplied = data.data.applicants?.some((app: any) => app.userId === userId);
            setApplied(hasApplied);
          }
        }
      } catch (error) {
        console.error("Failed to fetch event:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchEvent();
  }, [id, currentUser]);

  const handleApply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) {
      navigate('/auth');
      return;
    }
    
    setApplying(true);
    try {
      const token = await currentUser.getIdToken();
      const res = await fetch(apiUrl(`/events/${id}/apply`), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ message: applyMessage })
      });
      const data = await res.json();
      if (data.success) {
        setApplied(true);
        setShowApply(false);
      } else {
        alert(data.message);
      }
    } catch (err) {
      console.error(err);
      alert('Failed to submit application');
    } finally {
      setApplying(false);
    }
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center bg-[#2b2635]"><div className="animate-spin w-8 h-8 border-4 border-[#c0ff00] border-t-transparent rounded-full" /></div>;
  }

  if (!event) {
    return <div className="min-h-screen flex items-center justify-center bg-[#2b2635] text-[#e8e6ed] text-xl font-bold">Event not found</div>;
  }

  const isOwner = currentUser && (currentUser.uid === event.createdBy);

  return (
    <div className="min-h-screen bg-[#2b2635] flex flex-col">
      <Navbar variant="dashboard" />
      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-4 md:py-8 pb-bottom-nav">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-8">
          
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-4 md:space-y-6">
            <Card className="p-5 md:p-8 glass-card border-0 rounded-[20px]">
              <div className="flex gap-2 mb-4">
                <Badge className="bg-primary/20 text-primary border-none">{event.category}</Badge>
                <Badge variant="outline" className="border-border text-foreground">{event.eventType}</Badge>
              </div>
              
              <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-4">{event.title}</h1>
              
              <div className="flex flex-wrap items-center gap-4 text-sm text-foreground mb-8 border-b border-border pb-6">
                {event.location && (
                  <div className="flex items-center"><MapPin className="w-4 h-4 mr-1" /> {event.location}</div>
                )}
                <div className="flex items-center"><Briefcase className="w-4 h-4 mr-1" /> Posted by {event.role === 'brand' ? 'Brand' : 'Talent'}</div>
                <div className="flex items-center"><Clock className="w-4 h-4 mr-1" /> Posted {new Date(event.createdAt).toLocaleDateString()}</div>
              </div>

              <div className="prose max-w-none text-foreground">
                <h3 className="text-xl font-semibold text-foreground mb-3">About the Event</h3>
                <p className="whitespace-pre-wrap leading-relaxed">{event.description}</p>
              </div>

              {event.requirements && (
                <div className="mt-8">
                  <h3 className="text-xl font-semibold text-foreground mb-3">Requirements</h3>
                  <p className="whitespace-pre-wrap text-foreground">{event.requirements}</p>
                </div>
              )}

              {event.perks && (
                <div className="mt-8">
                  <h3 className="text-xl font-semibold text-foreground mb-3">Perks & Benefits</h3>
                  <p className="whitespace-pre-wrap text-foreground">{event.perks}</p>
                </div>
              )}

              {event.tags && event.tags.length > 0 && (
                <div className="mt-8 flex items-center gap-2 flex-wrap">
                  <Tag className="w-4 h-4 text-foreground" />
                  {event.tags.map((tag: string, i: number) => (
                    <Badge key={i} variant="secondary" className="bg-background text-foreground font-normal">
                      {tag}
                    </Badge>
                  ))}
                </div>
              )}
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <Card className="p-4 md:p-6 glass-card border-0 rounded-[20px] sticky top-20">
              <h3 className="text-lg font-bold text-foreground mb-4">Event Overview</h3>
              
              <div className="space-y-4 mb-6">
                <div className="flex justify-between pb-3 border-b border-border">
                  <span className="text-foreground">Budget/Pay</span>
                  <span className="font-semibold text-foreground">{event.budget || 'Unpaid / Negotiable'}</span>
                </div>
                {event.deadline && (
                  <div className="flex justify-between pb-3 border-b border-border">
                    <span className="text-foreground">Deadline</span>
                    <span className="font-semibold text-foreground">{new Date(event.deadline).toLocaleDateString()}</span>
                  </div>
                )}
                <div className="flex justify-between pb-3 border-b border-border">
                  <span className="text-foreground">Applicants</span>
                  <span className="font-semibold text-foreground">{event.applicants?.length || 0}</span>
                </div>
              </div>

              {!isOwner ? (
                applied ? (
                  <div className="bg-background text-foreground p-4 rounded-xl flex items-center justify-center gap-2 font-medium">
                    <CheckCircle2 className="w-5 h-5" /> Application Submitted
                  </div>
                ) : showApply ? (
                  <form onSubmit={handleApply} className="space-y-4">
                    <div>
                      <Label htmlFor="message">Why are you a good fit?</Label>
                      <textarea 
                        id="message" rows={4} required
                        placeholder="Write a brief message..."
                        value={applyMessage} onChange={e => setApplyMessage(e.target.value)}
                        className="w-full mt-1 rounded-md border border-border px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                      />
                    </div>
                    <div className="flex gap-2">
                      <Button type="button" variant="outline" className="flex-1" onClick={() => setShowApply(false)}>Cancel</Button>
                      <Button type="submit" disabled={applying} className="flex-1 bg-primary text-[#2b2635] hover:bg-primary/90">
                        {applying ? 'Sending...' : 'Submit'}
                      </Button>
                    </div>
                  </form>
                ) : (
                  <Button onClick={() => setShowApply(true)} className="w-full bg-[#c0ff00] text-[#1a1520] hover:bg-[#a8e000] h-12 text-lg font-semibold rounded-full shadow-[0_0_16px_rgba(192,255,0,0.2)]">
                    Apply Now
                  </Button>
                )
              ) : (
                <div className="bg-primary/10 text-primary p-4 rounded-xl text-center font-medium border border-primary/20">
                  You posted this event
                </div>
              )}
            </Card>
          </div>

        </div>
      </main>
      <Footer />
      <BottomNav />
    </div>
  );
}
