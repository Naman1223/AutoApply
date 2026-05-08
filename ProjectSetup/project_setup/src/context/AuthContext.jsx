import { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "../supabaseClient";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [session, setSession] = useState(undefined); // undefined = loading
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    // 1. Read existing session from localStorage immediately (no network call)
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session ?? null);
      if (data.session?.user) fetchProfile(data.session.user.email);
    });

    // 2. Listen for future auth changes (login, logout, token refresh)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, newSession) => {
        setSession(newSession ?? null);
        if (newSession?.user) {
          fetchProfile(newSession.user.email);
        } else {
          setProfile(null);
        }
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const fetchProfile = async (email) => {
    try {
      const { data, error } = await supabase
        .from("users")
        .select("name, phone, country")
        .eq("email", email)
        .maybeSingle();
      if (!error) setProfile(data ?? null);
      else console.warn("Profile fetch skipped:", error.message);
    } catch (e) {
      console.warn("Profile fetch error:", e);
    }
  };

  const refreshProfile = () => {
    if (session?.user?.email) fetchProfile(session.user.email);
  };

  return (
    <AuthContext.Provider value={{ session, profile, refreshProfile }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
