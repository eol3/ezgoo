const nodemailer = require("nodemailer");

async function send(to,subject,html) {
  let transporter = nodemailer.createTransport({
    host: "smtp.dreamhost.com",
    port: 587,
    secure: false, // true for 465, false for other ports
    auth: {
      user: 'no-reply@helloavgirls.com',
      pass: '7P-ia7pz'
    }
  });

  let info = await transporter.sendMail({
    from: '"Hello! Av Girls" <no-reply@helloavgirls.com>', // sender address
    to: to, // list of receivers
    subject: subject, // Subject line
    html: html + this.footer_tmp // html body
  });
  // console.log("Message sent: %s", info.messageId);
}

var footer_tmp = "<hr/><center>本信件由<a href='" + process.env.BASE_URL +"'>Hello! Av Girls</a>系統自動發送，請勿直接回覆。"
                + "如有任何疑問請寫信至<a href='mailto:support@helloavgirls.com'>support@helloavgirls.com</a></center>"

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
  'footer_tmp': footer_tmp
};