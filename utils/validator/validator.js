import Joi from 'joi';
import { Exception, statusCodes } from '../../utils/index.js';

/**
 *
 * @param schemas {Object}
 * @param schemas.type {String['body','query','params']}
 */
const generator = (...schemas) => {
	return async (req, res, next) => {
		await Promise.all(
			schemas.map(async (validation) => {
				const schema = Joi.object(validation.schema);
				schema
					.validateAsync(req[validation.type])
					.then((r) => {})
					.catch((e) => {
						next(new Exception(statusCodes.VALIDATION_ERROR, `${e} in ${validation.type}`));
					});
			})
		);
		next();
	};
};

export default { generator };
