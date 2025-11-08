import React from 'react';

export interface ColumnDefinition {
    key: string;
    label: string;
    className?: string;
    sortable: boolean;
}

interface SortableHeaderProps {
    columns: ColumnDefinition[];
    sortBy: string;
    sortOrder: string;
    onSort: (key: string) => void;
}

const SortableHeader: React.FC<SortableHeaderProps> = ({ columns, sortBy, sortOrder, onSort }) => {
    return (
        <div className="hidden md:flex bg-(--color-border) p-4 rounded-lg font-semibold text-(--color-text-muted) grid grid-cols-12 gap-4">
            {columns.map(col => (
                <div key={col.key} className={col.className}>
                    {col.sortable ? (
                        <div
                            className="cursor-pointer select-none flex items-center justify-center"
                            onClick={() => onSort(col.key)}
                        >
                            {col.label} {sortBy === col.key && (sortOrder === 'asc' ? '↑' : '↓')}
                        </div>
                    ) : (
                        <div className="flex items-center justify-center">{col.label}</div>
                    )}
                </div>
            ))}
        </div>
    );
};

export default SortableHeader;
