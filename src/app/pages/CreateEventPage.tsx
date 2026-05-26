import { useState } from 'react';
import { useNavigate } from 'react-router';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import BottomNav from '../components/BottomNav';
import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { apiUrl } from '@/lib/api';
import { useAuth } from '../../context/AuthContext';

export default function CreateEventPage() {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'Sponsorship',
    eventType: 'Online',
    location: '',
    deadline: '',
    budget: '',
    requirements: '',
    perks: '',
    tags: ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const token = await currentUser?.getIdToken();
      const res = await fetch(apiUrl('/events'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          ...formData,
          tags: formData.tags.split(',').map(tag => tag.trim()).filter(Boolean)
        })
      });

      const data = await res.json();
      if (data.success) {
        navigate(`/events/${data.data._id}`);
      } else {
        setError(data.message || 'Failed to create event');
      }
    } catch (err) {
      console.error(err);
      setError('An error occurred while creating the event.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#2b2635] flex flex-col">
      <Navbar variant="dashboard" />
      <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-4 md:py-8 pb-bottom-nav">
        <div className="mb-6">
          <h1 className="text-2xl md:text-3xl font-bold text-[#e8e6ed] mb-1">Post an Opportunity</h1>
          <p className="text-sm text-[#9d97a8]">Post any opportunity — sponsorship, collaboration, hiring, or anything you need.</p>
        </div>

        <Card className="p-4 md:p-6 lg:p-8 glass-card border-0 rounded-[20px]">
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="p-4 text-sm text-foreground bg-background rounded-lg">
                {error}
              </div>
            )}

            <div className="space-y-4">
              <div>
                <Label htmlFor="title">Title *</Label>
                <Input 
                  id="title" name="title" required 
                  placeholder="e.g. Summer Fitness Apparel Collaboration"
                  value={formData.title} onChange={handleChange} 
                  className="mt-1 bg-background border-border text-foreground" 
                />
              </div>

              <div>
                <Label htmlFor="description">Description *</Label>
                <textarea 
                  id="description" name="description" required rows={5}
                  placeholder="Describe the opportunity in detail..."
                  value={formData.description} onChange={handleChange}
                  className="w-full mt-1 rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="category">Category</Label>
                  <select 
                    id="category" name="category" 
                    value={formData.category} onChange={handleChange}
                    className="w-full mt-1 rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground"
                  >
                    <option value="Sponsorship">Sponsorship</option>
                    <option value="Collaboration">Collaboration</option>
                    <option value="Hiring">Hiring</option>
                    <option value="Event">Event</option>
                    <option value="Promotion">Promotion</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div>
                  <Label htmlFor="eventType">Event/Opportunity Type</Label>
                  <select 
                    id="eventType" name="eventType" 
                    value={formData.eventType} onChange={handleChange}
                    className="w-full mt-1 rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground"
                  >
                    <option value="Online">Online</option>
                    <option value="Offline">Offline</option>
                    <option value="Hybrid">Hybrid</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="location">Location (if applicable)</Label>
                  <Input 
                    id="location" name="location" 
                    placeholder="e.g. New York, NY or Zoom"
                    value={formData.location} onChange={handleChange} 
                    className="mt-1 bg-background border-border text-foreground" 
                  />
                </div>
                <div>
                  <Label htmlFor="deadline">Application Deadline</Label>
                  <Input 
                    id="deadline" name="deadline" type="date"
                    value={formData.deadline} onChange={handleChange} 
                    className="mt-1 bg-background border-border text-foreground" 
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="budget">Budget / Compensation (Optional)</Label>
                <Input 
                  id="budget" name="budget" 
                  placeholder="e.g. $500 - $1000 or Unpaid"
                  value={formData.budget} onChange={handleChange} 
                  className="mt-1 bg-background border-border text-foreground" 
                />
              </div>

              <div>
                <Label htmlFor="requirements">Requirements</Label>
                <textarea 
                  id="requirements" name="requirements" rows={3}
                  placeholder="e.g. Must have 10k+ followers on Instagram"
                  value={formData.requirements} onChange={handleChange}
                  className="w-full mt-1 rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>

              <div>
                <Label htmlFor="perks">Perks & Benefits</Label>
                <textarea 
                  id="perks" name="perks" rows={3}
                  placeholder="e.g. Free products, travel expenses covered"
                  value={formData.perks} onChange={handleChange}
                  className="w-full mt-1 rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>

              <div>
                <Label htmlFor="tags">Tags (comma separated)</Label>
                <Input 
                  id="tags" name="tags" 
                  placeholder="e.g. fitness, apparel, summer"
                  value={formData.tags} onChange={handleChange} 
                  className="mt-1 bg-background border-border text-foreground" 
                />
              </div>
            </div>

            <div className="pt-4 border-t border-border flex justify-end gap-3">
              <Button type="button" variant="outline" onClick={() => navigate(-1)} className="border-[rgba(192,255,0,0.15)] text-[#e8e6ed] hover:bg-[#342e40] rounded-xl">
                Cancel
              </Button>
              <Button type="submit" disabled={loading} className="bg-[#c0ff00] text-[#1a1520] hover:bg-[#a8e000] rounded-full px-6 font-semibold">
                {loading ? 'Posting...' : 'Post Opportunity'}
              </Button>
            </div>
          </form>
        </Card>
      </main>
      <Footer />
      <BottomNav />
    </div>
  );
}
