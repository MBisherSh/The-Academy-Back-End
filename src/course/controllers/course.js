import CourseService from '../services/course.js';
import { statusCodes, Uploader } from '../../../utils/index.js';

const create = async (req, res) => {
	const data = req.body;
	data.owner = req.user.id;
	data.image = res.locals.assets.image[0].key;
	const result = await new CourseService(data).create();
	res.status(statusCodes.CREATED).json(result);
};

const getCourse = async (req, res) => {
	const filters = req.query;
	const result = await CourseService.getCourse(filters);
	res.status(statusCodes.OK).json(result);
};

const getUnAcceptedCourse = async (req, res) => {
	const filters = req.query;
	filters.unAccepted = true;
	const result = await CourseService.getCourse(filters);
	res.status(statusCodes.OK).json(result);
};

const getMyOwnedCourse = async (req, res) => {
	const filters = req.query;
	filters.userId = req.user.id;
	filters.myOwnedCourses = true;
	const result = await CourseService.getCourse(filters);
	res.status(statusCodes.OK).json(result);
};

const getAllUserCourse = async (req, res) => {
	const userId = req.user.id;
	const result = await CourseService.getAllUserCourse(userId);
	res.status(statusCodes.OK).json({ msg: 'OK', data: result });
};

const getById = async (req, res) => {
	const id = req.params.id;
	const result = await CourseService.getById(id);
	res.status(statusCodes.OK).json(result);
};

const update = async (req, res) => {
	const id = req.params.id;
	const data = req.body;
	if (res.locals && res.locals.assets && res.locals.assets.image && res.locals.assets.image[0])
		data.image = res.locals.assets.image[0].key;
	const result = await CourseService.update(id, data);
	res.status(statusCodes.UPDATED).json(result);
};

const deleteOne = async (req, res) => {
	const id = req.params.id;
	const result = await CourseService.delete(id);
	res.status(statusCodes.DELETED).json(result);
};

const addUserToCourse = async (req, res) => {
	const data = req.body;
	const owner = req.user;
	const result = await CourseService.addUserToCourse(owner, data);
	res.status(statusCodes.UPDATED).json(result);
};

const removeUserFromCourse = async (req, res) => {
	const data = req.body;
	const owner = req.user;
	const result = await CourseService.removeUserFromCourse(owner, data);
	res.status(statusCodes.UPDATED).json(result);
};

const askTojoinCourse = async (req, res) => {
	const courseId = req.params.id;
	const userId = req.user.id;
	const result = await CourseService.askTojoinCourse(userId, courseId);
	res.status(statusCodes.UPDATED).json(result);
};

const setActive = async (req, res) => {
	const data = req.body;
	const owner = req.user;
	const result = await CourseService.setActive(owner, data);
	res.status(statusCodes.UPDATED).json(result);
};

const accept = async (req, res) => {
	const courseId = req.params.id;
	const admin = req.user;
	const result = await CourseService.accept(admin, courseId);
	res.status(statusCodes.UPDATED).json(result);
};

const courseUploader = (required) =>
	Uploader({
		fields: [{ name: 'image', maxCount: 1, required }],
		maxFileSize: 5,
		allowedFileTypes: ['jpeg', 'jpg', 'png', 'gif'],
		isPrivate: false,
	});

export default {
	create,
	getCourse,
	getById,
	update,
	delete: deleteOne,
	courseUploader,
	addUserToCourse,
	removeUserFromCourse,
	setActive,
	askTojoinCourse,
	accept,
	getUnAcceptedCourse,
	getMyOwnedCourse,
	getAllUserCourse,
};
