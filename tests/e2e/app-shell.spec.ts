import { expect, test } from '@playwright/test';

type GraphQLResponse<T> = {
    data?: T;
    errors?: Array<{ message?: string }>;
};

const expectNoRuntimeErrors = (pageErrors: Error[], consoleErrors: string[]) => {
    expect(pageErrors.map(error => error.message)).toEqual([]);
    expect(consoleErrors).toEqual([]);
};

test('loads the app shell and empty collection flow against the production server', async ({ page, request }) => {
    const pageErrors: Error[] = [];
    const consoleErrors: string[] = [];

    page.on('pageerror', error => {
        pageErrors.push(error);
    });
    page.on('console', message => {
        if (message.type() === 'error') {
            consoleErrors.push(message.text());
        }
    });

    await page.goto('/');

    await expect(page.getByRole('heading', { name: 'Prompt Palette' })).toBeVisible();
    await expect(page.getByText('No categories yet. Add your first category to start organizing prompts.')).toBeVisible();

    const categoriesResponse = await request.post('/graphql', {
        data: {
            query: '{ allCategories { id name order } }',
        },
    });
    expect(categoriesResponse.ok()).toBe(true);
    const categories = await categoriesResponse.json() as GraphQLResponse<{ allCategories: unknown[] }>;
    expect(categories.errors ?? []).toEqual([]);
    expect(categories.data?.allCategories).toEqual([]);

    await page.goto('/collection');

    await expect(page.getByRole('heading', { name: 'Collection' })).toBeVisible();
    await expect(page.getByText('No collections found.')).toBeVisible();

    const collectionsResponse = await request.post('/graphql', {
        data: {
            query: '{ allCollections(limit: 1, offset: 0) { pagination { total } collections { id title } } }',
        },
    });
    expect(collectionsResponse.ok()).toBe(true);
    const collections = await collectionsResponse.json() as GraphQLResponse<{
        allCollections: { pagination: { total: number }; collections: unknown[] };
    }>;
    expect(collections.errors ?? []).toEqual([]);
    expect(collections.data?.allCollections.pagination.total).toBe(0);
    expect(collections.data?.allCollections.collections).toEqual([]);

    expectNoRuntimeErrors(pageErrors, consoleErrors);
});
