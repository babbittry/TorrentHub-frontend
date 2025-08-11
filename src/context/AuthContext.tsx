"use client";

import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import { users, auth, UserPrivateProfileDto } from '@/lib/api';
import Cookies from 'js-cookie';
import {useRouter, useParams} from "next/navigation";



interface AuthContextType {
    isAuthenticated: boolean;
    user: UserPrivateProfileDto | null;
    login: () => void;
    logout: () => void;
    isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<UserPrivateProfileDto | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const router = useRouter();
    const { locale } = useParams();

    const fetchUserProfile = async () => {
        try {
            const userData = await users.getMe();
            setUser(userData);
        } catch (error) {
            console.error("Failed to fetch user profile", error);
            setUser(null);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        console.log("AuthContext useEffect triggered, calling fetchUserProfile");
        fetchUserProfile();
    }, []);

    const login = () => {
        setIsLoading(true);
        fetchUserProfile();
    };

    const logout = async () => {
        try {
            await auth.logout();
        } catch (error) {
            console.error("Failed to logout from server", error);
            // Continue with client-side logout even if server logout fails
        }
        Cookies.remove('authToken');
        setUser(null);
                                router.push(`/${locale}/login`);
    };

    return (
        <AuthContext.Provider value={{ isAuthenticated: !!user, user, login, logout, isLoading }}>
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