import { commonChains, validator } from '../../../utils/index.js';
import Joi from 'joi';

const create = validator.generator({
	schema: {
		nameAr: commonChains.stringRequired,
		nameEn: commonChains.stringRequired,
		descriptionAr: commonChains.stringRequired,
		descriptionEn: commonChains.stringRequired,
		subjectId: commonChains.stringRequired,
		isPrivate: commonChains.booleanOptional,
	},
	type: 'body',
});

const getList = validator.generator({
	schema: {
		limit: commonChains.numberRequired,
		offset: commonChains.numberRequired,
		search: commonChains.stringOptional,
		userId: commonChains.stringOptional,
		myCourses: commonChains.booleanOptional,
		myPendingCourses: commonChains.booleanOptional,
		isPrivate: commonChains.booleanOptional,
		active: commonChains.booleanOptional,
		subjectId: commonChains.stringOptional,
		sort: Joi.string().optional().valid('nameAr', 'nameEn'),
	},
	type: 'query',
});

const getMyOwnedCourse = validator.generator({
	schema: {
		limit: commonChains.numberRequired,
		offset: commonChains.numberRequired,
		search: commonChains.stringOptional,
		isPrivate: commonChains.booleanOptional,
		unAccepted: commonChains.booleanOptional,
		active: commonChains.booleanOptional,
		subjectId: commonChains.stringOptional,
		sort: Joi.string().optional().valid('nameAr', 'nameEn'),
	},
	type: 'query',
});
const update = validator.generator(
	{
		schema: {
			nameAr: commonChains.stringOptional,
			nameEn: commonChains.stringOptional,
			descriptionAr: commonChains.stringOptional,
			descriptionEn: commonChains.stringOptional,
			subjectId: commonChains.stringOptional,
			isPrivate: commonChains.booleanOptional,
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

const addUserToCourse = validator.generator({
	schema: {
		userId: commonChains.stringRequired,
		courseId: commonChains.stringRequired,
	},
	type: 'body',
});

const setActive = validator.generator({
	schema: {
		active: commonChains.booleanRequired,
		courseId: commonChains.stringRequired,
	},
	type: 'body',
});

const acceptAsk = validator.generator({
	schema: {
		id: commonChains.stringRequired,
	},
	type: 'params',
});

export default {
	create,
	getList,
	update,
	delete: deleteOne,
	getById,
	addUserToCourse,
	setActive,
	acceptAsk,
	getMyOwnedCourse,
};
