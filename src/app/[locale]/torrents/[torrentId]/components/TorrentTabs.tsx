'use client';

import { useState } from "react";
import { FileText, Image as ImageIcon, ArrowUp, ArrowDown, Check } from "lucide-react";
import React from "react";
import { useTranslations } from 'next-intl';
import { TorrentDto } from "@/lib/api";
import UserDisplay from "@/app/[locale]/components/UserDisplay";
import MarkdownRenderer from "@/app/[locale]/components/MarkdownRenderer";

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
  const [isMediaInfoExpanded, setIsMediaInfoExpanded] = useState(false);

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
              <div className="mb-8">
                <h2 className="text-xl font-bold text-foreground mb-2">{t('title')}</h2>
                <p className="text-lg text-foreground break-all">{torrent.name}</p>
                {torrent.subtitle && (
                  <>
                    <h2 className="text-xl font-bold text-foreground mt-8 mb-2">{t('subtitle')}</h2>
                    <p className="text-base text-foreground/90 break-all">{torrent.subtitle}</p>
                  </>
                )}
              </div>

              {torrent.description && (
                <div className="mb-8">
                  <h2 className="text-xl font-bold text-foreground mb-2">{t('description')}</h2>
                  <div className="bg-secondary/20 rounded-md">
                    <MarkdownRenderer content={torrent.description} />
                  </div>
                </div>
              )}

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
              {torrent.mediaInfo && (
                <div className="mt-8">
                  <button
                    onClick={() => setIsMediaInfoExpanded(!isMediaInfoExpanded)}
                    className="flex items-center gap-2 text-xl font-bold text-foreground mb-4 hover:text-primary transition-colors"
                  >
                    MediaInfo
                    {isMediaInfoExpanded ? <ArrowUp className="h-5 w-5" /> : <ArrowDown className="h-5 w-5" />}
                  </button>
                  
                  {isMediaInfoExpanded && (
                    <div className="bg-secondary/30 p-4 rounded-md overflow-x-auto animate-in fade-in slide-in-from-top-2">
                      <pre className="text-xs font-mono text-muted-foreground whitespace-pre-wrap break-all">
                        {torrent.mediaInfo}
                      </pre>
                    </div>
                  )}
                </div>
              )}
            </div>
            <div className="bg-background/50 p-6 rounded-xl shadow-md h-fit">
                <h2 className="text-xl font-bold text-foreground mb-4">{t('status.title')}</h2>
                <div className="space-y-4 text-muted-foreground">
                    <div className="flex justify-between items-center">
                        <span>{t('status.uploader')}</span>
                        {torrent.uploader || torrent.isAnonymous ? (
                            <UserDisplay
                                user={torrent.uploader}
                                showAvatar={false}
                                isAnonymous={torrent.isAnonymous}
                                showUsername={true}
                            />
                        ) : (
                            <span className="font-semibold text-muted-foreground">N/A</span>
                        )}
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
            <div className="mt-6">
                {torrent.screenshots && torrent.screenshots.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {torrent.screenshots.map((screenshot, index) => (
                            <div
                                key={index}
                                className="relative group overflow-hidden rounded-lg border border-border bg-secondary/50 hover:border-primary transition-colors cursor-pointer"
                                onClick={() => window.open(screenshot, '_blank')}
                            >
                                <img
                                    src={screenshot}
                                    alt={`${torrent.name} - Screenshot ${index + 1}`}
                                    className="w-full h-auto object-cover aspect-video group-hover:scale-105 transition-transform duration-300"
                                    loading="lazy"
                                />
                                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center">
                                    <ImageIcon className="w-8 h-8 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="bg-background/50 p-6 rounded-xl shadow-md text-center">
                        <ImageIcon className="mx-auto h-12 w-12 text-muted-foreground" />
                        <h3 className="mt-2 text-sm font-medium text-foreground">{t('screenshots.noScreenshots')}</h3>
                        <p className="mt-1 text-sm text-muted-foreground">{t('screenshots.noScreenshotsBody')}</p>
                    </div>
                )}
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