import { useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Card } from '../components/ui/card';
import { Separator } from '../components/ui/separator';
import { Building2, User, ArrowLeft, AlertCircle } from 'lucide-react';

import { auth, db } from '../../services/firebase';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signInWithPopup, 
  GoogleAuthProvider 
} from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { apiUrl } from '@/lib/api';

export default function AuthPage() {
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [role, setRole] = useState<'brand' | 'talent' | null>(null);
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [brandName, setBrandName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (mode === 'signup' && role) {
        // Signup
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        try {
          // Save user to MongoDB backend
          const res = await fetch(apiUrl('/users/register'), {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              firebaseUid: user.uid,
              name: user.displayName || user.email?.split('@')[0] || 'User',
              email: user.email,
              role: role,
              ...(role === 'brand' && { brandName })
            })
          });
          if (!res.ok) throw new Error('Status ' + res.status);
          navigate('/profile-setup');
        } catch (dbError: any) {
          console.error("Backend Save Error:", dbError);
          setError("Account created, but we couldn't save your profile to the database.");
          // Optionally sign them out since their account is in a broken state
          await auth.signOut();
        }
      } else {
        // Login
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        // Fetch user from MongoDB to verify/store role if needed in future
        try {
          const token = await user.getIdToken();
          const response = await fetch(apiUrl('/users/me'), {
            headers: { Authorization: `Bearer ${token}` }
          });
          
          if (response.ok) {
            const result = await response.json();
            if (result.data?.role === 'admin') {
              console.log("Logged in as Admin");
            }
          } else {
            console.warn("User document missing in MongoDB.");
            setError("Account found, but profile data missing. Please contact support.");
          }
          navigate('/dashboard');
        } catch (dbError: any) {
          console.error("Backend Read Error:", dbError);
          setError("Logged in, but couldn't verify profile permissions.");
        }
      }
    } catch (err: any) {
      console.error('Authentication Error:', err);
      // Clean up Firebase errors
      if (err.code === 'auth/email-already-in-use') {
        setError('Email is already in use. Please log in.');
      } else if (err.code === 'auth/wrong-password' || err.code === 'auth/user-not-found' || err.code === 'auth/invalid-credential') {
        setError('Invalid email or password.');
      } else {
        setError(err.message || 'An error occurred during authentication');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleAuth = async () => {
    setError(null);
    if (mode === 'signup' && role === 'brand' && !brandName) {
      setError('Please provide a Brand Name before signing up with Google.');
      return;
    }
    
    setLoading(true);
    try {
      const provider = new GoogleAuthProvider();
      const userCredential = await signInWithPopup(auth, provider);
      const user = userCredential.user;

      const token = await user.getIdToken();
      const meResponse = await fetch(apiUrl('/users/me'), {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (!meResponse.ok) {
        if (mode === 'signup' && role) {
          // New Google Signup
          const res = await fetch(apiUrl('/users/register'), {
             method: 'POST',
             headers: { 'Content-Type': 'application/json' },
             body: JSON.stringify({
               firebaseUid: user.uid,
               name: user.displayName || user.email?.split('@')[0] || 'User',
               email: user.email,
               role: role,
               ...(role === 'brand' && { brandName })
             })
          });
          navigate('/profile-setup');
        } else {
          // They are trying to signup/signin with Google but haven't selected a role 
          // and no doc exists in Firestore.
          await auth.signOut();
          if (mode === 'login') {
            setError('Account not found. Please sign up first.');
            setMode('signup');
          } else {
            setError('Please select a role to sign up.');
          }
        }
      } else {
        // Google Login (doc exists)
        navigate('/dashboard');
      }
    } catch (err: any) {
      console.error('Google Auth Error:', err);
      setError(err.message || 'An error occurred during Google authentication');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#2b2635] flex">
      {/* Left Side - Image */}
      <div className="hidden lg:block lg:w-1/2 relative bg-[#1a1520]">
        <img
          src="https://images.unsplash.com/photo-1582005450386-52b25f82d9bb?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxicmFuZCUyMGNvbGxhYm9yYXRpb24lMjBtZWV0aW5nfGVufDF8fHx8MTc3NTAyODUzM3ww&ixlib=rb-4.1.0&q=80&w=1080"
          alt="Collaboration"
          className="w-full h-full object-cover opacity-20"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-[#c0ff00]/5 to-transparent" />
        <div className="absolute inset-0 flex items-center justify-center p-12">
          <div className="text-center">
            <h2 className="text-4xl font-bold mb-4 text-[#e8e6ed]">Welcome to TalentMatch</h2>
            <p className="text-xl text-[#9d97a8]">
              Connect with the perfect influencers, athletes, and players for your brand
            </p>
          </div>
        </div>
      </div>

      {/* Right Side - Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-foreground hover:text-foreground mb-8"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </Link>

          <div className="mb-6 md:mb-8">
            <h1 className="text-2xl md:text-3xl font-bold mb-2 text-[#e8e6ed]">
              {mode === 'login' ? 'Welcome Back' : 'Get Started'}
            </h1>
            <p className="text-sm text-[#9d97a8]">
              {mode === 'login'
                ? 'Log in to your account to continue'
                : 'Create an account to start collaborating'}
            </p>
          </div>

          {/* Role Selection (Signup only) */}
          {mode === 'signup' && !role && (
            <div className="space-y-4 mb-8">
              <Label>I am a...</Label>
              <div className="grid grid-cols-2 gap-4">
                <Card
                  className={`p-6 cursor-pointer hover:border-primary transition-all shadow-sm ${
                    role === 'brand' ? 'border-primary border-2 bg-primary/10' : 'border-border'
                  }`}
                  onClick={() => setRole('brand')}
                >
                  <Building2 className={`w-8 h-8 mb-3 ${role === 'brand' ? 'text-primary' : 'text-foreground'}`} />
                  <h3 className="font-semibold mb-1">Brand</h3>
                  <p className="text-sm text-foreground">Looking for talent</p>
                </Card>
                <Card
                  className={`p-6 cursor-pointer hover:border-primary transition-all shadow-sm ${
                    role === 'talent' ? 'border-primary border-2 bg-primary/10' : 'border-border'
                  }`}
                  onClick={() => setRole('talent')}
                >
                  <User className={`w-8 h-8 mb-3 ${role === 'talent' ? 'text-primary' : 'text-foreground'}`} />
                  <h3 className="font-semibold mb-1">Talent</h3>
                  <p className="text-sm text-foreground">Offering services</p>
                </Card>
              </div>
            </div>
          )}

          {/* Form (Login or after role selection) */}
          {(mode === 'login' || role) && (
            <form onSubmit={handleAuth} className="space-y-4">
              {error && (
                <div className="p-3 text-sm text-foreground bg-background border border-border rounded-lg flex items-start gap-2">
                  <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                  <span>{error}</span>
                </div>
              )}

              {mode === 'signup' && role === 'brand' && (
                <div>
                  <Label htmlFor="brandName">Brand Name</Label>
                  <Input
                    id="brandName"
                    type="text"
                    placeholder="Your Brand Name"
                    required
                    className="mt-1"
                    value={brandName}
                    onChange={(e) => setBrandName(e.target.value)}
                    disabled={loading}
                  />
                </div>
              )}

              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  required
                  className="mt-1"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={loading}
                />
              </div>

              <div>
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  required
                  className="mt-1"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={loading}
                />
              </div>

              {mode === 'login' && (
                <div className="flex items-center justify-between text-sm">
                  <label className="flex items-center gap-2">
                    <input type="checkbox" className="rounded border-border" />
                    <span className="text-foreground">Remember me</span>
                  </label>
                  <a href="#" className="text-primary hover:text-primary font-medium">
                    Forgot password?
                  </a>
                </div>
              )}

              <Button type="submit" className="w-full bg-[#c0ff00] text-[#1a1520] hover:bg-[#a8e000] font-semibold rounded-full" size="lg" disabled={loading}>
                {loading ? 'Processing...' : (mode === 'login' ? 'Log In' : 'Continue')}
              </Button>

              <div className="relative my-6">
                <Separator />
                <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-background px-4 text-sm text-foreground font-medium">
                  Or continue with
                </span>
              </div>

              <Button 
                type="button" 
                variant="outline" 
                className="w-full font-medium" 
                size="lg" 
                onClick={handleGoogleAuth}
                disabled={loading}
              >
                <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                  <path
                    fill="currentColor"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="currentColor"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
                Sign {mode === 'login' ? 'in' : 'up'} with Google
              </Button>

              <div className="text-center text-sm text-foreground mt-4">
                {mode === 'login' ? "Don't have an account? " : 'Already have an account? '}
                <button
                  type="button"
                  onClick={() => {
                    setMode(mode === 'login' ? 'signup' : 'login');
                    setRole(null);
                    setError(null);
                  }}
                  className="text-primary hover:text-primary font-semibold transition-colors"
                >
                  {mode === 'login' ? 'Sign up' : 'Log in'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

