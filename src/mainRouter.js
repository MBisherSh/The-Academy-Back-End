import express from 'express';
import authRouter from './authentication/authRouter.js';
import courseRouter from './course/courseRouter.js';
import userRouter from './user/userRouter.js';
import chatRouter from './chat/chatRouter.js';
import {catchAsync} from "../utils/index.js";

const mainRouter = express.Router();


mainRouter.get(
	'/',
	catchAsync(async (req, res) => {
		res.status(200).json({ msg: 'OK' });
	})
);

mainRouter.use('/auth', authRouter);
mainRouter.use('/course', courseRouter);
mainRouter.use('/user', userRouter);
mainRouter.use('/chat', chatRouter);

export default mainRouter;
