'use client';

import { ForumPostDto, UserDisplayDto, CreateForumPostDto, COMMENT_TYPE } from '@/lib/api';
import { formatDistanceToNow } from 'date-fns';
import { zhCN, enUS, fr, ja } from 'date-fns/locale';
import { useState } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faReply, faTrash, faQuoteLeft } from '@fortawesome/free-solid-svg-icons';
import { Link } from '@/i18n/navigation';
import UserDisplay from './UserDisplay';
import ReplyEditor from './ReplyEditor';
import MarkdownRenderer from './MarkdownRenderer';
import CommentReactionBar from './CommentReactionBar';

interface ForumPostTreeProps {
    posts: ForumPostDto[];
    onReply: (parentId: number, replyToUser: UserDisplayDto) => void;
    onLoadMore?: () => void;
    hasMore?: boolean;
    isLoading?: boolean;
    canDelete?: (post: ForumPostDto) => boolean;
    onDelete?: (postId: number) => void;
    isDeleting?: boolean;
    onSubmitReply?: (data: { text: string; parentCommentId?: number | null; replyToUserId?: number | null }) => Promise<void>;
}

const dateLocales = {
    'zh-CN': zhCN,
    'en': enUS,
    'fr': fr,
    'ja': ja,
};

export default function ForumPostTree({
    posts,
    onReply,
    onLoadMore,
    hasMore,
    isLoading,
    canDelete,
    onDelete,
    isDeleting,
    onSubmitReply,
}: ForumPostTreeProps) {
    const t = useTranslations();
    const locale = useLocale() as keyof typeof dateLocales;
    const [activeReplyId, setActiveReplyId] = useState<number | null>(null);
    const [expandedQuotes, setExpandedQuotes] = useState<Set<number>>(new Set());

    // 按 Floor 全局排序
    const sortedPosts = [...posts].sort((a, b) => a.floor - b.floor);

    // 查找父帖子
    const getParentPost = (post: ForumPostDto): ForumPostDto | null => {
        if (!post.parentPostId) return null;
        return posts.find(p => p.id === post.parentPostId) || null;
    };

    // 切换引用展开/折叠
    const toggleQuote = (postId: number) => {
        const newExpanded = new Set(expandedQuotes);
        if (newExpanded.has(postId)) {
            newExpanded.delete(postId);
        } else {
            newExpanded.add(postId);
        }
        setExpandedQuotes(newExpanded);
    };

    const handleReplyClick = (post: ForumPostDto) => {
        setActiveReplyId(post.id);
        if (post.author) {
            onReply(post.id, post.author);
        }
    };

    const handleSubmitReply = async (data: { text: string; parentCommentId?: number | null; replyToUserId?: number | null }) => {
        if (onSubmitReply) {
            await onSubmitReply(data);
            setActiveReplyId(null);
        }
    };

    const handleCancelReply = () => {
        setActiveReplyId(null);
    };

    const renderPost = (post: ForumPostDto) => {
        const parentPost = getParentPost(post);
        const isReplyEditorOpen = activeReplyId === post.id;
        const isQuoteExpanded = expandedQuotes.has(post.id);

        return (
            <div
                key={post.id}
                id={`post-${post.id}`}
                className="border-b border-gray-200 dark:border-gray-700 last:border-b-0 py-4 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
            >
                {/* 帖子主体 */}
                <div className="flex items-start gap-4">
                    {/* 左侧头像 - 只显示头像,不显示用户名,可点击跳转 */}
                    <div className="flex-shrink-0">
                        {post.author && (
                            <UserDisplay user={post.author} showAvatar={true} avatarSize="md" showUsername={false} />
                        )}
                    </div>

                    {/* 右侧内容区 */}
                    <div className="flex-1 min-w-0">
                        {/* 顶部信息栏 - 用户信息在左,时间在右 */}
                        <div className="flex items-center justify-between gap-3 mb-2">
                            <div className="flex items-center gap-3 flex-wrap">
                                {post.author && (
                                    <UserDisplay user={post.author} />
                                )}
                                <span className="text-sm font-semibold text-gray-600 dark:text-gray-400">#{post.floor}</span>
                            </div>
                            <span className="text-xs text-gray-400 dark:text-gray-500 flex-shrink-0">
                                {formatDistanceToNow(new Date(post.createdAt), {
                                    addSuffix: true,
                                    locale: dateLocales[locale],
                                })}
                            </span>
                        </div>

                        {/* 引用信息 */}
                        {parentPost && post.replyToUser && parentPost.content && (
                            <div className="mb-3 bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-400 dark:border-blue-500 rounded-r overflow-hidden">
                                <div className="px-3 py-2">
                                    <div className="flex items-center justify-between mb-1">
                                        <div className="flex items-center gap-1.5 text-sm text-blue-600 dark:text-blue-400">
                                            <FontAwesomeIcon icon={faQuoteLeft} className="w-3 h-3" />
                                            <span>
                                                {t('reply.quote')} #{parentPost.floor} @{post.replyToUser.username}
                                            </span>
                                        </div>
                                        {parentPost.content.length > 150 && (
                                            <button
                                                onClick={() => toggleQuote(post.id)}
                                                className="text-xs text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 flex-shrink-0"
                                            >
                                                {isQuoteExpanded ? t('reply.collapse') : t('reply.expand')}
                                            </button>
                                        )}
                                    </div>
                                    <div
                                        className="text-sm text-gray-600 dark:text-gray-400 italic"
                                        style={{
                                            maxHeight: !isQuoteExpanded && parentPost.content.length > 150 ? '4.5em' : 'none',
                                            overflow: 'hidden',
                                            display: '-webkit-box',
                                            WebkitLineClamp: !isQuoteExpanded && parentPost.content.length > 150 ? 3 : 'unset',
                                            WebkitBoxOrient: 'vertical',
                                        }}
                                    >
                                        <MarkdownRenderer content={parentPost.content} />
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* 帖子内容 */}
                        <div className="text-gray-800 dark:text-gray-200 mb-3 break-words">
                            <MarkdownRenderer content={post.content} />
                        </div>

                        {/* 表情回应栏 */}
                        <div className="mb-3">
                            <CommentReactionBar
                                commentType={COMMENT_TYPE.FORUM_POST}
                                commentId={post.id}
                                initialReactions={post.reactions}
                            />
                        </div>

                        {/* 操作按钮区 */}
                        <div className="flex items-center justify-end gap-3">
                            <button
                                onClick={() => handleReplyClick(post)}
                                className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-md transition-colors"
                            >
                                <FontAwesomeIcon icon={faReply} className="w-3.5 h-3.5" />
                                <span>{t('reply.reply')}</span>
                            </button>

                            {canDelete && canDelete(post) && onDelete && (
                                <button
                                    onClick={() => onDelete(post.id)}
                                    disabled={isDeleting}
                                    className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-md transition-colors disabled:opacity-50"
                                >
                                    <FontAwesomeIcon icon={faTrash} className="w-3.5 h-3.5" />
                                    <span>{isDeleting ? t('reply.deleting') : t('reply.delete')}</span>
                                </button>
                            )}
                        </div>
                    </div>
                </div>

                {/* 内联回复编辑器 */}
                {isReplyEditorOpen && onSubmitReply && (
                    <div
                        id={`reply-editor-${post.id}`}
                        className="ml-16 mt-4 animate-in fade-in slide-in-from-top-2 duration-200"
                    >
                        <ReplyEditor
                            onSubmit={handleSubmitReply}
                            onCancel={handleCancelReply}
                            parentId={post.id}
                            replyToUser={post.author}
                        />
                    </div>
                )}
            </div>
        );
    };

    return (
        <div className="space-y-0">
            {sortedPosts.length === 0 ? (
                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                    {t('reply.no_posts')}
                </div>
            ) : (
                <>
                    <div className="divide-y divide-gray-200 dark:divide-gray-700">
                        {sortedPosts.map((post) => renderPost(post))}
                    </div>
                    {hasMore && onLoadMore && (
                        <div className="pt-4">
                            <button
                                onClick={onLoadMore}
                                disabled={isLoading}
                                className="w-full py-3 px-4 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 disabled:opacity-50 rounded-md transition-colors font-medium text-gray-700 dark:text-gray-200"
                            >
                                {isLoading ? t('reply.loading') : t('reply.load_more')}
                            </button>
                        </div>
                    )}
                </>
            )}
        </div>
    );
}