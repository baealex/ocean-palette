import type { Keyword } from '~/models/types';

import { graphQLRequest } from '~/api/graphql-core';

export interface KeywordFieldsInput {
    name: string;
    meaning?: string;
    effect?: string;
    note?: string;
}

const keywordFields = `
    id
    name
    meaning
    effect
    note
`;

export function createKeyword(
    data: { categoryId: number } & KeywordFieldsInput,
) {
    return graphQLRequest<
        'createKeyword',
        Pick<
            Keyword,
            'id' | 'name' | 'meaning' | 'effect' | 'note' | 'categories'
        >
    >(
        `
        mutation(
            $categoryId: ID!
            $name: String!
            $meaning: String
            $effect: String
            $note: String
        ) {
            createKeyword(
                categoryId: $categoryId
                name: $name
                meaning: $meaning
                effect: $effect
                note: $note
            ) {
                ${keywordFields}
                categories {
                    id
                    order
                }
            }
        }
        `,
        {
            categoryId: data.categoryId,
            name: data.name,
            meaning: data.meaning,
            effect: data.effect,
            note: data.note,
        },
    );
}

export function updateKeyword(data: { id: number } & KeywordFieldsInput) {
    return graphQLRequest<
        'updateKeyword',
        Pick<Keyword, 'id' | 'name' | 'meaning' | 'effect' | 'note'>
    >(
        `
        mutation(
            $id: ID!
            $name: String!
            $meaning: String
            $effect: String
            $note: String
        ) {
            updateKeyword(
                id: $id
                name: $name
                meaning: $meaning
                effect: $effect
                note: $note
            ) {
                ${keywordFields}
            }
        }
        `,
        {
            id: data.id,
            name: data.name,
            meaning: data.meaning,
            effect: data.effect,
            note: data.note,
        },
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
                meaning
                effect
                note
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
