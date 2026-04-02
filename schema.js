const Joi = require("joi");

module.exports.signupSchema = Joi.object({
  username: Joi.string().min(3).required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
});

module.exports.loginSchema = Joi.object({
  username: Joi.string().required(),
  password: Joi.string().required(),
});
