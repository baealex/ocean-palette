import express from 'express';

import { errorHandler } from './core/error-handler';
import { expressLogger } from './modules/logger';
import { apiRouter } from './routes/api';
import { assetsRouter } from './routes/assets';
import { clientFallbackHandler, clientStaticRouter } from './routes/client';
import { graphqlRouter } from './routes/graphql';

export const app = express()
    .use(expressLogger)
    .use(clientStaticRouter)
    .use(express.json({ limit: '50mb' }))
    .use(graphqlRouter)
    .use(assetsRouter)
    .use(apiRouter)
    .use(clientFallbackHandler)
    .use(errorHandler);
