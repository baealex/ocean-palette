import express from 'express';

import {
    IMAGE_ASSET_URL_PREFIX,
    resolveImageBaseDirPath,
} from '~/features/image/image-storage';

export const assetsRouter = express
    .Router()
    .use(
        `${IMAGE_ASSET_URL_PREFIX}/`,
        express.static(resolveImageBaseDirPath()),
    );
