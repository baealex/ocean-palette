import express from 'express';
import rateLimit from 'express-rate-limit';

import { errorHandler } from './core/error-handler';
import { expressLogger } from './modules/logger';
import { apiRouter } from './routes/api';
import { assetsRouter } from './routes/assets';
import { clientFallbackHandler, clientStaticRouter } from './routes/client';
import { graphqlRouter } from './routes/graphql';

const clientFallbackRateLimiter = rateLimit({
    windowMs: 60_000,
    limit: 300,
    standardHeaders: 'draft-8',
    legacyHeaders: false,
});

export const app = express()
    .use(expressLogger)
    .use(clientStaticRouter)
    .use(express.json({ limit: '50mb' }))
    .use(graphqlRouter)
    .use(assetsRouter)
    .use(apiRouter)
    .use(clientFallbackRateLimiter, clientFallbackHandler)
    .use(errorHandler);
