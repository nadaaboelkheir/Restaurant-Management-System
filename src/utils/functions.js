const jwt = require("jsonwebtoken");
const { JWT_SECRET } = require("../utils/env");

exports.generateToken = (user) => {
  const token = jwt.sign({ id: user.id, role: user.role }, JWT_SECRET, {
    expiresIn: "1d",
  });
  console.log("JWT_SECRET:", JWT_SECRET);

  return token;
};
