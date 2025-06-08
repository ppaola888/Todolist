import { createValidator } from 'express-joi-validation';
import Joi from 'joi';

const validator = createValidator({ passError: true });

export default [
  validator.body(
    Joi.object().keys({
      name: Joi.string().required().min(3),
      description: Joi.string().required().min(3),
      dueDate: Joi.number().min(new Date().getTime()).optional(),
      status: Joi.string().valid('open', 'closed').optional(),
      userIds: Joi.array().items(Joi.string().length(24).hex()).optional(),
    })
  ),
];
