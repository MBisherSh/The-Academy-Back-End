import express from 'express';
import privateRouter from './routers/router.js';
import publicRouter from './routers/publicRouter.js';
import controller from '../authentication/controllers/authentication.js';
import { catchAsync } from '../../utils/index.js';

const userRouter = express.Router();

userRouter.use('/public', publicRouter);
userRouter.use(catchAsync(controller.accessTokenVerifier));
userRouter.use('/', privateRouter);

export default userRouter;
