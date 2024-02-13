// 生成 secret key
const crypto = require("crypto");
const SECRET_KEY = crypto.randomBytes(64).toString("hex");
