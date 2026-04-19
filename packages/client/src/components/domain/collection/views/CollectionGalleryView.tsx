import { Link } from '@tanstack/react-router';
import { memo } from 'react';

import { Image } from '~/components/ui/Image';
import { MasonryColumns } from '~/components/ui/MasonryColumns';
import { Notice } from '~/components/ui/Notice';
import { Pagination } from '~/components/ui/Pagination';
import type { Collection } from '~/models/types';

type CollectionGalleryItem = Pick<Collection, 'id' | 'title' | 'image'>;

interface CollectionGalleryViewProps {
    items: CollectionGalleryItem[];
    loading: boolean;
    currentPage: number;
    totalPages: number;
    totalItems: number;
    errorMessage: string | null;
    onPageChange: (nextPage: number) => void;
}

const CollectionGalleryViewComponent = ({
    items,
    loading,
    currentPage,
    totalPages,
    totalItems,
    errorMessage,
    onPageChange,
}: CollectionGalleryViewProps) => {
    const placeholderText = loading
        ? 'Loading collections...'
        : items.length === 0
          ? 'No collections found.'
          : null;

    return (
        <>
            {placeholderText ? (
                <Notice variant="neutral">{placeholderText}</Notice>
            ) : (
                <MasonryColumns
                    items={items}
                    getItemKey={(item) => item.id}
                    renderItem={(item) => {
                        const displayTitle = item.title || '(untitled)';

                        return (
                            <Link
                                to="/collection/$id"
                                params={{ id: String(item.id) }}
                                className="ui-focus-ring group relative block overflow-hidden rounded-token-md border border-line/80 bg-surface-muted transition-colors hover:border-line-strong"
                            >
                                <Image
                                    className="block h-auto w-full object-cover"
                                    src={item.image.url}
                                    alt={displayTitle}
                                    width={item.image.width}
                                    height={item.image.height}
                                />
                                <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10 translate-y-full bg-overlay/70 px-3 py-2 transition-transform duration-200 group-hover:translate-y-0 group-focus-visible:translate-y-0">
                                    <p className="truncate text-xs font-semibold text-ink-inverse">
                                        {displayTitle}
                                    </p>
                                </div>
                            </Link>
                        );
                    }}
                />
            )}

            {items.length > 0 && totalPages > 1 ? (
                <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    totalItems={totalItems}
                    itemsPerPage={20}
                    onPageChange={onPageChange}
                />
            ) : null}

            {items.length > 0 ? (
                <p className="mt-2 text-xs text-ink-muted">
                    {totalItems} collections total
                </p>
            ) : null}

            {errorMessage ? (
                <Notice variant="error" className="mt-4">
                    {errorMessage}
                </Notice>
            ) : null}
        </>
    );
};

export const CollectionGalleryView = memo(CollectionGalleryViewComponent);
CollectionGalleryView.displayName = 'CollectionGalleryView';
