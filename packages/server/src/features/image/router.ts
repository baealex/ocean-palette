import { Router } from 'express';

import { useAsync } from '~/modules/use-async';
import { parseImageMetadata, uploadImage } from './http';

export const imageRouter = Router()
    .post('/image/metadata', useAsync(parseImageMetadata))
    .post('/image', useAsync(uploadImage));
