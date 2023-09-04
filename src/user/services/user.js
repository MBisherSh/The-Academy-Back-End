import User from '../models/user.js';
import TransactionService from '../services/transaction.js';
import { Exception, statusCodes, S3 } from '../../../utils/index.js';
import General from '../models/general.js';
import firebase from '../../../utils/firebase/firebase.js';

class UserService {
	constructor(data) {
		this.name = data.name;
		this.email = data.email;
		this.role = 1;
		this.passwordHash = data.passwordHash;
	}
	async createUser() {
		let isDuplicated = await UserService.getByEmail(this.email);
		if (isDuplicated)
			throw new Exception(statusCodes.DUPLICATED_ENTRY, 'A user with this email is already registered');
		return await this.save();
	}

	async save() {
		return await User.create(this);
	}

	static async getByEmail(email) {
		return await User.findOne({ email }).exec();
	}

	static async findUserById(id) {
		return await User.findById(id).exec();
	}
	static async updateUser(id, updatedFields) {
		return await User.updateOne({ _id: id }, updatedFields).exec();
	}

	static async updateProfileImage(userId, profileImage) {
		const user = await User.findById(userId);
		if (!profileImage) throw new Exception(statusCodes.BAD_REQUEST, 'Please upload an image.');
		await User.findByIdAndUpdate(userId, { profileImage }, { returnDocument: 'before', lean: true });
		if (user.profileImage)
			try {
				await S3.deleteFromS3(user.profileImage, false);
			} catch (e) {}
		return { msg: 'Profile image has been updated.', profileImage };
	}

	static async getProfile(id) {
		const data = await User.findById(id, 'name role email profileImage isOnline balance').exec();
		return { msg: 'OK', data };
	}

	static async getUserList(filters) {
		const limit = parseInt(filters.limit);
		const offset = parseInt(filters.offset);
		const role = parseInt(filters.role);
		let filter = role ? { role } : {};
		const total = await User.count(filter);
		const data = await User.find(filter, 'name email role profileImage').limit(limit).skip(offset).exec();
		return { msg: 'OK', total, data };
	}

	static async setUserRole(data) {
		const { id, role } = data;
		const now = new Date();
		await User.findByIdAndUpdate(id, { role, changedPasswordAt: now }, { returnDocument: 'after', lean: true });
		// const socket = socketIOInstance.getInstance();
		// socket.loggedOnNamespace.to(id).emit('roleChange', { role });
		try {
			await firebase.send(id, {
				title: 'تم تغيير الدور الخاص بك!',
				body: role,
				data: { event: 'roleChange', newRole: role },
			});
			await firebase.send(id, {
				title: 'Your role has been changed!',
				body: role,
				data: { event: 'roleChange', newRole: role },
			});
		} catch (e) {}
		return { msg: 'UPDATED, please login again.', data: { id, role } };
	}

	static async registerAsCoach(id) {
		const user = await User.findById(id).exec();
		if (user.role == 2) throw new Exception(statusCodes.BAD_REQUEST, 'You are already a coach.');
		const price = await General.findOne({ key: 'COACH_SUBSCRIPTION_FEE' }).exec();
		let amount;
		if (price) amount = parseInt(price.value);
		if (!amount) amount = 2000;
		await new TransactionService({
			userId: id,
			amount,
			type: 'fee',
			details: 'Coach subscription fee.',
		}).create();
		return this.setUserRole({ id, role: 2 });
	}
}

export default UserService;
