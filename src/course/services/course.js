import Course from '../models/course.js';
import { Exception, S3, statusCodes } from '../../../utils/index.js';
import General from '../../user/models/general.js';
import TransactionService from '../../user/services/transaction.js';
import firebase from '../../../utils/firebase/firebase.js';

class CourseService {
	constructor(data) {
		this.image = data.image;
		this.nameAr = data.nameAr;
		this.nameEn = data.nameEn;
		this.descriptionAr = data.descriptionAr;
		this.descriptionEn = data.descriptionEn;
		this.subject = data.subjectId;
		this.owner = data.owner;
		this.isPrivate = data.isPrivate;
	}

	async create() {
		if (this.isPrivate === 'true' || this.isPrivate === true) {
			const price = await General.findOne({ key: 'PRIVATE_COURSE_FEE' }).exec();
			let amount;
			if (price) amount = parseInt(price.value);
			if (!amount) amount = 5000;
			await new TransactionService({
				userId: this.owner,
				amount,
				type: 'fee',
				details: 'Private course fee.',
			}).create();
		}
		const course = await Course.create(this);

		return { msg: 'added a course.', course };
	}

	static async getCourse(filters) {
		const limit = parseInt(filters.limit);
		const offset = parseInt(filters.offset);

		let filter = filters.search
			? {
					$or: [
						{ nameAr: { $regex: filters.search, $options: 'i' } },
						{ nameEn: { $regex: filters.search, $options: 'i' } },
					],
			  }
			: {};

		if (filters.userId) {
			if (filters.myCourses) filter.users = filters.userId;
			if (filters.myPendingCourses) filter.pendingUsers = filters.userId;
			if (filters.myOwnedCourses) filter.owner = filters.userId;
		}
		filter.accepted = filters.unAccepted && filters.unAccepted != 'false' ? false : true;
		if (filters.isPrivate) filter.isPrivate = filters.isPrivate;
		if (filters.active) filter.active = filters.active;
		if (filters.subjectId) filter.subject = filters.subjectId;

		let sort = filters.sort ? { [filters.sort]: 1, _id: -1 } : { _id: -1 };
		let total;
		if (offset === 0) total = await Course.count(filter);
		const data = await Course.find(filter)
			.sort(sort)
			.skip(offset)
			.limit(limit)
			.populate('subject')
			.populate('owner', 'name email profileImage')
			.exec();
		return { msg: 'OK', total, data };
	}

	static async getAllUserCourse(userId) {
		return await Course.find({ $or: [{ users: userId }, { owner: userId }] }, 'owner users').exec();
	}

	static async getById(id) {
		const data = await Course.findById(id)
			.populate('subject')
			.populate('users pendingUsers owner', 'name email profileImage isOnline')
			.exec();
		if (!data) throw new Exception(statusCodes.ITEM_NOT_FOUND, 'no such course.');
		return { msg: 'OK', data };
	}

	static async update(id, data) {
		let course;
		if (data.subjectId) data.subject = data.subjectId;
		if (data.image) {
			const oldCourse = await Course.findByIdAndUpdate(id, data, { returnDocument: 'before', lean: true });
			try {
				await S3.deleteFromS3(oldCourse.image, false);
			} catch (e) {}
			course = await Course.findById(id).populate('subject').exec();
		} else
			course = await Course.findByIdAndUpdate(id, data, { returnDocument: 'after', lean: true })
				.populate('subject')
				.populate('users pendingUsers owner', 'name email profileImage isOnline')
				.exec();
		return { msg: 'updated an course.', course };
	}

	static async delete(id) {
		const course = await Course.findByIdAndDelete(id);
		try {
			await S3.deleteFromS3(course.image, false);
		} catch (e) {}
		return { msg: 'deleted a course.', id };
	}

	static async addUserToCourse(owner, data) {
		const { userId, courseId } = data;
		const course = await Course.findById(courseId)
			.populate('subject')
			.populate('users', 'name email profileImage isOnline')
			.exec();
		if (!course) throw new Exception(statusCodes.ITEM_NOT_FOUND, 'no such course.');
		if (course.owner != owner.id && owner.role < 3) throw new Exception(statusCodes.FORBIDDEN, 'no permission.');

		course.users.addToSet(userId);
		course.pendingUsers.pull(userId);
		await course.save();
		await course.populate(`users owner`, 'name email profileImage isOnline');
		// const socket = socketIOInstance.getInstance();
		// socket.loggedOnNamespace.to(courseId).emit('userJoin', { userId, course });
		try {
			await firebase.send(`${courseId}-ar`, {
				body: 'انضم مستخدم جديد إلى الدورة!',
				title: course.nameAr,
				data: { event: 'userJoin', course, newUserId: userId },
			});
			await firebase.send(`${courseId}-en`, {
				body: 'New user has joined course!',
				title: course.nameEn,
				data: { event: 'userJoin', course, newUserId: userId },
			});
		} catch (e) {}
		return { msg: 'OK', course };
	}

	static async removeUserFromCourse(owner, data) {
		const { userId, courseId } = data;
		const course = await Course.findById(courseId)
			.populate('subject')
			.populate('users', 'name email profileImage isOnline')
			.exec();
		if (!course) throw new Exception(statusCodes.ITEM_NOT_FOUND, 'no such course.');
		if (course.owner != owner.id && owner.role < 3 && owner.id != userId)
			throw new Exception(statusCodes.FORBIDDEN, 'no permission.');
		course.users.pull(userId);
		course.pendingUsers.pull(userId);
		await course.save();
		await course.populate(`owner`, 'name email profileImage isOnline');
		// const socket = socketIOInstance.getInstance();
		// socket.loggedOnNamespace.to(courseId).emit('userRemove', { userId, course });
		try {
			await firebase.send(`${courseId}-ar`, {
				body: 'غادرة مستخدم من الدورة.',
				title: course.nameAr,
				data: { event: 'userRemove', course, removedUserId: userId },
			});
			await firebase.send(`${courseId}-en`, {
				body: 'A user has left course.',
				title: course.nameEn,
				data: { event: 'userRemove', course, removedUserId: userId },
			});
		} catch (e) {}
		return { msg: 'DELETED' };
	}

	static async setActive(owner, data) {
		const { courseId, active } = data;
		const course = await Course.findById(courseId)
			.populate('subject')
			.populate('users', 'name email profileImage isOnline')
			.exec();
		if (!course) throw new Exception(statusCodes.ITEM_NOT_FOUND, 'no such course.');
		if (course.owner != owner.id && owner.role < 3) throw new Exception(statusCodes.FORBIDDEN, 'no permission.');
		course.active = active;
		await course.save();
		await course.populate(`owner`, 'name email profileImage isOnline');
		// const socket = socketIOInstance.getInstance();
		// socket.loggedOnNamespace.to(courseId).emit('courseActivation', { course });
		try {
			await firebase.send(`${courseId}-ar`, {
				body: active ? 'تم بدء الدورة!' : 'تم اغلاق الدورة.',
				title: course.nameAr,
				data: { event: 'courseActivation', course },
			});
			await firebase.send(`${courseId}-en`, {
				body: active ? 'Course is active!' : 'Course has been set to not active.',
				title: course.nameEn,
				data: { event: 'courseActivation', course },
			});
		} catch (e) {}
		return { msg: 'OK' };
	}

	static async accept(admin, courseId) {
		if (admin.role < 3) throw new Exception(statusCodes.FORBIDDEN, 'no permission.');
		const course = await Course.findByIdAndUpdate(
			courseId,
			{ accepted: true },
			{ returnDocument: 'after', lean: true }
		)
			.populate('subject')
			.populate(`owner`, 'name email profileImage isOnline')
			.exec();
		//const socket = socketIOInstance.getInstance();
		//socket.io.emit('newCourse', { course });
		try {
			await firebase.send('all-ar', {
				title: 'هناك دورة جديدة على المنصة!',
				body: course.nameAr,
				data: { event: 'newCourse', course },
			});
			await firebase.send('all-en', {
				title: 'New course on the academy!',
				body: course.nameEn,
				data: { event: 'newCourse', course },
			});
		} catch (e) {}
		return { msg: 'ACCEPTED', course };
	}

	static async askTojoinCourse(userId, courseId) {
		const course = await Course.findById(courseId)
			.populate('subject')
			.populate('users pendingUsers owner', 'name email profileImage isOnline')
			.exec();
		if (!course) throw new Exception(statusCodes.ITEM_NOT_FOUND, 'no such course.');

		const user = course.users.includes(userId);
		if (user) throw new Exception(statusCodes.DUPLICATED_ENTRY, 'you are already in this course.');
		if (course.isPrivate) course.pendingUsers.addToSet(userId);
		else course.users.addToSet(userId);
		await course.save();
		// const socket = socketIOInstance.getInstance();
		// socket.loggedOnNamespace.to(course.owner).emit('userAskToJoin', { userId, course });
		if (course.isPrivate)
			try {
				await firebase.send(`${course.owner._id}-ar`, {
					body: 'هناك طلب انضمام جديد إلى الدورة!',
					title: course.nameAr,
					data: { event: 'userAskToJoin', course },
				});
				await firebase.send(`${course.owner._id}-en`, {
					body: 'There is a new joining request!',
					title: course.nameEn,
					data: { event: 'userAskToJoin', course, removedUserId: userId },
				});
			} catch (e) {}
		else
			try {
				await firebase.send(`${courseId}-ar`, {
					body: 'انضم مستخدم جديد إلى الدورة!',
					title: course.nameAr,
					data: { event: 'userJoin', course, newUserId: userId },
				});
				await firebase.send(`${courseId}-en`, {
					body: 'New user has joined course!',
					title: course.nameEn,
					data: { event: 'userJoin', course, newUserId: userId },
				});
			} catch (e) {}
		return { msg: 'OK', isPrivate: course.isPrivate };
	}
}

export default CourseService;
