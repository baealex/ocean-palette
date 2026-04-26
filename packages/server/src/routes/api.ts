import express from 'express';

import { router } from '~/urls';

export const apiRouter = express.Router().use('/api/', router);
