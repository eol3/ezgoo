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
    from: '"EzGoo 易購網購物平台" <no-reply@ezgoo.biz>', // sender address
    to: to, // list of receivers
    subject: subject, // Subject line
    html: html + footerTemplate // html body
  });
  // console.log("Message sent: %s", info.messageId);
}

var footerTemplate = "<hr/><center>本信件由<a href='" + process.env.BASE_URL +"'>EzGoo</a>系統自動發送，請勿直接回覆</center>"

function apply_store_success_tmp(store_url, store_name) {
  let html = "<p>您申請的商店「" + store_name + "」已經申請成功</p>"
            + "<p><a href='" + store_url + "'>點此前往查看</a></p>"
            + this.footer_tmp
  return html
}

function order_new_store_tmp(mail_title, order_url) {
  let html = "<p>您的商家" + mail_title + "</p>"
            + "<p><a href='" + order_url + "'>點此前往後臺查看</a></p>"
            + this.footer_tmp
  return html
}

function order_new_tmp(mail_title, order_url, store_name) {
  let html = "<h3>" + mail_title + "</h3>"
            + "<p><a href='" + order_url + "'>點此查看訂單</a></p>"
            + "<p>感謝您的購買，我們會盡快出貨</p>"
            + "<i>" + store_name + " 敬上</i>"
            + this.footer_tmp
  return html
}

function order_get_tmp() {
  let html = "<h3>" + mail_title + "</h3>"
            + "<p><a href='" + order_url + "'>點此查看訂單</a></p>"
            + "<p>感謝您的購買，請盡快前往取貨</p>"
            + "<i>" + store_name + " 敬上</i>"
            + this.footer_tmp
  return html
}

module.exports = {
  'send': send,
  'apply_store_success_tmp': apply_store_success_tmp,
  'order_new_store_tmp': order_new_store_tmp,
  'order_new_tmp': order_new_tmp,
  'order_get_tmp': order_get_tmp,
  'footerTemplate': footerTemplate
};