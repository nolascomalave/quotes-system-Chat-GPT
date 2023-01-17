import nodemailer from 'nodemailer';

/*const accessId = 'AKIA6A6XR5EZHSLBXRVC',
	secretKey = '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';*/

// async..await is not allowed in global scope, must use a wrapper
export default async function mailer(opts) {
  // create reusable transporter object using the default SMTP transport
  let transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
	port: 465,
	secure: true,
	service: 'gmail',
	auth:{
		user:'hiconnection.desarrollo@gmail.com',
		pass:'usitazqkxoodoikq'
	}
  });

  // send mail with defined transport object
  let info = await transporter.sendMail({
  	...opts,
    from: '"New Evolution" <qsgpainting@gmail.com>', // sender address
    /*to: "nolascomalave@hotmail.com", // list of receivers
    subject: "Hello ✔", // Subject line
    text: "Hello world?", // plain text body
    html: "<b>Hello world?</b>", // html body*/
  });
}