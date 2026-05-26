import { useState, useEffect } from 'react';
import { Link } from 'react-router';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import BottomNav from '../components/BottomNav';
import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Input } from '../components/ui/input';
import { apiUrl } from '@/lib/api';
import { Calendar, MapPin, Briefcase, PlusCircle, Filter, Flame, Radio, TrendingUp } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { motion } from 'motion/react';

export default function EventsFeedPage() {
  const { currentUser } = useAuth();
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [typeFilter, setTypeFilter] = useState('All');
  const [activeTab, setActiveTab] = useState<'upcoming' | 'trending'>('upcoming');

  useEffect(() => {
    fetchEvents();
  }, [categoryFilter, typeFilter]);

  const fetchEvents = async () => {
    setLoading(true);
    try {
      let url = apiUrl('/events?');
      if (categoryFilter !== 'All') url += `category=${categoryFilter}&`;
      if (typeFilter !== 'All') url += `eventType=${typeFilter}&`;

      const res = await fetch(url);
      const data = await res.json();
      if (data.success) {
        setEvents(data.data);
      }
    } catch (error) {
      console.error("Failed to fetch events:", error);
    } finally {
      setLoading(false);
    }
  };

  const categoryChips = ['All', 'Sponsorship', 'Collaboration', 'Hiring', 'Event', 'Promotion'];
  const typeChips = ['All', 'Online', 'Offline', 'Hybrid'];

  return (
    <div className="min-h-screen bg-[#2b2635] flex flex-col">
      <Navbar variant="dashboard" />
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-4 md:py-8 pb-bottom-nav">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-3">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-[#e8e6ed]">Explore Events</h1>
            <p className="text-sm text-[#9d97a8]">Discover sponsorships, collaborations, and events.</p>
          </div>
          {currentUser && (
            <Link to="/events/create">
              <Button className="bg-[#c0ff00] text-[#1a1520] hover:bg-[#a8e000] rounded-full px-5 font-semibold shadow-[0_0_16px_rgba(192,255,0,0.2)]">
                <PlusCircle className="w-4 h-4 mr-2" />
                Post Event
              </Button>
            </Link>
          )}
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-4">
          {[
            { key: 'upcoming', label: 'Upcoming', icon: Calendar },
            { key: 'trending', label: 'Trending', icon: Flame },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as any)}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium transition-all ${
                activeTab === tab.key
                  ? 'bg-[#c0ff00] text-[#1a1520]'
                  : 'bg-[#342e40] text-[#9d97a8] hover:text-[#e8e6ed]'
              }`}
            >
              <tab.icon className="w-3.5 h-3.5" />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Category chips */}
        <div className="flex gap-2 overflow-x-auto hide-scrollbar mb-4 pb-1">
          {categoryChips.map((cat) => (
            <button
              key={cat}
              onClick={() => setCategoryFilter(cat)}
              className={`flex-shrink-0 px-3.5 py-1.5 rounded-full text-xs font-medium transition-all ${
                categoryFilter === cat
                  ? 'bg-[#c0ff00]/15 text-[#c0ff00] border border-[#c0ff00]/30'
                  : 'bg-[#342e40] text-[#9d97a8] border border-transparent hover:text-[#e8e6ed]'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Type chips */}
        <div className="flex gap-2 overflow-x-auto hide-scrollbar mb-6 pb-1">
          {typeChips.map((t) => (
            <button
              key={t}
              onClick={() => setTypeFilter(t)}
              className={`flex-shrink-0 px-3.5 py-1.5 rounded-full text-xs font-medium transition-all ${
                typeFilter === t
                  ? 'bg-[#c0ff00]/15 text-[#c0ff00] border border-[#c0ff00]/30'
                  : 'bg-[#342e40] text-[#9d97a8] border border-transparent hover:text-[#e8e6ed]'
              }`}
            >
              {t}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="h-64 rounded-[20px] animate-pulse bg-[#342e40]" />
            ))}
          </div>
        ) : events.length === 0 ? (
          <div className="text-center py-16 md:py-20 glass-card rounded-[24px]">
            <Calendar className="w-12 h-12 text-[#9d97a8] mx-auto mb-4" />
            <h3 className="text-xl font-bold text-[#e8e6ed] mb-2">No events found</h3>
            <p className="text-[#9d97a8] mb-6">Try adjusting your filters or post a new event.</p>
            {currentUser && (
              <Link to="/events/create">
                <Button className="bg-[#c0ff00] text-[#1a1520] rounded-full px-6 font-semibold">Post Event</Button>
              </Link>
            )}
          </div>
        ) : (
          <div className="space-y-4 md:space-y-0 md:grid md:grid-cols-2 lg:grid-cols-3 md:gap-6">
            {events.map((event, idx) => (
              <motion.div
                key={event._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: idx * 0.05 }}
              >
                <Card className="glass-card border-0 rounded-[20px] overflow-hidden flex flex-col h-full hover:shadow-[0_0_30px_rgba(192,255,0,0.06)] transition-all duration-300 group">
                  {/* Gradient top strip */}
                  <div className="h-1.5 bg-gradient-to-r from-[#c0ff00] via-[#c0ff00]/50 to-transparent" />
                  <div className="p-5 flex flex-col flex-1">
                    <div className="flex justify-between items-start mb-3">
                      <Badge className="bg-[#c0ff00]/10 text-[#c0ff00] border-0 text-[10px] font-semibold rounded-full">
                        {event.category}
                      </Badge>
                      <Badge variant="outline" className={`text-[10px] rounded-full ${event.role === 'brand' ? 'border-[#c0ff00]/30 text-[#c0ff00]' : 'border-[#9d97a8]/30 text-[#9d97a8]'}`}>
                        {event.role === 'brand' ? 'Brand' : 'Talent'}
                      </Badge>
                    </div>
                    <h3 className="text-lg font-bold text-[#e8e6ed] mb-2 line-clamp-2 group-hover:text-[#c0ff00] transition-colors">{event.title}</h3>
                    <p className="text-[#9d97a8] mb-4 line-clamp-2 text-sm flex-1">{event.description}</p>
                    
                    <div className="space-y-1.5 mb-4">
                      {event.deadline && (
                        <div className="flex items-center text-xs text-[#9d97a8]">
                          <Calendar className="w-3.5 h-3.5 mr-2 text-[#c0ff00]/50" />
                          {new Date(event.deadline).toLocaleDateString()}
                        </div>
                      )}
                      {event.eventType && (
                        <div className="flex items-center text-xs text-[#9d97a8]">
                          <MapPin className="w-3.5 h-3.5 mr-2 text-[#c0ff00]/50" />
                          {event.eventType} {event.location ? `· ${event.location}` : ''}
                        </div>
                      )}
                    </div>
                    
                    <Link to={`/events/${event._id}`} className="mt-auto">
                      <Button className="w-full bg-[#342e40] text-[#e8e6ed] hover:bg-[#c0ff00] hover:text-[#1a1520] rounded-xl font-medium transition-all">
                        View Details
                      </Button>
                    </Link>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </main>
      <Footer />
      <BottomNav />
    </div>
  );
}
