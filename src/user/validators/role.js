import { commonChains, validator } from '../../../utils/index.js';
import Joi from 'joi';

const create = validator.generator({
	schema: {
		_id: commonChains.numberRequired,
		nameEn: commonChains.stringRequired,
		nameAr: commonChains.stringRequired,
	},
	type: 'body',
});

const update = validator.generator(
	{
		schema: {
			nameEn: commonChains.stringOptional,
			nameAr: commonChains.stringOptional,
		},
		type: 'body',
	},
	{
		schema: {
			id: commonChains.numberRequired,
		},
		type: 'params',
	}
);

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

export default { create, getById, update, delete: deleteOne };
