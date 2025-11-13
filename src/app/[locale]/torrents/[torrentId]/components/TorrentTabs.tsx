'use client';

import { useState } from "react";
import { FileText, Image as ImageIcon, ArrowUp, ArrowDown, Check } from "lucide-react";
import React from "react";
import { useTranslations } from 'next-intl';
import { TorrentDto } from "@/lib/api";

interface TorrentTabsProps {
  torrent: TorrentDto;
  commentsSection: React.ReactNode;
  commentsCount: number;
  onCommentsTabOpen: () => void;
  commentsLoading: boolean;
}

const formatBytes = (bytes: number | undefined | null): string => {
    if (bytes === null || bytes === undefined || bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
};

const TorrentTabs = ({ torrent, commentsSection, commentsCount, onCommentsTabOpen, commentsLoading }: TorrentTabsProps) => {
  const t = useTranslations('torrentDetail');
  const [activeTab, setActiveTab] = useState('details');

  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId);
    if (tabId === 'comments') {
      onCommentsTabOpen();
    }
  };

  const tabs = [
    { id: 'details', label: t('tabs.details') },
    { id: 'comments', label: t('tabs.comments', { count: commentsCount }) },
    { id: 'screenshots', label: t('tabs.screenshots') },
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'details':
        return (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-6">
            <div className="lg:col-span-2 bg-background/50 p-6 rounded-xl shadow-md">
              <h2 className="text-xl font-bold text-foreground mb-4">{t('techSpecs.title')}</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4 text-muted-foreground">
                <div className="flex flex-col"><span className="text-sm">{t('techSpecs.fileSize')}</span><span className="font-semibold text-foreground">{formatBytes(torrent.size)}</span></div>
                <div className="flex flex-col"><span className="text-sm">{t('techSpecs.resolution')}</span><span className="font-semibold text-foreground">{torrent.technicalSpecs?.resolution || 'N/A'}</span></div>
                <div className="flex flex-col"><span className="text-sm">{t('techSpecs.videoCodec')}</span><span className="font-semibold text-foreground">{torrent.technicalSpecs?.videoCodec || 'N/A'}</span></div>
                <div className="flex flex-col"><span className="text-sm">{t('techSpecs.audioCodec')}</span><span className="font-semibold text-foreground">{torrent.technicalSpecs?.audioCodec || 'N/A'}</span></div>
                <div className="flex flex-col"><span className="text-sm">{t('techSpecs.subtitles')}</span><span className="font-semibold text-foreground">{torrent.technicalSpecs?.subtitles || 'N/A'}</span></div>
                <div className="flex flex-col"><span className="text-sm">{t('techSpecs.source')}</span><span className="font-semibold text-foreground">{torrent.technicalSpecs?.source || 'N/A'}</span></div>
              </div>
              <h2 className="text-xl font-bold text-foreground mt-8 mb-4">{t('fileList.title')}</h2>
              <ul className="space-y-2 text-sm text-muted-foreground">
                {torrent.files && torrent.files.length > 0 ? (
                  torrent.files.map((file) => (
                    <li key={file.name} className="flex items-center gap-2 bg-secondary/50 p-2 rounded-md">
                      <FileText className="h-4 w-4 shrink-0" />
                      <span className="grow truncate">{file.name}</span>
                      <span className="shrink-0 font-mono">{formatBytes(file.size)}</span>
                    </li>
                  ))
                ) : (
                  <p>{t('fileList.noFiles')}</p>
                )}
              </ul>
            </div>
            <div className="bg-background/50 p-6 rounded-xl shadow-md h-fit">
                <h2 className="text-xl font-bold text-foreground mb-4">{t('status.title')}</h2>
                <div className="space-y-4 text-muted-foreground">
                    <div className="flex justify-between items-center">
                        <span>{t('status.uploader')}</span>
                        <span className="font-semibold text-primary">{torrent.uploader?.username || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between items-center">
                        <span>{t('status.uploadTime')}</span>
                        <span className="font-semibold text-foreground">{new Date(torrent.createdAt).toLocaleString()}</span>
                    </div>
                    <hr className="border-border" />
                    <div className="flex justify-between items-center">
                        <span className="flex items-center gap-2"><ArrowUp className="h-4 w-4 text-green-500" />{t('status.seeders')}</span>
                        <span className="font-semibold text-green-500">{torrent.seeders}</span>
                    </div>
                    <div className="flex justify-between items-center">
                        <span className="flex items-center gap-2"><ArrowDown className="h-4 w-4 text-red-500" />{t('status.leechers')}</span>
                        <span className="font-semibold text-red-500">{torrent.leechers}</span>
                    </div>
                    <div className="flex justify-between items-center">
                        <span className="flex items-center gap-2"><Check className="h-4 w-4 text-blue-500" />{t('status.completed')}</span>
                        <span className="font-semibold text-blue-500">{torrent.snatched}</span>
                    </div>
                </div>
            </div>
          </div>
        );
      case 'comments':
        return (
          <div className="mt-6">
            {commentsLoading ? (
              <div className="flex items-center justify-center py-12">
                <p className="text-muted-foreground">{t('tabs.loadingComments')}</p>
              </div>
            ) : (
              commentsSection
            )}
          </div>
        );
      case 'screenshots':
        return (
            <div className="bg-background/50 p-6 rounded-xl shadow-md mt-6 text-center">
                <ImageIcon className="mx-auto h-12 w-12 text-muted-foreground" />
                <h3 className="mt-2 text-sm font-medium text-foreground">{t('screenshots.comingSoonTitle')}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{t('screenshots.comingSoonBody')}</p>
            </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="px-6 md:px-8 pb-6 md:pb-8 mt-8">
      <div className="border-b border-border">
        <nav aria-label="Tabs" className="-mb-px flex space-x-6">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => handleTabChange(tab.id)}
              className={`shrink-0 border-b-2 px-1 pb-4 text-sm font-medium ${
                activeTab === tab.id
                  ? 'border-primary text-primary'
                  : 'border-transparent text-muted-foreground hover:border-gray-300 hover:text-foreground'
              }`}
              aria-current={activeTab === tab.id ? 'page' : undefined}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>
      {renderContent()}
    </div>
  );
};

export default TorrentTabs;