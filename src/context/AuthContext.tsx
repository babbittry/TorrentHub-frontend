"use client";

import React, { createContext, useState, useContext, ReactNode, useEffect, useMemo, useCallback, useRef } from 'react';
import api, { UserPrivateProfileDto, UserForLoginDto, auth, users, LoginResponseDto } from '@/lib/api';

interface AuthContextType {
    user: UserPrivateProfileDto | null;
    accessToken: string | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    usernameFor2fa: string | null;
    login: (credentials: UserForLoginDto) => Promise<LoginResponseDto>;
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
    const refreshAttempted = useRef(false);

    const completeLogin = useCallback((userData: UserPrivateProfileDto, token: string) => {
        setUser(userData);
        setAccessToken(token);
        setUsernameFor2fa(null);
        api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    }, []);

    const login = useCallback(async (credentials: UserForLoginDto): Promise<LoginResponseDto> => {
        try {
            const response = await auth.login(credentials);

            if (response.result === 'Success' && response.user && response.accessToken) {
                completeLogin(response.user, response.accessToken);
            } else if (response.result === 'RequiresTwoFactor') {
                setUsernameFor2fa(credentials.userNameOrEmail);
            }

            return response;
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } catch (error: any) {
            if (error.response && error.response.data) {
                // If the error response has data, it's likely our LoginResultDto
                return error.response.data as LoginResponseDto;
            }
            // If not, it's an unexpected network error
            return { result: undefined, message: 'loginPage.unknown_error' };
        }
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
            if (refreshAttempted.current) {
                return;
            }
            refreshAttempted.current = true;

            try {
                // The refresh response contains user and accessToken directly
                const response = await auth.refresh();
                if (response.user && response.accessToken) {
                    completeLogin(response.user, response.accessToken);
                } else {
                    // This is a normal case when no session exists, so we don't throw an error.
                    // We just ensure the user is logged out on the client side.
                    setUser(null);
                    setAccessToken(null);
                }
            } catch (error) {
                // This is an expected failure when no session exists, so we just clear the client state.
                setUser(null);
                setAccessToken(null);
            } finally {
                setIsLoading(false);
            }
        };

        restoreSession();
    }, [completeLogin]);

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