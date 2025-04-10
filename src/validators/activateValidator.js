import Joi from 'joi';
import { createValidator } from 'express-joi-validation';

const validator = createValidator({ passError: true });

export default [
  validator.params(
    Joi.object().keys({
      token: Joi.string().length(10).required(),
    })
  ),
  //validator.headers(
  //  Joi.object()
  //    .keys({
  //      'content-type': Joi.string().valid('application/json').required(),
  //    })
  //    .unknown()
  //),
];
