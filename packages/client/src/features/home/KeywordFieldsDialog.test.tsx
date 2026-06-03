import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { KeywordFieldsDialog } from './KeywordFieldsDialog';

afterEach(() => {
    cleanup();
});

describe('KeywordFieldsDialog', () => {
    it('submits keyword effect card fields', () => {
        const onSubmit = vi.fn();

        render(
            <KeywordFieldsDialog
                open
                categoryName="Lighting"
                keyword={null}
                onSubmit={onSubmit}
                onOpenChange={vi.fn()}
            />,
        );

        fireEvent.change(screen.getByLabelText('Keyword'), {
            target: { value: 'cinematic lighting' },
        });
        fireEvent.change(screen.getByLabelText('Meaning'), {
            target: { value: '영화 같은 조명' },
        });
        fireEvent.change(screen.getByLabelText('Aliases'), {
            target: { value: 'movie light, dramatic light' },
        });
        fireEvent.change(screen.getByLabelText('Effect'), {
            target: { value: 'Adds dramatic contrast' },
        });
        fireEvent.change(screen.getByLabelText('Note'), {
            target: { value: 'Use with portraits' },
        });
        fireEvent.click(screen.getByRole('button', { name: 'Save' }));

        expect(onSubmit).toHaveBeenCalledWith({
            name: 'cinematic lighting',
            meaning: '영화 같은 조명',
            effect: 'Adds dramatic contrast',
            note: 'Use with portraits',
            aliases: ['movie light', 'dramatic light'],
        });
    });

    it('loads existing keyword values for editing', () => {
        render(
            <KeywordFieldsDialog
                open
                keyword={{
                    id: 7,
                    name: 'soft light',
                    meaning: '부드러운 빛',
                    effect: 'Softens shadows',
                    note: 'Good for skin texture',
                    aliases: [
                        {
                            id: 11,
                            name: 'gentle light',
                            keywordId: 7,
                        },
                    ],
                }}
                onSubmit={vi.fn()}
                onOpenChange={vi.fn()}
            />,
        );

        expect(screen.getByDisplayValue('soft light')).toBeInTheDocument();
        expect(screen.getByDisplayValue('부드러운 빛')).toBeInTheDocument();
        expect(screen.getByDisplayValue('Softens shadows')).toBeInTheDocument();
        expect(
            screen.getByDisplayValue('Good for skin texture'),
        ).toBeInTheDocument();
        expect(screen.getByDisplayValue('gentle light')).toBeInTheDocument();
    });
});
