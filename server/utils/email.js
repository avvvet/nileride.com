'use strict';
const nodemailer = require('nodemailer');
const env = require('../../env');

var send_mail = (user, varification_code) => {
    var transporter = nodemailer.createTransport({
        service: 'gmail',
        host: 'smtp.gmail.com',
        auth: {
               user: 'awetewa@gmail.com',
               pass: 'Awet_003994'
           }
    });
    
    const mailOptions = {
        from: 'dontreply@awetride.com', // sender address
        to: user.email, // list of receivers,
        cc: env.EMAIL_CC_A + ',' + env.EMAIL_CC_B,
        subject: 'New user registered', // Subject line
        html: '<p>Hello, </p> <p>Please send the following varification code to: </p> mobile number : ' + user.mobile +  ' <p> code : ' + varification_code +' </p>'
    };
    
    transporter.sendMail(mailOptions, function (err, info) {
        if(err)
          console.log('email', err)
        else
          console.log('email',info);
     });
    
}
module.exports = {send_mail};