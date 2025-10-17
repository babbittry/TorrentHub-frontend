'use client';

import { CreateCommentRequestDto, UserDisplayDto } from '@/lib/api';
import { useState } from 'react';
import { useTranslations } from 'next-intl';
import RichEditor from './RichEditor';

interface ReplyEditorProps {
    onSubmit: (data: { text: string; parentCommentId?: number | null; replyToUserId?: number | null }) => Promise<void>;
    parentId?: number;
    replyToUser?: UserDisplayDto;
    onCancel?: () => void;
    isSubmitting?: boolean;
    placeholder?: string;
    maxLength?: number;
}

export default function ReplyEditor({
    onSubmit,
    parentId,
    replyToUser,
    onCancel,
    isSubmitting = false,
    placeholder,
    maxLength = 1000,
}: ReplyEditorProps) {
    const t = useTranslations('reply');
    const [content, setContent] = useState('');
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        if (!content.trim()) {
            setError(t('comment_required'));
            return;
        }

        if (content.length > maxLength) {
            setError(t('comment_too_long', { max: maxLength }));
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
        <form onSubmit={handleSubmit} className="space-y-3 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
            {replyToUser && (
                <div className="text-sm font-medium text-blue-600 dark:text-blue-400 mb-2">
                    {t('replying_to')} @{replyToUser.username}
                </div>
            )}

            <div className="space-y-2">
                <RichEditor
                    value={content}
                    onChange={setContent}
                    placeholder={placeholder || t('write_comment')}
                    height={200}
                    maxLength={maxLength}
                    isDisabled={isSubmitting}
                />
                {error && (
                    <div className="text-sm text-red-600">{error}</div>
                )}
            </div>

            <div className="flex gap-2 justify-end">
                {onCancel && (
                    <button
                        type="button"
                        onClick={onCancel}
                        disabled={isSubmitting}
                        className="px-4 py-2 text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50 transition-colors"
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