import { commonChains, validator } from '../../../utils/index.js';

const create = validator.generator({
	schema: {
		nameAr: commonChains.stringRequired,
		nameEn: commonChains.stringRequired,
		categoryId: commonChains.stringRequired,
	},
	type: 'body',
});

const getList = validator.generator({
	schema: {
		limit: commonChains.numberRequired,
		offset: commonChains.numberRequired,
		search: commonChains.stringOptional,
		categoryId: commonChains.stringOptional,
	},
	type: 'query',
});

const update = validator.generator(
	{
		schema: {
			nameAr: commonChains.stringOptional,
			nameEn: commonChains.stringOptional,
			categoryId: commonChains.stringOptional,
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

export default { create, getList, update, delete: deleteOne, getById };
