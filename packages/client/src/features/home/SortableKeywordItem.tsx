import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useEffect, useRef, useState } from 'react';

import { Card } from '~/components/ui/Card';
import { cn } from '~/components/ui/cn';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '~/components/ui/DropdownMenu';
import {
    HoverCard,
    HoverCardContent,
    HoverCardTrigger,
} from '~/components/ui/HoverCard';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '~/components/ui/Popover';
import { DraftIcon, MoreIcon } from '~/icons';
import type { Keyword } from '~/models/types';

import { makeKeywordSortableId } from './dnd-ids';

interface SortableKeywordItemProps {
    categoryId: number;
    keyword: Keyword;
    disabled?: boolean;
    onCopyKeyword: (keywordName: string) => void;
    onViewCollection: (keywordName: string) => void;
    onEditKeyword: (keyword: Keyword) => void;
    onRemoveKeyword: (keywordId: number) => void;
    onAddSampleImage: (keywordId: number) => void;
    onRemoveSampleImage: (keywordId: number) => void;
}

export const SortableKeywordItem = ({
    categoryId,
    keyword,
    disabled = false,
    onCopyKeyword,
    onViewCollection,
    onEditKeyword,
    onRemoveKeyword,
    onAddSampleImage,
    onRemoveSampleImage,
}: SortableKeywordItemProps) => {
    const wasDraggingRef = useRef(false);
    const [detailsOpen, setDetailsOpen] = useState(false);

    const sortableId = makeKeywordSortableId(categoryId, keyword.id);
    const {
        attributes,
        listeners,
        setNodeRef,
        setActivatorNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({
        id: sortableId,
        disabled,
    });

    const style = {
        transform: CSS.Translate.toString(transform),
        transition,
    };
    const keywordDetails = [
        { label: 'Meaning', value: keyword.meaning?.trim() },
        { label: 'Effect', value: keyword.effect?.trim() },
        { label: 'Note', value: keyword.note?.trim() },
        {
            label: 'Aliases',
            value: keyword.aliases
                ?.map((alias) => alias.name.trim())
                .filter((alias) => alias.length > 0)
                .join(', '),
        },
    ].filter((detail): detail is { label: string; value: string } =>
        Boolean(detail.value),
    );
    const hasKeywordDetails = keywordDetails.length > 0;
    const usageCount = keyword.usage?.totalCount;

    useEffect(() => {
        if (isDragging) {
            wasDraggingRef.current = true;
        }
    }, [isDragging]);

    const handleCopyClick = () => {
        if (wasDraggingRef.current) {
            wasDraggingRef.current = false;
            return;
        }
        onCopyKeyword(keyword.name);
    };
    const keywordButton = (
        <button
            ref={setActivatorNodeRef}
            type="button"
            className={cn(
                'ui-focus-ring min-w-0 truncate rounded-sm text-left text-sm font-medium text-ink',
                disabled
                    ? 'cursor-default'
                    : 'cursor-grab active:cursor-grabbing',
            )}
            style={{ touchAction: 'none' }}
            onClick={handleCopyClick}
            {...attributes}
            {...listeners}
        >
            {keyword.name}
        </button>
    );

    return (
        <Card
            as="li"
            padding="none"
            ref={setNodeRef}
            style={style}
            emphasis="flat"
            className={cn(
                'group relative list-none rounded-token-sm bg-surface-muted py-1 pl-2.5 pr-0.5 text-sm select-none',
                isDragging ? 'z-10 opacity-70' : '',
            )}
        >
            <div className="flex min-w-0 items-center gap-0.5">
                {keyword.image ? (
                    <HoverCard openDelay={120} closeDelay={100}>
                        <HoverCardTrigger asChild>
                            {keywordButton}
                        </HoverCardTrigger>
                        <HoverCardContent
                            side="right"
                            align="start"
                            className="w-28 p-0"
                        >
                            <img
                                loading="lazy"
                                src={keyword.image.url}
                                alt={keyword.name}
                                className="block h-auto w-full"
                            />
                        </HoverCardContent>
                    </HoverCard>
                ) : (
                    keywordButton
                )}

                {usageCount !== undefined ? (
                    <span
                        aria-label={`${keyword.name} recent usage`}
                        title={`${usageCount} recent uses`}
                        className={cn(
                            'inline-flex h-5 min-w-5 shrink-0 items-center justify-center rounded-full bg-surface-base px-1.5 text-[10px] font-semibold leading-none',
                            usageCount > 0
                                ? 'text-brand-700'
                                : 'text-ink-subtle',
                        )}
                    >
                        {usageCount}
                    </span>
                ) : null}

                {hasKeywordDetails ? (
                    <Popover
                        open={detailsOpen}
                        onOpenChange={setDetailsOpen}
                        modal={false}
                    >
                        <PopoverTrigger asChild>
                            <button
                                type="button"
                                className="ui-focus-ring inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-token-sm text-brand-600 transition-colors hover:bg-surface-base hover:text-brand-700"
                                aria-label={`${keyword.name} details`}
                                aria-haspopup="dialog"
                                aria-expanded={detailsOpen}
                                disabled={disabled}
                            >
                                <DraftIcon width={12} height={12} aria-hidden />
                            </button>
                        </PopoverTrigger>
                        <PopoverContent
                            align="start"
                            sideOffset={6}
                            collisionPadding={8}
                            className="w-64 p-3"
                        >
                            <p className="truncate text-xs font-semibold text-ink">
                                {keyword.name}
                            </p>
                            <dl className="mt-2 space-y-2">
                                {keywordDetails.map((detail) => (
                                    <div key={detail.label} className="min-w-0">
                                        <dt className="text-[10px] font-semibold uppercase text-ink-subtle">
                                            {detail.label}
                                        </dt>
                                        <dd className="mt-0.5 max-h-20 overflow-auto whitespace-pre-wrap break-words text-xs leading-snug text-ink-muted">
                                            {detail.value}
                                        </dd>
                                    </div>
                                ))}
                            </dl>
                            <div className="mt-3 border-t border-line/60 pt-2">
                                <button
                                    type="button"
                                    className="ui-focus-ring rounded-token-sm px-2 py-1 text-xs font-semibold text-brand-700 transition-colors hover:bg-brand-50"
                                    onClick={() => {
                                        setDetailsOpen(false);
                                        onEditKeyword(keyword);
                                    }}
                                >
                                    Edit keyword
                                </button>
                            </div>
                        </PopoverContent>
                    </Popover>
                ) : null}

                <div className="relative shrink-0">
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <button
                                type="button"
                                className="ui-focus-ring inline-flex h-7 w-7 items-center justify-center rounded-token-sm text-ink-subtle transition-colors hover:bg-surface-base hover:text-ink-muted"
                                disabled={disabled}
                                aria-label={`${keyword.name} actions`}
                            >
                                <MoreIcon width={12} height={12} />
                            </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" sideOffset={8}>
                            <DropdownMenuItem
                                onSelect={() => {
                                    onCopyKeyword(keyword.name);
                                }}
                            >
                                Copy
                            </DropdownMenuItem>
                            <DropdownMenuItem
                                onSelect={() => {
                                    onViewCollection(keyword.name);
                                }}
                            >
                                View Collection
                            </DropdownMenuItem>
                            <DropdownMenuItem
                                onSelect={() => {
                                    onEditKeyword(keyword);
                                }}
                            >
                                Edit keyword
                            </DropdownMenuItem>
                            {keyword.image ? (
                                <DropdownMenuItem
                                    className="text-amber-700 data-[highlighted]:bg-orange-50 data-[highlighted]:text-amber-700"
                                    onSelect={() => {
                                        onRemoveSampleImage(keyword.id);
                                    }}
                                >
                                    Remove Sample
                                </DropdownMenuItem>
                            ) : (
                                <DropdownMenuItem
                                    className="text-green-700 data-[highlighted]:bg-emerald-50 data-[highlighted]:text-green-700"
                                    onSelect={() => {
                                        onAddSampleImage(keyword.id);
                                    }}
                                >
                                    Add Sample
                                </DropdownMenuItem>
                            )}
                            <DropdownMenuItem
                                className="text-red-700 data-[highlighted]:bg-red-50 data-[highlighted]:text-red-700"
                                onSelect={() => {
                                    onRemoveKeyword(keyword.id);
                                }}
                            >
                                Remove
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </div>
        </Card>
    );
};
