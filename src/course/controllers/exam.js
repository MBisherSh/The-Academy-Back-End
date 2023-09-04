import ExamService from '../services/exam.js';
import { statusCodes, Uploader } from '../../../utils/index.js';

const create = async (req, res) => {
	const data = req.body;
	const userId = req.user.id;
	const result = await new ExamService(data).create(userId);
	res.status(statusCodes.CREATED).json(result);
};

const getExam = async (req, res) => {
	const filters = req.query;
	const user = req.user;
	const result = await ExamService.getExam(filters, user);
	res.status(statusCodes.OK).json(result);
};

const getById = async (req, res) => {
	const id = req.params.id;
	const user = req.user;
	const result = await ExamService.getById(id, user);
	res.status(statusCodes.OK).json(result);
};

const update = async (req, res) => {
	const id = req.params.id;
	const data = req.body;
	const user = req.user;
	const result = await ExamService.update(id, data, user);
	res.status(statusCodes.UPDATED).json(result);
};

const deleteOne = async (req, res) => {
	const id = req.params.id;
	const userId = req.user.id;
	const result = await ExamService.delete(id, userId);
	res.status(statusCodes.DELETED).json(result);
};

const attendExam = async (req, res) => {
	const data = req.body;
	const user = req.user;
	const result = await ExamService.attendExam(data, user);
	res.status(statusCodes.CREATED).json(result);
};

const getMyUserExam = async (req, res) => {
	const filters = req.query;
	filters.userId = req.user.id;
	const result = await ExamService.getUserExamList(filters);
	res.status(statusCodes.OK).json(result);
};

const getAllUserExam = async (req, res) => {
	const filters = req.query;
	const user = req.user;
	const result = await ExamService.getAllUserExamList(filters, user);
	res.status(statusCodes.OK).json(result);
};

const getUserExamById = async (req, res) => {
	const id = req.params.id;
	const user = req.user;
	const result = await ExamService.getUserExamById(id, user);
	res.status(statusCodes.OK).json(result);
};

const getEvaluation = async (req, res) => {
	const filters = req.query;
	const user = req.user;
	const result = await ExamService.getEvaluation(filters, user);
	res.status(statusCodes.OK).json(result);
};

const getMyEvaluation = async (req, res) => {
	const filters = req.query;
	const user = req.user;
	const result = await ExamService.getMyEvaluation(filters, user);
	res.status(statusCodes.OK).json(result);
};

export default {
	create,
	getExam,
	getById,
	update,
	delete: deleteOne,
	attendExam,
	getMyUserExam,
	getAllUserExam,
	getUserExamById,
	getEvaluation,
	getMyEvaluation
};
