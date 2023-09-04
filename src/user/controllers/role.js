import RoleService from '../services/role.js';
import { statusCodes } from '../../../utils/index.js';

const create = async (req, res) => {
	const data = req.body;
	const result = await new RoleService(data).create();
	res.status(statusCodes.CREATED).json(result);
};

const get = async (req, res) => {
	const result = await RoleService.get();
	res.status(statusCodes.OK).json(result);
};

const getById = async (req, res) => {
	const id = req.params.id;
	const result = await RoleService.getById(id);
	res.status(statusCodes.OK).json(result);
};

const update = async (req, res) => {
	const id = req.params.id;
	const data = req.body;
	const result = await RoleService.update(id, data);
	res.status(statusCodes.UPDATED).json(result);
};

const deleteOne = async (req, res) => {
	const id = req.params.id;
	const result = await RoleService.delete(id);
	res.status(statusCodes.DELETED).json(result);
};

const setAsDefault = async (req, res) => {
	const result = await RoleService.setAsDefault();
	res.status(statusCodes.OK).json(result);
};

export default {
	create,
	get,
	getById,
	update,
	delete: deleteOne,
	setAsDefault
};
