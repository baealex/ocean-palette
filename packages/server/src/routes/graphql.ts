import express from 'express';
import { createHandler } from 'graphql-http/lib/use/express';

import { logger } from '~/modules/logger';
import { schema } from '~/schema';

export const graphqlRouter = express.Router().use(
    '/graphql',
    createHandler({
        schema,
        formatError: (error) => {
            logger.error(error.message);
            return error;
        },
    }),
);
