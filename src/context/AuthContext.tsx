"use client";

import React, { createContext, useState, useContext, ReactNode, useEffect, useMemo, useCallback } from 'react';
import api, { UserPrivateProfileDto, UserForLoginDto, auth, users } from '@/lib/api';

interface AuthContextType {
    user: UserPrivateProfileDto | null;
    accessToken: string | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    usernameFor2fa: string | null;
    login: (credentials: UserForLoginDto) => Promise<{ requiresTwoFactor: boolean }>;
    completeLogin: (user: UserPrivateProfileDto, token: string) => void;
    logout: () => Promise<void>;
    refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<UserPrivateProfileDto | null>(null);
    const [accessToken, setAccessToken] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [usernameFor2fa, setUsernameFor2fa] = useState<string | null>(null);

    const completeLogin = useCallback((userData: UserPrivateProfileDto, token: string) => {
        setUser(userData);
        setAccessToken(token);
        setUsernameFor2fa(null);
        api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    }, []);

    const login = useCallback(async (credentials: UserForLoginDto) => {
        const response = await auth.login(credentials);

        if (response.requiresTwoFactor) {
            setUsernameFor2fa(credentials.userName);
            return { requiresTwoFactor: true };
        }

        if (response.user && response.accessToken) {
            completeLogin(response.user, response.accessToken);
            return { requiresTwoFactor: false };
        }

        throw new Error("Invalid API response during login");
    }, [completeLogin]);

    const logout = useCallback(async () => {
        setUser(null);
        setAccessToken(null);
        setUsernameFor2fa(null);
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
                // The refresh response contains user and accessToken directly
                const response = await auth.refresh();
                if (response.user && response.accessToken) {
                    completeLogin(response.user, response.accessToken);
                } else {
                    throw new Error("Refresh token invalid or expired.");
                }
            } catch (error) {
                console.log("No active session or session expired.");
                await logout();
            } finally {
                setIsLoading(false);
            }
        };

        restoreSession();
    }, [completeLogin, logout]);

    const value = useMemo(() => ({
        user,
        accessToken,
        isAuthenticated: !!accessToken,
        isLoading,
        usernameFor2fa,
        login,
        completeLogin,
        logout,
        refreshUser
    }), [user, accessToken, isLoading, usernameFor2fa, login, completeLogin, logout, refreshUser]);

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