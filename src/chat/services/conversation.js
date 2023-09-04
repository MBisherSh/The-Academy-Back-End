import Conversation from '../models/conversation.js';
import { Exception, statusCodes } from '../../../utils/index.js';
import Message from '../models/message.js';

class ConversationService {
	constructor(data) {
		this.firstUser = data.firstUserId;
		this.secondUser = data.secondUserId;
	}

	async createOrGetOne() {
		let conversation;
		conversation = await Conversation.findOne({
			$or: [
				{ firstUser: this.firstUser, secondUser: this.secondUser },
				{ firstUser: this.secondUser, secondUser: this.firstUser },
			],
		})
			.populate('firstUser secondUser', 'name email profileImage isOnline')
			.exec();
		if (!conversation) {
			conversation = await Conversation.create(this);
			await conversation.populate('firstUser secondUser', 'name email profileImage isOnline');
		}
		return { msg: 'created a conversation.', conversation };
	}

	static async getOne(firstUser, secondUser) {
		let conversation;
		conversation = await Conversation.findOne({
			$or: [
				{ firstUser: firstUser, secondUser: secondUser },
				{ firstUser: secondUser, secondUser: firstUser },
			],
		})
			.populate('firstUser secondUser', 'name email profileImage isOnline')
			.exec();
		return { msg: 'OK', conversation };
	}

	static async restrictForConversationUsers(conversationId, userId) {
		const conversation = await Conversation.findById(conversationId);
		if (conversation.firstUser != userId && conversation.secondUser != userId)
			throw new Exception(statusCodes.UNAUTHORIZED, 'you do not belong to this conversation');
	}

	static async getConversation(filters, userId) {
		const limit = parseInt(filters.limit);
		const offset = parseInt(filters.offset);

		let filter = {};
		filter.$or = [{ firstUser: userId }, { secondUser: userId }];
		let sort = filters.sort ? filters.sort : '-_id';
		let total;
		if (offset === 0) total = await Conversation.count(filter);
		const data = await Conversation.find(filter)
			.sort(sort)
			.skip(offset)
			.limit(limit)
			.populate('firstUser secondUser', 'name email profileImage isOnline')
			.exec();
		return { msg: 'OK', total, data };
	}

	static async delete(id, userId) {
		await ConversationService.restrictForConversationUsers(id, userId);
		await Conversation.deleteOne({ _id: id });
		//delete messages
		await Message.deleteMany({ conversation: id });
		return { msg: 'deleted an conversation.', id };
	}
}

export default ConversationService;
