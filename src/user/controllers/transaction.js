import TransactionService from '../services/transaction.js';
import { statusCodes } from '../../../utils/index.js';

const create = async (req, res) => {
	const data = req.body;
	const result = await new TransactionService(data).create();
	res.status(statusCodes.CREATED).json(result);
};

const get = async (req, res) => {
	const filters = req.query;
	filters.userId = req.user.id;
	const result = await TransactionService.get(filters);
	res.status(statusCodes.OK).json(result);
};

const getAll = async (req, res) => {
	const filters = req.query;
	const result = await TransactionService.getAll(filters);
	res.status(statusCodes.OK).json(result);
};

const getById = async (req, res) => {
	const id = req.params.id;
	const result = await TransactionService.getById(id);
	res.status(statusCodes.OK).json(result);
};


const deleteOne = async (req, res) => {
	const id = req.params.id;
	const result = await TransactionService.delete(id);
	res.status(statusCodes.DELETED).json(result);
};

export default {
	create,
	get,
	getById,
	getAll,
	delete: deleteOne,
};
