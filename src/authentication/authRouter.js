import express from 'express';
import privateRouter from './routers/router.js';
import publicRouter from './routers/publicRouter.js';
import controller from './controllers/authentication.js';
import { catchAsync } from '../../utils/index.js';

const authRouter = express.Router();

authRouter.use('/public', publicRouter);
authRouter.use(catchAsync(controller.accessTokenVerifier));
authRouter.use('/', privateRouter);

export default authRouter;
