import StatisticsService from '../services/statistics.js';
import { statusCodes } from '../../../utils/index.js';

const getGeneralStatistics = async (req, res) => {
	const result = await StatisticsService.getGeneralStatistics();
	res.status(statusCodes.OK).json(result);
};

const getPaymentsStatistics = async (req, res) => {
	const result = await StatisticsService.getPaymentsStatistics();
	res.status(statusCodes.OK).json(result);
};

export default {
	getGeneralStatistics,
	getPaymentsStatistics,
};
