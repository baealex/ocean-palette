import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3';
import { PrismaClient } from '@prisma/client';

if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL is required for server tests.');
}

const adapter = new PrismaBetterSqlite3({
    url: process.env.DATABASE_URL,
});

const mockPrisma = new PrismaClient({
    adapter,
});

vi.doMock('~/models', async () => {
    const actual = await vi.importActual<Record<string, unknown>>('~/models');
    return {
        ...actual,
        models: mockPrisma,
    };
});

beforeAll(async () => {
    await mockPrisma.$connect();
});

afterAll(async () => {
    await mockPrisma.$disconnect();
});
