import Message from '../models/message.js';
import Course from '../../course/models/course.js';
import { Exception, statusCodes } from '../../../utils/index.js';
import ConversationService from './conversation.js';

class MessageService {
	constructor(data) {
		this.type = data.type;
		this.course = data.courseId;
		this.conversation = data.conversationId;
		this.contents = data.contents;
		this.replyTo = data.replyToId;
	}

	async create(user, receiverId) {
		if (this.course) await MessageService.restrictForCourseUsers(this.course, user);
		this.sender = user.id;
		if (this.conversation) await ConversationService.restrictForConversationUsers(this.conversation, user.id);
		else if (receiverId) {
			const data = await new ConversationService({ firstUserId: user.id, secondUserId: receiverId });
			const conversation = data.conversation;
			this.conversation = conversation._id;
		}
		const result = await Message.create(this);
		const message = await MessageService.getById(result._id);
		return { msg: 'created a message.', message: JSON.parse(JSON.stringify(message)) };
	}

	static async restrictForCourseUsers(courseId, user) {
		const courseObject = await Course.findById(courseId);
		if (user.role < 3) {
			if (!courseObject || (courseObject.owner != user.id && !courseObject.users.includes(user.id)))
				throw new Exception(statusCodes.UNAUTHORIZED);
		}
	}

	static async getMessage(filters, user) {
		const limit = parseInt(filters.limit);
		const offset = parseInt(filters.offset);

		let filter = {};
		const courseId = filters.courseId;
		if (courseId) {
			await MessageService.restrictForCourseUsers(courseId, user);
			filter.course = courseId;
		} else if (filters.conversationId) {
			await ConversationService.restrictForConversationUsers(filters.conversationId, user.id);
			filter.conversation = filters.conversationId;
		} else filter.sender = user.id;

		if (filters.isChat) filter.type = ['text', 'image', 'voice'];
		else if (filters.isFeed) filter.type = ['file', 'location', 'slides', 'poll', 'poll-option'];

		let sort = filters.sort ? filters.sort : '-_id';
		let total;
		if (offset === 0) total = await Message.count(filter);
		const data = await Message.find(filter, 'type contents replyTo createdAt conversation')
			.sort(sort)
			.skip(offset)
			.limit(limit)
			.populate({
				path: 'course',
				select: 'nameAr nameEn',
			})
			.populate({
				path: 'sender',
				select: 'name profileImage',
			})
			.populate({
				path: 'replyTo',
				select: 'sender type contents',
				populate: { path: 'sender', select: 'name email profileImage isOnline' },
			})
			.exec();
		return { msg: 'OK', total, data };
	}

	static async delete(id, user) {
		const message = await Message.findById(id).populate('course').populate('conversation').exec();
		if (!message) throw new Exception(statusCodes.BAD_REQUEST, 'deleted message.');
		if (message.sender != user.id && socket.user.role < 3 && (!message.course || message.course.owner != user.id))
			throw new Exception(statusCodes.UNAUTHORIZED, 'you are not allowed to delete this message.');
		await Message.deleteOne({ _id: id });
		return {
			msg: 'deleted a message.',
			message: {
				_id: message._id.toString(),
				conversation: message.conversation ? JSON.parse(JSON.stringify(message.conversation)) : undefined,
				courseId: message.course && message.course._id ? message.course._id.toString() : undefined,
			},
		};
	}

	static async getById(id) {
		return await Message.findById(id)
			.populate('course', 'nameAr nameEn')
			.populate('conversation')
			.populate('sender', 'name email profileImage isOnline')
			.populate({
				path: 'replyTo',
				select: 'sender type contents',
				populate: { path: 'sender', select: 'name email profileImage isOnline' },
			})
			.lean()
			.exec();
	}
	static async answerPoll(data) {
		const { userId, messageId, contentId, retract } = data;
		const message = await Message.findById(messageId)
			.populate({
				path: 'course',
				select: 'nameAr nameEn',
			})
			.populate({
				path: 'sender',
				select: 'name profileImage',
			})
			.populate('replyTo')
			.exec();
		if (!message) throw new Exception(statusCodes.ITEM_NOT_FOUND, 'no such course.');

		if (!retract) message.contents.id(contentId).chosenBy.addToSet(userId);
		message.contents.map((content) => {
			if (retract) content.chosenBy.pull(userId);
			else if (content.chosenBy && content._id != contentId) content.chosenBy.pull(userId);
		});
		await message.save();
		if (message.course) {
			const socket = socketIOInstance.getInstance();
			socket.loggedOnNamespace
				.to(message.course._id)
				.emit('userChoice', { userId, message: JSON.parse(JSON.stringify(message)) });
		}
		return { msg: 'OK', message };
	}
}

export default MessageService;
