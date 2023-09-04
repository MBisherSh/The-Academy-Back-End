import express from 'express';
const router = express.Router();
import { catchAsync } from '../../../utils/index.js';
import controller from '../controllers/user.js';
import validator from '../validators/user.js';
import authenticationController from '../../authentication/controllers/authentication.js';
import PermissionValidator from '../validators/permission.js';
import PermissionController from '../controllers/permission.js';
import RoleValidator from '../validators/role.js';
import RoleController from '../controllers/role.js';
import TransactionValidator from '../validators/transaction.js';
import TransactionController from '../controllers/transaction.js';
import GeneralController from '../controllers/general.js';
import GeneralValidator from '../validators/general.js';
import StatisticsController from '../controllers/statistics.js';
const restrictToAdmin = authenticationController.restrictToAdmin;

router.get('/my-profile', catchAsync(controller.getProfile));
router.patch(
	'/profile-image',
	catchAsync(controller.updateProfileImageUploader),
	catchAsync(controller.updateProfileImage)
);

router.patch('/register-as-coach', catchAsync(controller.registerAsCoach));

router.get('/my-transaction', catchAsync(TransactionValidator.get), catchAsync(TransactionController.get));

const restrictPayments = authenticationController.restrictByPermissionId('PAYMENTS');

router
	.route('/transaction')
	.get(catchAsync(restrictPayments), catchAsync(TransactionValidator.get), catchAsync(TransactionController.getAll))
	.post(
		catchAsync(restrictPayments),
		catchAsync(TransactionValidator.create),
		catchAsync(TransactionController.create)
	);

router
	.route('/transaction/:id')
	.get(
		catchAsync(restrictPayments),
		catchAsync(TransactionValidator.getById),
		catchAsync(TransactionController.getById)
	)
	.delete(
		catchAsync(restrictPayments),
		catchAsync(TransactionValidator.delete),
		catchAsync(TransactionController.delete)
	);

const updateGeneralUploader = GeneralController.generalUploader(true);

router.patch(
	'/setting/image/:id',
	catchAsync(restrictToAdmin),
	catchAsync(updateGeneralUploader),
	catchAsync(GeneralController.updateImage)
);

router.post(
	'/setting',
	catchAsync(restrictToAdmin),
	catchAsync(GeneralValidator.create),
	catchAsync(GeneralController.create)
);

router
	.route('/setting/:id')
	.patch(catchAsync(restrictToAdmin), catchAsync(GeneralValidator.update), catchAsync(GeneralController.update))
	.delete(catchAsync(restrictToAdmin), catchAsync(GeneralValidator.delete), catchAsync(GeneralController.delete));

const restrictRBAC = authenticationController.restrictByPermissionId('RBAC');
const restrictToSuperAdmin = authenticationController.restrictToSuperAdmin;

router.get('/statistics/general', catchAsync(restrictToAdmin), catchAsync(StatisticsController.getGeneralStatistics));
router.get('/statistics/payments', catchAsync(restrictToAdmin), catchAsync(StatisticsController.getPaymentsStatistics));

router.patch('/set-role-default', catchAsync(restrictToSuperAdmin), catchAsync(RoleController.setAsDefault));
router.patch(
	'/set-permission-default',
	catchAsync(restrictToSuperAdmin),
	catchAsync(PermissionController.setAsDefault)
);

router.post(
	'/notification',
	catchAsync(restrictToAdmin),
	catchAsync(GeneralValidator.sendNotification),
	catchAsync(GeneralController.sendNotification)
);

router.use(catchAsync(restrictRBAC));

router.post('/role', catchAsync(RoleValidator.create), catchAsync(RoleController.create));

router
	.route('/role/:id')
	.patch(catchAsync(RoleValidator.update), catchAsync(RoleController.update))
	.delete(catchAsync(RoleValidator.delete), catchAsync(RoleController.delete));

router.post('/permission', catchAsync(PermissionValidator.create), catchAsync(PermissionController.create));

router
	.route('/permission/:id')
	.patch(catchAsync(PermissionValidator.update), catchAsync(PermissionController.update))
	.delete(catchAsync(PermissionValidator.delete), catchAsync(PermissionController.delete));

router.get('/user-list', catchAsync(validator.getUserList), catchAsync(controller.getUserList));
router.patch('/set-role', catchAsync(validator.setUserRole), catchAsync(controller.setUserRole));

export default router;
