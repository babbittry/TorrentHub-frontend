'use client';

import React, { createContext, useContext, useEffect, useState, useMemo, useCallback } from 'react';
import { settings, AnonymousPublicSettingsDto, PublicSiteSettingsDto } from '@/lib/api';
import { useAuth } from './AuthContext';

interface PublicSettingsContextValue {
  publicSettings: AnonymousPublicSettingsDto | PublicSiteSettingsDto | null;
  isLoading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

const PublicSettingsContext = createContext<PublicSettingsContextValue | undefined>(undefined);

export function PublicSettingsProvider({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth();
  const [publicSettings, setPublicSettings] = useState<AnonymousPublicSettingsDto | PublicSiteSettingsDto | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchSettings = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      if (isAuthenticated) {
        // 认证用户：获取完整配置
        const config = await settings.getPublicSettings();
        setPublicSettings(config);
      } else {
        // 匿名用户：仅获取基础配置
        const config = await settings.getAnonymousPublicSettings();
        setPublicSettings(config);
      }
    } catch (err) {
      setError(err as Error);
      console.error('Failed to fetch public settings:', err);
      
      // 降级策略：设置默认值
      setPublicSettings({
        siteName: 'TorrentHub',
        logoUrl: null,
        contactEmail: null,
        isRegistrationOpen: false,
        isForumEnabled: true,
      });
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated]);

  // 初始加载
  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  const value = useMemo(() => ({
    publicSettings,
    isLoading,
    error,
    refetch: fetchSettings,
  }), [publicSettings, isLoading, error, fetchSettings]);

  return (
    <PublicSettingsContext.Provider value={value}>
      {children}
    </PublicSettingsContext.Provider>
  );
}

export function usePublicSettings() {
  const context = useContext(PublicSettingsContext);
  if (context === undefined) {
    throw new Error('usePublicSettings must be used within a PublicSettingsProvider');
  }
  return context;
}

/**
 * 类型守卫：检查是否为完整配置（认证用户配置）
 */
export function isAuthenticatedSettings(
  settings: AnonymousPublicSettingsDto | PublicSiteSettingsDto | null
): settings is PublicSiteSettingsDto {
  return settings !== null && 'isRequestSystemEnabled' in settings;
}