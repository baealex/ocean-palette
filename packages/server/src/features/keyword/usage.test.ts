import { describe, expect, it } from 'vitest';

import {
    buildKeywordSearchTerms,
    calculateKeywordUsage,
    promptContainsKeywordTerm,
} from './usage';

describe('keyword usage matching', () => {
    it('builds unique keyword and alias search terms', () => {
        const terms = buildKeywordSearchTerms({
            id: 1,
            name: 'Soft Light',
            aliases: [{ name: 'soft light' }, { name: 'Gentle Glow' }],
        } as never);

        expect(terms).toEqual(['soft light', 'gentle glow']);
    });

    it('matches prompt terms without matching partial words', () => {
        expect(
            promptContainsKeywordTerm('warm soft light, portrait', [
                'soft light',
            ]),
        ).toBe(true);
        expect(promptContainsKeywordTerm('reddish fabric', ['red'])).toBe(
            false,
        );
    });

    it('counts each prompt field once for a keyword name or alias match', () => {
        const usage = calculateKeywordUsage({
            keywords: [
                {
                    id: 1,
                    name: 'cinematic lighting',
                    aliases: [{ name: 'dramatic light' }],
                },
            ] as never,
            collections: [
                {
                    prompt: 'dramatic light, cinematic lighting',
                    negativePrompt: 'low contrast',
                },
                {
                    prompt: 'simple background',
                    negativePrompt: 'dramatic light',
                },
            ] as never,
        });

        expect(usage[0]).toMatchObject({
            keywordId: 1,
            totalCount: 2,
            promptCount: 1,
            negativePromptCount: 1,
            aliases: ['dramatic light'],
        });
    });
});
