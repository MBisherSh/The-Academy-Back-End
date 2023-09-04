import Permission from '../models/permission.js';
import { Exception, statusCodes } from '../../../utils/index.js';
import config from 'config';

class PermissionService {
	constructor(data) {
		this._id = data._id;
		this.nameAr = data.nameAr;
		this.nameEn = data.nameEn;
		this.roles = data.roles;
	}

	async create() {
		try {
			const permission = await Permission.create(this);
			return { msg: 'CREATED', permission };
		} catch (e) {
			throw new Exception(statusCodes.BAD_REQUEST, e.message);
		}
	}

	static async get() {
		const arr = await Permission.find().sort('+_id').populate('roles').exec();
		const data = arr.reduce((map, obj) => {
			map[obj._id] = { nameAr: obj.nameAr, nameEn: obj.nameEn, roles: obj.roles };
			return map;
		}, {});
		return { msg: 'OK', data };
	}

	static async getByRole(role) {
		const arr = await Permission.find({roles: role},'nameAr nameEn').sort('+_id').exec();
		const data = arr.reduce((map, obj) => {
			map[obj._id] = { nameAr: obj.nameAr, nameEn: obj.nameEn };
			return map;
		}, {});
		return { msg: 'OK', data };
	}

	static async getById(id) {
		return await Permission.findById(id).exec();
	}

	static async update(id, data) {
		const general = await Permission.findByIdAndUpdate(id, data, { returnDocument: 'after', lean: true });
		return { msg: 'UPDATED', general };
	}

	static async delete(id) {
		await Permission.findByIdAndDelete(id);
		return { msg: 'DELETED', id };
	}

	static async setAsDefault() {
		const permissions = config.get('defaultPermissions');
		if (!permissions) throw new Exception(statusCodes.SERVICE_UNAVAILABLE, 'missing config');
		const data = await Promise.all(
			permissions.map(async (permission) => {
				return await Permission.findByIdAndUpdate(permission._id, permission, {
					upsert: true,
					returnDocument: 'after',
				})
					.populate('roles')
					.exec();
			})
		);
		return { msg: 'OK', data };
	}
}

export default PermissionService;
