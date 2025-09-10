import React from 'react';
import { ForumPostDto } from '@/lib/api';
import UserDisplay from '../../components/UserDisplay';

interface ForumPostProps {
    post: ForumPostDto;
}

const ForumPost: React.FC<ForumPostProps> = ({ post }) => {
    return (
        <div className="flex p-4 border-b border-[var(--color-border)]">
            {/* User Info Sidebar */}
            <div className="flex-shrink-0 w-32 text-center mr-4">
                <UserDisplay user={post.author} />
            </div>

            {/* Post Content */}
            <div className="flex-grow">
                <div className="text-xs text-[var(--color-text-muted)] mb-2">
                    {new Date(post.createdAt).toLocaleString()}
                </div>
                <div className="prose dark:prose-invert max-w-none text-[var(--color-foreground)]">
                    {post.content}
                </div>
            </div>
        </div>
    );
};

export default ForumPost;
