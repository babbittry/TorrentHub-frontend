'use client';

import React, { useState } from 'react';
import { useTranslations } from 'next-intl';
import { useAuth } from '@/context/AuthContext';
import {
    ReactionType,
    CommentReactionsDto,
    reactions as reactionsApi,
    CommentType
} from '@/lib/api';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
    faThumbsUp, 
    faThumbsDown, 
    faHeart, 
    faFaceLaugh,
    faEye,
    faPlus
} from '@fortawesome/free-solid-svg-icons';
import { AxiosError } from 'axios';
import useSWR from 'swr';

interface CommentReactionBarProps {
    commentType: CommentType;
    commentId: number;
    initialReactions?: CommentReactionsDto;
}

// 表情配置映射
const REACTION_CONFIG: Record<ReactionType, { emoji: string; icon: typeof faThumbsUp; labelKey: string }> = {
    [ReactionType.ThumbsUp]: { emoji: '👍', icon: faThumbsUp, labelKey: 'thumbs_up' },
    [ReactionType.ThumbsDown]: { emoji: '👎', icon: faThumbsDown, labelKey: 'thumbs_down' },
    [ReactionType.Heart]: { emoji: '❤️', icon: faHeart, labelKey: 'heart' },
    [ReactionType.Celebration]: { emoji: '🎉', icon: faHeart, labelKey: 'celebration' },
    [ReactionType.Thinking]: { emoji: '🤔', icon: faHeart, labelKey: 'thinking' },
    [ReactionType.Laugh]: { emoji: '😂', icon: faFaceLaugh, labelKey: 'laugh' },
    [ReactionType.Eyes]: { emoji: '👀', icon: faEye, labelKey: 'eyes' }
};

export default function CommentReactionBar({
    commentType,
    commentId,
    initialReactions
}: CommentReactionBarProps) {
    const t = useTranslations('reactions');
    const { user: currentUser } = useAuth();
    const [showPicker, setShowPicker] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // 使用 SWR 获取反应数据
    const { data: reactions, mutate } = useSWR<CommentReactionsDto>(
        `reactions-${commentType}-${commentId}`,
        async () => {
            try {
                return await reactionsApi.getReactions(commentType, commentId);
            } catch (err) {
                // 如果获取失败，返回初始数据或空数据
                return initialReactions || { totalCount: 0, reactions: [] };
            }
        },
        {
            fallbackData: initialReactions,
            revalidateOnFocus: false,
            revalidateOnReconnect: false,
        }
    );

    // 切换反应（乐观更新）
    const handleToggleReaction = async (type: ReactionType) => {
        if (!currentUser) {
            setError(t('login_required'));
            return;
        }

        if (!reactions) return;

        // 找到当前表情的反应
        const reaction = reactions.reactions.find(r => r.type === type);
        const hasReacted = reaction?.viewerReacted || false;

        // 乐观更新函数
        const optimisticUpdate = (currentData: CommentReactionsDto): CommentReactionsDto => {
            const newReactions = [...currentData.reactions];
            const index = newReactions.findIndex(r => r.type === type);
            
            if (hasReacted) {
                // 移除反应
                if (index !== -1) {
                    newReactions[index] = {
                        ...newReactions[index],
                        count: Math.max(0, newReactions[index].count - 1),
                        viewerReacted: false
                    };
                    if (newReactions[index].count === 0) {
                        newReactions.splice(index, 1);
                    }
                }
            } else {
                // 添加反应
                if (index !== -1) {
                    newReactions[index] = {
                        ...newReactions[index],
                        count: newReactions[index].count + 1,
                        viewerReacted: true
                    };
                } else {
                    newReactions.push({
                        type,
                        count: 1,
                        viewerReacted: true,
                        users: []
                    });
                }
            }

            return {
                ...currentData,
                reactions: newReactions.sort((a, b) => b.count - a.count),
                totalCount: hasReacted ? currentData.totalCount - 1 : currentData.totalCount + 1
            };
        };

        setError(null);
        setShowPicker(false);

        try {
            // 使用 SWR 的乐观更新
            await mutate(
                async (currentData) => {
                    if (!currentData) return currentData;

                    // 调用 API
                    if (hasReacted) {
                        await reactionsApi.removeReaction(commentType, commentId, type);
                    } else {
                        await reactionsApi.addReaction(commentType, commentId, { type });
                    }

                    // 返回乐观更新后的数据
                    return optimisticUpdate(currentData);
                },
                {
                    optimisticData: reactions ? optimisticUpdate(reactions) : undefined,
                    rollbackOnError: true,
                    revalidate: false
                }
            );
        } catch (err) {
            // 错误处理
            if (err instanceof AxiosError && err.response?.data?.message) {
                const errorKey = err.response.data.message;
                setError(t(errorKey, { defaultValue: t('error_generic') }));
            } else {
                setError(t('error_generic'));
            }
        }
    };

    if (!reactions || reactions.totalCount === 0) {
        // 如果没有反应，只显示添加按钮
        return currentUser ? (
            <div className="flex items-center gap-2">
                <div className="relative">
                    <button
                        onClick={() => setShowPicker(!showPicker)}
                        className="flex items-center justify-center w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                        title={t('add_reaction')}
                    >
                        <FontAwesomeIcon icon={faPlus} className="w-3 h-3" />
                    </button>

                    {/* 表情选择器 */}
                    {showPicker && (
                        <div className="absolute bottom-full mb-2 left-0 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 p-2 flex gap-1 z-10">
                            {Object.values(ReactionType)
                                .filter((v): v is ReactionType => isNaN(Number(v)))
                                .map((type) => {
                                    const config = REACTION_CONFIG[type];
                                    return (
                                        <button
                                            key={type}
                                            onClick={() => handleToggleReaction(type)}
                                            className="w-8 h-8 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                                            title={t(config.labelKey)}
                                        >
                                            <span className="text-xl">{config.emoji}</span>
                                        </button>
                                    );
                                })}
                        </div>
                    )}
                </div>
                {error && (
                    <span className="text-xs text-red-600 dark:text-red-400">{error}</span>
                )}
            </div>
        ) : null;
    }

    return (
        <div className="flex items-center gap-2 flex-wrap">
            {/* 显示已有的反应 */}
            {reactions.reactions.map((reaction) => {
                const config = REACTION_CONFIG[reaction.type];
                if (!config) return null;

                // 显示用户数量，超过10个显示"10+"
                const displayCount = reaction.users.length >= 10 && reaction.count > 10 
                    ? '10+' 
                    : reaction.count.toString();

                return (
                    <button
                        key={reaction.type}
                        onClick={() => currentUser && handleToggleReaction(reaction.type)}
                        disabled={!currentUser}
                        className={`
                            flex items-center gap-1.5 px-2.5 py-1 rounded-full text-sm
                            transition-all duration-200
                            ${reaction.viewerReacted
                                ? 'bg-blue-100 dark:bg-blue-900/30 border-2 border-blue-500 text-blue-700 dark:text-blue-300'
                                : 'bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300'
                            }
                            ${currentUser 
                                ? 'hover:bg-gray-200 dark:hover:bg-gray-700 cursor-pointer' 
                                : 'cursor-default'
                            }
                            disabled:opacity-50 disabled:cursor-not-allowed
                        `}
                        title={t(config.labelKey)}
                    >
                        <span className="text-base">{config.emoji}</span>
                        <span className="font-medium">{displayCount}</span>
                    </button>
                );
            })}

            {/* 添加新反应按钮 */}
            {currentUser && (
                <div className="relative">
                    <button
                        onClick={() => setShowPicker(!showPicker)}
                        className="flex items-center justify-center w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                        title={t('add_reaction')}
                    >
                        <FontAwesomeIcon icon={faPlus} className="w-3 h-3" />
                    </button>

                    {/* 表情选择器 */}
                    {showPicker && (
                        <div className="absolute bottom-full mb-2 left-0 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 p-2 flex gap-1 z-10">
                            {Object.values(ReactionType)
                                .filter((v): v is ReactionType => isNaN(Number(v)))
                                .map((type) => {
                                    const config = REACTION_CONFIG[type];
                                    const hasReacted = reactions.reactions.find(
                                        r => r.type === type
                                    )?.viewerReacted;

                                    return (
                                        <button
                                            key={type}
                                            onClick={() => handleToggleReaction(type)}
                                            className={`
                                                w-8 h-8 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors
                                                ${hasReacted ? 'bg-blue-50 dark:bg-blue-900/20' : ''}
                                            `}
                                            title={t(config.labelKey)}
                                        >
                                            <span className="text-xl">{config.emoji}</span>
                                        </button>
                                    );
                                })}
                        </div>
                    )}
                </div>
            )}

            {/* 错误提示 */}
            {error && (
                <span className="text-xs text-red-600 dark:text-red-400">{error}</span>
            )}
        </div>
    );
}