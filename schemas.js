const Joi = require("joi");

module.exports.recipeSchema = Joi.object({
  title: Joi.string().required(),
  ingredients: Joi.string().required(),
  image: Joi.string(),
});
