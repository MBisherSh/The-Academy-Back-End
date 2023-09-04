import { commonChains, validator } from '../../../utils/index.js';

const create = validator.generator({
	schema: {
		nameAr: commonChains.stringRequired,
		nameEn: commonChains.stringRequired,
		courseId: commonChains.stringRequired,
		language: commonChains.stringRequired,
		startDate: commonChains.dateRequired,
		endDate: commonChains.dateRequired,
		questions: commonChains.arrayRequired,
	},
	type: 'body',
});

const getList = validator.generator({
	schema: {
		limit: commonChains.numberRequired,
		offset: commonChains.numberRequired,
		search: commonChains.stringOptional,
		courseId: commonChains.stringOptional,
	},
	type: 'query',
});

const update = validator.generator(
	{
		schema: {
			nameAr: commonChains.stringOptional,
			nameEn: commonChains.stringOptional,
			courseId: commonChains.stringOptional,
			language: commonChains.stringOptional,
			startDate: commonChains.dateOptional,
			endDate: commonChains.dateOptional,
			questions: commonChains.arrayOptional,
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

const attendExam = validator.generator({
	schema: {
		examId: commonChains.stringRequired,
		answers: commonChains.arrayRequired,
	},
	type: 'body',
});

const getMyUserExam = validator.generator({
	schema: {
		limit: commonChains.numberRequired,
		offset: commonChains.numberRequired,
		startDate: commonChains.dateOptional,
		endDate: commonChains.dateOptional,
		sort: commonChains.stringOptional,
	},
	type: 'query',
});

const getAllUserExamList = validator.generator({
	schema: {
		limit: commonChains.numberRequired,
		offset: commonChains.numberRequired,
		examId: commonChains.stringRequired,
		userId: commonChains.stringOptional,
		startDate: commonChains.dateOptional,
		endDate: commonChains.dateOptional,
		sort: commonChains.stringOptional,
	},
	type: 'query',
});

const getEvaluation = validator.generator({
	schema: {
		courseId: commonChains.stringRequired,
	},
	type: 'query',
});

export default {
	create,
	getList,
	update,
	delete: deleteOne,
	getById,
	attendExam,
	getMyUserExam,
	getAllUserExamList,
	getEvaluation,
};
