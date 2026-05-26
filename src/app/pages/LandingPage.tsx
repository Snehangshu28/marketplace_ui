import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import BottomNav from '../components/BottomNav';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Link } from 'react-router';
import { Search, Users, Zap, Shield, CheckCircle, ArrowRight, Star, MapPin, Calendar, Sparkles } from 'lucide-react';
import { motion } from 'motion/react';
import { categories, testimonials, mockTalents } from '../data/mockData';
import { useAuth } from '../../context/AuthContext';

const storyProfiles = [
  { name: 'Jordan', type: 'Athlete', image: 'https://images.unsplash.com/photo-1568602471122-7832951cc4c5?w=200&h=200&fit=crop&crop=face' },
  { name: 'Ava', type: 'Influencer', image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&h=200&fit=crop&crop=face' },
  { name: 'Nike', type: 'Brand', image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=200&h=200&fit=crop' },
  { name: 'Marcus', type: 'Creator', image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop&crop=face' },
  { name: 'Sophia', type: 'Athlete', image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200&h=200&fit=crop&crop=face' },
  { name: 'Puma', type: 'Brand', image: 'https://images.unsplash.com/photo-1608231387042-66d1773070a5?w=200&h=200&fit=crop' },
  { name: 'Leo', type: 'Creator', image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&h=200&fit=crop&crop=face' },
];

const featuredEvents = [
  {
    title: 'Global Fitness Summit 2026',
    location: 'Los Angeles, CA',
    date: 'Jun 15-17',
    image: 'https://images.unsplash.com/photo-1540497077202-7c8a3999166f?w=800&fit=crop',
    attendees: 240,
  },
  {
    title: 'Creator Economy Conference',
    location: 'New York, NY',
    date: 'Jul 8-10',
    image: 'https://images.unsplash.com/photo-1505373877841-8d25f7d46678?w=800&fit=crop',
    attendees: 180,
  },
];

const trendingCollabs = [
  {
    title: 'Athleisure Brand Launch',
    type: 'Sponsorship',
    image: 'https://images.unsplash.com/photo-1556906781-9a412961c28c?w=600&fit=crop',
    budget: '$10K - $25K',
  },
  {
    title: 'Sports Nutrition Campaign',
    type: 'Partnership',
    image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=600&fit=crop',
    budget: '$5K - $15K',
  },
  {
    title: 'Influencer Capsule Collection',
    type: 'Campaign',
    image: 'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=600&fit=crop',
    budget: '$8K - $20K',
  },
];

export default function LandingPage() {
  const { userData } = useAuth();
  return (
    <div className="min-h-screen bg-[#2b2635]">
      <Navbar />

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        {/* Background gradient orbs */}
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-[#c0ff00]/5 rounded-full blur-[120px]" />
        <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-[#7c3aed]/10 rounded-full blur-[100px]" />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-12 md:py-20 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center max-w-4xl mx-auto"
          >
            <Badge className="mb-4 md:mb-6 bg-[#c0ff00]/10 text-[#c0ff00] border border-[#c0ff00]/20 backdrop-blur-sm rounded-full px-4 py-1.5">
              <Sparkles className="w-3.5 h-3.5 mr-1.5" />
              Trusted by 500+ Brands
            </Badge>
            <h1 className="text-3xl sm:text-4xl md:text-6xl font-bold mb-4 md:mb-6 leading-tight text-[#e8e6ed]">
              Find the Perfect
              <span className="block gradient-text">Collaboration Partner</span>
            </h1>
            <p className="text-base md:text-xl mb-6 md:mb-8 text-[#9d97a8] max-w-2xl mx-auto">
              Connect with verified influencers, athletes, and creators for authentic brand collaborations
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link to={userData?.role === 'talent' ? "/explore-brands" : "/explore"}>
                <Button size="lg" className="bg-[#c0ff00] text-[#1a1520] hover:bg-[#a8e000] text-base md:text-lg px-6 md:px-8 h-12 md:h-14 rounded-full font-semibold shadow-[0_0_24px_rgba(192,255,0,0.25)] w-full sm:w-auto">
                  {userData?.role === 'talent' ? 'Find Brands' : 'Find Talent'}
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </Link>
              {!userData && (
                <Link to="/auth">
                  <Button
                    size="lg"
                    variant="outline"
                    className="border-[rgba(192,255,0,0.2)] text-[#e8e6ed] hover:bg-[#342e40] text-base md:text-lg px-6 md:px-8 h-12 md:h-14 rounded-full w-full sm:w-auto"
                  >
                    Join as Talent
                  </Button>
                </Link>
              )}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Story-style Profile Scroll */}
      <section className="py-6 md:py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex gap-4 md:gap-6 overflow-x-auto hide-scrollbar pb-2">
            {storyProfiles.map((profile, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4, delay: idx * 0.06 }}
                className="flex flex-col items-center gap-1.5 flex-shrink-0"
              >
                <div className="w-16 h-16 md:w-20 md:h-20 rounded-full p-[2.5px] bg-gradient-to-br from-[#c0ff00] via-[#c0ff00]/50 to-[#7c3aed] shadow-[0_0_12px_rgba(192,255,0,0.2)]">
                  <img
                    src={profile.image}
                    alt={profile.name}
                    className="w-full h-full rounded-full object-cover border-[2.5px] border-[#2b2635]"
                  />
                </div>
                <span className="text-[11px] md:text-xs text-[#9d97a8] font-medium truncate max-w-[72px] text-center">{profile.name}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Events */}
      <section className="py-8 md:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl md:text-2xl font-bold text-[#e8e6ed]">Featured Events</h2>
            <Link to="/events" className="text-sm text-[#c0ff00] font-medium hover:underline">See All</Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
            {featuredEvents.map((event, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: idx * 0.1 }}
                viewport={{ once: true }}
              >
                <Link to="/events">
                  <Card className="relative overflow-hidden rounded-[20px] md:rounded-[24px] border-0 group cursor-pointer h-52 md:h-64">
                    <img src={event.image} alt={event.title} className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#1a1520] via-[#1a1520]/40 to-transparent" />
                    <div className="absolute bottom-0 left-0 right-0 p-5 md:p-6">
                      <h3 className="text-lg md:text-xl font-bold text-white mb-2">{event.title}</h3>
                      <div className="flex items-center gap-4 text-sm text-white/70">
                        <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" /> {event.location}</span>
                        <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" /> {event.date}</span>
                      </div>
                      <div className="flex items-center gap-1 mt-3">
                        <div className="flex -space-x-2">
                          {[1,2,3].map(i => (
                            <div key={i} className="w-6 h-6 rounded-full bg-[#3d3549] border-2 border-[#1a1520]" />
                          ))}
                        </div>
                        <span className="text-xs text-white/50 ml-2">+{event.attendees} attending</span>
                      </div>
                    </div>
                  </Card>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Trending Collaborations */}
      <section className="py-8 md:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl md:text-2xl font-bold text-[#e8e6ed]">Trending Collaborations</h2>
            <Link to="/campaigns" className="text-sm text-[#c0ff00] font-medium hover:underline">View All</Link>
          </div>
          <div className="flex gap-4 overflow-x-auto hide-scrollbar pb-2">
            {trendingCollabs.map((collab, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, x: 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4, delay: idx * 0.1 }}
                viewport={{ once: true }}
                className="flex-shrink-0 w-[260px] md:w-[300px]"
              >
                <Link to="/campaigns">
                  <Card className="overflow-hidden rounded-[20px] border-0 glass-card group cursor-pointer hover:shadow-[0_0_30px_rgba(192,255,0,0.08)] transition-all duration-300">
                    <img src={collab.image} alt={collab.title} className="w-full h-36 md:h-44 object-cover group-hover:scale-105 transition-transform duration-500" />
                    <div className="p-4">
                      <Badge className="mb-2 bg-[#c0ff00]/10 text-[#c0ff00] border-0 text-[10px] font-semibold rounded-full">{collab.type}</Badge>
                      <h3 className="font-semibold text-[#e8e6ed] text-sm mb-1">{collab.title}</h3>
                      <span className="text-xs text-[#9d97a8]">{collab.budget}</span>
                    </div>
                  </Card>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-12 md:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10 md:mb-16">
            <Badge className="mb-3 bg-[#c0ff00]/10 text-[#c0ff00] border-0 rounded-full">Simple Process</Badge>
            <h2 className="text-2xl md:text-4xl font-bold mb-3 text-[#e8e6ed]">How It Works</h2>
            <p className="text-base md:text-lg text-[#9d97a8] max-w-2xl mx-auto">
              Get started in three simple steps
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-8">
            {[
              {
                step: '01',
                icon: Search,
                title: 'Search & Filter',
                description: 'Browse thousands of verified influencers, athletes, and players with advanced filters.',
              },
              {
                step: '02',
                icon: Users,
                title: 'Connect & Collaborate',
                description: 'Send invitations and negotiate terms through our secure messaging platform.',
              },
              {
                step: '03',
                icon: Zap,
                title: 'Launch & Track',
                description: 'Launch campaigns and track performance with real-time analytics.',
              },
            ].map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <Card className="p-6 md:p-8 glass-card border-0 rounded-[20px] md:rounded-[24px] hover:shadow-[0_0_30px_rgba(192,255,0,0.06)] transition-all duration-300 group">
                  <div className="flex items-start gap-4 mb-4">
                    <div className="text-3xl md:text-4xl font-bold text-[#c0ff00]/15">{item.step}</div>
                    <div className="w-10 h-10 md:w-12 md:h-12 bg-[#c0ff00]/10 rounded-2xl flex items-center justify-center group-hover:bg-[#c0ff00]/15 transition-colors">
                      <item.icon className="w-5 h-5 md:w-6 md:h-6 text-[#c0ff00]" />
                    </div>
                  </div>
                  <h3 className="text-lg md:text-xl font-semibold mb-2 text-[#e8e6ed]">{item.title}</h3>
                  <p className="text-sm md:text-base text-[#9d97a8]">{item.description}</p>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="py-12 md:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10 md:mb-16">
            <Badge className="mb-3 bg-[#c0ff00]/10 text-[#c0ff00] border-0 rounded-full">Explore Categories</Badge>
            <h2 className="text-2xl md:text-4xl font-bold mb-3 text-[#e8e6ed]">Find Your Perfect Match</h2>
            <p className="text-base md:text-lg text-[#9d97a8] max-w-2xl mx-auto">
              Choose from our diverse categories of talent
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
            {categories.map((category, index) => (
              <motion.div
                key={category.id}
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <Link to={userData?.role === 'talent' ? `/explore-brands?category=${category.id}` : `/explore?category=${category.id}`}>
                  <Card className="p-6 md:p-8 glass-card border-0 rounded-[20px] md:rounded-[24px] group hover:shadow-[0_0_30px_rgba(192,255,0,0.06)] transition-all duration-300">
                    <div className="text-4xl md:text-5xl mb-3 md:mb-4">{category.icon}</div>
                    <h3 className="text-xl md:text-2xl font-semibold mb-2 text-[#e8e6ed] group-hover:text-[#c0ff00] transition-colors">
                      {category.name}
                    </h3>
                    <p className="text-sm text-[#9d97a8] mb-3 md:mb-4">{category.description}</p>
                    <div className="flex flex-wrap gap-2">
                      {category.subCategories.slice(0, 3).map((sub) => (
                        <Badge key={sub} variant="secondary" className="text-xs bg-[#3d3549] text-[#9d97a8] border-0 rounded-full">
                          {sub}
                        </Badge>
                      ))}
                    </div>
                  </Card>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Talents */}
      <section className="py-12 md:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10 md:mb-16">
            <Badge className="mb-3 bg-[#c0ff00]/10 text-[#c0ff00] border-0 rounded-full">Top Talent</Badge>
            <h2 className="text-2xl md:text-4xl font-bold mb-3 text-[#e8e6ed]">Featured Talents</h2>
            <p className="text-base md:text-lg text-[#9d97a8] max-w-2xl mx-auto">
              Meet some of our verified and highly-rated talent
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6 mb-8">
            {mockTalents.slice(0, 4).map((talent) => (
              <Link key={talent.id} to={`/talent/${talent.id}`}>
                <Card className="overflow-hidden glass-card border-0 rounded-[18px] md:rounded-[22px] group hover:shadow-[0_0_30px_rgba(192,255,0,0.06)] transition-all duration-300">
                  <div className="relative">
                    <img
                      src={talent.profileImage}
                      alt={talent.name}
                      className="w-full h-40 md:h-56 object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#1a1520]/80 via-transparent to-transparent" />
                    {talent.verified && (
                      <Badge className="absolute top-2 left-2 md:top-3 md:left-3 bg-[#c0ff00] text-[#1a1520] gap-1 text-[10px] md:text-xs border-0 rounded-full">
                        <CheckCircle className="w-3 h-3" />
                        Verified
                      </Badge>
                    )}
                  </div>
                  <div className="p-3 md:p-5">
                    <h3 className="font-semibold text-sm md:text-lg mb-0.5 text-[#e8e6ed] group-hover:text-[#c0ff00] transition-colors truncate">
                      {talent.name}
                    </h3>
                    <p className="text-xs md:text-sm text-[#9d97a8] mb-1 md:mb-2">{talent.subCategory}</p>
                    <div className="flex items-center gap-1.5 text-xs md:text-sm text-[#9d97a8]">
                      <Users className="w-3.5 h-3.5" />
                      <span>{(talent.followers / 1000).toFixed(0)}K</span>
                    </div>
                  </div>
                </Card>
              </Link>
            ))}
          </div>

          <div className="text-center">
            <Link to={userData?.role === 'talent' ? "/explore-brands" : "/explore"}>
              <Button size="lg" className="bg-[#c0ff00] text-[#1a1520] hover:bg-[#a8e000] rounded-full px-8 font-semibold shadow-[0_0_16px_rgba(192,255,0,0.2)]">
                {userData?.role === 'talent' ? 'View All Brands' : 'View All Talent'}
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-12 md:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10 md:mb-16">
            <Badge className="mb-3 bg-[#c0ff00]/10 text-[#c0ff00] border-0 rounded-full">Success Stories</Badge>
            <h2 className="text-2xl md:text-4xl font-bold mb-3 text-[#e8e6ed]">Trusted by Industry Leaders</h2>
            <p className="text-base md:text-lg text-[#9d97a8] max-w-2xl mx-auto">
              See what our clients have to say
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-8">
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <Card className="p-5 md:p-8 glass-card border-0 rounded-[20px] md:rounded-[24px]">
                  <div className="flex gap-1 mb-3 md:mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 md:w-5 md:h-5 fill-[#c0ff00] text-[#c0ff00]" />
                    ))}
                  </div>
                  <p className="text-sm md:text-base text-[#9d97a8] mb-4 md:mb-6 italic leading-relaxed">"{testimonial.content}"</p>
                  <div className="flex items-center gap-3 md:gap-4">
                    <img
                      src={testimonial.image}
                      alt={testimonial.name}
                      className="w-10 h-10 md:w-12 md:h-12 rounded-full object-cover border-2 border-[rgba(192,255,0,0.15)]"
                    />
                    <div>
                      <div className="font-semibold text-sm text-[#e8e6ed]">{testimonial.name}</div>
                      <div className="text-xs text-[#9d97a8]">{testimonial.role}</div>
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-12 md:py-20 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-[#2b2635] via-[#1a1520] to-[#2b2635]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-[#c0ff00]/5 rounded-full blur-[150px]" />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h2 className="text-2xl sm:text-3xl md:text-5xl font-bold mb-4 md:mb-6 text-[#e8e6ed]">
              Ready to Find Your Perfect
              <span className="block gradient-text">Collaboration?</span>
            </h2>
            <p className="text-base md:text-xl mb-6 md:mb-8 text-[#9d97a8]">
              Join thousands of brands and talents creating amazing partnerships
            </p>
            <div className="flex flex-col sm:flex-row gap-3 md:gap-4 justify-center">
              <Link to={userData?.role === 'talent' ? "/explore-brands" : "/explore"}>
                <Button size="lg" className="bg-[#c0ff00] text-[#1a1520] hover:bg-[#a8e000] text-base md:text-lg px-6 md:px-8 h-12 md:h-14 rounded-full font-semibold shadow-[0_0_24px_rgba(192,255,0,0.25)] animate-pulse-glow w-full sm:w-auto">
                  Get Started Now
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </Link>
              <Link to="/campaigns">
                <Button
                  size="lg"
                  variant="outline"
                  className="border-[rgba(192,255,0,0.2)] text-[#e8e6ed] hover:bg-[#342e40] text-base md:text-lg px-6 md:px-8 h-12 md:h-14 rounded-full w-full sm:w-auto"
                >
                  View Campaigns
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      <Footer />
      <BottomNav />
    </div>
  );
}
