import { Link } from 'react-router';
import { Facebook, Twitter, Instagram, Linkedin, Youtube } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import logo from '../../assets/marketplace_logo.jpeg';

export default function Footer() {
  const { userData } = useAuth();
  return (
    <footer className="bg-[#1a1520] text-[#9d97a8] pb-24 md:pb-0">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-8">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <Link to="/" className="flex items-center gap-2 mb-4">
              <img src={logo} alt="TalentMatch Logo" className="w-28 h-7 rounded-lg object-cover" />
            </Link>
            <p className="text-sm text-[#9d97a8] mb-4 leading-relaxed">
              Connecting brands with the perfect influencers, athletes, and players for impactful collaborations.
            </p>
            <div className="flex gap-2">
              {[Facebook, Twitter, Instagram, Linkedin, Youtube].map((Icon, i) => (
                <a key={i} href="#" className="w-8 h-8 flex items-center justify-center rounded-full bg-[#342e40] hover:bg-[#c0ff00]/10 hover:text-[#c0ff00] transition-all">
                  <Icon className="w-3.5 h-3.5" />
                </a>
              ))}
            </div>
          </div>

          {/* For Brands */}
          <div>
            <h3 className="font-semibold text-[#e8e6ed] mb-4 text-sm">For Brands</h3>
            <ul className="space-y-2.5">
              <li>
                <Link to={userData?.role === 'talent' ? "/explore-brands" : "/explore"} className="text-sm hover:text-[#c0ff00] transition-colors">
                  {userData?.role === 'talent' ? 'Find Brands' : 'Find Talent'}
                </Link>
              </li>
              {userData?.role !== 'talent' && (
                <li>
                  <Link to="/campaigns" className="text-sm hover:text-[#c0ff00] transition-colors">
                    Post Campaign
                  </Link>
                </li>
              )}
              <li>
                <Link to="/#how-it-works" className="text-sm hover:text-[#c0ff00] transition-colors">
                  How it Works
                </Link>
              </li>
              <li>
                <Link to="#" className="text-sm hover:text-[#c0ff00] transition-colors">
                  Pricing
                </Link>
              </li>
            </ul>
          </div>

          {/* For Talent */}
          <div>
            <h3 className="font-semibold text-[#e8e6ed] mb-4 text-sm">For Talent</h3>
            <ul className="space-y-2.5">
              <li><Link to="/auth" className="text-sm hover:text-[#c0ff00] transition-colors">Join as Talent</Link></li>
              <li><Link to="/campaigns" className="text-sm hover:text-[#c0ff00] transition-colors">Browse Campaigns</Link></li>
              <li><Link to="#" className="text-sm hover:text-[#c0ff00] transition-colors">Success Stories</Link></li>
              <li><Link to="#" className="text-sm hover:text-[#c0ff00] transition-colors">Resources</Link></li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <h3 className="font-semibold text-[#e8e6ed] mb-4 text-sm">Company</h3>
            <ul className="space-y-2.5">
              <li><Link to="#" className="text-sm hover:text-[#c0ff00] transition-colors">About Us</Link></li>
              <li><Link to="#" className="text-sm hover:text-[#c0ff00] transition-colors">Careers</Link></li>
              <li><Link to="#" className="text-sm hover:text-[#c0ff00] transition-colors">Press</Link></li>
              <li><Link to="#" className="text-sm hover:text-[#c0ff00] transition-colors">Contact</Link></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-[rgba(192,255,0,0.06)] pt-6 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-xs text-[#9d97a8]">
            © 2026 TalentMatch. All rights reserved.
          </p>
          <div className="flex gap-6">
            <Link to="#" className="text-xs text-[#9d97a8] hover:text-[#c0ff00] transition-colors">Privacy Policy</Link>
            <Link to="#" className="text-xs text-[#9d97a8] hover:text-[#c0ff00] transition-colors">Terms of Service</Link>
            <Link to="#" className="text-xs text-[#9d97a8] hover:text-[#c0ff00] transition-colors">Cookie Policy</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
