import type { Collection } from '~/models/types';

import { graphQLRequest } from '~/api/graphql-core';

export interface OrderRequest {
    order?: 'asc' | 'desc';
    orderBy?: string;
}

export interface SearchRequest {
    query?: string;
    model?: string;
    searchBy?: CollectionSearchBy;
    dateField?: CollectionDateField;
    dateFrom?: string;
    dateTo?: string;
}

export type CollectionSearchBy =
    | 'title_prompt'
    | 'title'
    | 'prompt'
    | 'negative_prompt';
export type CollectionDateField = 'collection_added' | 'generated_at';

export interface PaginationRequest {
    offset?: number;
    limit?: number;
    total?: number;
}

export interface Pagination {
    offset: number;
    limit: number;
    total: number;
}

export function getCollection(data: { id: number }) {
    return graphQLRequest<
        'collection',
        Pick<
            Collection,
            | 'id'
            | 'title'
            | 'prompt'
            | 'negativePrompt'
            | 'image'
            | 'generatedMetadata'
            | 'generatedAt'
        >
    >(
        `
        query($id: ID!) {
            collection(id: $id) {
                id
                title
                prompt
                negativePrompt
                generatedAt
                image {
                    id
                    url
                    width
                    height
                    createdAt
                }
                generatedMetadata {
                    sourceType
                    prompt
                    negativePrompt
                    model
                    modelHash
                    baseSampler
                    baseScheduler
                    baseSteps
                    baseCfgScale
                    baseSeed
                    upscaleSampler
                    upscaleScheduler
                    upscaleSteps
                    upscaleCfgScale
                    upscaleSeed
                    upscaleFactor
                    upscaler
                    sizeWidth
                    sizeHeight
                    clipSkip
                    vae
                    denoiseStrength
                    parseWarnings
                    parseVersion
                }
            }
        }
        `,
        { id: data.id },
    );
}

export function getCollectionModelOptions() {
    return graphQLRequest<'collectionModelOptions', string[]>(`
        query {
            collectionModelOptions
        }
    `);
}

interface GetCollectionsRequestData
    extends OrderRequest,
        PaginationRequest,
        SearchRequest {
    page?: number;
    limit?: number;
}

interface GetCollectionsResponse {
    collections: Pick<
        Collection,
        'id' | 'image' | 'title' | 'prompt' | 'negativePrompt'
    >[];
    pagination: Pagination;
}

export function getCollections(data: GetCollectionsRequestData = {}) {
    const {
        page = 1,
        limit = 10,
        query = '',
        model = '',
        searchBy = 'title_prompt',
        dateField = 'collection_added',
        dateFrom = '',
        dateTo = '',
        order = 'desc',
        orderBy = 'createdAt',
    } = data;
    const offset = (page - 1) * limit;

    return graphQLRequest<'allCollections', GetCollectionsResponse>(
        `
        query(
            $limit: Int!
            $offset: Int!
            $query: String!
            $model: String
            $searchBy: String
            $dateField: String
            $dateFrom: String
            $dateTo: String
            $order: String!
            $orderBy: String!
        ) {
            allCollections(
                limit: $limit,
                offset: $offset,
                query: $query,
                model: $model,
                searchBy: $searchBy,
                dateField: $dateField,
                dateFrom: $dateFrom,
                dateTo: $dateTo,
                order: $order,
                orderBy: $orderBy
            ) {
                collections {
                    id
                    title
                    prompt
                    negativePrompt
                    image {
                        id
                        url
                        width
                        height
                    }
                }
                pagination {
                    offset
                    limit
                    total
                }
            }
        }
        `,
        {
            limit,
            offset,
            query,
            model,
            searchBy,
            dateField,
            dateFrom,
            dateTo,
            order,
            orderBy,
        },
    );
}

export function createCollection(data: {
    title: string;
    prompt: string;
    negativePrompt: string;
    imageId: number;
}) {
    return graphQLRequest<
        'createCollection',
        Pick<Collection, 'id' | 'prompt' | 'negativePrompt' | 'image'>
    >(
        `
        mutation($title: String!, $prompt: String!, $negativePrompt: String!, $imageId: ID!) {
            createCollection(title: $title, prompt: $prompt, negativePrompt: $negativePrompt, imageId: $imageId) {
                id
                title
                prompt
                negativePrompt
                image {
                    id
                    url
                    width
                    height
                }
            }
        }
        `,
        {
            title: data.title,
            prompt: data.prompt,
            negativePrompt: data.negativePrompt,
            imageId: data.imageId,
        },
    );
}

export function updateCollection(data: { id: number; title: string }) {
    return graphQLRequest<'updateCollection', Pick<Collection, 'title'>>(
        `
        mutation($id: ID!, $title: String!) {
            updateCollection(id: $id, title: $title) {
                title
            }
        }
        `,
        {
            id: data.id,
            title: data.title,
        },
    );
}

export function deleteCollection(data: { id: number }) {
    return graphQLRequest<'deleteCollection', boolean>(
        `
        mutation($id: ID!) {
            deleteCollection(id: $id)
        }
        `,
        { id: data.id },
    );
}
