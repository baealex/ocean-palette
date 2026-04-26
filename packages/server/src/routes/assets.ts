import express from 'express';
import path from 'path';

export const assetsRouter = express
    .Router()
    .use(
        '/assets/images/',
        express.static(path.resolve('public/assets/images/')),
    );
