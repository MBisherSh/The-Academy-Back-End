import { commonChains, validator } from '../../../utils/index.js';
import Joi from 'joi';

const setUserRole = validator.generator({
	schema: {
		id: commonChains.stringRequired,
		role: Joi.number().integer().max(4).min(1).required(),
	},
	type: 'body',
});

const getUserList = validator.generator({
	schema: {
		limit: commonChains.numberRequired,
		offset: commonChains.numberRequired,
		role: Joi.number().integer().max(4).min(1).optional(),
	},
	type: 'query',
});

const registerToOffer = validator.generator({
	schema: {
		email: commonChains.emailRequired,
		phone: commonChains.stringRequired,
	},
	type: 'body',
});

export default { setUserRole, getUserList, registerToOffer };
