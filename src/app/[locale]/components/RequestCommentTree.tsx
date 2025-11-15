'use client';

import { CommentDto, UserDisplayDto, COMMENT_TYPE } from '@/lib/api';
import { formatDistanceToNow } from 'date-fns';
import { zhCN, enUS, fr, ja } from 'date-fns/locale';
import { useState } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faReply, faTrash, faQuoteLeft, faEdit } from '@fortawesome/free-solid-svg-icons';
import UserDisplay from './UserDisplay';
import ReplyEditor from './ReplyEditor';
import { CreateCommentDto } from '@/lib/api';
import MarkdownRenderer from './MarkdownRenderer';
import CommentReactionBar from './CommentReactionBar';

interface RequestCommentTreeProps {
	comments: CommentDto[];
	onReply: (parentId: number, replyToUser: UserDisplayDto) => void;
	onLoadMore?: () => void;
	hasMore?: boolean;
	isLoading?: boolean;
	canDelete?: (comment: CommentDto) => boolean;
	canEdit?: (comment: CommentDto) => boolean;
	onDelete?: (commentId: number) => void;
	onEdit?: (commentId: number, newContent: string) => Promise<void>;
	isDeleting?: boolean;
	isEditing?: boolean;
	onSubmitReply?: (data: CreateCommentDto) => Promise<void>;
}

const dateLocales = {
	'zh-CN': zhCN,
	'en': enUS,
	'fr': fr,
	'ja': ja,
};

export default function RequestCommentTree({
	comments,
	onReply,
	onLoadMore,
	hasMore,
	isLoading,
	canDelete,
	canEdit,
	onDelete,
	onEdit,
	isDeleting,
	isEditing,
	onSubmitReply,
}: RequestCommentTreeProps) {
	const t = useTranslations('reply');
	const locale = useLocale() as keyof typeof dateLocales;
	const [activeReplyId, setActiveReplyId] = useState<number | null>(null);
	const [activeEditId, setActiveEditId] = useState<number | null>(null);
	const [editContent, setEditContent] = useState<string>('');
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

	const handleSubmitReply = async (data: CreateCommentDto) => {
		if (onSubmitReply) {
			await onSubmitReply(data);
			setActiveReplyId(null);
		}
	};

	const handleCancelReply = () => {
		setActiveReplyId(null);
	};

	const handleEditClick = (comment: CommentDto) => {
		setActiveEditId(comment.id);
		setEditContent(comment.content);
		setActiveReplyId(null); // 关闭回复编辑器
	};

	const handleSubmitEdit = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!editContent.trim() || !activeEditId || !onEdit) return;

		try {
			await onEdit(activeEditId, editContent);
			setActiveEditId(null);
			setEditContent('');
		} catch (err) {
			console.error('Edit failed:', err);
		}
	};

	const handleCancelEdit = () => {
		setActiveEditId(null);
		setEditContent('');
	};

	const renderComment = (comment: CommentDto) => {
		const parentComment = getParentComment(comment);
		const isReplyEditorOpen = activeReplyId === comment.id;
		const isEditMode = activeEditId === comment.id;
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
								{comment.editedAt && (
									<span className="text-xs text-gray-500 italic">
										({t('edited')})
									</span>
								)}
							</div>
							<span className="text-xs text-gray-400 shrink-0">
								{formatDistanceToNow(new Date(comment.createdAt), {
									addSuffix: true,
									locale: dateLocales[locale],
								})}
							</span>
						</div>

						{/* 引用信息 */}
						{parentComment && comment.replyToUser && parentComment.content && (
							<div className="mb-3 bg-blue-50 dark:bg-blue-900/30 border-l-4 border-blue-400 dark:border-blue-500 rounded-r overflow-hidden">
								<div className="px-3 py-2">
									<div className="flex items-center justify-between mb-1">
										<div className="flex items-center gap-1.5 text-sm text-blue-600 dark:text-blue-300">
											<FontAwesomeIcon icon={faQuoteLeft} className="w-3 h-3" />
											<span>
												{t('quote')} #{parentComment.floor} @{comment.replyToUser.username}
											</span>
										</div>
										{parentComment.content.length > 150 && (
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
											maxHeight: !isQuoteExpanded && parentComment.content.length > 150 ? '4.5em' : 'none',
											overflow: 'hidden',
											display: '-webkit-box',
											WebkitLineClamp: !isQuoteExpanded && parentComment.content.length > 150 ? 3 : 'unset',
											WebkitBoxOrient: 'vertical',
										}}
									>
										{parentComment.content}
									</div>
								</div>
							</div>
						)}

						{/* 评论内容或编辑器 */}
						{isEditMode ? (
							<form onSubmit={handleSubmitEdit} className="mb-3">
								<textarea
									value={editContent}
									onChange={(e) => setEditContent(e.target.value)}
									className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[100px]"
									maxLength={500}
									disabled={isEditing}
								/>
								<div className="flex gap-2 mt-2">
									<button
										type="submit"
										disabled={isEditing || !editContent.trim()}
										className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 transition-colors text-sm"
									>
										{isEditing ? t('saving') : t('save')}
									</button>
									<button
										type="button"
										onClick={handleCancelEdit}
										disabled={isEditing}
										className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 disabled:opacity-50 transition-colors text-sm"
									>
										{t('cancel')}
									</button>
								</div>
							</form>
						) : (
							<div className="text-gray-800 mb-3 break-words">
								<MarkdownRenderer content={comment.content} />
							</div>
						)}

						{/* 表情回应栏 */}
						{comment.reactions && (
							<div className="mb-3">
								<CommentReactionBar
									commentType={COMMENT_TYPE.REQUEST}
									commentId={comment.id}
									initialReactions={comment.reactions}
								/>
							</div>
						)}

						{/* 操作按钮区 */}
						{!isEditMode && (
							<div className="flex items-center justify-end gap-3">
								<button
									onClick={() => handleReplyClick(comment)}
									className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-md transition-colors"
								>
									<FontAwesomeIcon icon={faReply} className="w-3.5 h-3.5" />
									<span>{t('reply')}</span>
								</button>

								{canEdit && canEdit(comment) && onEdit && (
									<button
										onClick={() => handleEditClick(comment)}
										disabled={isEditing}
										className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-yellow-600 hover:text-yellow-800 hover:bg-yellow-50 rounded-md transition-colors disabled:opacity-50"
									>
										<FontAwesomeIcon icon={faEdit} className="w-3.5 h-3.5" />
										<span>{t('edit')}</span>
									</button>
								)}

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
						)}
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