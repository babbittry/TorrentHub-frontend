'use client';

import { CommentDto, UserDisplayDto, COMMENT_TYPE } from '@/lib/api';
import { formatDistanceToNow } from 'date-fns';
import { zhCN, enUS, fr, ja } from 'date-fns/locale';
import { useState } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faReply, faTrash, faQuoteLeft } from '@fortawesome/free-solid-svg-icons';
import { Link } from '@/i18n/navigation';
import UserDisplay from './UserDisplay';
import ReplyEditor from './ReplyEditor';
import { CreateCommentRequestDto } from '@/lib/api';
import MarkdownRenderer from './MarkdownRenderer';
import CommentReactionBar from './CommentReactionBar';

interface CommentTreeProps {
	comments: CommentDto[];
	onReply: (parentId: number, replyToUser: UserDisplayDto) => void;
	onLoadMore?: () => void;
	hasMore?: boolean;
	isLoading?: boolean;
	canDelete?: (comment: CommentDto) => boolean;
	onDelete?: (commentId: number) => void;
	isDeleting?: boolean;
	onSubmitReply?: (data: CreateCommentRequestDto) => Promise<void>;
	// 未来可以添加: onLike?: (commentId: number) => void;
}

const dateLocales = {
	'zh-CN': zhCN,
	'en': enUS,
	'fr': fr,
	'ja': ja,
};

export default function TorrentCommentTree({
	comments,
	onReply,
	onLoadMore,
	hasMore,
	isLoading,
	canDelete,
	onDelete,
	isDeleting,
	onSubmitReply,
}: CommentTreeProps) {
	const t = useTranslations('reply');
	const locale = useLocale() as keyof typeof dateLocales;
	const [activeReplyId, setActiveReplyId] = useState<number | null>(null);
	const [expandedQuotes, setExpandedQuotes] = useState<Set<number>>(new Set());

	// 按 Floor 全局排序
	const sortedComments = [...comments].sort((a, b) => a.floor - b.floor);

	// 查找父评论
	const getParentComment = (comment: CommentDto): CommentDto | null => {
		if (!comment.parentCommentId) return null;
		return comments.find(c => c.id === comment.parentCommentId) || null;
	};

	// 切换引用展开/折叠
	const toggleQuote = (commentId: number) => {
		const newExpanded = new Set(expandedQuotes);
		if (newExpanded.has(commentId)) {
			newExpanded.delete(commentId);
		} else {
			newExpanded.add(commentId);
		}
		setExpandedQuotes(newExpanded);
	};

	const handleReplyClick = (comment: CommentDto) => {
		setActiveReplyId(comment.id);
		if (comment.user) {
			onReply(comment.id, comment.user);
		}
	};

	const handleSubmitReply = async (data: CreateCommentRequestDto) => {
		if (onSubmitReply) {
			await onSubmitReply(data);
			setActiveReplyId(null);
		}
	};

	const handleCancelReply = () => {
		setActiveReplyId(null);
	};

	const renderComment = (comment: CommentDto) => {
		const parentComment = getParentComment(comment);
		const isReplyEditorOpen = activeReplyId === comment.id;
		const isQuoteExpanded = expandedQuotes.has(comment.id);

		return (
			<div
				key={comment.id}
				id={`comment-${comment.id}`}
				className="border-b border-gray-200 dark:border-gray-700 last:border-b-0 py-4"
			>
				{/* 评论主体 */}
				<div className="flex items-start gap-4">
					{/* 左侧头像 - 只显示头像,不显示用户名,可点击跳转 */}
					<div className="shrink-0">
						{comment.user && (
							<UserDisplay user={comment.user} showAvatar={true} avatarSize="md" showUsername={false} />
						)}
					</div>

					{/* 右侧内容区 */}
					<div className="flex-1 min-w-0">
						{/* 顶部信息栏 - 用户信息在左,时间在右 */}
						<div className="flex items-center justify-between gap-3 mb-2">
							<div className="flex items-center gap-3 flex-wrap">
								{comment.user && (
									<UserDisplay user={comment.user} />
								)}
								<span className="text-sm font-semibold text-gray-600">#{comment.floor}</span>
							</div>
							<span className="text-xs text-gray-400 shrink-0">
								{formatDistanceToNow(new Date(comment.createdAt), {
									addSuffix: true,
									locale: dateLocales[locale],
								})}
							</span>
						</div>

						{/* 引用信息 */}
						{parentComment && comment.replyToUser && parentComment.text && (
							<div className="mb-3 bg-blue-50 dark:bg-blue-900/30 border-l-4 border-blue-400 dark:border-blue-500 rounded-r overflow-hidden">
								<div className="px-3 py-2">
									<div className="flex items-center justify-between mb-1">
										<div className="flex items-center gap-1.5 text-sm text-blue-600 dark:text-blue-300">
											<FontAwesomeIcon icon={faQuoteLeft} className="w-3 h-3" />
											<span>
												{t('quote')} #{parentComment.floor} @{comment.replyToUser.username}
											</span>
										</div>
										{parentComment.text.length > 150 && (
											<button
												onClick={() => toggleQuote(comment.id)}
												className="text-xs text-blue-600 dark:text-blue-300 hover:text-blue-800 dark:hover:text-blue-200 shrink-0"
											>
												{isQuoteExpanded ? t('collapse') : t('expand')}
											</button>
										)}
									</div>
									<div
										className="text-sm text-gray-600 dark:text-gray-300 italic"
										style={{
											maxHeight: !isQuoteExpanded && parentComment.text.length > 150 ? '4.5em' : 'none',
											overflow: 'hidden',
											display: '-webkit-box',
											WebkitLineClamp: !isQuoteExpanded && parentComment.text.length > 150 ? 3 : 'unset',
											WebkitBoxOrient: 'vertical',
										}}
									>
										{parentComment.text}
									</div>
								</div>
							</div>
						)}

						{/* 评论内容 */}
						<div className="text-gray-800 mb-3 break-words">
							<MarkdownRenderer content={comment.text} />
						</div>

						{/* 表情回应栏 */}
						{comment.reactions && (
							<div className="mb-3">
								<CommentReactionBar
									commentType={COMMENT_TYPE.TORRENT_COMMENT}
									commentId={comment.id}
									initialReactions={comment.reactions}
								/>
							</div>
						)}

						{/* 操作按钮区 */}
						<div className="flex items-center justify-end gap-3">
							<button
								onClick={() => handleReplyClick(comment)}
								className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-md transition-colors"
							>
								<FontAwesomeIcon icon={faReply} className="w-3.5 h-3.5" />
								<span>{t('reply')}</span>
							</button>

							{/* 未来可以在这里添加点赞/爱心按钮 */}

							{canDelete && canDelete(comment) && onDelete && (
								<button
									onClick={() => onDelete(comment.id)}
									disabled={isDeleting}
									className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-red-600 hover:text-red-800 hover:bg-red-50 rounded-md transition-colors disabled:opacity-50"
								>
									<FontAwesomeIcon icon={faTrash} className="w-3.5 h-3.5" />
									<span>{isDeleting ? t('deleting') : t('delete')}</span>
								</button>
							)}
						</div>
					</div>
				</div>

				{/* 内联回复编辑器 */}
				{isReplyEditorOpen && onSubmitReply && (
					<div
						id={`reply-editor-${comment.id}`}
						className="ml-16 mt-4 animate-in fade-in slide-in-from-top-2 duration-200"
					>
						<ReplyEditor
							onSubmit={handleSubmitReply}
							onCancel={handleCancelReply}
							parentId={comment.id}
							replyToUser={comment.user}
							maxLength={500}
						/>
					</div>
				)}
			</div>
		);
	};

	return (
		<div className="space-y-0">
			{sortedComments.length === 0 ? (
				<div className="text-center py-8 text-gray-500">
					{t('no_comments')}
				</div>
			) : (
				<>
					<div className="divide-y divide-gray-200">
						{sortedComments.map((comment) => renderComment(comment))}
					</div>
					{hasMore && onLoadMore && (
						<div className="pt-4">
							<button
								onClick={onLoadMore}
								disabled={isLoading}
								className="w-full py-3 px-4 bg-gray-100 hover:bg-gray-200 disabled:opacity-50 rounded-md transition-colors font-medium text-gray-700"
							>
								{isLoading ? t('loading') : t('load_more')}
							</button>
						</div>
					)}
				</>
			)}
		</div>
	);
}