import Joi from 'joi';
import { createValidator } from 'express-joi-validation';

const validator = createValidator({ passError: true });

export default [
  validator.query(
    Joi.object().keys({
      cursor: Joi.string().hex().length(24).allow(null, '').optional(),
      limit: Joi.number().integer().default(10).optional(),
      direction: Joi.string().valid('next', 'prev').default('next').optional(),
    })
  ),
  validator.headers(
    Joi.object()
      .keys({
        'content-type': Joi.string().valid('application/json').required(),
      })
      .unknown()
  ),
];
