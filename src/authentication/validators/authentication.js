import { commonChains, validator } from '../../../utils/index.js';
//import Joi from 'joi';

const signUp = validator.generator({
	schema: {
		name: commonChains.namesRequired,
		email: commonChains.emailRequired,
		password: commonChains.passwordRequired,
	},
	type: 'body',
});

const login = validator.generator({
	schema: {
		email: commonChains.stringRequired,
		password: commonChains.stringRequired,
	},
	type: 'body',
});

const verify = validator.generator({
	schema: {
		code: commonChains.numberRequired,
	},
	type: 'query',
});

const requestPasswordResetCode = validator.generator({
	schema: {
		email: commonChains.stringRequired,
	},
	type: 'body',
});

const changePassword = validator.generator({
	schema: {
		newPassword: commonChains.passwordRequired,
		oldPassword: commonChains.stringRequired,
	},
	type: 'body',
});

const resetPassword = validator.generator(
	{
		schema: {
			code: commonChains.numberRequired,
		},
		type: 'query',
	},
	{
		schema: {
			email: commonChains.stringRequired,
			newPassword: commonChains.passwordRequired,
		},
		type: 'body',
	}
);

export default { signUp, login, verify, resetPassword, changePassword, requestPasswordResetCode };
