import CategoryService from '../services/category.js';
import { statusCodes, Uploader } from '../../../utils/index.js';

const create = async (req, res) => {
	const data = req.body;
	data.image = res.locals.assets.image[0].key;
	const result = await new CategoryService(data).create();
	res.status(statusCodes.CREATED).json(result);
};

const getCategory = async (req, res) => {
	const filters = req.query;
	const result = await CategoryService.getCategory(filters);
	res.status(statusCodes.OK).json(result);
};

const getById = async (req, res) => {
	const id = req.params.id;
	const result = await CategoryService.getById(id);
	res.status(statusCodes.OK).json(result);
};

const update = async (req, res) => {
	const id = req.params.id;
	const data = req.body;
	if (res.locals && res.locals.assets && res.locals.assets.image && res.locals.assets.image[0])
		data.image = res.locals.assets.image[0].key;
	const result = await CategoryService.update(id, data);
	res.status(statusCodes.UPDATED).json(result);
};

const deleteOne = async (req, res) => {
	const id = req.params.id;
	const result = await CategoryService.delete(id);
	res.status(statusCodes.DELETED).json(result);
};

const categoryUploader = (required) =>
	Uploader({
		fields: [{ name: 'image', maxCount: 1, required }],
		maxFileSize: 5,
		allowedFileTypes: ['jpeg', 'jpg', 'png', 'gif'],
		isPrivate: false,
	});

export default {
	create,
	getCategory,
	getById,
	update,
	delete: deleteOne,
	categoryUploader,
};
