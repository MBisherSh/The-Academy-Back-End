import Category from '../../course/models/category.js';
import Subject from '../../course/models/subject.js';
import User from '../../user/models/user.js';
import Course from '../../course/models/course.js';
import Transaction from '../../user/models/transaction.js';

class StatisticsService {
	static async getGeneralStatistics() {
		const userCount = await User.aggregate([{ $group: { _id: '$role', count: { $sum: 1 } } }]);
		const categoryCount = await Category.count();
		const subjectCount = await Subject.count();
		const courseCount = await Course.aggregate([
			{ $match: { accepted: true } },
			{ $group: { _id: '$isPrivate', count: { $sum: 1 } } },
		]);

		return { userCount, categoryCount, subjectCount, courseCount };
	}

	static async getPaymentsStatistics() {
		const sixMonthsAgo = new Date();
		sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

		const sixMonthsAgoProfits = await Transaction.aggregate([
			{
				$match: {
					type: 'deposit',
					createdAt: { $gte: sixMonthsAgo },
				},
			},
			{
				$group: {
					_id: {
						month: { $month: '$createdAt' },
						year: { $year: '$createdAt' },
					},
					total: { $sum: '$amount' },
				},
			},
			{
				$project: {
					_id: 0,
					month: '$_id.month',
					year: '$_id.year',
					total: 1,
				},
			},
		]);

		const allTimeProfits = await Transaction.aggregate([
			{
				$group: {
					_id: '$type',
					totalAmount: { $sum: '$amount' },
				},
			},
		]);

		return { sixMonthsAgoProfits, allTimeProfits };
	}
}

export default StatisticsService;
