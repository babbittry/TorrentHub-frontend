"use client";

import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import { fetchApi } from '@/lib/apiClient';
import Cookies from 'js-cookie';
import {useRouter} from "next/navigation";

interface User {
    id: number;
    userName: string;
    avatar: string | null;
    role: string;
}

interface AuthContextType {
    isAuthenticated: boolean;
    user: User | null;
    login: () => void;
    logout: () => void;
    isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const router = useRouter();

    const fetchUserProfile = async () => {
        try {
            const userData = await fetchApi<User>('/api/User/self');
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

    const logout = () => {
        Cookies.remove('authToken');
        setUser(null);
        router.push('/login');
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