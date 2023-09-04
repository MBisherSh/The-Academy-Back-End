import jwt from 'jsonwebtoken';
import config from 'config';
import bcrypt from 'bcryptjs';
import { Exception, statusCodes, nodemailer } from '../../../utils/index.js';
import UserService from '../../user/services/user.js';
import PermissionService from '../../user/services/permission.js';
import moment from 'moment';

const { JWT_SECRET, EXPIRES_IN } = config.get('JWT');

class Authentication {
	static generateAccessToken(user) {
		return jwt.sign(user, JWT_SECRET, { expiresIn: EXPIRES_IN });
	}

	static authenticateToken(authHeader) {
		const token = authHeader && authHeader.split(' ')[1];
		if (token == null) throw new Exception(statusCodes.UNAUTHORIZED, 'Please sign in.');
		let userData;
		jwt.verify(token, JWT_SECRET, (err, user) => {
			if (err) throw new Exception(statusCodes.UNAUTHORIZED, 'Please sign in.');
			else userData = user;
		});
		return userData;
	}

	static async signUp(userData) {
		userData.passwordHash = await bcrypt.hash(userData.password, 12);
		const role = 1;
		userData.role = role;
		const user = await new UserService(userData).createUser();
		const { id, name, email } = user;
		const token = Authentication.generateAccessToken({
			id,
			email,
			role,
		});
		return { user: { id, name, email, role }, token };
	}

	static async login(userData) {
		const { email, password } = userData;
		const user = await UserService.getByEmail(email);
		if (!user) throw new Exception(statusCodes.ITEM_NOT_FOUND, 'no such user');
		else if (!(await bcrypt.compare(password, user.passwordHash)))
			throw new Exception(statusCodes.UNAUTHORIZED, 'wrong password');
		else {
			const token = Authentication.generateAccessToken({
				id: user._id,
				email: user.email,
				role: user.role,
			});
			const { id, name, email, role, profileImage, balance } = user;
			return { user: { id, name, email, role, profileImage, balance }, token };
		}
	}

	static async verifyJwtTokenAndGetUser(authorization) {
		if (!authorization)
			throw new Exception(statusCodes.UNAUTHORIZED, 'You are not logged in! Please log in to get access.');
		const token = authorization.split(' ')[1];

		const decoded = await new Promise((resolve, reject) => {
			jwt.verify(token, JWT_SECRET, (err, decoded) => {
				if (err) reject(new Exception(statusCodes.UNAUTHORIZED, 'Invalid access token'));
				else resolve(decoded);
			});
		});
		const user = await UserService.findUserById(decoded.id);
		if (!user)
			throw new Exception(statusCodes.UNAUTHORIZED, 'The user belonging to this token does no longer exist.');

		if (user.changedPasswordAt) {
			const changedTimestamp = parseInt(user.changedPasswordAt.getTime() / 1000, 10);

			if (decoded.iat < changedTimestamp)
				throw new Exception(
					statusCodes.UNAUTHORIZED,
					'User recently changed password or role! Please log in again.'
				);
		}
		return { id: decoded.id, email: decoded.email, role: decoded.role };
	}

	static async setCodeToUser(user, isPasswordVerification) {
		const code = Math.floor(100000 + Math.random() * 900000);
		const date = new Date();

		let fields;
		if (isPasswordVerification) fields = { passwordResetCode: code, passwordResetCodeAt: date };
		else fields = { verificationCode: code, verificationCodeAt: date };

		await UserService.updateUser(user.id, fields);
		return code;
	}

	static async requestCode(user, isPasswordVerification) {
		const reason = isPasswordVerification ? 'account reset password' : 'account verification';

		const verificationCode = await Authentication.setCodeToUser(user, isPasswordVerification);
		try {
			await nodemailer.sendVerificationCode(
				user.email,
				`Decor and design ${reason} code`,
				`Your ${reason} code is ${verificationCode}`
			);
		} catch (e) {
			console.log(e);
			throw new Exception(
				statusCodes.SERVICE_UNAVAILABLE,
				'Sorry we could not send an email to your account, try later'
			);
		}
		return { msg: 'Code has been sent to your email successfully.' };
	}

	static async requestResetPasswordCode(email) {
		const userData = await UserService.getByEmail(email);
		if (!userData) throw new Exception(statusCodes.ITEM_NOT_FOUND, 'no such email');

		return await Authentication.requestCode(userData, true);
	}

	static async changePassword(user, data) {
		const userData = await UserService.findUserById(user.id);
		if (!(await bcrypt.compare(data.oldPassword, userData.passwordHash)))
			throw new Exception(statusCodes.UNAUTHORIZED, 'wrong password');
		else {
			const newPasswordHash = await bcrypt.hash(data.newPassword, 12);
			const now = new Date();
			await UserService.updateUser(userData._id, { passwordHash: newPasswordHash, changedPasswordAt: now });
			return { msg: 'password changed successfully' };
		}
	}

	static async invalidateToken(userId) {
		const now = new Date();
		return await UserService.updateUser(userId, { changedPasswordAt: now });
	}

	static async resetPassword(code, data) {
		const userData = await UserService.getByEmail(data.email);
		if (!userData) throw new Exception(statusCodes.ITEM_NOT_FOUND, 'no such email');

		if (
			userData.passwordResetCode == code &&
			moment(userData.passwordResetCodeAt).isBetween(moment().subtract(1, 'hours'), moment())
		) {
			const passwordHash = await bcrypt.hash(data.newPassword, 12);
			await UserService.updateUser(userData._id, {
				passwordHash,
				passwordResetCode: null,
				passwordResetCodeAt: null,
			});
			return { msg: 'Password has been reset successfully.' };
		} else throw new Exception(statusCodes.BAD_REQUEST, 'Wrong verification code.');
	}

	static async restrictToEditor(role) {
		if (role <= 1) throw new Exception(statusCodes.FORBIDDEN, 'You are not allowed to access this route.');
	}

	static async restrictToAdmin(role) {
		if (role <= 2) throw new Exception(statusCodes.FORBIDDEN, 'You are not allowed to access this route.');
	}

	static async restrictToSuperAdmin(role) {
		if (role <= 3) throw new Exception(statusCodes.FORBIDDEN, 'You are not allowed to access this route.');
	}

	static async restrictByPermissionId(permissionId, userRole) {
		let role = typeof userRole === 'string' ? parseInt(userRole) : userRole;
		const permission = await PermissionService.getById(permissionId);
		if (!permission) throw new Exception(statusCodes.SERVICE_UNAVAILABLE, 'missing permission.');
		if (!permission.roles.includes(role))
			throw new Exception(statusCodes.FORBIDDEN, 'You are not allowed to access this route.');
	}
}

export default Authentication;
