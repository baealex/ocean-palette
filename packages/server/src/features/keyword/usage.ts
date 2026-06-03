import type { Collection, Keyword, KeywordAlias } from '~/models';

type KeywordWithAliases = Keyword & {
    aliases: Pick<KeywordAlias, 'name'>[];
};

type PromptScope = 'all' | 'prompt' | 'negative_prompt';

export interface KeywordUsageOptions {
    promptScope?: PromptScope | null;
}

export interface KeywordUsageResult {
    keywordId: number;
    totalCount: number;
    promptCount: number;
    negativePromptCount: number;
    aliases: string[];
}

type PromptCollection = Pick<Collection, 'prompt' | 'negativePrompt'>;

interface CalculateKeywordUsageArgs {
    keywords: KeywordWithAliases[];
    collections: PromptCollection[];
    options?: KeywordUsageOptions;
}

const DEFAULT_PROMPT_SCOPE: PromptScope = 'all';

const REGEXP_SPECIAL_CHARS = /[.*+?^${}()|[\]\\]/g;

const normalizeSearchText = (value: string) =>
    value.trim().toLowerCase().replace(/\s+/g, ' ');

const escapeRegExp = (value: string) =>
    value.replace(REGEXP_SPECIAL_CHARS, '\\$&');

export const buildKeywordSearchTerms = (keyword: KeywordWithAliases) => {
    const values = [
        keyword.name,
        ...keyword.aliases.map((alias) => alias.name),
    ];
    const uniqueTerms = new Set<string>();

    for (const value of values) {
        const term = normalizeSearchText(value);
        if (term) {
            uniqueTerms.add(term);
        }
    }

    return [...uniqueTerms];
};

export const promptContainsKeywordTerm = (
    prompt: string | null | undefined,
    terms: string[],
) => {
    const normalizedPrompt = normalizeSearchText(prompt ?? '');
    if (!normalizedPrompt) {
        return false;
    }

    return terms.some((term) => {
        const escaped = escapeRegExp(term).replace(/\\ /g, '\\s+');
        const pattern = new RegExp(`(^|[^a-z0-9])${escaped}(?=$|[^a-z0-9])`);
        return pattern.test(normalizedPrompt);
    });
};

export const calculateKeywordUsage = ({
    keywords,
    collections,
    options = {},
}: CalculateKeywordUsageArgs): KeywordUsageResult[] => {
    const promptScope = options.promptScope || DEFAULT_PROMPT_SCOPE;
    const includePrompt = promptScope === 'all' || promptScope === 'prompt';
    const includeNegativePrompt =
        promptScope === 'all' || promptScope === 'negative_prompt';

    return keywords.map((keyword) => {
        const terms = buildKeywordSearchTerms(keyword);
        const aliases = keyword.aliases.map((alias) => alias.name);
        let promptCount = 0;
        let negativePromptCount = 0;

        for (const collection of collections) {
            if (
                includePrompt &&
                promptContainsKeywordTerm(collection.prompt, terms)
            ) {
                promptCount += 1;
            }

            if (
                includeNegativePrompt &&
                promptContainsKeywordTerm(collection.negativePrompt, terms)
            ) {
                negativePromptCount += 1;
            }
        }

        return {
            keywordId: keyword.id,
            totalCount: promptCount + negativePromptCount,
            promptCount,
            negativePromptCount,
            aliases,
        };
    });
};
