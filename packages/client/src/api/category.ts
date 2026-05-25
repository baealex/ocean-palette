import type { Category } from '~/models/types';

import { graphQLRequest } from './graphql-core';

export function getCategories() {
    return graphQLRequest<
        'allCategories',
        Pick<Category, 'id' | 'name' | 'keywords' | 'order'>[]
    >(`
        query {
            allCategories {
                id
                name
                order
                keywords {
                    id
                    name
                    image {
                        id
                        url
                    }
                    categories {
                        id
                        order
                    }
                }
            }
        }
    `);
}

export function createCategory(data: { name: string }) {
    return graphQLRequest<
        'createCategory',
        Pick<Category, 'id' | 'name' | 'order'>
    >(
        `
        mutation($name: String!) {
            createCategory(name: $name) {
                id
                name
                order
            }
        }
        `,
        { name: data.name },
    );
}

export function updateCategory(data: { id: number; name: string }) {
    return graphQLRequest<'updateCategory', Pick<Category, 'id' | 'name'>>(
        `
        mutation($id: ID!, $name: String!) {
            updateCategory(id: $id, name: $name) {
                id
                name
            }
        }
        `,
        { id: data.id, name: data.name },
    );
}

export function updateCategoryOrder(data: { id: number; order: number }) {
    return graphQLRequest<'updateCategoryOrder', boolean>(
        `
        mutation($id: ID!, $order: Int!) {
            updateCategoryOrder(id: $id, order: $order)
        }
        `,
        { id: data.id, order: data.order },
    );
}

export function deleteCategory(data: { id: number }) {
    return graphQLRequest<'deleteCategory', boolean>(
        `
        mutation($id: ID!) {
            deleteCategory(id: $id)
        }
        `,
        { id: data.id },
    );
}
