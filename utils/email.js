const nodemailer = require('nodemailer');
const pug = require('pug');
const { convert } = require('html-to-text');
// new Email(user, url).sendWelcome();

module.exports = class Email {
  constructor(user, url) {
    this.to = user.email;
    this.firstName = user.name.split(' ')[0];
    this.url = url;
    this.from = process.env.EMAIL_FROM;
  }

  createTransportFunction() {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_FROM,
        pass: process.env.EMAIL_PASSWORD,
      },
    });
    return transporter;
  }
  async send(template, subject) {
    //send the actual email
    //1. Render HTML based on pug template
    const html = pug.renderFile(
      `${__dirname}/../views/emails/${template}.pug`,
      {
        firstName: this.firstName,
        url: this.url,
        subject,
      }
    );
    //2. Define email options
    const mailOptions = {
      from: this.from,
      to: this.to,
      subject,
      html,
      text: convert(html, {}),
      // html:,
    };

    //3. Create a transport and send email
    await this.createTransportFunction().sendMail(mailOptions);
  }
  async sendWelcome() {
    await this.send('welcome', 'Welcome to the Natours Family!');
  }
  async sendForgotPasswordUrl() {
    await this.send(
      'passwordReset',
      'Your password reset token (valid for only 10 min'
    );
  }
};

/*exports.sendEmail = async (options) => {
  //1. Create a transporter
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: '21520358@gm.uit.edu.vn',
      
    },
    // host: process.env.EMAIL_HOST,
    // port: process.env.EMAIL_PORT,
    // service: 'Gmail',
    // auth: {
    //   user: process.env.EMAIL_USERNAME,
    //   pass: process.env.EMAIL_PASSWORD,
    // },
    //Activate in gmail "Less secure app" is no available
  });
  //2. Define email options
  const mailOptions = {
    from: 'hieunganwjk@gmail.com',
    to: options.email,
    subject: options.subject,
    text: options.message,
    // html:
  };
  //3. Send the email
  try {
    await transporter.sendMail(mailOptions);
  } catch (err) {
    console.log(err.message);
    throw new Error('Error when send email');
  }
};*/
