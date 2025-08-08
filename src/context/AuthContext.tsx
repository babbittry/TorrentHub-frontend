
"use client";

import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import { fetchApi } from '@/lib/apiClient'; // We need fetchApi to check the auth status

interface AuthContextType {
    isAuthenticated: boolean;
    login: () => void; // login function no longer takes a token
    logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isLoading, setIsLoading] = useState(true); // Add a loading state

    useEffect(() => {
        // Check the user's authentication status on initial load.
        // We do this by making a request to a protected endpoint.
        // If the request succeeds, the user is logged in (browser sent the HttpOnly cookie).
        const checkAuthStatus = async () => {
            try {
                // Replace with an actual lightweight protected endpoint from your API
                await fetchApi('/api/User/profile');
                setIsAuthenticated(true);
            } catch (error) {
                setIsAuthenticated(false);
            } finally {
                setIsLoading(false);
            }
        };

        checkAuthStatus();
    }, []);

    const login = () => {
        // This function is now just for updating the client-side state.
        // The actual login logic (setting the cookie) is handled in the login page.
        setIsAuthenticated(true);
    };

    const logout = async () => {
        try {
            // It's good practice to have a backend endpoint to invalidate the cookie.
            await fetchApi('/api/User/logout', { method: 'POST' });
        } catch (error) {
            console.error("Logout failed:", error);
        }
        // Even if the backend call fails, we log the user out on the client-side.
        setIsAuthenticated(false);
    };

    // While checking auth status, we can render a loading indicator or nothing
    if (isLoading) {
        return null; // Or a loading spinner
    }

    return (
        <AuthContext.Provider value={{ isAuthenticated, login, logout }}>
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
