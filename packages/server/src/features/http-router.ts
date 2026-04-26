import { Router } from 'express';

import { homeRouter } from './home/router';
import { imageRouter } from './image/router';
import { liveRouter } from './live/router';

export const featureRouter = Router()
    .use(homeRouter)
    .use(imageRouter)
    .use(liveRouter);
