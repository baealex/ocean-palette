import {
    closestCenter,
    DndContext,
    KeyboardSensor,
    PointerSensor,
    type DragEndEvent,
    useSensor,
    useSensors,
} from '@dnd-kit/core';
import {
    rectSortingStrategy,
    SortableContext,
    sortableKeyboardCoordinates,
    useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useState } from 'react';
import type { FormEvent, SyntheticEvent } from 'react';

import { Button } from '~/components/ui/Button';
import { Card } from '~/components/ui/Card';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '~/components/ui/DropdownMenu';
import { IconButton } from '~/components/ui/IconButton';
import { Input } from '~/components/ui/Input';
import { DragHandleIcon, MoreIcon } from '~/icons';
import { makeCategorySortableId, makeKeywordSortableId } from './dnd-ids';
import { SortableKeywordItem } from './SortableKeywordItem';
import type { HomeCategory } from './types';

interface SortableCategoryCardProps {
    category: HomeCategory;
    saving?: boolean;
    onKeywordDragEnd: (categoryId: number, event: DragEndEvent) => void;
    onCopyAllKeywords: (category: HomeCategory) => void;
    onRenameCategory: (category: HomeCategory) => void;
    onRemoveCategory: (categoryId: number) => void;
    onAddKeywords: (
        categoryId: number,
        rawKeywords: string,
    ) => Promise<boolean>;
    onCopyKeyword: (keywordName: string) => void;
    onViewCollection: (keywordName: string) => void;
    onRemoveKeyword: (categoryId: number, keywordId: number) => void;
    onAddKeywordSampleImage: (keywordId: number) => void;
    onRemoveKeywordSampleImage: (keywordId: number) => void;
}

export const SortableCategoryCard = ({
    category,
    saving = false,
    onKeywordDragEnd,
    onCopyAllKeywords,
    onRenameCategory,
    onRemoveCategory,
    onAddKeywords,
    onCopyKeyword,
    onViewCollection,
    onRemoveKeyword,
    onAddKeywordSampleImage,
    onRemoveKeywordSampleImage,
}: SortableCategoryCardProps) => {
    const [keywordInput, setKeywordInput] = useState('');

    const sortableId = makeCategorySortableId(category.id);
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
        disabled: saving,
    });

    const keywordSensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: { distance: 6 },
        }),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        }),
    );

    const style = {
        transform: CSS.Translate.toString(transform),
        transition,
    };

    const stopMenuEvent = (event: SyntheticEvent<HTMLElement>) => {
        event.stopPropagation();
    };

    const handleAddKeywordSubmit = async (
        event: FormEvent<HTMLFormElement>,
    ) => {
        event.preventDefault();
        const input = keywordInput.trim();
        if (!input) {
            return;
        }
        const created = await onAddKeywords(category.id, input);
        if (created) {
            setKeywordInput('');
        }
    };

    return (
        <Card
            as="article"
            padding="none"
            ref={setNodeRef}
            style={style}
            className={
                isDragging
                    ? 'z-10 overflow-hidden opacity-80'
                    : 'overflow-hidden'
            }
        >
            <header className="flex items-center justify-between gap-3 border-b border-line p-3 sm:p-4">
                <div className="flex min-w-0 items-center gap-2">
                    <IconButton
                        ref={setActivatorNodeRef}
                        label={`Drag ${category.name}`}
                        icon={<DragHandleIcon width={14} height={14} />}
                        variant="ghost"
                        size="sm"
                        className={
                            saving
                                ? 'h-9 w-9 cursor-default'
                                : 'h-9 w-9 cursor-grab active:cursor-grabbing'
                        }
                        disabled={saving}
                        {...attributes}
                        {...listeners}
                    />
                    <div className="min-w-0">
                        <h3 className="truncate text-base font-semibold text-ink">
                            {category.name}
                        </h3>
                        <p className="mt-0.5 text-[11px] font-medium text-ink-subtle">
                            {category.keywords.length} keywords
                        </p>
                    </div>
                </div>

                <div
                    className="relative shrink-0"
                    onPointerDown={stopMenuEvent}
                    onClick={stopMenuEvent}
                >
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <IconButton
                                label={`${category.name} actions`}
                                icon={<MoreIcon width={14} height={14} />}
                                variant="ghost"
                                size="sm"
                                className="h-9 w-9"
                                disabled={saving}
                            />
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" sideOffset={8}>
                            <DropdownMenuItem
                                onSelect={() => {
                                    onCopyAllKeywords(category);
                                }}
                            >
                                Copy All
                            </DropdownMenuItem>
                            <DropdownMenuItem
                                onSelect={() => {
                                    onRenameCategory(category);
                                }}
                            >
                                Rename
                            </DropdownMenuItem>
                            <DropdownMenuItem
                                className="text-red-700 data-[highlighted]:bg-red-50 data-[highlighted]:text-red-700"
                                onSelect={() => {
                                    onRemoveCategory(category.id);
                                }}
                            >
                                Remove
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </header>

            <div className="p-3 sm:p-4">
                <DndContext
                    sensors={keywordSensors}
                    collisionDetection={closestCenter}
                    onDragEnd={(event: DragEndEvent) =>
                        onKeywordDragEnd(category.id, event)
                    }
                >
                    <SortableContext
                        items={category.keywords.map((keyword) =>
                            makeKeywordSortableId(category.id, keyword.id),
                        )}
                        strategy={rectSortingStrategy}
                    >
                        {category.keywords.length > 0 ? (
                            <ul className="flex flex-wrap gap-2">
                                {category.keywords.map((keyword) => (
                                    <SortableKeywordItem
                                        key={keyword.id}
                                        categoryId={category.id}
                                        keyword={keyword}
                                        disabled={saving}
                                        onCopyKeyword={onCopyKeyword}
                                        onViewCollection={onViewCollection}
                                        onRemoveKeyword={(keywordId) =>
                                            onRemoveKeyword(
                                                category.id,
                                                keywordId,
                                            )
                                        }
                                        onAddSampleImage={
                                            onAddKeywordSampleImage
                                        }
                                        onRemoveSampleImage={
                                            onRemoveKeywordSampleImage
                                        }
                                    />
                                ))}
                            </ul>
                        ) : (
                            <p className="text-sm text-ink-muted">
                                No keywords yet.
                            </p>
                        )}
                    </SortableContext>
                </DndContext>

                <form
                    onSubmit={handleAddKeywordSubmit}
                    className="mt-3 flex gap-2 border-t border-line/70 pt-3"
                >
                    <Input
                        value={keywordInput}
                        onChange={(event) =>
                            setKeywordInput(event.target.value)
                        }
                        placeholder="keyword1, keyword2"
                        inputSize="control"
                        tone="control"
                        className="min-w-0 flex-1 text-xs"
                        disabled={saving}
                    />
                    <Button
                        type="submit"
                        variant="control"
                        size="control"
                        className="shrink-0"
                        disabled={saving}
                    >
                        Add
                    </Button>
                </form>
            </div>
        </Card>
    );
};
