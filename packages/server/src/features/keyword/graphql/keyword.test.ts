import request from 'supertest';

import { app } from '~/app';
import { models } from '~/models';

beforeAll(async () => {
    const colorCategory = await models.category.create({
        data: {
            name: 'Color',
        },
    });
    await models.keyword.create({
        data: {
            name: 'Red',
            categories: {
                create: {
                    order: 1,
                    category: {
                        connect: {
                            id: colorCategory.id,
                        },
                    },
                },
            },
        },
    });
    await models.keyword.create({
        data: {
            name: 'Blue',
            categories: {
                create: {
                    order: 2,
                    category: {
                        connect: {
                            id: colorCategory.id,
                        },
                    },
                },
            },
        },
    });
    const themeCategory = await models.category.create({
        data: {
            name: 'Theme',
        },
    });
    await models.keyword.create({
        data: {
            name: 'Light',
            categories: {
                create: {
                    order: 1,
                    category: {
                        connect: {
                            id: themeCategory.id,
                        },
                    },
                },
            },
        },
    });
    await models.keyword.create({
        data: {
            name: 'Dark',
            categories: {
                create: {
                    order: 2,
                    category: {
                        connect: {
                            id: themeCategory.id,
                        },
                    },
                },
            },
        },
    });
});

afterAll(async () => {
    await models.keywordAlias.deleteMany();
    await models.keywordToCategory.deleteMany();
    await models.category.deleteMany();
    await models.collection.deleteMany();
    await models.imageMeta.deleteMany();
    await models.image.deleteMany();
    await models.keyword.deleteMany();
});

type TestKeyword = {
    id: number;
};

type TestCategory = {
    id: number;
    keywords: TestKeyword[];
};

describe('Keyword Schema', () => {
    const allCategoriesQuery = `
        query {
            allCategories {
                id
                name
                keywords {
                    id
                    name
                    categories {
                        id
                        order
                    }
                }
            }
        }       
    `;

    const getAllCategories = async (): Promise<TestCategory[]> => {
        const res = await request(app).post('/graphql').send({
            query: allCategoriesQuery,
        });

        return res.body.data.allCategories;
    };

    const getAllKeywords = async (): Promise<TestKeyword[]> => {
        const allCategories = await getAllCategories();

        return allCategories.reduce<TestKeyword[]>((acc, cur) => {
            return acc.concat(cur.keywords);
        }, []);
    };

    it('키워드 리스트를 반환한다.', async () => {
        const response = await request(app)
            .post('/graphql')
            .send({
                query: `
                query {
                    allKeywords {
                        id
                        name
                        meaning
                        effect
                        note
                        aliases {
                            id
                            name
                        }
                        categories {
                            id
                            order
                        }
                    }
                }
            `,
            });

        expect(response.body.data.allKeywords).toHaveLength(4);
        expect(response.body.data.allKeywords[0]).toHaveProperty('meaning');
        expect(response.body.data.allKeywords[0]).toHaveProperty('effect');
        expect(response.body.data.allKeywords[0]).toHaveProperty('note');
        expect(response.body.data.allKeywords[0]).toHaveProperty('aliases');
    });

    it('키워드를 생성한다.', async () => {
        const allCategories = await getAllCategories();

        const response = await request(app)
            .post('/graphql')
            .send({
                query: `
                mutation {
                    createKeyword(name: "Green", categoryId: "${allCategories[0].id}") {
                        id
                        name
                        meaning
                        effect
                        note
                        categories {
                            id
                            order
                        }
                    }
                }
            `,
            });

        expect(response.body.data.createKeyword).toHaveProperty('id');
        expect(response.body.data.createKeyword).toHaveProperty('name');
        expect(response.body.data.createKeyword.meaning).toBe('');
        expect(response.body.data.createKeyword.effect).toBe('');
        expect(response.body.data.createKeyword.note).toBe('');
        expect(response.body.data.createKeyword.categories).toHaveLength(1);
    });

    it('효과 카드 필드를 포함해 키워드를 생성한다.', async () => {
        const allCategories = await getAllCategories();

        const response = await request(app)
            .post('/graphql')
            .send({
                query: `
                mutation {
                    createKeyword(
                        name: "Soft light",
                        categoryId: "${allCategories[0].id}",
                        meaning: "부드러운 빛",
                        effect: "Softens shadows around the subject",
                        note: "Good for portrait prompts",
                        aliases: ["gentle glow", "soft glow"]
                    ) {
                        id
                        name
                        meaning
                        effect
                        note
                        aliases {
                            name
                        }
                    }
                }
            `,
            });

        expect(response.body.data.createKeyword).toMatchObject({
            name: 'Soft light',
            meaning: '부드러운 빛',
            effect: 'Softens shadows around the subject',
            note: 'Good for portrait prompts',
        });
        expect(response.body.data.createKeyword.aliases).toEqual([
            { name: 'gentle glow' },
            { name: 'soft glow' },
        ]);
    });

    it('기존 키워드 상세 필드를 빈 생성 입력으로 덮어쓰지 않는다.', async () => {
        const allCategories = await getAllCategories();
        const keyword = await models.keyword.create({
            data: {
                name: 'Golden hour',
                meaning: '해질녘 빛',
                effect: 'Warms the scene',
                note: 'Keep highlights soft',
                categories: {
                    create: {
                        order: 997,
                        category: {
                            connect: {
                                id: Number(allCategories[0].id),
                            },
                        },
                    },
                },
            },
        });

        const response = await request(app)
            .post('/graphql')
            .send({
                query: `
                mutation {
                    createKeyword(
                        name: "Golden hour",
                        categoryId: "${allCategories[1].id}",
                        meaning: "",
                        effect: "",
                        note: ""
                    ) {
                        id
                        name
                        meaning
                        effect
                        note
                    }
                }
            `,
            });

        expect(response.body.data.createKeyword).toMatchObject({
            id: String(keyword.id),
            name: 'Golden hour',
            meaning: '해질녘 빛',
            effect: 'Warms the scene',
            note: 'Keep highlights soft',
        });
    });

    it('키워드 효과 카드 필드를 수정한다.', async () => {
        const keyword = await models.keyword.create({
            data: {
                name: 'Sharp focus',
                meaning: '선명한 초점',
                effect: 'Makes edges crisp',
                note: 'Before update',
            },
        });

        const response = await request(app)
            .post('/graphql')
            .send({
                query: `
                mutation {
                    updateKeyword(
                        id: "${keyword.id}",
                        name: "Sharp focus",
                        meaning: "또렷한 초점",
                        effect: "Keeps the subject crisp",
                        note: "Use with product shots",
                        aliases: ["crisp focus", "clear focus"]
                    ) {
                        id
                        name
                        meaning
                        effect
                        note
                        aliases {
                            name
                        }
                    }
                }
            `,
            });

        expect(response.body.data.updateKeyword).toMatchObject({
            name: 'Sharp focus',
            meaning: '또렷한 초점',
            effect: 'Keeps the subject crisp',
            note: 'Use with product shots',
        });
        expect(response.body.data.updateKeyword.aliases).toEqual([
            { name: 'clear focus' },
            { name: 'crisp focus' },
        ]);
    });

    it('키워드 alias를 생성, 수정, 삭제한다.', async () => {
        const keyword = await models.keyword.create({
            data: {
                name: 'Low angle',
            },
        });

        const createResponse = await request(app)
            .post('/graphql')
            .send({
                query: `
                mutation {
                    createKeywordAlias(keywordId: "${keyword.id}", name: "from below") {
                        id
                        name
                        keywordId
                    }
                }
            `,
            });

        expect(createResponse.body.data.createKeywordAlias).toMatchObject({
            name: 'from below',
            keywordId: keyword.id,
        });

        const aliasId = createResponse.body.data.createKeywordAlias.id;
        const updateResponse = await request(app)
            .post('/graphql')
            .send({
                query: `
                mutation {
                    updateKeywordAlias(id: "${aliasId}", name: "worm view") {
                        id
                        name
                    }
                }
            `,
            });

        expect(updateResponse.body.data.updateKeywordAlias.name).toBe(
            'worm view',
        );

        const deleteResponse = await request(app)
            .post('/graphql')
            .send({
                query: `
                mutation {
                    deleteKeywordAlias(id: "${aliasId}")
                }
            `,
            });

        expect(deleteResponse.body.data.deleteKeywordAlias).toBe(true);
    });

    it('최근 Collection prompt에서 keyword usage를 집계한다.', async () => {
        const keyword = await models.keyword.create({
            data: {
                name: 'Cinematic lighting',
                aliases: {
                    create: {
                        name: 'dramatic light',
                    },
                },
            },
        });
        const recentDate = new Date();
        recentDate.setDate(recentDate.getDate() - 3);
        const oldDate = new Date();
        oldDate.setDate(oldDate.getDate() - 45);
        const recentImage = await models.image.create({
            data: {
                url: 'keyword-usage-recent.png',
                hash: 'keyword-usage-recent',
                generatedAt: recentDate,
                meta: {
                    create: {
                        model: 'usage-model',
                        parseVersion: 'test-v1',
                    },
                },
            },
        });
        const oldImage = await models.image.create({
            data: {
                url: 'keyword-usage-old.png',
                hash: 'keyword-usage-old',
                generatedAt: oldDate,
                meta: {
                    create: {
                        model: 'usage-model',
                        parseVersion: 'test-v1',
                    },
                },
            },
        });

        await models.collection.createMany({
            data: [
                {
                    imageId: recentImage.id,
                    title: 'Recent A',
                    prompt: 'portrait with dramatic light',
                    negativePrompt: 'low quality',
                    createdAt: recentDate,
                },
                {
                    imageId: recentImage.id,
                    title: 'Recent B',
                    prompt: 'cinematic lighting, detailed face',
                    negativePrompt: 'dramatic light',
                    createdAt: recentDate,
                },
                {
                    imageId: oldImage.id,
                    title: 'Old',
                    prompt: 'dramatic light',
                    negativePrompt: '',
                    createdAt: oldDate,
                },
            ],
        });

        const response = await request(app)
            .post('/graphql')
            .send({
                query: `
                query {
                    keywordUsage(model: "usage-model") {
                        keywordId
                        totalCount
                        promptCount
                        negativePromptCount
                        aliases
                    }
                }
            `,
            });

        const targetUsage = response.body.data.keywordUsage.find(
            (usage: { keywordId: string }) =>
                Number(usage.keywordId) === keyword.id,
        );

        expect(targetUsage).toMatchObject({
            totalCount: 3,
            promptCount: 2,
            negativePromptCount: 1,
            aliases: ['dramatic light'],
        });
    });

    it('키워드 효과 카드 필드를 빈 값으로 지운다.', async () => {
        const keyword = await models.keyword.create({
            data: {
                name: 'Film grain',
                meaning: '필름 입자',
                effect: 'Adds texture',
                note: 'Remove when clean render is needed',
            },
        });

        const response = await request(app)
            .post('/graphql')
            .send({
                query: `
                mutation {
                    updateKeyword(
                        id: "${keyword.id}",
                        name: "Film grain",
                        meaning: "",
                        effect: "",
                        note: ""
                    ) {
                        id
                        name
                        meaning
                        effect
                        note
                    }
                }
            `,
            });

        expect(response.body.data.updateKeyword).toMatchObject({
            name: 'Film grain',
            meaning: '',
            effect: '',
            note: '',
        });
    });

    it('키워드를 삭제한다', async () => {
        const allCategories = await getAllCategories();
        const allKeywords = await getAllKeywords();

        const response = await request(app)
            .post('/graphql')
            .send({
                query: `
                mutation {
                    deleteKeyword(categoryId: "${allCategories[0].id}", keywordId: "${allKeywords[0].id}")
                }
            `,
            });

        expect(response.body.data.deleteKeyword).toBe(true);
    });

    it('카테고리가 남아있는 키워드는 삭제되지 않는다.', async () => {
        const allCategories = await getAllCategories();

        const dataX = await models.keyword.create({
            data: {
                name: 'X',
                categories: {
                    create: {
                        order: 998,
                        category: {
                            connect: {
                                id: Number(allCategories[0].id),
                            },
                        },
                    },
                },
            },
        });
        await models.keyword.update({
            where: {
                id: dataX.id,
            },
            data: {
                categories: {
                    create: {
                        order: 999,
                        category: {
                            connect: {
                                id: Number(allCategories[1].id),
                            },
                        },
                    },
                },
            },
        });

        await request(app)
            .post('/graphql')
            .send({
                query: `
                mutation {
                    deleteKeyword(categoryId: "${allCategories[0].id}", keywordId: "${dataX.id}")
                }
            `,
            });

        const allKeywords = await getAllKeywords();
        expect(
            allKeywords.find((keyword) => keyword.id === dataX.id),
        ).not.toBeNull();
    });
});
