'use client';

import { CommentDto, UserDisplayDto } from '@/lib/api';
import { formatDistanceToNow } from 'date-fns';
import { zhCN, enUS, fr, ja } from 'date-fns/locale';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import UserDisplay from './UserDisplay';

interface CommentTreeProps {
  comments: CommentDto[];
  onReply: (parentId: number, replyToUser: UserDisplayDto) => void;
  onLoadMore?: () => void;
  hasMore?: boolean;
  isLoading?: boolean;
  canDelete?: (comment: CommentDto) => boolean;
  onDelete?: (commentId: number) => void;
  isDeleting?: boolean;
}

const dateLocales = {
  'zh-CN': zhCN,
  'en': enUS,
  'fr': fr,
  'ja': ja,
};

export default function CommentTree({
  comments,
  onReply,
  onLoadMore,
  hasMore,
  isLoading,
  canDelete,
  onDelete,
  isDeleting,
}: CommentTreeProps) {
  const { i18n, t } = useTranslation();
  const [expandedReplies, setExpandedReplies] = useState<Set<number>>(new Set());
  const locale = (i18n.language || 'en') as keyof typeof dateLocales;

  const toggleReplies = (commentId: number) => {
    const newExpanded = new Set(expandedReplies);
    if (newExpanded.has(commentId)) {
      newExpanded.delete(commentId);
    } else {
      newExpanded.add(commentId);
    }
    setExpandedReplies(newExpanded);
  };

  const renderComment = (comment: CommentDto, isReply: boolean = false) => {
    const isExpanded = expandedReplies.has(comment.id);
    const hasReplies = comment.replyCount > 0;

    return (
      <div
        key={comment.id}
        className={`${isReply ? 'ml-8 border-l-2 border-gray-200 pl-4' : ''} py-4`}
      >
        {/* Comment Header */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3 flex-1">
            {comment.user && <UserDisplay user={comment.user} />}
            <span className="text-sm text-gray-500">#{comment.floor}</span>
            {comment.replyToUser && (
              <span className="text-sm text-blue-600">
                {t('reply_to')} @{comment.replyToUser.username}
              </span>
            )}
          </div>
          <span className="text-xs text-gray-400 whitespace-nowrap">
            {formatDistanceToNow(new Date(comment.createdAt), {
              addSuffix: true,
              locale: dateLocales[locale],
            })}
          </span>
        </div>

        {/* Comment Content */}
        <div className="mt-2 mb-3 text-sm text-gray-800">
          {comment.text}
        </div>

        {/* Comment Actions */}
        <div className="flex items-center gap-4 text-xs">
          <button
            onClick={() => comment.user && onReply(comment.id, comment.user)}
            className="text-blue-600 hover:text-blue-800 transition-colors"
          >
            {t('reply')}
          </button>

          {hasReplies && (
            <button
              onClick={() => toggleReplies(comment.id)}
              className="text-blue-600 hover:text-blue-800 transition-colors"
            >
              {isExpanded ? t('hide_replies') : `${t('show_replies')} (${comment.replyCount})`}
            </button>
          )}

          {canDelete && canDelete(comment) && (
            <button
              onClick={() => onDelete && onDelete(comment.id)}
              disabled={isDeleting}
              className="text-red-600 hover:text-red-800 transition-colors disabled:opacity-50"
            >
              {isDeleting ? t('deleting') : t('delete')}
            </button>
          )}
        </div>

        {/* Replies Section */}
        {hasReplies && isExpanded && (
          <div className="mt-4">
            {comments
              .filter((c) => c.parentCommentId === comment.id)
              .map((reply) => renderComment(reply, true))}
          </div>
        )}
      </div>
    );
  };

  const topLevelComments = comments.filter((c) => !c.parentCommentId);

  return (
    <div className="space-y-4">
      {topLevelComments.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          {t('no_comments')}
        </div>
      ) : (
        <>
          {topLevelComments.map((comment) => renderComment(comment))}
          {hasMore && (
            <button
              onClick={onLoadMore}
              disabled={isLoading}
              className="w-full py-2 px-4 bg-gray-100 hover:bg-gray-200 disabled:opacity-50 rounded transition-colors"
            >
              {isLoading ? t('loading') : t('load_more')}
            </button>
          )}
        </>
      )}
    </div>
  );
}