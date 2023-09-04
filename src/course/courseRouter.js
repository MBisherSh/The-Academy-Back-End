import express from 'express';
import privateRouter from './routers/router.js';
import publicRouter from './routers/publicRouter.js';
import controller from '../authentication/controllers/authentication.js';
import { catchAsync } from '../../utils/index.js';

const mainRouter = express.Router();

mainRouter.use('/public', publicRouter);
mainRouter.use(catchAsync(controller.accessTokenVerifier));
mainRouter.use('/', privateRouter);

export default mainRouter;
