const nodemailer = require("nodemailer");
const {
  EMAIL_HOST,
  EMAIL_PORT,
  EMAIL_USER,
  EMAIL_PASS,
} = require("../utils/env");
const transporter = nodemailer.createTransport({
  host: EMAIL_HOST,
  port: EMAIL_PORT,
  secure: false, // true for 465, false for other ports (587 for Gmail)
  auth: {
    user: EMAIL_USER,
    pass: EMAIL_PASS,
  },
});
exports.sendEmail = (to, subject, text, html) => {
  const mailOptions = {
    from: EMAIL_USER,
    to,
    subject,
    text,
    html,
  };

  return transporter.sendMail(mailOptions);
};
