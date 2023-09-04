import Transaction from '../models/transaction.js';
import User from '../models/user.js';
import { Exception, statusCodes } from '../../../utils/index.js';

class TransactionService {
	constructor(data) {
		this.type = data.type;
		this.amount = data.amount;
		this.user = data.userId;
		this.details = data.details;
	}

	async create() {
		const user = await User.findById(this.user).exec();
		if (this.type == 'fee') {
			if (user.balance < this.amount) throw new Exception(statusCodes.PAYMENT_REQUIRED, 'Not enough funds.');
			else await User.findByIdAndUpdate(this.user, { $inc: { balance: -1 * this.amount } });
		} else await User.findByIdAndUpdate(this.user, { $inc: { balance: this.amount } });
		const transaction = await Transaction.create(this);
		return { msg: 'CREATED', transaction };
	}

	static async get(filters) {
		const { userId, type } = filters;
		const limit = parseInt(filters.limit);
		const offset = parseInt(filters.offset);
		let filter = { user: userId };
		if (type) filter.type = type;
		let sort = filters.sort ? filters.sort : '-_id';
		let total;
		if (offset === 0) total = await Transaction.count(filter);
		const data = await Transaction.find(filter)
			.sort(sort)
			.skip(offset)
			.limit(limit)
			.populate('user', 'name email profileImage balance')
			.exec();
		return { msg: 'OK', total, data };
	}

	static async getAll(filters) {
		const { type } = filters;
		const limit = parseInt(filters.limit);
		const offset = parseInt(filters.offset);
		let filter = {};
		if (type) filter.type = type;
		let sort = filters.sort ? filters.sort : '-_id';
		let total;
		if (offset === 0) total = await Transaction.count(filter);
		const data = await Transaction.find(filter)
			.sort(sort)
			.skip(offset)
			.limit(limit)
			.populate('user', 'name email profileImage balance')
			.exec();
		return { msg: 'OK', total, data };
	}

	static async getById(id) {
		const transaction = await Transaction.findById(id).populate('user', 'name email profileImage').exec();
		return { msg: 'OK', transaction };
	}

	static async delete(id) {
		const transaction = await Transaction.findById(id).exec();
		let update;
		if (transaction.type == 'fee') update = { $inc: { balance: transaction.amount } };
		else update = { $inc: { balance: -1 * transaction.amount } };
		await User.findByIdAndUpdate(transaction.user, update);
		return { msg: 'DELETED', id };
	}
}

export default TransactionService;
