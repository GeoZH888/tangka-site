import { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from './supabase.js';

/**
 * Auth context — exposes the current user, admin status, and login/logout.
 *
 * Auth model:
 *   - Magic-link email login (no passwords)
 *   - Admin status determined by raw_app_meta_data.role === 'admin'
 *     (set in Supabase dashboard for your account)
 */
const AuthContext = createContext({
  user: null,
  isAdmin: false,
  loading: true,
  signInWithEmail: async () => {},
  signOut: async () => {},
});

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check current session
    supabase.auth.getSession().then(({ data }) => {
      setUser(data.session?.user || null);
      setLoading(false);
    });

    // Subscribe to auth changes (login, logout, token refresh)
    const { data: subscription } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user || null);
      }
    );

    return () => subscription.subscription.unsubscribe();
  }, []);

  // Accept admin role from either metadata location, with either label.
  // Some platforms (CLF) put role in user_metadata; we also accept it there.
  // Both 'admin' and 'superadmin' are recognized.
  const roleFromApp = user?.app_metadata?.role;
  const roleFromUser = user?.user_metadata?.role;
  const role = roleFromApp || roleFromUser;
  const isAdmin = role === 'admin' || role === 'superadmin';

  async function signInWithEmail(email) {
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        // After clicking the magic link, return to /admin
        emailRedirectTo: `${window.location.origin}${import.meta.env.BASE_URL || '/'}admin`,
      },
    });
    if (error) throw error;
  }

  async function signOut() {
    await supabase.auth.signOut();
  }

  return (
    <AuthContext.Provider value={{ user, isAdmin, loading, signInWithEmail, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
