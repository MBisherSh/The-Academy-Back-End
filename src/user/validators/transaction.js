import { commonChains, validator } from '../../../utils/index.js';
import Joi from 'joi';

const create = validator.generator({
	schema: {
		type: Joi.string().valid('fee', 'deposit'),
		amount: commonChains.numberRequired,
		userId: commonChains.stringRequired,
		details: commonChains.stringOptional,
	},
	type: 'body',
});

const get = validator.generator({
	schema: {
		limit: commonChains.numberRequired,
		offset: commonChains.numberRequired,
		sort: commonChains.stringOptional,
	},
	type: 'query',
});

const deleteOne = validator.generator({
	schema: {
		id: commonChains.numberRequired,
	},
	type: 'params',
});

const getById = validator.generator({
	schema: {
		id: commonChains.numberRequired,
	},
	type: 'params',
});

export default { create, getById, get, delete: deleteOne };
