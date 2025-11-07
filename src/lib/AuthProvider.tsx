// src/lib/AuthProvider.tsx
import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import * as LocalAuthentication from "expo-local-authentication";

type AuthUser = {
    id: string;
    email?: string | null;
} | null;

type AuthContextValue = {
    user: AuthUser;
    loading: boolean;
    signOut: () => Promise<void>;
    deleteAccount: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<AuthUser>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let mounted = true;

        // Initial session load
        (async () => {
            const { data } = await supabase.auth.getSession();
            if (mounted) {
                setUser(data.session?.user ?? null);
                setLoading(false);
            }
        })();

        // Listen for changes
        const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
            if (mounted) setUser(session?.user ?? null);
        });

        return () => {
            mounted = false;
            sub.subscription.unsubscribe();
        };
    }, []);

    const signOut = async () => {
        const { error } = await supabase.auth.signOut();
        if (error) {
            console.error('Error signing out', error.message);
            return;
        }
        setUser(null);
    };

    const deleteAccount = async () => {
        try {
            const avail = await LocalAuthentication.hasHardwareAsync();
            const enrolled = avail ? await LocalAuthentication.isEnrolledAsync() : false;
            if (enrolled) {
                const res = await LocalAuthentication.authenticateAsync({
                    promptMessage: "Confirm Identification to Delete Account",
                    cancelLabel: "Cancel",
                    disableDeviceFallback: false,
                });
                if (!res.success) return;
            }
        } catch {}

        const { data, error } = await supabase.functions.invoke('delete-account', { body: {} });
        if (error) {
            console.error("Delete account failed", error.message);
            throw error;
        }

        await supabase.auth.signOut();
    }

    return (
        <AuthContext.Provider value={{ user, loading, signOut, deleteAccount }}>
            { children }
        </AuthContext.Provider>
    )
}

// Optional helper
export function useAuth() {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
    return ctx;
}

