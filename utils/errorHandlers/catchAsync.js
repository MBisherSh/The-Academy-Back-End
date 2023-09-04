/**
 *
 * @param  {...function} middlewares
 */
export default (...middlewares) =>
	middlewares.map((middleware) => (req, res, next) => {
		const promise = middleware(req, res, next);
		if (promise instanceof Promise) promise.catch(next);
	});
