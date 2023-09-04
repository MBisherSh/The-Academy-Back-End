import Exam from '../models/exam.js';
import UserExam from '../models/userExam.js';
import Course from '../models/course.js';
import { Exception, statusCodes } from '../../../utils/index.js';
import userExam from '../models/userExam.js';
import mongoose from 'mongoose';
import firebase from '../../../utils/firebase/firebase.js';

class ExamService {
	constructor(data) {
		this.nameAr = data.nameAr;
		this.nameEn = data.nameEn;
		this.language = data.language;
		this.startDate = data.startDate;
		this.endDate = data.endDate;
		this.course = data.courseId;
		this.questions = data.questions;
	}

	async create(userId) {
		const course = await Course.findById(this.course);
		if (!course || course.owner != userId) throw new Exception(statusCodes.UNAUTHORIZED);
		if (!this.questions || !this.questions.length) throw new Exception(statusCodes.BAD_REQUEST, 'need questions');

		const exam = await Exam.create(this);
		await exam.populate('course', 'nameAr nameEn image');
		// const socket = socketIOInstance.getInstance();
		// socket.loggedOnNamespace.to(this.course).emit('newExam', { exam, course });
		try {
			await firebase.send(`${this.course}-ar`, {
				title: 'هناك امتحان جديد!',
				body: this.nameAr,
				data: { event: 'newExam', exam },
			});
			await firebase.send(`${this.course}-en`, {
				title: 'There is a new exam!',
				body: this.nameEn,
				data: { event: 'newExam', exam },
			});
		} catch (e) {}
		return { msg: 'created an exam.', exam };
	}

	static async restrictForCourseUsers(courseId, user) {
		const courseObject = await Course.findById(courseId);
		if (user.role < 3) {
			if (!courseObject || (courseObject.owner != user.id && !courseObject.users.includes(user.id)))
				throw new Exception(statusCodes.UNAUTHORIZED);
		}
	}

	static async restrictForCourseOwner(examId, user) {
		const exam = await Exam.findById(examId);
		if (!exam) throw new Exception(statusCodes.ITEM_NOT_FOUND, 'no such exam');
		const course = await Course.findById(exam.course);
		if ((!course || course.owner != user.id) && user.role < 3) {
			throw new Exception(statusCodes.UNAUTHORIZED, 'no access');
		}
	}

	static async restrictForCourseOwnerById(courseId, user) {
		const course = await Course.findById(courseId);
		if ((!course || course.owner != user.id) && user.role < 3) {
			throw new Exception(statusCodes.UNAUTHORIZED, 'no access');
		}
	}

	static async getExam(filters, user) {
		const limit = parseInt(filters.limit);
		const offset = parseInt(filters.offset);
		const courseId = filters.courseId;

		//await ExamService.restrictForCourseUsers(courseId, user);

		let filter = filters.search
			? {
					$or: [
						{ nameAr: { $regex: filters.search, $options: 'i' } },
						{ nameEn: { $regex: filters.search, $options: 'i' } },
					],
			  }
			: {};

		//get specific course exams or get my all exams
		if (courseId) filter.course = mongoose.Types.ObjectId(courseId);
		//filter.course = mongoose.Types.ObjectId('6414ea6f68860652c4055b3a');

		let sort = { startDate: -1, _id: -1 };

		let pipeline = [
			{
				$match: filter,
			},
			{
				$sort: sort,
			},
			{
				$skip: offset,
			},
			{
				$limit: limit,
			},
			{
				$lookup: {
					from: 'courses',
					let: { courseId: '$course' },
					pipeline: [
						{
							$match: {
								$expr: { $eq: ['$_id', '$$courseId'] },
							},
						},
						{
							$project: {
								nameAr: 1,
								nameEn: 1,
								users: 1,
							},
						},
					],
					as: 'course',
				},
			},
			{
				$project: {
					nameAr: 1,
					nameEn: 1,
					language: 1,
					startDate: 1,
					endDate: 1,
					course: {
						$arrayElemAt: ['$course', 0],
					},
				},
			},
		];

		let countPipeline = [
			{
				$match: filter,
			},
			{
				$lookup: {
					from: 'courses',
					let: { courseId: '$course' },
					pipeline: [
						{
							$match: {
								$expr: { $eq: ['$_id', '$$courseId'] },
							},
						},
						{
							$project: {
								users: 1,
							},
						},
					],
					as: 'course',
				},
			},
		];

		if (!courseId) {
			pipeline.push({
				$match: { 'course.users': mongoose.Types.ObjectId(user.id) },
			});
			countPipeline.push({
				$match: { 'course.users': mongoose.Types.ObjectId(user.id) },
			});
		}

		let total;
		if (offset === 0) {
			const count = await Exam.aggregate(countPipeline).count('total').exec();
			if (count && count[0] && count[0].total) total = count[0].total;
			else total = 0;
		}
		const data = await Exam.aggregate(pipeline).exec();
		// const data2 = await Exam.find({}, 'nameAr nameEn language startDate endDate course')
		// 	.sort(sort)
		// 	.skip(offset)
		// 	.limit(limit)
		// 	.populate({
		// 		path: 'course',
		// 		select: 'nameAr nameEn users',
		// 	})
		// 	.exec();
		await Promise.all(
			data.map(async (exam) => {
				exam.userExam = await UserExam.findOne({ exam: exam._id, user: user.id }).exec();
			})
		);
		return { msg: 'OK', total, data };
	}

	static async getById(id, user) {
		let fields =
			'nameAr nameEn language startDate endDate course questions._id questions.text questions.choices._id questions.choices.text';
		const exam = await Exam.findById(id, 'endDate course').populate('course').exec();
		if (!exam) throw new Exception(statusCodes.ITEM_NOT_FOUND, 'no such exam.');
		const courseObject = exam.course;
		if (courseObject && user.role < 3) {
			if (!courseObject || (courseObject.owner != user.id && !courseObject.users.includes(user.id)))
				throw new Exception(statusCodes.UNAUTHORIZED);
		}
		if (courseObject.owner == user.id || Date.now() > exam.endDate) fields += ' questions.choices.isTrueAnswer';
		const data = await Exam.findById(id, fields).populate('course', 'nameAr nameEn').exec();
		return { msg: 'OK', data };
	}

	static async update(id, data, user) {
		await ExamService.restrictForCourseOwner(id, user);
		const exam = await Exam.findByIdAndUpdate(id, data, { returnDocument: 'after', lean: true })
			.populate('course', 'nameAr nameEn')
			.exec();
		return { msg: 'updated an exam.', exam };
	}

	static async delete(id, userId) {
		await ExamService.restrictForCourseOwner(id, userId);
		await Exam.findByIdAndDelete(id);
		return { msg: 'deleted an exam.', id };
	}

	static async attendExam(data, user) {
		const oldUserExam = await UserExam.findOne({ exam: data.examId, user: user.id }).exec();
		if (oldUserExam)
			throw new Exception(statusCodes.DUPLICATED_ENTRY, 'you can not attend an exam more than once.');

		const exam = await Exam.findById(data.examId).exec();
		if (!exam) throw new Exception(statusCodes.ITEM_NOT_FOUND, 'no such exam.');
		await ExamService.restrictForCourseUsers(exam.course, user);
		data.exam = data.examId;
		data.user = user.id;
		let totalCorrect = 0;
		if (data.answers && data.answers.length) {
			data.answers.forEach((answer) => {
				let question = exam.questions.find((q) => q._id == answer.questionId);

				if (question && question.choices && question.choices.length) {
					let choice = question.choices.find((c) => c._id == answer.choiceId);
					if (choice && choice.isTrueAnswer) {
						totalCorrect++;
					}
				}
			});
		}

		data.mark = Math.round(((totalCorrect * 100.0) / exam.questions.length) * 100) / 100.0;

		const userExam = await UserExam.create(data);

		return { msg: 'attended an exam.', userExam };
	}

	static async getUserExamList(filters) {
		const limit = parseInt(filters.limit);
		const offset = parseInt(filters.offset);
		let { examId, startDate, endDate, userId } = filters;
		let filter = {};
		if (examId) filter.exam = examId;
		if (userId) filter.user = userId;

		let createdAt = {};
		if (startDate) createdAt.$gte = startDate;
		if (endDate) createdAt.$lte = endDate;
		if (startDate || endDate) filter.createdAt = createdAt;
		let sort = filters.sort ? filters.sort : '-mark';
		let total;
		if (offset === 0) total = await UserExam.count(filter);
		const data = await UserExam.find(filter)
			.sort(sort)
			.skip(offset)
			.limit(limit)
			.populate('user', 'name profileImage')
			.populate('exam', 'nameAr nameEn')
			.populate('exam.course', 'nameAr nameEn')
			.exec();
		return { msg: 'OK', total, data };
	}

	static async getAllUserExamList(filters, user) {
		if (!filters.examId) throw new Exception(statusCodes.BAD_REQUEST, 'examId needed');
		await ExamService.restrictForCourseOwner(filters.examId, user);
		return await ExamService.getUserExamList(filters);
	}

	static async getUserExamById(id, user) {
		const data = await UserExam.findById(id)
			.populate('user', 'name profileImage')
			.populate('exam', 'nameAr nameEn')
			.populate('exam.course', 'nameAr nameEn')
			.exec();
		if (!data) throw new Exception(statusCodes.ITEM_NOT_FOUND, 'no such userExam.');
		if (user.id != data.user.id) await ExamService.restrictForCourseOwner(data.exam, user.id);
		return { msg: 'OK', data };
	}

	static async getEvaluation(filters, user) {
		const { courseId } = filters;
		const examsCount = await Exam.count({ course: courseId }).exec();
		await ExamService.restrictForCourseOwnerById(courseId, user);
		const data = await userExam
			.aggregate([
				{
					$lookup: {
						from: 'exams',
						localField: 'exam',
						foreignField: '_id',
						as: 'exam',
					},
				},
				{
					$unwind: {
						path: '$exam',
					},
				},
				{ $match: { 'exam.course': mongoose.Types.ObjectId(courseId) } },
				{ $group: { _id: '$user', markSum: { $sum: '$mark' }, examCount: { $sum: 1 } } },
				{
					$lookup: {
						from: 'users',
						localField: '_id',
						foreignField: '_id',
						as: 'user',
					},
				},
				{
					$unwind: {
						path: '$user',
					},
				},
				{ $project: { _id: 0, markSum: 1, user: { _id: 1, name: 1, email: 1, profileImage: 1 } } },
			])
			.exec();

		return { msg: 'OK', examsCount, data };
	}

	static async getMyEvaluation(filters, user) {
		const { courseId } = filters;
		const examsCount = await Exam.count({ course: courseId }).exec();
		const data = await userExam
			.aggregate([
				{
					$lookup: {
						from: 'exams',
						localField: 'exam',
						foreignField: '_id',
						as: 'exam',
					},
				},
				{
					$unwind: {
						path: '$exam',
					},
				},
				{
					$match: {
						'exam.course': mongoose.Types.ObjectId(courseId),
						user: mongoose.Types.ObjectId(user.id),
					},
				},
				{ $group: { _id: '$user', markSum: { $sum: '$mark' }, examCount: { $sum: 1 } } },
				{
					$lookup: {
						from: 'users',
						localField: '_id',
						foreignField: '_id',
						as: 'user',
					},
				},
				{
					$unwind: {
						path: '$user',
					},
				},
				{
					$project: {
						_id: 0,
						markSum: 1,
						examCount: 1,
						user: { _id: 1, name: 1, email: 1, profileImage: 1 },
					},
				},
			])
			.exec();

		return { msg: 'OK', examsCount, data: data[0] ? data[0] : {} };
	}
}

export default ExamService;
