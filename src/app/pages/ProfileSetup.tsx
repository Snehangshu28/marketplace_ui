import { useState, useEffect } from 'react';
import { auth } from '../../services/firebase';
import { useNavigate } from 'react-router';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { Card } from '../components/ui/card';
import { Progress } from '../components/ui/progress';
import { Badge } from '../components/ui/badge';
import { ArrowLeft, ArrowRight, Check, Upload } from 'lucide-react';
import { categories } from '../data/mockData';
import { apiUrl } from '@/lib/api';
import SocialConnectButtons from '../components/SocialConnectButtons';

export default function ProfileSetup() {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    fullName: '',
    displayName: '',
    brandName: '',
    categories: [] as string[],
    subCategory: '',
    bio: '',
    location: '',
    instagram: '',
    youtube: '',
    twitter: '',
    tiktok: '',
    profileImage: '',
  });
  const navigate = useNavigate();
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  const [role, setRole] = useState<string | null>(null);

  useEffect(() => {
    const fetchUserRole = () => {
      const unsubscribe = auth.onAuthStateChanged(async (user) => {
        if (user) {
          try {
            const token = await user.getIdToken();
            const response = await fetch(apiUrl('/users/me'), {
              headers: { Authorization: `Bearer ${token}` }
            });
            if (response.ok) {
              const result = await response.json();
              setRole(result.data?.role || null);
              if (result.data) {
                setFormData(prev => ({
                  ...prev,
                  brandName: result.data.brandName || prev.brandName,
                  fullName: result.data.fullName || prev.fullName,
                  displayName: result.data.displayName || prev.displayName,
                }));
              }
            }
          } catch (err) {
            console.error('Error fetching role:', err);
          }
        }
      });
      return () => unsubscribe();
    };
    fetchUserRole();
  }, []);

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setIsUploadingPhoto(true);
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData({ ...formData, profileImage: reader.result as string });
        setIsUploadingPhoto(false);
      };
      reader.readAsDataURL(file);
    }
  };

  const getStepsList = () => {
    const list = ['Basic Info'];
    if (role === 'talent') {
      list.push('Category');
    }
    list.push('Social Media');
    return list;
  };
  
  const stepsList = getStepsList();
  const totalSteps = stepsList.length;
  const progress = (step / totalSteps) * 100;
  const currentStepTitle = stepsList[step - 1];

  useEffect(() => {
    if (step > totalSteps && totalSteps > 0) {
      setStep(totalSteps);
    }
  }, [totalSteps, step]);

  const handleNext = async () => {
    // Validate required fields
    if (currentStepTitle === 'Basic Info') {
      if (role === 'brand') {
        if (!formData.brandName || !formData.location || !formData.bio) {
          alert('Please fill out all required fields (Brand Name, Location, Bio).');
          return;
        }
      } else {
        if (!formData.fullName || !formData.displayName || !formData.location || !formData.bio) {
          alert('Please fill out all required fields (Full Name, Display Name, Location, Bio).');
          return;
        }
      }
    } else if (currentStepTitle === 'Category') {
      if (formData.categories.length === 0) {
        alert('Please select at least one sub-category.');
        return;
      }
    }

    if (step < totalSteps) {
      setStep(step + 1);
    } else {
      try {
        const token = await auth.currentUser?.getIdToken();
        const response = await fetch(apiUrl('/users/profile'), {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(formData)
        });

        if (!response.ok) {
          const errText = await response.text();
          throw new Error(`Failed to save profile on backend. Status: ${response.status}, Error: ${errText}`);
        }

        navigate('/dashboard');
      } catch (err) {
        console.error('Error saving profile:', err);
        alert(String(err));
      }
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  return (
    <div className="min-h-screen bg-background py-12">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8">
          <Badge className="mb-4">Profile Setup</Badge>
          <h1 className="text-3xl font-bold mb-2">Complete Your Profile</h1>
          <p className="text-foreground">
            Step {step} of {totalSteps}
          </p>
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <Progress value={progress} className="h-2" />
          <div className="flex justify-between mt-4 text-sm">
            {stepsList.map((title, idx) => (
              <span key={title} className={step >= idx + 1 ? 'text-primary font-semibold' : 'text-foreground'}>
                {title}
              </span>
            ))}
          </div>
        </div>

        <Card className="p-8 rounded-2xl">
          {/* Step 1: Basic Info */}
          {currentStepTitle === 'Basic Info' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-semibold mb-4">Basic Information</h2>
                <p className="text-foreground mb-6">
                  Let's start with some basic information about you
                </p>
              </div>

              <div className="space-y-4">
                <div className="flex flex-col gap-2">
                  <Label>Profile Photo</Label>
                  <div className="flex items-center gap-4">
                    <div className="w-20 h-20 bg-background rounded-full flex items-center justify-center overflow-hidden border border-border">
                      {formData.profileImage ? (
                        <img src={formData.profileImage} alt="Profile" className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-foreground text-xs">No Photo</span>
                      )}
                    </div>
                    <div className="flex-1">
                      <Input
                        type="file"
                        accept="image/*"
                        onChange={handlePhotoUpload}
                        className="cursor-pointer"
                        disabled={isUploadingPhoto}
                      />
                      <p className="text-xs text-foreground mt-1">Recommended size: 256x256px</p>
                    </div>
                  </div>
                </div>

                {role === 'brand' ? (
                  <div>
                    <Label htmlFor="brandName">Brand Name *</Label>
                    <Input
                      id="brandName"
                      value={formData.brandName}
                      onChange={(e) =>
                        setFormData({ ...formData, brandName: e.target.value })
                      }
                      placeholder="Your Brand Name"
                      className="mt-1"
                    />
                  </div>
                ) : (
                  <>
                    <div>
                      <Label htmlFor="fullName">Full Name *</Label>
                      <Input
                        id="fullName"
                        value={formData.fullName}
                        onChange={(e) =>
                          setFormData({ ...formData, fullName: e.target.value })
                        }
                        placeholder="John Doe"
                        className="mt-1"
                      />
                    </div>

                    <div>
                      <Label htmlFor="displayName">Display Name *</Label>
                      <Input
                        id="displayName"
                        value={formData.displayName}
                        onChange={(e) =>
                          setFormData({ ...formData, displayName: e.target.value })
                        }
                        placeholder="johndoe"
                        className="mt-1"
                      />
                      <p className="text-sm text-foreground mt-1">
                        This is how you'll appear to others
                      </p>
                    </div>
                  </>
                )}

                <div>
                  <Label htmlFor="location">Location *</Label>
                  <Input
                    id="location"
                    value={formData.location}
                    onChange={(e) =>
                      setFormData({ ...formData, location: e.target.value })
                    }
                    placeholder="Los Angeles, CA"
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="bio">Bio *</Label>
                  <Textarea
                    id="bio"
                    value={formData.bio}
                    onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                    placeholder="Tell us about yourself..."
                    rows={4}
                    className="mt-1"
                  />
                  <p className="text-sm text-foreground mt-1">
                    {formData.bio.length}/500 characters
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Category */}
          {currentStepTitle === 'Category' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-semibold mb-4">Choose Your Category</h2>
                <p className="text-foreground mb-6">Select the category that best describes you</p>
              </div>

              <div className="space-y-8 mb-6">
                {categories.map((category) => (
                  <div key={category.id} className="space-y-4">
                    <div className="flex items-center gap-2 pb-2 border-b">
                      <span className="text-2xl">{category.icon}</span>
                      <h3 className="text-lg font-semibold text-foreground">{category.name}</h3>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                      {category.subCategories.map((subCat) => {
                        const isSelected = formData.categories.includes(subCat);
                        return (
                          <div
                            key={subCat}
                            className={`flex items-center gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                              isSelected
                                ? 'border-primary bg-primary/10 shadow-sm'
                                : 'border-border hover:border-primary bg-background'
                            }`}
                            onClick={() => {
                              if (isSelected) {
                                setFormData({
                                  ...formData,
                                  categories: formData.categories.filter((c) => c !== subCat),
                                });
                              } else {
                                setFormData({
                                  ...formData,
                                  categories: [...formData.categories, subCat],
                                });
                              }
                            }}
                          >
                            <div className={`w-5 h-5 rounded border flex items-center justify-center shrink-0 transition-colors ${isSelected ? 'bg-primary text-[#2b2635] border-primary' : 'border-border'}`}>
                              {isSelected && <Check className="w-3.5 h-3.5 text-foreground" />}
                            </div>
                            <span className="text-sm font-medium text-foreground select-none">{subCat}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Step 3: Social Media */}
          {currentStepTitle === 'Social Media' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-semibold mb-4">Social Media Accounts</h2>
                <p className="text-foreground mb-4">
                  Connect your accounts or enter handles manually — you can skip and finish this later.
                </p>
              </div>

              <div className="rounded-xl border border-primary/20 bg-primary/10 p-4 space-y-3">
                <p className="text-sm font-medium text-primary">Quick connect</p>
                <p className="text-xs text-primary/80">
                  Facebook and Instagram use Meta login on our server. You’ll return here after authorizing.
                </p>
                <SocialConnectButtons layout="stack" className="sm:flex-row sm:flex-wrap" />
              </div>

              <p className="text-sm font-medium text-foreground">Or add handles manually</p>

              <div className="space-y-4">
                <div>
                  <Label htmlFor="instagram">Instagram</Label>
                  <div className="relative mt-1">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-foreground">
                      @
                    </span>
                    <Input
                      id="instagram"
                      value={formData.instagram}
                      onChange={(e) =>
                        setFormData({ ...formData, instagram: e.target.value })
                      }
                      placeholder="username"
                      className="pl-8"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="youtube">YouTube</Label>
                  <div className="relative mt-1">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-foreground">
                      youtube.com/@
                    </span>
                    <Input
                      id="youtube"
                      value={formData.youtube}
                      onChange={(e) =>
                        setFormData({ ...formData, youtube: e.target.value })
                      }
                      placeholder="channel"
                      className="pl-32"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="twitter">Twitter / X</Label>
                  <div className="relative mt-1">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-foreground">
                      @
                    </span>
                    <Input
                      id="twitter"
                      value={formData.twitter}
                      onChange={(e) =>
                        setFormData({ ...formData, twitter: e.target.value })
                      }
                      placeholder="username"
                      className="pl-8"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="tiktok">TikTok</Label>
                  <div className="relative mt-1">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-foreground">
                      @
                    </span>
                    <Input
                      id="tiktok"
                      value={formData.tiktok}
                      onChange={(e) =>
                        setFormData({ ...formData, tiktok: e.target.value })
                      }
                      placeholder="username"
                      className="pl-8"
                    />
                  </div>
                </div>
              </div>

              <div className="rounded-xl border border-dashed border-border bg-background p-4 text-sm text-foreground">
                <span className="font-medium text-foreground">Prefer to skip?</span> Use{' '}
                <span className="font-medium">Skip for now</span> below — you can update social links from your profile
                anytime.
              </div>
            </div>
          )}

          {/* Navigation */}
          <div className="flex flex-wrap items-center justify-between gap-3 mt-8 pt-6 border-t">
            <div className="flex flex-wrap items-center gap-2">
              <Button
                variant="outline"
                onClick={handleBack}
                disabled={step === 1}
                className="gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                Back
              </Button>
              {currentStepTitle === 'Social Media' && (
                <Button type="button" variant="ghost" className="text-foreground" onClick={handleNext}>
                  Skip for now
                </Button>
              )}
            </div>

            <p className="text-sm text-foreground order-last w-full text-center sm:order-none sm:w-auto">
              Profile completion: {Math.round(progress)}%
            </p>

            <Button onClick={handleNext} className="bg-primary text-[#2b2635] hover:bg-primary text-[#2b2635] gap-2">
              {step === totalSteps ? 'Complete' : 'Next'}
              {step === totalSteps ? (
                <Check className="w-4 h-4" />
              ) : (
                <ArrowRight className="w-4 h-4" />
              )}
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}
