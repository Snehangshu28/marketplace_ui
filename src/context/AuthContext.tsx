import { createContext, useContext, useEffect, useState } from 'react';
import { User, onAuthStateChanged, signOut } from 'firebase/auth';
import { auth } from '../services/firebase';
import { apiUrl, fetchWithIdToken } from '@/lib/api';

interface AuthContextType {
  currentUser: User | null;
  userRole: string | null;
  userData: any | null; // MongoDB user data
  setUserData: (data: any) => void;
  loading: boolean;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  currentUser: null,
  userRole: null,
  userData: null,
  setUserData: () => {},
  loading: true,
  logout: async () => {},
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [userData, setUserData] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setLoading(true);
      setCurrentUser(user);
      
      if (user) {
        // Fetch role from backend
        try {
          const response = await fetchWithIdToken('/users/me', user);
          
          if (response.ok) {
            const data = await response.json();
            const fetchedUserData = data.data || data;
            setUserRole(fetchedUserData?.role || null);
            setUserData(fetchedUserData);
          } else {
            setUserRole(null);
            setUserData(null);
          }
        } catch (error) {
          console.error("Failed to fetch user role from db:", error);
          setUserRole(null);
        }
      } else {
        setUserRole(null);
        setUserData(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const logout = async () => {
    try {
      await signOut(auth);
    } catch (err) {
      console.error("Logout Error:", err);
    }
  };

  return (
    <AuthContext.Provider value={{ currentUser, userRole, userData, setUserData, loading, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
