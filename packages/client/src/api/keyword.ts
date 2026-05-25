import type { Keyword } from '~/models/types';

import { graphQLRequest } from './graphql-core';

export function createKeyword(data: { categoryId: number; name: string }) {
    return graphQLRequest<
        'createKeyword',
        Pick<Keyword, 'id' | 'name' | 'categories'>
    >(
        `
        mutation($categoryId: ID!, $name: String!) {
            createKeyword(categoryId: $categoryId, name: $name) {
                id
                name
                categories {
                    id
                    order
                }
            }
        }
        `,
        { categoryId: data.categoryId, name: data.name },
    );
}

export function updateKeywordOrder(data: {
    keywordId: number;
    categoryId: number;
    order: number;
}) {
    return graphQLRequest<'updateKeywordOrder', boolean>(
        `
        mutation($keywordId: ID!, $categoryId: ID!, $order: Int!) {
            updateKeywordOrder(keywordId: $keywordId, categoryId: $categoryId, order: $order)
        }
        `,
        {
            keywordId: data.keywordId,
            categoryId: data.categoryId,
            order: data.order,
        },
    );
}

export function deleteKeyword(data: { keywordId: number; categoryId: number }) {
    return graphQLRequest<'deleteKeyword', boolean>(
        `
        mutation($keywordId: ID!, $categoryId: ID!) {
            deleteKeyword(keywordId: $keywordId, categoryId: $categoryId)
        }
        `,
        {
            keywordId: data.keywordId,
            categoryId: data.categoryId,
        },
    );
}

export function createSampleImage(data: {
    imageId: number;
    keywordId: number;
}) {
    return graphQLRequest<'createSampleImage', boolean>(
        `
        mutation($imageId: ID!, $keywordId: ID!) {
            createSampleImage(imageId: $imageId, keywordId: $keywordId) {
                id
                name
                image {
                    id
                    url
                }
            }
        }
        `,
        {
            imageId: data.imageId,
            keywordId: data.keywordId,
        },
    );
}

export function deleteSampleImage(data: { id: number }) {
    return graphQLRequest<'deleteSampleImage', boolean>(
        `
        mutation($id: ID!) {
            deleteSampleImage(id: $id)
        }
        `,
        { id: data.id },
    );
}
