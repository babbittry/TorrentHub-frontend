"use client";

import { AuthProvider, useAuth } from '@/context/AuthContext';
import { PublicSettingsProvider } from '@/context/PublicSettingsContext';
import api, { auth as authApi } from '@/lib/api'; // Import authApi
import { useEffect } from 'react';
import { Toaster } from "@/components/ui/sonner"
import { ThemeProvider as NextThemesProvider } from "next-themes";
import { SWRConfig } from 'swr';

let isRefreshing = false;
// The queue now holds callbacks that expect an error or a token
let failedRequestsQueue: ((error: Error | null, token: string | null) => void)[] = [];

const processQueue = (error: Error | null, token: string | null = null) => {
    failedRequestsQueue.forEach(callback => {
        callback(error, token);
    });
    failedRequestsQueue = [];
};

const AppWithInterceptors = ({ children }: { children: React.ReactNode }) => {
    const auth = useAuth();
    useEffect(() => {
        const responseInterceptor = api.interceptors.response.use(
            (response) => response,
            async (error) => {
                const originalRequest = error.config;
                // Check for 401, not a refresh token request, and not a retry already
                if (error.response?.status === 401 && originalRequest.url !== '/api/auth/refresh' && !originalRequest._retry) {
                    if (isRefreshing) {
                        return new Promise((resolve, reject) => {
                            failedRequestsQueue.push((err, token) => {
                                if (err) {
                                    return reject(err);
                                }
                                originalRequest.headers['Authorization'] = `Bearer ${token}`;
                                resolve(api(originalRequest));
                            });
                        });
                    }
            
                    originalRequest._retry = true;
                    isRefreshing = true;
            
                    return new Promise(async (resolve, reject) => {
                        try {
                            const { accessToken, user } = await authApi.refresh();
                            if (user && accessToken) {
                                auth.completeLogin(user, accessToken);
                            } else {
                                throw new Error("Invalid refresh response");
                            }
                            api.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;
                            processQueue(null, accessToken);
                            
                            // Retry the original request
                            originalRequest.headers['Authorization'] = `Bearer ${accessToken}`;
                            resolve(api(originalRequest));
            
                        } catch (refreshError) {
                            processQueue(refreshError as Error, null);
                            auth.logout();
                            reject(refreshError);
                        } finally {
                            isRefreshing = false;
                        }
                    });
                }
                return Promise.reject(error);
            }
        );

        // Cleanup interceptors on component unmount
        return () => {
            api.interceptors.response.eject(responseInterceptor);
        };
    }, [auth.login, auth.logout]);

    return <>{children}</>;
};


export function Providers({ children }: { children: React.ReactNode }) {
    return (
        <NextThemesProvider
            attribute="class"
            defaultTheme="system"
            enableSystem={true}
            storageKey="torrenthub-theme"
            disableTransitionOnChange={false}
        >
            <SWRConfig
                value={{
                    // 核心配置：只在浏览器刷新时更新数据
                    revalidateOnFocus: false,       // 切换标签不刷新
                    revalidateOnReconnect: false,   // 网络重连不刷新
                    revalidateOnMount: true,        // 组件挂载时请求（浏览器F5刷新会触发）
                    revalidateIfStale: false,       // 数据过期不刷新
                    refreshInterval: 0,             // 不自动定时刷新
                    
                    // 缓存策略
                    dedupingInterval: 2000,         // 2秒内相同请求去重
                    
                    // 错误处理
                    shouldRetryOnError: false,      // 错误时不重试
                    
                    // 使用内存缓存
                    provider: () => new Map(),
                }}
            >
                <AuthProvider>
                    <PublicSettingsProvider>
                        <AppWithInterceptors>
                            {children}
                        </AppWithInterceptors>
                        <Toaster />
                    </PublicSettingsProvider>
                </AuthProvider>
            </SWRConfig>
        </NextThemesProvider>
    )
}
