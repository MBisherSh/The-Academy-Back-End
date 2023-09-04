import express from 'express';
import privateRouter from './routers/router.js';
import publicRouter from './routers/publicRouter.js';
import controller from '../authentication/controllers/authentication.js';
import { catchAsync } from '../../utils/index.js';

const chatRouter = express.Router();

chatRouter.use('/public', publicRouter);
chatRouter.use(catchAsync(controller.accessTokenVerifier));
chatRouter.use('/', privateRouter);

export default chatRouter;
