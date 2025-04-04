import Joi from 'joi';
import { createValidator } from 'express-joi-validation';
import { status } from '../const/constant.js';

const validator = createValidator({ passError: true });

export default [
  validator.query(
    Joi.object().keys({
      skip: Joi.number().integer().min(0).default(0).optional(),
      limit: Joi.number().integer().min(1).default(10).optional(),
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
