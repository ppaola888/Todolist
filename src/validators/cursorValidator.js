import Joi from 'joi';
import { createValidator } from 'express-joi-validation';
import { status } from '../const/constant.js';

const validator = createValidator({ passError: true });

export default [
  validator.query(
    Joi.object().keys({
      cursor: Joi.string().hex().length(24).allow(null, '').optional(),
      limit: Joi.number().integer().default(10).optional(),
      direction: Joi.string().valid('next', 'prev').default('next').optional(),
      status: [
        Joi.array()
          .items(Joi.string().valid(status.OPEN, status.COMPLETED, status.DELETED, status.ARCHIVED))
          .optional(),
        Joi.string().valid(status.OPEN, status.COMPLETED, status.DELETED, status.ARCHIVED).optional(),
      ],
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
