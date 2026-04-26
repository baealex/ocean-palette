import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3';
import { PrismaClient } from '@prisma/client';

export const createPrismaClient = (
    url = process.env.DATABASE_URL ?? 'file:./prisma/data/db.sqlite3',
) => {
    const adapter = new PrismaBetterSqlite3({
        url,
    });

    return new PrismaClient({
        adapter,
        log:
            process.env.NODE_ENV === 'development'
                ? ['query', 'error', 'warn']
                : ['error'],
    });
};

export const models = createPrismaClient();

export interface Order {
    orderBy: string;
    order: 'asc' | 'desc';
}

export interface Search {
    query: string;
    model?: string;
    searchBy?: 'title_prompt' | 'title' | 'prompt' | 'negative_prompt';
    dateField?: 'collection_added' | 'generated_at';
    dateFrom?: string;
    dateTo?: string;
}

export interface Pagination {
    limit: number;
    offset: number;
}

export * from '@prisma/client';
