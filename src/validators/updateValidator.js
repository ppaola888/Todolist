import Joi from 'joi';
import { createValidator } from 'express-joi-validation';

const validator = createValidator({ passError: true });

export default [
  validator.body(
    Joi.object().keys({
      name: Joi.string().optional().min(3),
      description: Joi.string().optional().min(3),
      dueDate: Joi.number().min(new Date().getTime()).optional(),
    })
  ),
  validator.params(
    Joi.object().keys({
      id: Joi.string()
        //.regex(/^(?!0+[1-9]+)\d+$/)
        .hex()
        .length(24)
        .required(),
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
