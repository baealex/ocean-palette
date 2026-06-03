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
    await models.keywordToCategory.deleteMany();
    await models.category.deleteMany();
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
                        note: "Good for portrait prompts"
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
            name: 'Soft light',
            meaning: '부드러운 빛',
            effect: 'Softens shadows around the subject',
            note: 'Good for portrait prompts',
        });
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
                        note: "Use with product shots"
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
            name: 'Sharp focus',
            meaning: '또렷한 초점',
            effect: 'Keeps the subject crisp',
            note: 'Use with product shots',
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
