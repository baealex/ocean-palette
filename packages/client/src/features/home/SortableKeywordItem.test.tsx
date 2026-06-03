import { DndContext } from '@dnd-kit/core';
import { SortableContext } from '@dnd-kit/sortable';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { makeKeywordSortableId } from './dnd-ids';
import { SortableKeywordItem } from './SortableKeywordItem';

afterEach(() => {
    cleanup();
});

describe('SortableKeywordItem', () => {
    it('opens keyword detail preview from a compact card', () => {
        const sortableId = makeKeywordSortableId(1, 10);

        render(
            <DndContext>
                <SortableContext items={[sortableId]}>
                    <SortableKeywordItem
                        categoryId={1}
                        keyword={{
                            id: 10,
                            name: 'cinematic lighting',
                            meaning: '영화 같은 조명',
                            effect: 'Adds dramatic contrast',
                            note: 'Use with portraits',
                            aliases: [
                                {
                                    id: 1,
                                    name: 'dramatic light',
                                    keywordId: 10,
                                },
                            ],
                            usage: {
                                keywordId: 10,
                                totalCount: 3,
                                promptCount: 2,
                                negativePromptCount: 1,
                                aliases: ['dramatic light'],
                            },
                        }}
                        onCopyKeyword={vi.fn()}
                        onViewCollection={vi.fn()}
                        onEditKeyword={vi.fn()}
                        onRemoveKeyword={vi.fn()}
                        onAddSampleImage={vi.fn()}
                        onRemoveSampleImage={vi.fn()}
                    />
                </SortableContext>
            </DndContext>,
        );

        expect(screen.getByText('cinematic lighting')).toBeInTheDocument();
        expect(
            screen.getByLabelText('cinematic lighting recent usage'),
        ).toHaveTextContent('3');
        const detailsButton = screen.getByRole('button', {
            name: 'cinematic lighting details',
        });
        expect(detailsButton).toBeInTheDocument();
        expect(screen.queryByText('영화 같은 조명')).not.toBeInTheDocument();
        expect(
            screen.queryByText('Adds dramatic contrast'),
        ).not.toBeInTheDocument();
        expect(
            screen.queryByText('Use with portraits'),
        ).not.toBeInTheDocument();

        fireEvent.click(detailsButton);

        expect(screen.getByText('Meaning')).toBeInTheDocument();
        expect(screen.getByText('Effect')).toBeInTheDocument();
        expect(screen.getByText('Note')).toBeInTheDocument();
        expect(screen.getByText('Aliases')).toBeInTheDocument();
        expect(screen.getByText('영화 같은 조명')).toBeInTheDocument();
        expect(screen.getByText('Adds dramatic contrast')).toBeInTheDocument();
        expect(screen.getByText('Use with portraits')).toBeInTheDocument();
        expect(screen.getByText('dramatic light')).toBeInTheDocument();
        expect(
            screen.getByRole('button', { name: 'Edit keyword' }),
        ).toBeInTheDocument();
    });
});
