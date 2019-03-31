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

var send_mail_driver = (user, varification_code) => {
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
        subject: 'New Driver registered', // Subject line
        html: '<p>Hello, </p> <p>Please send the following varification code to: </p> mobile number : ' + user.mobile +  ' <p> code : ' + varification_code +' </p>'
    };
    
    transporter.sendMail(mailOptions, function (err, info) {
        if(err)
          console.log('email', err)
        else
          console.log('email',info);
     });
    
}

var send_mail_driver_change_password = (driver, varification_code) => {
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
      to: driver.email, // list of receivers,
      cc: env.EMAIL_CC_A + ',' + env.EMAIL_CC_B,
      subject: 'Change Password Request', // Subject line
      html: '<p>Hello, </p> <p>You have requested change password at nileride.com. Please use this varification code. </p> mobile number : ' + driver.mobile +  ' <p> code : ' + varification_code +' Well,Jesus Loves you !</p>'
  };
  
  transporter.sendMail(mailOptions, function (err, info) {
      if(err)
        console.log('email', err)
      else
        console.log('email',info);
   });
  
}

var send_mail_ride_request = (driver,user) => {
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
      to: env.EMAIL_CC_A + ',' + env.EMAIL_CC_B,
      subject: 'hallelujah hallelujah hallelujah', // Subject line
      html: '<p>hallelujah, </p> <p> ስትወድ ቡዙ ፡ ስትምር ብዙ ፡  <br> <p> አምላኽይ አመልክሀለሁ </p><p> Jesus Come !</p>'
  };
  
  transporter.sendMail(mailOptions, function (err, info) {
      if(err)
        console.log('email', err)
      else
        console.log('email',info);
   });
  
}
module.exports = {send_mail, send_mail_driver, send_mail_driver_change_password, send_mail_ride_request};