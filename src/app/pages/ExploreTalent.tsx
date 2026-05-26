import { useState, useMemo, useEffect } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import BottomNav from '../components/BottomNav';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router';
import TalentCard from '../components/TalentCard';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Slider } from '../components/ui/slider';
import { Checkbox } from '../components/ui/checkbox';
import { Card } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Separator } from '../components/ui/separator';
import { Search, Filter, X } from 'lucide-react';
import { categories } from '../data/mockData';
import { apiUrl } from '@/lib/api';

export default function ExploreTalent() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedSubCategories, setSelectedSubCategories] = useState<string[]>([]);
  const [followersRange, setFollowersRange] = useState([0, 2000000]);
  const [minEngagement, setMinEngagement] = useState(0);
  const [selectedLocations, setSelectedLocations] = useState<string[]>([]);
  const [verifiedOnly, setVerifiedOnly] = useState(false);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const [dbTalents, setDbTalents] = useState<any[]>([]);

  const { currentUser, userData, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  const [connections, setConnections] = useState<any[]>([]);
  const [sentInvites, setSentInvites] = useState<any[]>([]);

  useEffect(() => {
    if (!authLoading) {
      if (!currentUser || userData?.role !== 'brand') {
        navigate('/dashboard');
        return;
      }
      
      const fetchData = async () => {
        try {
          const token = await currentUser.getIdToken();
          const [talentsRes, connRes, invitesRes] = await Promise.all([
            fetch(apiUrl('/talents'), { headers: { Authorization: `Bearer ${token}` } }),
            fetch(apiUrl('/connections'), { headers: { Authorization: `Bearer ${token}` } }),
            fetch(apiUrl('/invites'), { headers: { Authorization: `Bearer ${token}` } })
          ]);
          
          if (talentsRes.ok) {
            const data = await talentsRes.json();
            setDbTalents(data.data || []);
          }
          if (connRes.ok) {
            const data = await connRes.json();
            setConnections(data.data || []);
          }
          if (invitesRes.ok) {
            const data = await invitesRes.json();
            // Store pending invites sent by this user
            setSentInvites(data.data?.filter((inv: any) => inv.senderId === currentUser.uid && inv.status === 'pending') || []);
          }
        } catch (err) {
          console.error(err);
        }
      };
      
      fetchData();
    }
  }, [currentUser, userData, authLoading, navigate]);

  // Extract unique locations
  const locations = useMemo(() => {
    const locs = dbTalents.map((t) => t.location?.split(',')[1]?.trim() || t.location).filter(Boolean);
    return [...new Set(locs)];
  }, [dbTalents]);

  // Get subcategories based on selected categories
  const availableSubCategories = useMemo(() => {
    if (selectedCategories.length === 0) {
      return categories.flatMap((c) => c.subCategories);
    }
    return categories
      .filter((c) => selectedCategories.includes(c.name))
      .flatMap((c) => c.subCategories);
  }, [selectedCategories]);

  // Filter talents
  const filteredTalents = useMemo(() => {
    return dbTalents.filter((talent) => {
      // Search query
      if (
        searchQuery &&
        !talent.name?.toLowerCase().includes(searchQuery.toLowerCase()) &&
        !talent.subCategory?.toLowerCase().includes(searchQuery.toLowerCase()) &&
        !(talent.tags || []).some((tag: string) => tag.toLowerCase().includes(searchQuery.toLowerCase()))
      ) {
        return false;
      }

      // Category filter
      if (selectedCategories.length > 0 && !selectedCategories.includes(talent.category)) {
        return false;
      }

      // Subcategory filter
      if (
        selectedSubCategories.length > 0 &&
        !selectedSubCategories.includes(talent.subCategory)
      ) {
        return false;
      }

      // Followers range
      const followersRaw = talent.followers || 0;
      let followersNum = 0;
      if (typeof followersRaw === 'string') {
        const clean = followersRaw.toUpperCase();
        if (clean.includes('M')) followersNum = parseFloat(clean) * 1000000;
        else if (clean.includes('K')) followersNum = parseFloat(clean) * 1000;
        else followersNum = parseFloat(clean) || 0;
      } else {
        followersNum = followersRaw;
      }

      if (followersNum < followersRange[0] || (followersRange[1] < 2000000 && followersNum > followersRange[1])) {
        return false;
      }

      // Engagement rate
      const engagementRaw = talent.engagementRate || 0;
      let engagementNum = 0;
      if (typeof engagementRaw === 'string') {
        engagementNum = parseFloat(engagementRaw) || 0;
      } else {
        engagementNum = engagementRaw;
      }

      if (engagementNum < minEngagement) {
        return false;
      }

      // Location filter
      if (selectedLocations.length > 0 && talent.location) {
        const talentLocation = talent.location.split(',')[1]?.trim() || talent.location;
        if (!selectedLocations.includes(talentLocation)) {
          return false;
        }
      }

      // Verified filter
      if (verifiedOnly && !talent.verified) {
        return false;
      }

      return true;
    });
  }, [
    searchQuery,
    selectedCategories,
    selectedSubCategories,
    followersRange,
    minEngagement,
    selectedLocations,
    verifiedOnly,
    dbTalents,
  ]);

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedCategories([]);
    setSelectedSubCategories([]);
    setFollowersRange([0, 2000000]);
    setMinEngagement(0);
    setSelectedLocations([]);
    setVerifiedOnly(false);
  };

  const hasActiveFilters =
    selectedCategories.length > 0 ||
    selectedSubCategories.length > 0 ||
    followersRange[0] > 0 ||
    followersRange[1] < 2000000 ||
    minEngagement > 0 ||
    selectedLocations.length > 0 ||
    verifiedOnly;

  const FilterPanel = () => (
    <div className="space-y-6">
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-lg">Filters</h3>
          {hasActiveFilters && (
            <Button variant="ghost" size="sm" onClick={clearFilters}>
              Clear All
            </Button>
          )}
        </div>
      </div>

      <Separator />

      {/* Category Filter */}
      <div>
        <Label className="text-base font-semibold mb-3 block">Category</Label>
        <div className="space-y-3">
          {categories.map((category) => (
            <div key={category.id} className="flex items-center gap-2">
              <Checkbox
                id={`cat-${category.id}`}
                checked={selectedCategories.includes(category.name)}
                onCheckedChange={(checked) => {
                  if (checked) {
                    setSelectedCategories([...selectedCategories, category.name]);
                  } else {
                    setSelectedCategories(
                      selectedCategories.filter((c) => c !== category.name)
                    );
                    // Clear subcategories of this category
                    setSelectedSubCategories(
                      selectedSubCategories.filter(
                        (sc) => !category.subCategories.includes(sc)
                      )
                    );
                  }
                }}
              />
              <label
                htmlFor={`cat-${category.id}`}
                className="text-sm cursor-pointer flex items-center gap-2"
              >
                <span>{category.icon}</span>
                <span>{category.name}</span>
              </label>
            </div>
          ))}
        </div>
      </div>

      <Separator />

      {/* Subcategory Filter */}
      {availableSubCategories.length > 0 && (
        <>
          <div>
            <Label className="text-base font-semibold mb-3 block">Sub-Category</Label>
            <div className="space-y-3 max-h-48 overflow-y-auto">
              {availableSubCategories.map((subCat) => (
                <div key={subCat} className="flex items-center gap-2">
                  <Checkbox
                    id={`subcat-${subCat}`}
                    checked={selectedSubCategories.includes(subCat)}
                    onCheckedChange={(checked) => {
                      if (checked) {
                        setSelectedSubCategories([...selectedSubCategories, subCat]);
                      } else {
                        setSelectedSubCategories(
                          selectedSubCategories.filter((sc) => sc !== subCat)
                        );
                      }
                    }}
                  />
                  <label
                    htmlFor={`subcat-${subCat}`}
                    className="text-sm cursor-pointer"
                  >
                    {subCat}
                  </label>
                </div>
              ))}
            </div>
          </div>
          <Separator />
        </>
      )}

      {/* Followers Range */}
      <div>
        <Label className="text-base font-semibold mb-3 block">Followers</Label>
        <div className="space-y-4">
          <Slider
            value={followersRange}
            onValueChange={setFollowersRange}
            min={0}
            max={2000000}
            step={50000}
            className="my-4"
          />
          <div className="flex items-center justify-between text-sm text-foreground">
            <span>{(followersRange[0] / 1000).toFixed(0)}K</span>
            <span>{(followersRange[1] / 1000).toFixed(0)}K</span>
          </div>
        </div>
      </div>

      <Separator />

      {/* Engagement Rate */}
      <div>
        <Label className="text-base font-semibold mb-3 block">
          Min. Engagement Rate: {minEngagement}%
        </Label>
        <Slider
          value={[minEngagement]}
          onValueChange={(value) => setMinEngagement(value[0])}
          min={0}
          max={10}
          step={0.5}
          className="my-4"
        />
      </div>

      <Separator />

      {/* Location Filter */}
      <div>
        <Label className="text-base font-semibold mb-3 block">Location</Label>
        <div className="space-y-3 max-h-48 overflow-y-auto">
          {locations.map((location) => (
            <div key={location} className="flex items-center gap-2">
              <Checkbox
                id={`loc-${location}`}
                checked={selectedLocations.includes(location)}
                onCheckedChange={(checked) => {
                  if (checked) {
                    setSelectedLocations([...selectedLocations, location]);
                  } else {
                    setSelectedLocations(
                      selectedLocations.filter((l) => l !== location)
                    );
                  }
                }}
              />
              <label htmlFor={`loc-${location}`} className="text-sm cursor-pointer">
                {location}
              </label>
            </div>
          ))}
        </div>
      </div>

      <Separator />

      {/* Verified Toggle */}
      <div className="flex items-center gap-2">
        <Checkbox
          id="verified"
          checked={verifiedOnly}
          onCheckedChange={(checked) => setVerifiedOnly(checked as boolean)}
        />
        <label htmlFor="verified" className="text-sm cursor-pointer">
          Show verified talents only
        </label>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#2b2635]">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 md:py-8 pb-bottom-nav">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl md:text-3xl font-bold mb-1 text-[#e8e6ed]">Find Talents</h1>
          <p className="text-sm text-[#9d97a8]">
            Find the perfect influencer, athlete, or player for your brand
          </p>
        </div>

        {/* Search Bar */}
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#9d97a8]" />
            <Input
              type="text"
              placeholder="Search by name, category, or tags..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-12 h-12 md:h-14 text-base md:text-lg bg-[#342e40] border-0 rounded-full text-[#e8e6ed] placeholder:text-[#9d97a8] focus:ring-[rgba(192,255,0,0.3)]"
            />
          </div>
        </div>

        <div className="flex gap-8">
          {/* Sidebar Filters - Desktop */}
          <aside className="hidden lg:block w-80 flex-shrink-0">
            <Card className="p-6 rounded-2xl sticky top-24">
              <FilterPanel />
            </Card>
          </aside>

          {/* Main Content */}
          <main className="flex-1">
            {/* Mobile Filter Button */}
            <div className="lg:hidden mb-6">
              <Button
                variant="outline"
                className="w-full"
                onClick={() => setMobileFiltersOpen(true)}
              >
                <Filter className="w-4 h-4 mr-2" />
                Filters
                {hasActiveFilters && (
                  <Badge className="ml-2 bg-primary text-[#2b2635]">Active</Badge>
                )}
              </Button>
            </div>

            {/* Active Filters */}
            {hasActiveFilters && (
              <div className="mb-6 flex flex-wrap gap-2">
                {selectedCategories.map((cat) => (
                  <Badge key={cat} variant="secondary" className="gap-1">
                    {cat}
                    <button
                      onClick={() =>
                        setSelectedCategories(selectedCategories.filter((c) => c !== cat))
                      }
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </Badge>
                ))}
                {verifiedOnly && (
                  <Badge variant="secondary" className="gap-1">
                    Verified
                    <button onClick={() => setVerifiedOnly(false)}>
                      <X className="w-3 h-3" />
                    </button>
                  </Badge>
                )}
              </div>
            )}

            {/* Results Header */}
            <div className="mb-6">
              <p className="text-foreground">
                Showing <span className="font-semibold">{filteredTalents.length}</span>{' '}
                {filteredTalents.length === 1 ? 'talent' : 'talents'}
              </p>
            </div>

            {/* Talent Grid */}
            {filteredTalents.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {filteredTalents.map((talent) => (
                  <TalentCard 
                    key={talent._id || talent.id} 
                    talent={talent} 
                    isConnected={connections.some(c => c.firebaseUid === talent.firebaseUid)}
                    isPending={sentInvites.some(inv => inv.receiverId === talent.firebaseUid)}
                  />
                ))}
              </div>
            ) : (
              <Card className="p-12 text-center rounded-2xl">
                <p className="text-foreground mb-4">
                  No talents found matching your criteria
                </p>
                <Button onClick={clearFilters} variant="outline">
                  Clear Filters
                </Button>
              </Card>
            )}
          </main>
        </div>
      </div>

      {/* Mobile Filter Modal */}
      {mobileFiltersOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="absolute inset-0 bg-background"
            onClick={() => setMobileFiltersOpen(false)}
          />
          <div className="absolute right-0 top-0 bottom-0 w-full max-w-sm bg-background overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-semibold text-lg">Filters</h3>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setMobileFiltersOpen(false)}
                >
                  <X className="w-5 h-5" />
                </Button>
              </div>
              <FilterPanel />
              <div className="mt-6">
                <Button
                  className="w-full bg-primary text-[#2b2635] hover:bg-primary text-[#2b2635]"
                  onClick={() => setMobileFiltersOpen(false)}
                >
                  Apply Filters
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      <Footer />
      <BottomNav />
    </div>
  );
}
