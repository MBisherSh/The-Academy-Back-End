import express from 'express';
const router = express.Router();
import { catchAsync } from '../../../utils/index.js';

import RoleController from '../controllers/role.js';
import RoleValidator from '../validators/role.js';

import PermissionController from '../controllers/permission.js';
import PermissionValidator from '../validators/permission.js';
import GeneralController from '../controllers/general.js';
import GeneralValidator from '../validators/general.js';

router.get('/setting', catchAsync(GeneralController.get));
router.get('/setting/:key', catchAsync(GeneralValidator.getByKey), catchAsync(GeneralController.getByKey));

router.get('/role', catchAsync(RoleController.get));
router.get('/role/:id', catchAsync(RoleValidator.getById), catchAsync(RoleController.getById));

router.get('/permission', catchAsync(PermissionController.get));
router.get('/permission-by-role', catchAsync(PermissionValidator.getByRole), catchAsync(PermissionController.getByRole));
router.get('/permission/:id', catchAsync(PermissionValidator.getById), catchAsync(PermissionController.getById));

export default router;
