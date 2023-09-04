import General from '../models/general.js';
import { Exception, S3, statusCodes, firebase } from '../../../utils/index.js';
class GeneralService {
	constructor(data) {
		this.key = data.key;
		this.value = data.value;
		this.isGeneral = data.isGeneral;
	}

	async create() {
		const oldItem = await General.findOne({ key: this.key }).exec();
		if (oldItem) throw new Exception(statusCodes.DUPLICATED_ENTRY, this.key + ' is already created.');
		const general = await General.create(this);
		return { msg: 'added a general.', general };
	}

	static async get() {
		const arr = await General.find({ isGeneral: true }).exec();
		const data = arr.reduce((map, obj) => {
			map[obj.key] = { _id: obj._id, value: obj.value };
			return map;
		}, {});
		return { msg: 'OK', data };
	}

	static async getByKey(key) {
		const data = await General.findOne({ key }).exec();
		if (!data) throw new Exception(statusCodes.ITEM_NOT_FOUND, 'no such general.');
		return { msg: 'OK', data };
	}

	static async update(id, data) {
		const general = await General.findByIdAndUpdate(id, data, { returnDocument: 'after', lean: true });
		return { msg: 'updated a general.', general };
	}

	static async updateImage(id, data) {
		const general = await General.findByIdAndUpdate(id, data, { returnDocument: 'before', lean: true });
		try {
			await S3.deleteFromS3(general.value, false);
		} catch (e) {}
		return { msg: 'updated a general.', general: { _id: id, ...data } };
	}

	static async delete(id) {
		await General.findByIdAndDelete(id);
		return { msg: 'deleted a general.', id };
	}

	static async sendNotification(reqData) {
		const { topic, title, body, data } = reqData;
		try {
			await firebase.send(topic, { title, body, data });
			return { msg: 'Success' };
		} catch (e) {
			return { msg: 'Failure' };
		}
	}
}

export default GeneralService;
