const joi = require("joi");

const UserRoleSchema = joi.string().valid("user", "admin").default("user");
module.exports = UserRoleSchema;
