import Joi from 'joi';
import { createValidator } from 'express-joi-validation';

const validator = createValidator({ passError: true });

export default [
  validator.body(
    Joi.object().keys({
      email: Joi.string()
        .email({ tlds: { allow: false } })
        .required(),
      password: Joi.string().required(),
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
