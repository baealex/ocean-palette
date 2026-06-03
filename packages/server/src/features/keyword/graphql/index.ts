import { IResolvers } from '@graphql-tools/utils';

import {
    Keyword,
    KeywordAlias,
    KeywordToCategory,
    Prisma,
    models,
} from '~/models';
import { gql } from '~/modules/graphql';

import { calculateKeywordUsage } from '../usage';

export const keywordType = gql`
    type Keyword {
        id: ID!
        name: String
        meaning: String
        effect: String
        note: String
        aliases: [KeywordAlias!]!
        image: Image
        createdAt: String!
        updatedAt: String!
        categories: [keywordToCategory!]!
    }

    type KeywordAlias {
        id: ID!
        name: String!
        keywordId: Int!
        createdAt: String!
        updatedAt: String!
    }

    enum KeywordUsagePromptScope {
        ALL
        PROMPT
        NEGATIVE_PROMPT
    }

    type KeywordUsage {
        keywordId: ID!
        totalCount: Int!
        promptCount: Int!
        negativePromptCount: Int!
        aliases: [String!]!
    }

    type Image {
        id: ID!
        url: String!
        width: Int!
        height: Int!
    }

    type keywordToCategory {
        id: ID!
        order: Int!
        keywordId: Int!
        categoryId: Int!
    }
`;

export const keywordQuery = gql`
    type Query {
        allKeywords: [Keyword!]!
        keyword(id: ID!): Keyword!
        keywordUsage(dateFrom: String, dateTo: String, model: String, promptScope: KeywordUsagePromptScope): [KeywordUsage!]!
    }
`;

export const keywordMutation = gql`
    type Mutation {
        createKeyword(
            name: String!
            categoryId: ID!
            meaning: String
            effect: String
            note: String
            aliases: [String!]
        ): Keyword!
        updateKeyword(
            id: ID!
            name: String!
            meaning: String
            effect: String
            note: String
            aliases: [String!]
        ): Keyword!
        createKeywordAlias(keywordId: ID!, name: String!): KeywordAlias!
        updateKeywordAlias(id: ID!, name: String!): KeywordAlias!
        deleteKeywordAlias(id: ID!): Boolean!
        createSampleImage(imageId: ID!, keywordId: ID!): Keyword!
        updateKeywordOrder(categoryId: ID!, keywordId: ID!, order: Int!): Boolean!
        deleteKeyword(categoryId: ID!, keywordId: ID!): Boolean!
        deleteSampleImage(id: ID!): Boolean!
    }
`;

export const keywordTypeDefs = `
    ${keywordType}
    ${keywordQuery}
    ${keywordMutation}
`;

type KeywordWriteArgs = Keyword &
    KeywordToCategory & {
        aliases?: string[];
    };

const clampOrderToIndex = (order: number, length: number) => {
    if (length <= 0) {
        return 0;
    }
    if (order <= 1) {
        return 0;
    }
    if (order >= length) {
        return length - 1;
    }
    return order - 1;
};

const normalizeRequiredText = (value: unknown, fieldName: string) => {
    const text = typeof value === 'string' ? value.trim() : '';
    if (!text) {
        throw new Error(`${fieldName} is required`);
    }
    return text;
};

const normalizeOptionalText = (value: unknown) =>
    typeof value === 'string' ? value.trim() : undefined;

const buildKeywordTextData = ({
    meaning,
    effect,
    note,
}: Pick<Keyword, 'meaning' | 'effect' | 'note'>) => {
    const normalized = {
        meaning: normalizeOptionalText(meaning),
        effect: normalizeOptionalText(effect),
        note: normalizeOptionalText(note),
    };

    return {
        ...(normalized.meaning !== undefined
            ? { meaning: normalized.meaning }
            : {}),
        ...(normalized.effect !== undefined
            ? { effect: normalized.effect }
            : {}),
        ...(normalized.note !== undefined ? { note: normalized.note } : {}),
    };
};

const buildKeywordCreateUpdateData = (
    textData: ReturnType<typeof buildKeywordTextData>,
) =>
    Object.fromEntries(
        Object.entries(textData).filter(([, value]) => value.length > 0),
    );

const normalizeAliasNames = (aliases: unknown) => {
    if (!Array.isArray(aliases)) {
        return undefined;
    }

    const names = new Map<string, string>();
    for (const alias of aliases) {
        const name = normalizeOptionalText(alias);
        if (name) {
            const key = name.toLowerCase();
            if (!names.has(key)) {
                names.set(key, name);
            }
        }
    }

    return [...names.values()];
};

const replaceKeywordAliases = async ({
    tx,
    keywordId,
    aliases,
}: {
    tx: Prisma.TransactionClient;
    keywordId: number;
    aliases: unknown;
}) => {
    const aliasNames = normalizeAliasNames(aliases);
    if (aliasNames === undefined) {
        return;
    }

    await tx.keywordAlias.deleteMany({
        where: {
            keywordId,
        },
    });

    if (aliasNames.length === 0) {
        return;
    }

    await tx.keywordAlias.createMany({
        data: aliasNames.map((name) => ({
            keywordId,
            name,
        })),
    });
};

const parseDate = (value: unknown, fieldName: string) => {
    if (typeof value !== 'string' || !value.trim()) {
        return null;
    }

    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
        throw new Error(`${fieldName} must be a valid date`);
    }

    return date;
};

const getDefaultDateFrom = () => {
    const date = new Date();
    date.setDate(date.getDate() - 30);
    return date;
};

const normalizePromptScope = (scope: unknown) => {
    if (scope === 'PROMPT') {
        return 'prompt';
    }
    if (scope === 'NEGATIVE_PROMPT') {
        return 'negative_prompt';
    }
    return 'all';
};

export const keywordResolvers: IResolvers = {
    Query: {
        allKeywords: models.keyword.findMany,
        keyword: (_, { id }: Keyword) =>
            models.keyword.findUnique({
                where: {
                    id: Number(id),
                },
            }),
        keywordUsage: async (
            _,
            {
                dateFrom,
                dateTo,
                model,
                promptScope,
            }: {
                dateFrom?: string;
                dateTo?: string;
                model?: string;
                promptScope?: string;
            },
        ) => {
            const from =
                parseDate(dateFrom, 'dateFrom') ?? getDefaultDateFrom();
            const to = parseDate(dateTo, 'dateTo');
            const filters: Prisma.CollectionWhereInput[] = [
                {
                    createdAt: {
                        gte: from,
                        ...(to ? { lte: to } : {}),
                    },
                },
            ];
            const normalizedModel = model?.trim();

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

            const [keywords, collections] = await Promise.all([
                models.keyword.findMany({
                    include: {
                        aliases: {
                            orderBy: {
                                name: 'asc',
                            },
                        },
                    },
                    orderBy: {
                        id: 'asc',
                    },
                }),
                models.collection.findMany({
                    where:
                        filters.length === 1
                            ? filters[0]
                            : {
                                  AND: filters,
                              },
                    select: {
                        prompt: true,
                        negativePrompt: true,
                    },
                }),
            ]);

            return calculateKeywordUsage({
                keywords,
                collections,
                options: {
                    promptScope: normalizePromptScope(promptScope),
                },
            });
        },
    },
    Mutation: {
        createKeyword: async (
            _,
            {
                name,
                categoryId,
                meaning,
                effect,
                note,
                aliases,
            }: KeywordWriteArgs,
        ) => {
            categoryId = Number(categoryId);
            const keywordName = normalizeRequiredText(name, 'Keyword name');
            const keywordTextData = buildKeywordTextData({
                meaning,
                effect,
                note,
            });
            return models.$transaction(async (tx) => {
                const keyword = await tx.keyword.findFirst({
                    where: {
                        name: keywordName,
                    },
                    select: {
                        id: true,
                        categories: {
                            select: {
                                categoryId: true,
                            },
                        },
                    },
                });

                if (
                    keyword?.categories?.some(
                        (category) => category.categoryId === categoryId,
                    )
                ) {
                    throw new Error('Keyword already exists in category');
                }

                const nextOrder = await tx.keywordToCategory.findFirst({
                    where: {
                        categoryId,
                    },
                    orderBy: {
                        order: 'desc',
                    },
                });
                const order = nextOrder ? nextOrder.order + 1 : 1;

                if (keyword) {
                    const updatedKeyword = await tx.keyword.update({
                        where: {
                            id: keyword.id,
                        },
                        data: {
                            ...buildKeywordCreateUpdateData(keywordTextData),
                            categories: {
                                create: {
                                    order,
                                    category: {
                                        connect: {
                                            id: categoryId,
                                        },
                                    },
                                },
                            },
                        },
                    });
                    await replaceKeywordAliases({
                        tx,
                        keywordId: keyword.id,
                        aliases,
                    });
                    return updatedKeyword;
                }

                const createdKeyword = await tx.keyword.create({
                    data: {
                        name: keywordName,
                        ...keywordTextData,
                        categories: {
                            create: {
                                order,
                                category: {
                                    connect: {
                                        id: categoryId,
                                    },
                                },
                            },
                        },
                    },
                });
                await replaceKeywordAliases({
                    tx,
                    keywordId: createdKeyword.id,
                    aliases,
                });
                return createdKeyword;
            });
        },
        updateKeyword: async (
            _,
            { id, name, meaning, effect, note, aliases }: KeywordWriteArgs,
        ) => {
            return models.$transaction(async (tx) => {
                const keywordId = Number(id);
                const updatedKeyword = await tx.keyword.update({
                    where: {
                        id: keywordId,
                    },
                    data: {
                        name: normalizeRequiredText(name, 'Keyword name'),
                        ...buildKeywordTextData({ meaning, effect, note }),
                    },
                });
                await replaceKeywordAliases({
                    tx,
                    keywordId,
                    aliases,
                });
                return updatedKeyword;
            });
        },
        createKeywordAlias: async (_, { keywordId, name }: KeywordAlias) => {
            const parsedKeywordId = Number(keywordId);
            const keyword = await models.keyword.findUnique({
                where: {
                    id: parsedKeywordId,
                },
                select: {
                    id: true,
                },
            });

            if (!keyword) {
                throw new Error('Keyword does not exist');
            }

            return models.keywordAlias.create({
                data: {
                    keywordId: parsedKeywordId,
                    name: normalizeRequiredText(name, 'Alias name'),
                },
            });
        },
        updateKeywordAlias: async (_, { id, name }: KeywordAlias) => {
            return models.keywordAlias.update({
                where: {
                    id: Number(id),
                },
                data: {
                    name: normalizeRequiredText(name, 'Alias name'),
                },
            });
        },
        deleteKeywordAlias: async (_, { id }: KeywordAlias) => {
            await models.keywordAlias.delete({
                where: {
                    id: Number(id),
                },
            });

            return true;
        },
        createSampleImage: async (
            _,
            { imageId, keywordId }: { imageId: number; keywordId: number },
        ) => {
            keywordId = Number(keywordId);
            imageId = Number(imageId);
            return models.$transaction(async (tx) => {
                const keywordExists = await tx.keyword.findFirst({
                    where: {
                        id: keywordId,
                    },
                    select: {
                        id: true,
                    },
                });

                if (!keywordExists) {
                    throw new Error('Keyword does not exist');
                }

                const imageExists = await tx.image.findFirst({
                    where: {
                        id: imageId,
                    },
                    select: {
                        id: true,
                    },
                });

                if (!imageExists) {
                    throw new Error('Image does not exist');
                }

                return tx.keyword.update({
                    where: {
                        id: keywordId,
                    },
                    data: {
                        image: {
                            connect: {
                                id: imageId,
                            },
                        },
                    },
                });
            });
        },
        updateKeywordOrder: async (
            _,
            { categoryId, keywordId, order }: KeywordToCategory,
        ) => {
            const parsedCategoryId = Number(categoryId);
            const parsedKeywordId = Number(keywordId);
            const targetOrder = Number(order);

            const keywords = await models.keywordToCategory.findMany({
                where: {
                    categoryId: parsedCategoryId,
                },
                orderBy: {
                    order: 'asc',
                },
            });

            const fromIndex = keywords.findIndex(
                (keyword) => keyword.keywordId === parsedKeywordId,
            );
            if (fromIndex < 0) {
                throw new Error('Keyword does not exist in category');
            }

            const toIndex = clampOrderToIndex(targetOrder, keywords.length);
            if (fromIndex === toIndex) {
                return true;
            }

            const reordered = [...keywords];
            const [moved] = reordered.splice(fromIndex, 1);
            reordered.splice(toIndex, 0, moved);

            await models.$transaction(
                reordered.map((keyword, index) =>
                    models.keywordToCategory.update({
                        where: {
                            id: keyword.id,
                        },
                        data: {
                            order: index + 1,
                        },
                    }),
                ),
            );

            return true;
        },
        deleteKeyword: async (
            _,
            { categoryId, keywordId }: KeywordToCategory,
        ) => {
            categoryId = Number(categoryId);
            keywordId = Number(keywordId);
            await models.$transaction(async (tx) => {
                const categoryLink = await tx.keywordToCategory.findFirst({
                    where: {
                        keywordId,
                        categoryId,
                    },
                    select: {
                        id: true,
                    },
                });

                if (!categoryLink) {
                    throw new Error('Keyword does not exist in category');
                }

                await tx.keywordToCategory.delete({
                    where: {
                        id: categoryLink.id,
                    },
                });

                const remainingCategoryCount = await tx.keywordToCategory.count(
                    {
                        where: {
                            keywordId,
                        },
                    },
                );

                if (remainingCategoryCount === 0) {
                    await tx.keyword.delete({
                        where: {
                            id: keywordId,
                        },
                    });
                }
            });

            return true;
        },
        deleteSampleImage: async (_, { id }: Keyword) => {
            id = Number(id);

            const keyword = await models.keyword.findFirst({
                where: {
                    id,
                },
                select: {
                    id: true,
                    image: {
                        select: {
                            id: true,
                        },
                    },
                },
            });

            if (!keyword) {
                throw new Error('Keyword does not exist');
            }

            if (!keyword.image) {
                throw new Error('Keyword does not have an image');
            }

            await models.keyword.update({
                where: {
                    id,
                },
                data: {
                    image: {
                        disconnect: true,
                    },
                },
            });

            return true;
        },
    },
    Keyword: {
        aliases: (keyword: Keyword) =>
            models.keywordAlias.findMany({
                where: {
                    keywordId: keyword.id,
                },
                orderBy: {
                    name: 'asc',
                },
            }),
        categories: (keyword: Keyword) =>
            models.keywordToCategory.findMany({
                where: {
                    keywordId: keyword.id,
                },
            }),
        image: (keyword: Keyword) =>
            models.image.findFirst({
                where: {
                    keywords: {
                        some: {
                            id: keyword.id,
                        },
                    },
                },
            }),
    },
};
