import Joi from "joi";
import { createValidator } from "express-joi-validation";

const validator = createValidator({ passError: true });

export default [
  validator.body(
    Joi.object().keys({
      email: Joi.string().email({ tlds: { allow: false } }),
      password: Joi.string().required(),
    })
  ),
];
