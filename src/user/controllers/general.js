import GeneralService from '../services/general.js';
import { statusCodes, Uploader } from '../../../utils/index.js';

const create = async (req, res) => {
	const data = req.body;
	const result = await new GeneralService(data).create();
	res.status(statusCodes.CREATED).json(result);
};

const get = async (req, res) => {
	const result = await GeneralService.get();
	res.status(statusCodes.OK).json(result);
};

const getByKey = async (req, res) => {
	const key = req.params.key;
	const result = await GeneralService.getByKey(key);
	res.status(statusCodes.OK).json(result);
};

const update = async (req, res) => {
	const id = req.params.id;
	const data = req.body;
	const result = await GeneralService.update(id, data);
	res.status(statusCodes.UPDATED).json(result);
};

const updateImage = async (req, res) => {
	const id = req.params.id;
	const data = { value: res.locals.assets.image[0].key };
	const result = await GeneralService.updateImage(id, data);
	res.status(statusCodes.UPDATED).json(result);
};

const deleteOne = async (req, res) => {
	const id = req.params.id;
	const result = await GeneralService.delete(id);
	res.status(statusCodes.DELETED).json(result);
};

const generalUploader = (required) =>
	Uploader({
		fields: [{ name: 'image', maxCount: 1, required }],
		maxFileSize: 5,
		allowedFileTypes: ['jpeg', 'jpg', 'png', 'gif'],
		isPrivate: false,
	});

const sendNotification = async (req, res) => {
	const data = req.body;
	const result = await GeneralService.sendNotification(data);
	res.status(statusCodes.OK).json(result);
};


export default {
	create,
	get,
	update,
	delete: deleteOne,
	updateImage,
	generalUploader,
	getByKey,
	sendNotification
};
