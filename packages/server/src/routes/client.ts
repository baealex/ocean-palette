import express, { type RequestHandler } from 'express';
import path from 'path';

const clientDistDir = path.resolve('../client/dist');

export const clientStaticRouter = express.Router().use(
    express.static(clientDistDir, {
        extensions: ['html'],
    }),
);

export const clientFallbackHandler: RequestHandler = (req, res) => {
    if (req.path.startsWith('/api/')) {
        return res.status(404).json({
            message: 'Not Found',
        });
    }

    return res.sendFile(path.resolve(clientDistDir, 'index.html'));
};
