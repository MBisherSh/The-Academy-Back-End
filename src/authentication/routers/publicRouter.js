import express from 'express';
import controller from '../controllers/authentication.js';
import { catchAsync } from '../../../utils/index.js';
import validator from '../validators/authentication.js';

const router = express.Router();

router.post('/sign-up', catchAsync(validator.signUp), catchAsync(controller.signUp));
router.post('/login', catchAsync(validator.login), catchAsync(controller.login));

router.post(
	'/request-password-reset-code',
	catchAsync(validator.requestPasswordResetCode),
	catchAsync(controller.requestResetPasswordCode)
);
router.post('/reset-password', catchAsync(validator.resetPassword), catchAsync(controller.resetPassword));

export default router;
