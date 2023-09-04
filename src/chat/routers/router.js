import express from 'express';
const router = express.Router();
import { catchAsync } from '../../../utils/index.js';
import chatController from '../controllers/chat.js';
import chatValidator from '../validators/chat.js';
import authenticationController from '../../authentication/controllers/authentication.js';

const restrictChat = authenticationController.restrictByPermissionId('CHAT');
router.use(catchAsync(restrictChat));

router.post('/file', catchAsync(chatController.fileUploader), catchAsync(chatController.createAFile));
router.post('/poll', catchAsync(chatValidator.answerPoll), catchAsync(chatController.answerPoll));

router.post(
	'/conversation',
	catchAsync(chatValidator.createOrGetOneConversation),
	catchAsync(chatController.createOrGetOneConversation)
);

router.get('/conversation', catchAsync(chatValidator.getConversation), catchAsync(chatController.getConversation));

router.get(
	'/one-conversation',
	catchAsync(chatValidator.getOneConversation),
	catchAsync(chatController.getOneConversation)
);

router.delete(
	'/conversation/:id',
	catchAsync(chatValidator.deleteConversationById),
	catchAsync(chatController.deleteConversationById)
);

router.get('/message', catchAsync(chatValidator.getMessage), catchAsync(chatController.getMessage));

export default router;
