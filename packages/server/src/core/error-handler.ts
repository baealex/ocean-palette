import type { ErrorRequestHandler, Response } from 'express';

import { logger } from '~/modules/logger';

interface ErrorHandlerInput {
    error: unknown;
    res: Response;
}

const handleErrorResponse = ({ error, res }: ErrorHandlerInput) => {
    if (res.headersSent) {
        return;
    }

    if (error instanceof Error) {
        logger.error(error.stack || error.message);
    } else {
        logger.error(String(error));
    }

    res.status(500).send('Internal Server Error');
};

export const errorHandler = Object.defineProperty(
    (...args: Parameters<ErrorRequestHandler>) => {
        const [error, _req, res] = args;
        handleErrorResponse({ error, res });
    },
    'length',
    { value: 4 },
) as ErrorRequestHandler;
