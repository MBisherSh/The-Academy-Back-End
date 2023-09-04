import Role from '../models/role.js';
import { Exception, statusCodes } from '../../../utils/index.js';
import config from 'config';

class RoleService {
	constructor(data) {
		this.nameAr = data.nameAr;
		this.nameEn = data.nameEn;
		this._id = data._id;
	}

	async create() {
		try {
			const role = await Role.create(this);
			return { msg: 'CREATED', role };
		} catch (e) {
			throw new Exception(statusCodes.BAD_REQUEST, e.message);
		}
	}

	static async get() {
		const data = await Role.find().sort('+_id').exec();
		return { msg: 'OK', data };
	}

	static async getById(id) {
		const role = await Role.findById(id).exec();
		return { msg: 'OK', role };
	}

	static async update(id, data) {
		try {
			const role = await Role.findByIdAndUpdate(id, data, { returnDocument: 'after', lean: true });
			return { msg: 'UPDATED', role };
		} catch (e) {
			throw new Exception(statusCodes.BAD_REQUEST, e.message);
		}
	}

	static async delete(id) {
		await Role.findByIdAndDelete(id);
		return { msg: 'DELETED', id };
	}

	static async setAsDefault() {
		const roles = config.get('defaultRoles');
		if (!roles) throw new Exception(statusCodes.SERVICE_UNAVAILABLE, 'missing config');
		const data = await Promise.all(
			roles.map(async (role) => {
				return await Role.findByIdAndUpdate(role._id, role, { upsert: true, returnDocument: 'after' }).exec();
			})
		);
		return { msg: 'OK', data };
	}
}

export default RoleService;
