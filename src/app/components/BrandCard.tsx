import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { MapPin, Briefcase, Bookmark } from 'lucide-react';
import { Link } from 'react-router';
import { motion } from 'motion/react';
import { useState } from 'react';

interface BrandCardProps {
  brand: any;
}

export default function BrandCard({ brand }: BrandCardProps) {
  const [saved, setSaved] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      whileHover={{ y: -4 }}
    >
      <Card className="overflow-hidden glass-card border-0 rounded-[20px] hover:shadow-[0_0_30px_rgba(192,255,0,0.08)] transition-all duration-300 flex flex-col h-full group">
        <div className="relative">
          <div className="w-full h-32 bg-gradient-to-br from-[#342e40] to-[#c0ff00]/10 flex items-center justify-center overflow-hidden">
            {brand.profileImage ? (
              <img
                src={brand.profileImage}
                alt={brand.name}
                className="w-full h-full object-cover opacity-80 group-hover:scale-105 transition-transform duration-500"
              />
            ) : null}
          </div>
          <button
            onClick={() => setSaved(!saved)}
            className="absolute top-3 right-3 w-8 h-8 bg-[#1a1520]/50 backdrop-blur-sm rounded-full flex items-center justify-center hover:scale-110 transition-transform border border-white/10"
          >
            <Bookmark
              className={`w-4 h-4 ${saved ? 'fill-[#c0ff00] text-[#c0ff00]' : 'text-white/70'}`}
            />
          </button>
          <div className="absolute -bottom-8 left-5">
            <div className="w-14 h-14 bg-[#342e40] rounded-2xl shadow-lg border border-[rgba(192,255,0,0.1)] flex items-center justify-center overflow-hidden">
                 {brand.profileImage ? (
                    <img src={brand.profileImage} alt={brand.name} className="w-full h-full object-cover" />
                 ) : (
                    <span className="text-xl font-bold text-[#c0ff00] uppercase">{brand.name?.charAt(0) || 'B'}</span>
                 )}
            </div>
          </div>
        </div>

        <div className="p-4 md:p-5 pt-10 flex-1 flex flex-col">
          <div className="mb-3">
            <h3 className="font-semibold text-base md:text-lg mb-0.5 text-[#e8e6ed] group-hover:text-[#c0ff00] transition-colors">{brand.name}</h3>
            {brand.category && <p className="text-xs md:text-sm text-[#9d97a8]">{brand.category}</p>}
          </div>

          <div className="flex flex-col gap-1.5 mb-4 text-xs md:text-sm flex-1">
            {brand.location && (
              <div className="flex items-center gap-2 text-[#9d97a8]">
                <MapPin className="w-3.5 h-3.5 text-[#c0ff00]/50" />
                <span className="truncate">{brand.location.split(',')[0]}</span>
              </div>
            )}
            <div className="flex items-center gap-2 text-[#9d97a8]">
                <Briefcase className="w-3.5 h-3.5 text-[#c0ff00]/50" />
                <span className="truncate">Campaigns Available</span>
            </div>
          </div>

          <div className="flex gap-2 mt-auto">
            <Link to={`/brand/${brand._id || brand.id}`} className="flex-1">
              <Button variant="outline" className="w-full border-[rgba(192,255,0,0.15)] text-[#e8e6ed] hover:bg-[#c0ff00] hover:text-[#1a1520] hover:border-[#c0ff00] rounded-xl text-sm transition-all">
                View Brand
              </Button>
            </Link>
          </div>
        </div>
      </Card>
    </motion.div>
  );
}
