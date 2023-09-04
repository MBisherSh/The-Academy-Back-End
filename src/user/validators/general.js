import { commonChains, validator } from '../../../utils/index.js';
import Joi from 'joi';
const create = validator.generator({
	schema: {
		key: commonChains.stringRequired,
		value: commonChains.stringRequired,
		isGeneral: commonChains.booleanOptional,
	},
	type: 'body',
});

const update = validator.generator(
	{
		schema: {
			value: commonChains.stringRequired,
			isGeneral: commonChains.booleanOptional,
		},
		type: 'body',
	},
	{
		schema: {
			id: commonChains.stringRequired,
		},
		type: 'params',
	}
);

const deleteOne = validator.generator({
	schema: {
		id: commonChains.stringRequired,
	},
	type: 'params',
});

const getByKey = validator.generator({
	schema: {
		key: commonChains.stringRequired,
	},
	type: 'params',
});

const sendNotification = validator.generator({
	schema: {
		data: Joi.object().optional(),
		title: commonChains.stringRequired,
		body: commonChains.stringRequired,
		topic: commonChains.stringRequired,
	},
	type: 'body',
});

export default { create, update, delete: deleteOne, getByKey, sendNotification };
