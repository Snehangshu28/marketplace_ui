import { useState, useEffect } from 'react';
import { Link } from 'react-router';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import BottomNav from '../components/BottomNav';
import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { apiUrl } from '@/lib/api';
import { useAuth } from '../../context/AuthContext';
import { Calendar, Users, Edit, Trash, PlusCircle, CheckCircle, XCircle } from 'lucide-react';

export default function MyEventsPage() {
  const { currentUser } = useAuth();
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedEvent, setSelectedEvent] = useState<any>(null);

  useEffect(() => {
    fetchMyEvents();
  }, [currentUser]);

  const fetchMyEvents = async () => {
    if (!currentUser) return;
    setLoading(true);
    try {
      const token = await currentUser.getIdToken();
      const res = await fetch(apiUrl('/events/user/my-events'), {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setEvents(data.data);
      }
    } catch (error) {
      console.error("Failed to fetch my events:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateApplicant = async (eventId: string, applicantId: string, status: string) => {
    try {
      const token = await currentUser?.getIdToken();
      const res = await fetch(apiUrl(`/events/${eventId}/applicants/${applicantId}`), {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ status })
      });
      const data = await res.json();
      if (data.success) {
        // Update local state
        if (selectedEvent && selectedEvent._id === eventId) {
          setSelectedEvent({
            ...selectedEvent,
            applicants: selectedEvent.applicants.map((app: any) => 
              app._id === applicantId ? { ...app, status } : app
            )
          });
        }
        setEvents(events.map(ev => 
          ev._id === eventId ? {
            ...ev,
            applicants: ev.applicants.map((app: any) => 
              app._id === applicantId ? { ...app, status } : app
            )
          } : ev
        ));
      }
    } catch (error) {
      console.error("Failed to update applicant:", error);
    }
  };

  return (
    <div className="min-h-screen bg-[#2b2635] flex flex-col">
      <Navbar variant="dashboard" />
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 md:p-6 lg:p-8 flex flex-col lg:flex-row gap-6 md:gap-8 pb-bottom-nav">
        
        {/* Events List */}
        <div className="w-full lg:w-1/3">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold text-foreground">My Events</h1>
            <Link to="/events/create">
              <Button size="icon" className="bg-primary text-[#2b2635] hover:bg-primary/90">
                <PlusCircle className="w-5 h-5" />
              </Button>
            </Link>
          </div>

          <div className="space-y-4">
            {loading ? (
              <div className="animate-pulse space-y-4">
                {[1,2,3].map(i => <div key={i} className="h-24 bg-background rounded-xl" />)}
              </div>
            ) : events.length === 0 ? (
              <Card className="p-6 text-center border-dashed">
                <p className="text-foreground mb-4">You haven't posted any events yet.</p>
                <Link to="/events/create">
                  <Button variant="outline">Create One Now</Button>
                </Link>
              </Card>
            ) : (
              events.map((event) => (
                <Card 
                  key={event._id} 
                  className={`p-4 rounded-xl cursor-pointer transition-all ${selectedEvent?._id === event._id ? 'border-primary shadow-md ring-1 ring-primary' : 'border-border hover:border-border'}`}
                  onClick={() => setSelectedEvent(event)}
                >
                  <h3 className="font-semibold text-foreground line-clamp-1">{event.title}</h3>
                  <div className="flex items-center gap-4 mt-2 text-sm text-foreground">
                    <span className="flex items-center gap-1"><Users className="w-4 h-4" /> {event.applicants?.length || 0}</span>
                    <span className="flex items-center gap-1"><Calendar className="w-4 h-4" /> {new Date(event.createdAt).toLocaleDateString()}</span>
                  </div>
                </Card>
              ))
            )}
          </div>
        </div>

        {/* Event Details & Applicants */}
        <div className="hidden lg:block lg:w-2/3">
          {selectedEvent ? (
            <Card className="p-8 rounded-2xl border-border bg-background min-h-[500px]">
              <div className="flex justify-between items-start mb-6 pb-6 border-b border-border">
                <div>
                  <h2 className="text-2xl font-bold text-foreground mb-2">{selectedEvent.title}</h2>
                  <div className="flex gap-2">
                    <Badge variant="secondary">{selectedEvent.category}</Badge>
                    <Badge variant="outline">{selectedEvent.eventType}</Badge>
                  </div>
                </div>
                <Link to={`/events/${selectedEvent._id}`}>
                  <Button variant="outline" size="sm">View Public Page</Button>
                </Link>
              </div>

              <h3 className="text-lg font-bold text-foreground mb-4">Applicants ({selectedEvent.applicants?.length || 0})</h3>
              
              {selectedEvent.applicants?.length === 0 ? (
                <div className="text-center py-12 text-foreground bg-background rounded-xl">
                  No one has applied to this event yet.
                </div>
              ) : (
                <div className="space-y-4">
                  {selectedEvent.applicants?.map((applicant: any) => (
                    <div key={applicant._id} className="p-5 border border-border rounded-xl bg-background flex flex-col gap-3">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-semibold text-foreground">Applicant ID: {applicant.userId.substring(0,8)}...</p>
                          <p className="text-xs text-foreground">{new Date(applicant.appliedAt).toLocaleString()}</p>
                        </div>
                        <Badge className={
                          applicant.status === 'accepted' ? 'bg-background text-foreground hover:bg-background' : 
                          applicant.status === 'rejected' ? 'bg-background text-foreground hover:bg-background' : 
                          'bg-background text-foreground hover:bg-background'
                        }>
                          {applicant.status.toUpperCase()}
                        </Badge>
                      </div>
                      
                      <div className="bg-background p-3 rounded border border-border text-sm text-foreground">
                        <span className="font-medium text-foreground block mb-1">Message:</span>
                        {applicant.message}
                      </div>

                      {applicant.status === 'pending' && (
                        <div className="flex gap-2 mt-2">
                          <Button size="sm" onClick={() => handleUpdateApplicant(selectedEvent._id, applicant._id, 'accepted')} className="bg-background hover:bg-background text-foreground flex-1">
                            <CheckCircle className="w-4 h-4 mr-2" /> Accept
                          </Button>
                          <Button size="sm" variant="outline" onClick={() => handleUpdateApplicant(selectedEvent._id, applicant._id, 'rejected')} className="text-foreground border-border hover:bg-background flex-1">
                            <XCircle className="w-4 h-4 mr-2" /> Reject
                          </Button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </Card>
          ) : (
            <div className="h-full flex items-center justify-center text-foreground border-2 border-dashed border-border rounded-2xl">
              Select an event to view details and applicants
            </div>
          )}
        </div>
      </main>
      <Footer />
      <BottomNav />
    </div>
  );
}
