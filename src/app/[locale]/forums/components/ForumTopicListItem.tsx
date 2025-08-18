import React from 'react';
import { ForumTopicDto } from '@/lib/api';
import { Link } from '@/i18n/navigation';
import { useTranslations } from 'next-intl';

interface ForumTopicListItemProps {
    topic: ForumTopicDto;
}

const ForumTopicListItem: React.FC<ForumTopicListItemProps> = ({ topic }) => {
    const t = useTranslations('forumPage');

    return (
        <Link href={`/forum/topics/${topic.id}`}>
            <div className="group grid grid-cols-12 gap-4 items-center p-3 rounded-lg hover:bg-[var(--color-card-background-hover)] transition-colors duration-200 border-b border-gray-200 dark:border-gray-800">
                {/* Title and Author */}
                <div className="col-span-7">
                    <p className="font-semibold text-md text-[var(--color-foreground)] group-hover:text-[var(--color-primary)] transition-colors truncate">
                        {topic.title}
                    </p>
                    <p className="text-sm text-[var(--color-text-muted)]">
                        {t('by')} {topic.author.userName}
                    </p>
                </div>

                {/* Stats */}
                <div className="col-span-2 text-center text-sm text-[var(--color-text-muted)]">
                    <p>{t('posts')}: {topic.postCount}</p>
                </div>

                {/* Last Reply */}
                <div className="col-span-3 text-right text-sm text-[var(--color-text-muted)]">
                    <p className="truncate">{topic.lastReplyAuthor.userName}</p>
                    <p>{new Date(topic.lastReplyAt).toLocaleString()}</p>
                </div>
            </div>
        </Link>
    );
};

export default ForumTopicListItem;
