import { makeExecutableSchema } from '@graphql-tools/schema';
import {
    categoryResolvers,
    categoryTypeDefs,
} from '~/features/category/graphql';
import {
    CollectionResolvers,
    CollectionTypeDefs,
} from '~/features/collection/graphql';
import { keywordResolvers, keywordTypeDefs } from '~/features/keyword/graphql';
import { userResolvers, userTypeDefs } from '~/features/user/graphql';

const schema = makeExecutableSchema({
    typeDefs: [
        categoryTypeDefs,
        CollectionTypeDefs,
        keywordTypeDefs,
        userTypeDefs,
    ],
    resolvers: [
        categoryResolvers,
        CollectionResolvers,
        keywordResolvers,
        userResolvers,
    ],
});

export { schema };
