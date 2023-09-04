import { commonChains, validator } from '../../../utils/index.js';

const create = validator.generator({
	schema: {
		_id: commonChains.stringRequired,
		nameEn: commonChains.stringRequired,
		nameAr: commonChains.stringRequired,
		roles: commonChains.arrayRequired,
	},
	type: 'body',
});

const update = validator.generator(
	{
		schema: {
			nameEn: commonChains.stringOptional,
			nameAr: commonChains.stringOptional,
			roles: commonChains.arrayOptional,
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

const getById = validator.generator({
	schema: {
		id: commonChains.stringRequired,
	},
	type: 'params',
});


const getByRole = validator.generator({
	schema: {
		role: commonChains.numberRequired,
	},
	type: 'query',
});

export default {getByRole, create, update, delete: deleteOne, getById };
