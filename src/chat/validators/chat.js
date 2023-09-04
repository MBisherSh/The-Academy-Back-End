import { commonChains, validator } from '../../../utils/index.js';

const createOrGetOneConversation = validator.generator({
	schema: {
		secondUserId: commonChains.stringRequired,
	},
	type: 'body',
});

const getConversation = validator.generator({
	schema: {
		limit: commonChains.numberRequired,
		offset: commonChains.numberRequired,
		sort: commonChains.stringOptional,
	},
	type: 'query',
});

const getOneConversation = validator.generator({
	schema: {
		secondUserId: commonChains.stringRequired,
	},
	type: 'query',
});

const deleteConversationById = validator.generator({
	schema: {
		id: commonChains.stringRequired,
	},
	type: 'params',
});

const getMessage = validator.generator({
	schema: {
		limit: commonChains.numberRequired,
		offset: commonChains.numberRequired,
		sort: commonChains.stringOptional,
		courseId: commonChains.stringOptional,
		conversationId: commonChains.stringOptional,
		isChat: commonChains.booleanOptional,
		isFeed: commonChains.booleanOptional,
	},
	type: 'query',
});

const answerPoll = validator.generator({
	schema: {
		contentId: commonChains.stringRequired,
		messageId: commonChains.stringRequired,
		retract: commonChains.booleanOptional,
	},
	type: 'body',
});

export default {
	createOrGetOneConversation,
	getConversation,
	getOneConversation,
	deleteConversationById,
	getMessage,
	answerPoll,
};
