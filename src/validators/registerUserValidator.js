import { createValidator } from 'express-joi-validation';
import Joi from 'joi';

const validator = createValidator({ passError: true });

export default [
  validator.body(
    Joi.object().keys({
      email: Joi.string()
        .email({ tlds: { allow: false } })
        .required(),
      password: Joi.string().required(),
      username: Joi.string()
        .pattern(/^[a-zA-Z0-9 ]+$/)
        .min(3)
        .max(30)
        .required(),
    })
  ),
];
