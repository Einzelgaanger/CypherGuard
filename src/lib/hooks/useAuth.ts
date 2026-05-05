import { useState, useEffect } from 'react';
import { useAuthActions } from "@convex-dev/auth/react";
import { useQuery } from 'convex/react';
import { api } from '../../../convex/_generated/api';

export const useAuth = () => {
  const { signIn, signOut } = useAuthActions();
  const convexUser = useQuery(api.auth.currentUser);
  const [devUser, setDevUser] = useState<any>(null);

  // Check for development auth state
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedDevUser = localStorage.getItem('dev_user');
      if (storedDevUser) {
        setDevUser(JSON.parse(storedDevUser));
      }
    }
  }, []);

  // Use dev user if available, otherwise use Convex auth user
  const user = devUser || convexUser;

  const login = async (email: string, password: string) => {
    try {
      await signIn("password", { email, password });
      return true;
    } catch (error) {
      throw error;
    }
  };

  const logout = async () => {
    // Clear dev auth if it exists
    if (devUser) {
      localStorage.removeItem('dev_user');
      setDevUser(null);
    } else {
      await signOut();
    }
  };

  return {
    user,
    isLoading: !devUser && convexUser === undefined,
    isAuthenticated: !!user,
    login,
    logout,
  };
}; 