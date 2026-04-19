import { useEffect, useRef } from 'react';

import { Button } from '~/components/ui/Button';
import { Card } from '~/components/ui/Card';
import { Image } from '~/components/ui/Image';
import { MasonryColumns } from '~/components/ui/MasonryColumns';
import { Notice } from '~/components/ui/Notice';

import {
    BROWSE_GALLERY_BREAKPOINTS,
    type CollectionBrowseItem,
} from './collection-browse-types';

interface CollectionBrowseGalleryPanelProps {
    items: CollectionBrowseItem[];
    loading: boolean;
    currentPage: number;
    totalPages: number;
    totalItems: number;
    selectedId: number | null;
    onPageChange: (nextPage: number) => void;
    onSelectedChange: (nextSelectedId: number | null) => void;
}

export const CollectionBrowseGalleryPanel = ({
    items,
    loading,
    currentPage,
    totalPages,
    totalItems,
    selectedId,
    onPageChange,
    onSelectedChange,
}: CollectionBrowseGalleryPanelProps) => {
    const galleryScrollRef = useRef<HTMLDivElement | null>(null);
    const hasItems = items.length > 0;
    const hasPagination = hasItems && totalPages > 1;
    const itemRangeText =
        totalItems > 0
            ? `${Math.max(1, (currentPage - 1) * 20 + 1)}-${Math.min(
                  totalItems,
                  currentPage * 20,
              )} of ${totalItems}`
            : null;

    useEffect(() => {
        galleryScrollRef.current?.scrollTo({ top: 0, behavior: 'auto' });
    }, [currentPage]);

    const moveToPage = (nextPage: number) => {
        if (nextPage < 1 || nextPage > totalPages || nextPage === currentPage) {
            return;
        }
        onPageChange(nextPage);
    };

    return (
        <Card
            padding="none"
            className="order-2 h-fit overflow-hidden xl:order-1 xl:sticky xl:top-20 xl:self-start"
        >
            <header className="flex items-baseline justify-between gap-2 border-b border-line p-3 sm:p-4">
                <h2 className="text-base font-semibold text-ink">Browse</h2>
                <p className="text-[11px] font-medium text-ink-subtle">
                    Page {currentPage}/{totalPages}
                </p>
            </header>
            {loading && !hasItems ? (
                <div className="p-3 sm:p-4">
                    <Notice variant="neutral">Loading collections...</Notice>
                </div>
            ) : null}

            {!loading && !hasItems ? (
                <div className="p-3 sm:p-4">
                    <Notice variant="neutral">No collections found.</Notice>
                </div>
            ) : null}

            {hasItems ? (
                <div
                    ref={galleryScrollRef}
                    className="p-2 sm:p-3 xl:max-h-[62vh] xl:overflow-y-auto"
                >
                    <MasonryColumns
                        items={items}
                        breakpoints={BROWSE_GALLERY_BREAKPOINTS}
                        breakpointMode="container"
                        className="grid gap-2"
                        columnClassName="space-y-2"
                        getItemKey={(item) => item.id}
                        renderItem={(item) => {
                            const selected = selectedId === item.id;
                            const displayTitle = item.title || '(untitled)';

                            return (
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    aria-pressed={selected}
                                    aria-label={`Select ${displayTitle}`}
                                    onClick={() => {
                                        onSelectedChange(item.id);
                                    }}
                                    className={`group relative !block !h-auto w-full overflow-hidden !rounded-token-sm border-0 bg-surface-muted !p-0 text-left !font-normal shadow-none hover:bg-surface-muted ${
                                        selected
                                            ? 'after:pointer-events-none after:absolute after:inset-0 after:rounded-token-sm after:border-2 after:border-brand-700'
                                            : ''
                                    }`}
                                >
                                    <Image
                                        src={item.image.url}
                                        alt={displayTitle}
                                        width={item.image.width}
                                        height={item.image.height}
                                        className={`block h-auto w-full transition-opacity ${
                                            selected
                                                ? 'opacity-100'
                                                : 'opacity-90 group-hover:opacity-100'
                                        }`}
                                    />
                                </Button>
                            );
                        }}
                    />
                </div>
            ) : null}

            {hasItems ? (
                <footer className="border-t border-line bg-surface-muted p-3">
                    {hasPagination ? (
                        <nav aria-label="Browse pagination">
                            <div className="mb-2 flex items-center justify-between gap-2">
                                <p className="text-xs font-semibold text-ink-muted">
                                    Page {currentPage} of {totalPages}
                                </p>
                                {itemRangeText ? (
                                    <p className="text-xs text-ink-subtle">
                                        {itemRangeText}
                                    </p>
                                ) : null}
                            </div>

                            <div className="flex items-center gap-2">
                                <Button
                                    variant="secondary"
                                    size="sm"
                                    className="flex-1"
                                    onClick={() => {
                                        moveToPage(currentPage - 1);
                                    }}
                                    disabled={currentPage <= 1}
                                >
                                    Prev
                                </Button>

                                <div className="inline-flex h-11 min-w-[88px] items-center justify-center rounded-token-md border border-line bg-surface-base px-3 text-xs font-semibold text-ink">
                                    {currentPage} / {totalPages}
                                </div>

                                <Button
                                    variant="secondary"
                                    size="sm"
                                    className="flex-1"
                                    onClick={() => {
                                        moveToPage(currentPage + 1);
                                    }}
                                    disabled={currentPage >= totalPages}
                                >
                                    Next
                                </Button>
                            </div>
                        </nav>
                    ) : null}
                    <p
                        className={`text-xs text-ink-muted ${
                            hasPagination ? 'mt-2' : ''
                        }`}
                    >
                        {totalItems} collections total
                    </p>
                </footer>
            ) : null}
        </Card>
    );
};
