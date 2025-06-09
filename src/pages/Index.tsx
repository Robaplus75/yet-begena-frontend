
import { useState, useEffect } from "react";
import { Toaster } from "@/components/ui/toaster";
import { supabase } from "@/integrations/supabase/client";
import { Session, User } from "@supabase/supabase-js";
import AuthForm from "@/components/AuthForm";
import Dashboard from "@/components/Dashboard";

export type UserType = "normal" | "instructor" | "employer" | "admin";

export interface UserProfile {
  id: string;
  full_name: string;
  email: string;
  role: UserType;
  cv_url?: string;
}

const Index = () => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [profileLoading, setProfileLoading] = useState(false);

  const createDefaultProfile = async (userId: string, userData: any) => {
    console.log('Creating default profile for user:', userId);
    try {
      const defaultProfile: UserProfile = {
        id: userId,
        full_name: userData.full_name || userData.email?.split('@')[0] || 'User',
        email: userData.email,
        role: (userData.role as UserType) || 'normal',
        cv_url: undefined
      };

      const { error } = await supabase
        .from('profiles')
        .upsert(defaultProfile, { onConflict: 'id' });

      if (error) {
        console.error('Error creating profile:', error);
        // If profile creation fails, use the default profile anyway
        setUserProfile(defaultProfile);
      } else {
        console.log('Profile created successfully');
        setUserProfile(defaultProfile);
      }
    } catch (error) {
      console.error('Error in createDefaultProfile:', error);
      // Create a fallback profile from user metadata
      const fallbackProfile: UserProfile = {
        id: userId,
        full_name: userData.full_name || userData.email?.split('@')[0] || 'User',
        email: userData.email,
        role: (userData.role as UserType) || 'normal',
        cv_url: undefined
      };
      setUserProfile(fallbackProfile);
    }
  };

  const fetchUserProfile = async (userId: string, userData: any) => {
    setProfileLoading(true);
    console.log('Fetching profile for user:', userId);
    
    try {
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();
      
      if (error) {
        console.error('Error fetching profile:', error);
        // If profile doesn't exist or there's an error, create a default one
        await createDefaultProfile(userId, userData);
      } else if (profile) {
        console.log('Profile fetched successfully:', profile);
        const userProfile: UserProfile = {
          id: profile.id,
          full_name: profile.full_name,
          email: profile.email,
          role: profile.role as UserType,
          cv_url: profile.cv_url || undefined
        };
        setUserProfile(userProfile);
      } else {
        // No profile found, create default
        await createDefaultProfile(userId, userData);
      }
    } catch (error) {
      console.error('Error in fetchUserProfile:', error);
      // Fallback to creating profile from user metadata
      await createDefaultProfile(userId, userData);
    } finally {
      setProfileLoading(false);
    }
  };

  useEffect(() => {
    console.log('Setting up auth state listener');
    
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        console.log('Auth state changed:', event, session);
        setSession(session);
        setUser(session?.user ?? null);

        if (session?.user) {
          // Use setTimeout to defer the profile fetch and avoid blocking auth state
          setTimeout(() => {
            fetchUserProfile(session.user.id, session.user.user_metadata);
          }, 0);
        } else {
          setUserProfile(null);
        }
        setLoading(false);
      }
    );

    // Check for existing session
    const checkSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        console.log('Initial session check:', session);
        
        if (session?.user) {
          setSession(session);
          setUser(session.user);
          await fetchUserProfile(session.user.id, session.user.user_metadata);
        }
      } catch (error) {
        console.error('Error checking session:', error);
      }
      setLoading(false);
    };

    checkSession();

    return () => subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    console.log('Logging out user');
    await supabase.auth.signOut();
  };

  // Show loading only if we're checking initial session or if we have a session but no profile yet
  if (loading || (session && !userProfile && profileLoading)) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-green-50 to-yellow-50 flex items-center justify-center">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  console.log('Rendering - Session:', !!session, 'UserProfile:', !!userProfile);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-green-50 to-yellow-50">
      <Toaster />
      {!session || !userProfile ? (
        <AuthForm />
      ) : (
        <Dashboard user={userProfile} onLogout={handleLogout} />
      )}
    </div>
  );
};

export default Index;
