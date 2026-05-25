import { IResolvers } from '@graphql-tools/utils';

import { Collection, Prisma, models } from '~/models';
import { gql } from '~/modules/graphql';
import { liveImagesService } from '~/features/live';

import { toGeneratedMetadataPayload } from './metadata-payload';
import {
    AllCollectionsQueryArgs,
    normalizeDateField,
    normalizeLimit,
    normalizeOffset,
    normalizeOrder,
    normalizeSearchBy,
    resolveCollectionDateFilter,
    resolveCollectionOrderBy,
    resolveCollectionQueryFilter,
} from './query-helpers';

type CollectionWithImageMeta = Prisma.CollectionGetPayload<{
    include: {
        image: {
            include: {
                meta: true;
            };
        };
    };
}>;

interface CollectionPaginationPayload {
    limit: number;
    offset: number;
    total: number;
}

interface AllCollectionsPayload {
    collections: CollectionWithImageMeta[];
    pagination: CollectionPaginationPayload;
}

function resolveLoadedImage(
    collection: Collection | CollectionWithImageMeta,
): CollectionWithImageMeta['image'] | null {
    if ('image' in collection) {
        return collection.image;
    }
    return null;
}

export const CollectionType = gql`
    type Collection {
        id: ID!
        image: Image!
        title: String!
        prompt: String!
        negativePrompt: String!
        generatedAt: String
        generatedMetadata: GeneratedMetadata
        createdAt: String!
        updatedAt: String!
    }

    type GeneratedMetadata {
        sourceType: String!
        prompt: String!
        negativePrompt: String!
        model: String
        modelHash: String
        baseSampler: String
        baseScheduler: String
        baseSteps: Int
        baseCfgScale: Float
        baseSeed: String
        upscaleSampler: String
        upscaleScheduler: String
        upscaleSteps: Int
        upscaleCfgScale: Float
        upscaleSeed: String
        upscaleFactor: Float
        upscaler: String
        sizeWidth: Int
        sizeHeight: Int
        clipSkip: Int
        vae: String
        denoiseStrength: Float
        parseWarnings: [String!]!
        parseVersion: String!
    }

    type Image {
        id: ID!
        url: String!
        width: Int!
        height: Int!
        createdAt: String!
    }

    type Pagination {
        limit: Int!
        offset: Int!
        total: Int!
    }

    type AllCollections {
        collections: [Collection!]!
        pagination: Pagination!
    }
`;

export const CollectionQuery = gql`
    type Query {
        collectionModelOptions: [String!]!
        allCollections(orderBy: String, order: String, query: String, model: String, searchBy: String, dateField: String, dateFrom: String, dateTo: String, limit: Int, offset: Int): AllCollections!
        collection(id: ID!): Collection!
    }
`;

export const CollectionMutation = gql`
    type Mutation {
        createCollection(imageId: ID!, title: String!, prompt: String!, negativePrompt: String!): Collection!
        updateCollection(id: ID!, imageId: ID, title: String, prompt: String, negativePrompt: String): Collection!
        deleteCollection(id: ID!): Boolean!
    }
`;

export const CollectionTypeDefs = `
    ${CollectionType}
    ${CollectionQuery}
    ${CollectionMutation}
`;

export const CollectionResolvers: IResolvers = {
    Query: {
        collectionModelOptions: async () => {
            const metas = await models.imageMeta.findMany({
                where: {
                    model: {
                        not: null,
                    },
                },
                select: {
                    model: true,
                },
                distinct: ['model'],
                orderBy: {
                    model: 'asc',
                },
            });

            return metas
                .map((meta) => meta.model?.trim())
                .filter((model): model is string => Boolean(model));
        },
        allCollections: async (
            _,
            {
                orderBy,
                order,
                query,
                model,
                searchBy,
                dateField,
                dateFrom,
                dateTo,
                limit,
                offset,
            }: AllCollectionsQueryArgs,
        ): Promise<AllCollectionsPayload> => {
            const normalizedQuery = query?.trim() || '';
            const normalizedModel = model?.trim() || '';
            const normalizedLimit = normalizeLimit(limit);
            const normalizedOffset = normalizeOffset(offset);
            const filters: Prisma.CollectionWhereInput[] = [];

            if (normalizedQuery) {
                filters.push(
                    resolveCollectionQueryFilter(
                        normalizedQuery,
                        normalizeSearchBy(searchBy),
                    ),
                );
            }

            if (normalizedModel) {
                filters.push({
                    image: {
                        meta: {
                            is: {
                                model: {
                                    contains: normalizedModel,
                                },
                            },
                        },
                    },
                });
            }

            const dateFilter = resolveCollectionDateFilter({
                dateField: normalizeDateField(dateField),
                dateFrom,
                dateTo,
            });
            if (dateFilter) {
                filters.push(dateFilter);
            }

            const where =
                filters.length === 0
                    ? undefined
                    : filters.length === 1
                      ? filters[0]
                      : {
                            AND: filters,
                        };

            const [collections, total] = await Promise.all([
                models.collection.findMany({
                    orderBy: resolveCollectionOrderBy(
                        orderBy,
                        normalizeOrder(order),
                    ),
                    where,
                    take: normalizedLimit,
                    skip: normalizedOffset,
                    include: {
                        image: {
                            include: {
                                meta: true,
                            },
                        },
                    },
                }),
                models.collection.count({ where }),
            ]);

            return {
                collections,
                pagination: {
                    limit: normalizedLimit,
                    offset: normalizedOffset,
                    total,
                },
            };
        },
        collection: (_, { id }: Collection) =>
            models.collection.findUnique({
                where: {
                    id: Number(id),
                },
                include: {
                    image: {
                        include: {
                            meta: true,
                        },
                    },
                },
            }),
    },
    Mutation: {
        createCollection: async (
            _,
            { imageId, title, prompt, negativePrompt }: Collection,
        ) => {
            imageId = Number(imageId);

            const collection = await models.collection.create({
                data: {
                    image: {
                        connect: {
                            id: imageId,
                        },
                    },
                    title,
                    prompt,
                    negativePrompt,
                },
            });

            liveImagesService.notifyCollectionsChanged('gql:createCollection');
            return collection;
        },
        updateCollection: async (
            _,
            { id, imageId, title, prompt, negativePrompt }: Partial<Collection>,
        ) => {
            id = Number(id);
            imageId = Number(imageId);

            const collection = await models.collection.update({
                where: {
                    id,
                },
                data: {
                    image: imageId
                        ? {
                              connect: {
                                  id: imageId,
                              },
                          }
                        : undefined,
                    title,
                    prompt,
                    negativePrompt,
                },
            });

            liveImagesService.notifyCollectionsChanged('gql:updateCollection');
            return collection;
        },
        deleteCollection: async (_, { id }: Collection) => {
            id = Number(id);

            const imageId = await models.$transaction(async (tx) => {
                const target = await tx.collection.findUnique({
                    where: {
                        id,
                    },
                    select: {
                        id: true,
                        imageId: true,
                    },
                });

                if (!target) {
                    throw new Error('Collection not found');
                }

                await tx.collection.delete({
                    where: {
                        id: target.id,
                    },
                });

                return target.imageId;
            });

            const deletedOrphan = await liveImagesService.deleteImageIfOrphan(
                imageId,
                'gql:deleteCollection',
            );

            if (!deletedOrphan) {
                liveImagesService.notifyCollectionsChanged(
                    'gql:deleteCollection',
                );
            }

            return true;
        },
    },
    Collection: {
        image: async (collection: Collection | CollectionWithImageMeta) => {
            const loadedImage = resolveLoadedImage(collection);
            if (loadedImage) {
                return loadedImage;
            }
            return models.image.findUnique({
                where: {
                    id: collection.imageId,
                },
            });
        },
        generatedAt: async (
            collection: Collection | CollectionWithImageMeta,
        ) => {
            const loadedImage = resolveLoadedImage(collection);
            if (loadedImage) {
                return loadedImage.generatedAt?.toISOString?.() || null;
            }

            const image = await models.image.findUnique({
                where: { id: collection.imageId },
                select: { generatedAt: true },
            });
            return image?.generatedAt?.toISOString?.() || null;
        },
        generatedMetadata: async (
            collection: Collection | CollectionWithImageMeta,
        ) => {
            const loadedImage = resolveLoadedImage(collection);
            if (loadedImage) {
                return toGeneratedMetadataPayload(loadedImage.meta || null);
            }

            const metadata = await models.imageMeta.findUnique({
                where: {
                    imageId: collection.imageId,
                },
            });
            return toGeneratedMetadataPayload(metadata);
        },
    },
};
