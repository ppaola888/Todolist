import { createValidator } from 'express-joi-validation';
import Joi from 'joi';

const validator = createValidator({ passError: true });

export default [
  validator.query(
    Joi.object().keys({
      text: Joi.string().allow('').min(3).optional(),
      cursor: Joi.string().hex().length(24).allow(null, '').optional(),
      limit: Joi.number().integer().min(1).default(3).optional(),
      direction: Joi.string().valid('next', 'prev').default('next').optional(),
      sortBy: Joi.string().valid('_id', 'username').optional(),
    })
  ),
  validator.headers(
    Joi.object()
      .keys({
        'content-type': Joi.string().valid('application/json').optional(),
      })
      .unknown()
  ),
];
