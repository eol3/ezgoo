const nodemailer = require("nodemailer");

async function send(to,subject,html) {
  let transporter = nodemailer.createTransport({
    host: "smtp.dreamhost.com",
    port: 587,
    secure: false, // true for 465, false for other ports
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  });

  let info = await transporter.sendMail({
    from: '"系統自動發送請勿回覆" <no-reply@ezgoo.biz>', // sender address
    to: to, // list of receivers
    subject: subject, // Subject line
    html: html // html body
  });
  // console.log("Message sent: %s", info.messageId);
}

module.exports = {
  'send': send
};