'use client';

import { CreateCommentRequestDto, UserDisplayDto } from '@/lib/api';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

interface ReplyEditorProps {
  onSubmit: (data: CreateCommentRequestDto) => Promise<void>;
  parentId?: number;
  replyToUser?: UserDisplayDto;
  onCancel?: () => void;
  isSubmitting?: boolean;
  placeholder?: string;
}

export default function ReplyEditor({
  onSubmit,
  parentId,
  replyToUser,
  onCancel,
  isSubmitting = false,
  placeholder,
}: ReplyEditorProps) {
  const { t } = useTranslation();
  const [content, setContent] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!content.trim()) {
      setError(t('comment_required'));
      return;
    }

    if (content.length > 500) {
      setError(t('comment_too_long', { max: 500 }));
      return;
    }

    try {
      await onSubmit({
        text: content,
        parentCommentId: parentId,
        replyToUserId: replyToUser?.id,
      });
      setContent('');
    } catch (err) {
      setError(err instanceof Error ? err.message : t('submit_failed'));
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3 p-4 bg-gray-50 rounded-lg border border-gray-200">
      {replyToUser && (
        <div className="text-sm text-blue-600">
          {t('replying_to')} @{replyToUser.username}
        </div>
      )}

      <div className="space-y-2">
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder={placeholder || t('write_comment')}
          maxLength={500}
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
          disabled={isSubmitting}
        />
        <div className="flex justify-between items-center text-xs text-gray-500">
          <span>{content.length}/500</span>
          {error && <span className="text-red-600">{error}</span>}
        </div>
      </div>

      <div className="flex gap-2 justify-end">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            disabled={isSubmitting}
            className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 transition-colors"
          >
            {t('cancel')}
          </button>
        )}
        <button
          type="submit"
          disabled={isSubmitting || !content.trim()}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 transition-colors"
        >
          {isSubmitting ? t('submitting') : t('submit')}
        </button>
      </div>
    </form>
  );
}