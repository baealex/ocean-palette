import { Router } from 'express';

import { useAsync } from '~/modules/use-async';
import { home } from './http';

export const homeRouter = Router().get('/home', useAsync(home));
