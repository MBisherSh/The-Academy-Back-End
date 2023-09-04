import express from 'express';
import controller from '../controllers/authentication.js';
import { catchAsync } from '../../../utils/index.js';
import validator from '../validators/authentication.js';

const router = express.Router();

router.post('/change-password', catchAsync(validator.changePassword), catchAsync(controller.changePassword));

export default router;
