import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

interface User {
  id: string;
  username: string;
  email: string | null;
  userType?: "admin" | "team_member";
  role?: string;
  permissions?: {
    canCreateInvoices?: boolean;
    canDeleteInvoices?: boolean;
    canManageServices?: boolean;
    canManageCompanyProfiles?: boolean;
    canManagePaymentMethods?: boolean;
    canManageTemplates?: boolean;
    canViewOnlyAssignedInvoices?: boolean;
    canManageTeamMembers?: boolean;
  };
  createdAt: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (username: string, email: string, password: string, confirmPassword: string) => Promise<void>;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
  hasPermission: (permission: string) => boolean;
  isAdmin: boolean;
  isTeamMember: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient();
  
  // Query to get current user
  const { data: user, isLoading } = useQuery<User>({
    queryKey: ['/api/auth/me'],
    retry: false,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Login mutation
  const loginMutation = useMutation({
    mutationFn: async ({ email, password }: { email: string; password: string }) => {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
        credentials: 'include',
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Login failed');
      }
      
      return response.json();
    },
    onSuccess: (userData) => {
      queryClient.setQueryData(['/api/auth/me'], userData);
      queryClient.invalidateQueries({ queryKey: ['/api/auth/me'] });
    },
  });

  // Signup mutation
  const signupMutation = useMutation({
    mutationFn: async ({ username, email, password, confirmPassword }: { 
      username: string; 
      email: string; 
      password: string; 
      confirmPassword: string; 
    }) => {
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, email, password, confirmPassword }),
        credentials: 'include',
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Signup failed');
      }
      
      return response.json();
    },
    onSuccess: (userData) => {
      queryClient.setQueryData(['/api/auth/me'], userData);
      queryClient.invalidateQueries({ queryKey: ['/api/auth/me'] });
    },
  });

  // Logout mutation
  const logoutMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include',
      });
      
      if (!response.ok) {
        throw new Error('Logout failed');
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.setQueryData(['/api/auth/me'], null);
      queryClient.clear();
    },
  });

  const login = async (email: string, password: string) => {
    await loginMutation.mutateAsync({ email, password });
  };

  const signup = async (username: string, email: string, password: string, confirmPassword: string) => {
    await signupMutation.mutateAsync({ username, email, password, confirmPassword });
  };

  const logout = async () => {
    await logoutMutation.mutateAsync();
  };

  // Helper methods for team member permissions
  const hasPermission = (permission: string): boolean => {
    if (!user) return false;
    // Admin users have all permissions
    if (user.userType === "admin" || !user.userType) return true; // Default to admin for existing users
    // Team members need specific permission
    if (user.userType === "team_member" && user.permissions) {
      return user.permissions[permission as keyof typeof user.permissions] === true;
    }
    return false;
  };

  const isAdmin = user?.userType === "admin" || (!user?.userType && !!user); // Default to admin for existing users
  const isTeamMember = user?.userType === "team_member";

  const value: AuthContextType = {
    user: user || null,
    isLoading,
    login,
    signup,
    logout,
    isAuthenticated: !!user,
    hasPermission,
    isAdmin,
    isTeamMember,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}