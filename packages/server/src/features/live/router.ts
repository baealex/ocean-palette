import { Router } from 'express';

import { useAsync } from '~/modules/use-async';
import {
    deleteLiveImage,
    getLiveConfig,
    getLiveImageMetadata,
    getLiveImagePrompt,
    listLiveDirectories,
    listLiveImages,
    liveStatus,
    pickLiveDirectory,
    syncLiveImages,
    updateLiveConfig,
} from './http';

export const liveRouter = Router()
    .get('/live/status', useAsync(liveStatus))
    .get('/live/config', useAsync(getLiveConfig))
    .get('/live/config/directories', useAsync(listLiveDirectories))
    .put('/live/config', useAsync(updateLiveConfig))
    .post('/live/config/pick-dir', useAsync(pickLiveDirectory))
    .get('/live/images', useAsync(listLiveImages))
    .get('/live/images/:id/prompt', useAsync(getLiveImagePrompt))
    .get('/live/images/:id/metadata', useAsync(getLiveImageMetadata))
    .delete('/live/images/:id', useAsync(deleteLiveImage))
    .post('/live/sync', useAsync(syncLiveImages));
