"use client";

import React, { createContext, useState, useContext, ReactNode, useEffect, useMemo, useCallback } from 'react';
import api, { UserPrivateProfileDto, auth } from '@/lib/api'; // Import auth API and api instance

interface AuthContextType {
    user: UserPrivateProfileDto | null;
    accessToken: string | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    login: (user: UserPrivateProfileDto, token: string) => void;
    logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<UserPrivateProfileDto | null>(null);
    const [accessToken, setAccessToken] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    const login = useCallback((userData: UserPrivateProfileDto, token: string) => {
        setUser(userData);
        setAccessToken(token);
        api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    }, []);

    const logout = useCallback(async () => {
        setUser(null);
        setAccessToken(null);
        delete api.defaults.headers.common['Authorization'];
        try {
            await auth.logout();
        } catch (error) {
            console.error("Logout failed on server:", error);
        }
    }, []);

    useEffect(() => {
        const restoreSession = async () => {
            try {
                const { accessToken, user } = await auth.refresh();
                login(user, accessToken);
            } catch (error) {
                console.log("No active session or session expired.");
                // Call logout to ensure all state is cleared consistently
                logout();
            } finally {
                setIsLoading(false);
            }
        };

        restoreSession();
    }, [login, logout]);

    const value = useMemo(() => ({
        user,
        accessToken,
        isAuthenticated: !!accessToken,
        isLoading,
        login,
        logout
    }), [user, accessToken, isLoading, login, logout]);

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