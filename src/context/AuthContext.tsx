"use client";

import React, { createContext, useState, useContext, ReactNode, useEffect, useMemo, useCallback } from 'react';
import api, { UserPrivateProfileDto, auth, users } from '@/lib/api';

interface AuthContextType {
    user: UserPrivateProfileDto | null;
    accessToken: string | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    login: (user: UserPrivateProfileDto, token: string) => void;
    logout: () => Promise<void>;
    refreshUser: () => Promise<void>;
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

    const refreshUser = useCallback(async () => {
        try {
            const updatedUser = await users.getMe();
            setUser(updatedUser);
        } catch (error) {
            console.error("Failed to refresh user data:", error);
            // Optional: Handle session expiry by logging out the user
            await logout();
        }
    }, [logout]);


    useEffect(() => {
        const restoreSession = async () => {
            try {
                const { accessToken, user } = await auth.refresh();
                login(user, accessToken);
            } catch (error) {
                console.log("No active session or session expired.");
                await logout();
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
        logout,
        refreshUser
    }), [user, accessToken, isLoading, login, logout, refreshUser]);

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