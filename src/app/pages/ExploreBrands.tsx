import { useState, useMemo, useEffect } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import BottomNav from '../components/BottomNav';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router';
import BrandCard from '../components/BrandCard';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Card } from '../components/ui/card';
import { Search } from 'lucide-react';
import { apiUrl } from '@/lib/api';

export default function ExploreBrands() {
  const [searchQuery, setSearchQuery] = useState('');
  const [dbBrands, setDbBrands] = useState<any[]>([]);

  const { currentUser, userData, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!authLoading) {
      if (!currentUser || userData?.role !== 'talent') {
        navigate('/dashboard');
        return;
      }
      
      const fetchBrands = async () => {
        try {
          const token = await currentUser.getIdToken();
          const res = await fetch(apiUrl('/brands'), {
            headers: {
              Authorization: `Bearer ${token}`
            }
          });
          if (res.ok) {
            const data = await res.json();
            setDbBrands(data.data || []);
          }
        } catch (err) {
          console.error('Fetch brands err:', err);
        }
      };
      
      fetchBrands();
    }
  }, [currentUser, userData, authLoading, navigate]);

  const filteredBrands = useMemo(() => {
    return dbBrands.filter((brand) => {
      if (
        searchQuery &&
        !brand.name?.toLowerCase().includes(searchQuery.toLowerCase()) &&
        !brand.category?.toLowerCase().includes(searchQuery.toLowerCase())
      ) {
        return false;
      }
      return true;
    });
  }, [searchQuery, dbBrands]);

  return (
    <div className="min-h-screen bg-[#2b2635] flex flex-col">
      <Navbar />

      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 md:py-8 pb-bottom-nav">
        <div className="mb-6">
          <h1 className="text-2xl md:text-3xl font-bold mb-1 text-[#e8e6ed]">Find Brands</h1>
          <p className="text-sm text-[#9d97a8]">
            Find innovative brands looking to collaborate with you.
          </p>
        </div>

        <div className="mb-6 max-w-2xl">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#9d97a8]" />
            <Input
              type="text"
              placeholder="Search by brand name or category..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-12 h-12 md:h-14 text-base md:text-lg bg-[#342e40] border-0 rounded-full text-[#e8e6ed] placeholder:text-[#9d97a8] focus:ring-[rgba(192,255,0,0.3)]"
            />
          </div>
        </div>

        <div className="mb-6">
          <p className="text-foreground">
            Showing <span className="font-semibold">{filteredBrands.length}</span>{' '}
            {filteredBrands.length === 1 ? 'brand' : 'brands'}
          </p>
        </div>

        {filteredBrands.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {filteredBrands.map((brand) => (
              <BrandCard key={brand._id || brand.id} brand={brand} />
            ))}
          </div>
        ) : (
          <Card className="p-12 text-center rounded-2xl bg-background shadow-sm border-0">
            <p className="text-foreground mb-4">
              No brands found matching your search.
            </p>
            <Button onClick={() => setSearchQuery('')} variant="outline">
              Clear Search
            </Button>
          </Card>
        )}
      </main>

      <Footer />
      <BottomNav />
    </div>
  );
}
