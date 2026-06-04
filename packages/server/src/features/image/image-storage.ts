import path from 'path';

import { loadServerEnv } from '~/modules/env';

loadServerEnv();

export const IMAGE_ASSET_URL_PREFIX = '/assets/images';

export const resolveImageBaseDirPath = () =>
    path.resolve(process.env.OCEAN_PALETTE_IMAGE_DIR || 'public/assets/images');

export const resolveImageAssetUrl = (pathSegments: string[]) =>
    `${IMAGE_ASSET_URL_PREFIX}/${pathSegments.map((segment) => encodeURIComponent(segment)).join('/')}`;
