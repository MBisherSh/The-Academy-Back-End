import ConversationService from '../services/conversation.js';
import { statusCodes, Uploader } from '../../../utils/index.js';
import MessageService from '../services/message.js';
import CategoryService from '../../course/services/category.js';

// Conversation Controller

const createOrGetOneConversation = async (req, res) => {
	const data = req.body;
	data.firstUserId = req.user.id;
	const result = await new ConversationService(data).createOrGetOne();
	res.status(statusCodes.CREATED).json(result);
};

const getConversation = async (req, res) => {
	const filters = req.query;
	const userId = req.user.id;
	const result = await ConversationService.getConversation(filters, userId);
	res.status(statusCodes.OK).json(result);
};

const getOneConversation = async (req, res) => {
	const secondUserId = req.query.secondUserId;
	const firstUserId = req.user.id;
	const result = await ConversationService.getOne(firstUserId, secondUserId);
	res.status(statusCodes.CREATED).json(result);
};

const deleteConversationById = async (req, res) => {
	const id = req.params.id;
	const userId = req.user.id;
	const result = await ConversationService.delete(id, userId);
	res.status(statusCodes.DELETED).json(result);
};

// Message Controller

const getMessage = async (req, res) => {
	const filters = req.query;
	const user = req.user;
	const result = await MessageService.getMessage(filters, user);
	res.status(statusCodes.OK).json(result);
};

const fileUploader = Uploader({
	fields: [{ name: 'file', maxCount: 1, required: true }],
	maxFileSize: 50,
	allowedFileTypes: ['jpeg', 'jpg', 'png', 'gif'],
	isPrivate: false,
});

const createAFile = async (req, res) => {
	const result = res.locals.assets.file[0];
	res.status(statusCodes.CREATED).json(result);
};

const answerPoll = async (req, res) => {
	const data = req.body;
	data.userId = req.user.id;
	const result = await MessageService.answerPoll(data);
	res.status(statusCodes.CREATED).json(result);
};

export default {
	createOrGetOneConversation,
	getConversation,
	getOneConversation,
	deleteConversationById,
	getMessage,
	fileUploader,
	createAFile,
	answerPoll,
};
