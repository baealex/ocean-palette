import dayjs from 'dayjs';

import { Prisma } from '~/models';

export type AllCollectionsOrder = 'asc' | 'desc';
export type AllCollectionsSearchBy =
    | 'title_prompt'
    | 'title'
    | 'prompt'
    | 'negative_prompt';
export type AllCollectionsDateField = 'collection_added' | 'generated_at';

const DEFAULT_COLLECTION_LIMIT = 60;
const MAX_COLLECTION_LIMIT = 200;

export interface AllCollectionsQueryArgs {
    orderBy?: string;
    order?: string;
    query?: string;
    model?: string;
    searchBy?: string;
    dateField?: string;
    dateFrom?: string;
    dateTo?: string;
    limit?: number;
    offset?: number;
}

export const resolveCollectionQueryFilter = (
    query: string,
    searchBy?: AllCollectionsSearchBy,
): Prisma.CollectionWhereInput => {
    if (searchBy === 'title') {
        return {
            title: {
                contains: query,
            },
        };
    }

    if (searchBy === 'prompt') {
        return {
            prompt: {
                contains: query,
            },
        };
    }

    if (searchBy === 'negative_prompt') {
        return {
            negativePrompt: {
                contains: query,
            },
        };
    }

    return {
        OR: [
            {
                title: {
                    contains: query,
                },
            },
            {
                prompt: {
                    contains: query,
                },
            },
        ],
    };
};

const parseCollectionDateValue = (input?: string) => {
    if (!input) {
        return null;
    }

    const normalized = input.trim();
    if (!normalized) {
        return null;
    }

    const parsed = dayjs(normalized);
    if (!parsed.isValid()) {
        return null;
    }

    return parsed.toDate();
};

export const resolveCollectionDateFilter = ({
    dateField,
    dateFrom,
    dateTo,
}: {
    dateField?: AllCollectionsDateField;
    dateFrom?: string;
    dateTo?: string;
}): Prisma.CollectionWhereInput | null => {
    let parsedFrom = parseCollectionDateValue(dateFrom);
    let parsedTo = parseCollectionDateValue(dateTo);

    if (!parsedFrom && !parsedTo) {
        return null;
    }

    if (parsedFrom && parsedTo && parsedFrom.getTime() > parsedTo.getTime()) {
        [parsedFrom, parsedTo] = [parsedTo, parsedFrom];
    }

    const range: Prisma.DateTimeFilter = {};
    if (parsedFrom) {
        range.gte = parsedFrom;
    }
    if (parsedTo) {
        range.lte = parsedTo;
    }

    if (dateField === 'generated_at') {
        return {
            image: {
                generatedAt: range,
            },
        };
    }

    return {
        createdAt: range,
    };
};

export function resolveCollectionOrderBy(
    orderBy?: string,
    order: AllCollectionsOrder = 'desc',
) {
    const normalizedOrder = order === 'asc' ? 'asc' : 'desc';
    if (
        orderBy === 'generatedAt' ||
        orderBy === 'fileCreatedAt' ||
        orderBy === 'fileModifiedAt'
    ) {
        return {
            image: {
                generatedAt: normalizedOrder,
            },
        } as const;
    }
    return {
        [orderBy || 'createdAt']: normalizedOrder,
    } as const;
}

export function normalizeOrder(input: string | undefined): AllCollectionsOrder {
    return input === 'asc' ? 'asc' : 'desc';
}

export function normalizeSearchBy(
    input: string | undefined,
): AllCollectionsSearchBy | undefined {
    if (
        input === 'title_prompt' ||
        input === 'title' ||
        input === 'prompt' ||
        input === 'negative_prompt'
    ) {
        return input;
    }
    return undefined;
}

export function normalizeDateField(
    input: string | undefined,
): AllCollectionsDateField | undefined {
    if (input === 'collection_added' || input === 'generated_at') {
        return input;
    }
    return undefined;
}

export function normalizeLimit(input: number | undefined): number {
    if (!Number.isFinite(input) || !input || input <= 0) {
        return DEFAULT_COLLECTION_LIMIT;
    }
    return Math.min(Math.trunc(input), MAX_COLLECTION_LIMIT);
}

export function normalizeOffset(input: number | undefined): number {
    if (!Number.isFinite(input) || input === undefined || input < 0) {
        return 0;
    }
    return Math.trunc(input);
}
