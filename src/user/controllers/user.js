import UserService from '../services/user.js';
import { statusCodes, Uploader } from '../../../utils/index.js';

const updateProfileImage = async (req, res) => {
	const userId = req.user.id;
	const profileImage = res.locals.assets.profileImage[0];
	const result = await UserService.updateProfileImage(userId, profileImage.key);
	res.status(statusCodes.UPDATED).json(result);
};

const updateProfileImageUploader = Uploader({
	fields: [{ name: 'profileImage', maxCount: 1, required: true }],
	maxFileSize: 5,
	allowedFileTypes: ['jpeg', 'jpg', 'png', 'gif'],
	isPrivate: false,
});

const getProfile = async (req, res) => {
	const userId = req.user.id;
	const result = await UserService.getProfile(userId);
	res.status(statusCodes.OK).json(result);
};

const getUserList = async (req, res) => {
	const pagination = req.query;
	const result = await UserService.getUserList(pagination);
	res.status(statusCodes.OK).json(result);
};

const setUserRole = async (req, res) => {
	const data = req.body;
	const result = await UserService.setUserRole(data);
	res.status(statusCodes.UPDATED).json(result);
};

const registerAsCoach = async (req, res) => {
	const userId = req.user.id;
	const result = await UserService.registerAsCoach(userId);
	res.status(statusCodes.UPDATED).json(result);
};

export default {
	updateProfileImage,
	updateProfileImageUploader,
	getProfile,
	getUserList,
	setUserRole,
	registerAsCoach,
};
