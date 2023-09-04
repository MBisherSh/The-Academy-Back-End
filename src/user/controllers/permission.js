import PermissionService from '../services/permission.js';
import { statusCodes } from '../../../utils/index.js';

const create = async (req, res) => {
	const data = req.body;
	const result = await new PermissionService(data).create();
	res.status(statusCodes.CREATED).json(result);
};

const get = async (req, res) => {
	const result = await PermissionService.get();
	res.status(statusCodes.OK).json(result);
};

const getByRole = async (req, res) => {
	const role = req.query.role;
	const result = await PermissionService.getByRole(role);
	res.status(statusCodes.OK).json(result);
};

const getById = async (req, res) => {
	const id = req.params.id;
	const result = await PermissionService.getById(id);
	res.status(statusCodes.OK).json(result);
};

const update = async (req, res) => {
	const id = req.params.id;
	const data = req.body;
	const result = await PermissionService.update(id, data);
	res.status(statusCodes.UPDATED).json(result);
};

const deleteOne = async (req, res) => {
	const id = req.params.id;
	const result = await PermissionService.delete(id);
	res.status(statusCodes.DELETED).json(result);
};

const setAsDefault = async (req, res) => {
	const result = await PermissionService.setAsDefault();
	res.status(statusCodes.OK).json(result);
};

export default {
	create,
	get,
	getById,
	update,
	delete: deleteOne,
	setAsDefault,
	getByRole,
};
