import { AppError } from '../utils/appError.js';

/**
 * Zod validation middleware
 * @param {import('zod').ZodSchema} schema
 * @param {'body'|'query'|'params'} source
 */
export const validate = (schema, source = 'body') => {
  return (req, res, next) => {
    const result = schema.safeParse(req[source]);

    if (!result.success) {
      const errors = result.error.issues.map((i) => ({
        field: i.path.join('.'),
        message: i.message,
      }));

      return next(
        new AppError({
          statusCode: 422,
          message: errors[0]?.message || 'Validation failed',
          errors,
        })
      );
    }

		req[source] = result.data;
		next();
	};
};
