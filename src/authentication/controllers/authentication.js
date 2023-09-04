import AuthenticationService from '../services/authentication.js';
import { statusCodes } from '../../../utils/index.js';

const signUp = async (req, res) => {
	const userData = req.body;
	const data = await AuthenticationService.signUp(userData);
	res.status(statusCodes.CREATED).json(data);
};

const login = async (req, res) => {
	const userData = req.body;
	const data = await AuthenticationService.login(userData);
	res.status(statusCodes.OK).json(data);
};

const accessTokenVerifier = async (req, res, next) => {
	const authorization = req.get('authorization');
	req.user = await AuthenticationService.verifyJwtTokenAndGetUser(authorization);
	next();
};

const requestResetPasswordCode = async (req, res) => {
	const email = req.body.email;
	const result = await AuthenticationService.requestResetPasswordCode(email);
	res.status(statusCodes.OK).json(result);
};

const resetPassword = async (req, res) => {
	const data = req.body;
	const code = req.query.code;
	const result = await AuthenticationService.resetPassword(code, data);
	res.status(statusCodes.OK).json(result);
};

const changePassword = async (req, res) => {
	const user = req.user;
	const data = req.body;
	const result = await AuthenticationService.changePassword(user, data);
	res.status(statusCodes.OK).json(result);
};

const restrictToEditor = async (req, res, next) => {
	const user = req.user;
	await AuthenticationService.restrictToEditor(user.role);
	next();
};

const restrictToAdmin = async (req, res, next) => {
	const user = req.user;
	await AuthenticationService.restrictToAdmin(user.role);
	next();
};

const restrictToSuperAdmin = async (req, res, next) => {
	const user = req.user;
	await AuthenticationService.restrictToSuperAdmin(user.role);
	next();
};

const restrictByPermissionId = (permissionId) => async (req, res, next) => {
	const user = req.user;
	await AuthenticationService.restrictByPermissionId(permissionId, user.role);
	next();
};

export default {
	signUp,
	login,
	accessTokenVerifier,
	requestResetPasswordCode,
	resetPassword,
	changePassword,
	restrictToEditor,
	restrictToAdmin,
	restrictToSuperAdmin,
	restrictByPermissionId,
};
