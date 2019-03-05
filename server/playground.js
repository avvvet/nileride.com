const models = require('./models');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

createAdmin = () => {
    var body = {
        firstName : 'NILE',
        middleName : 'RIDE',
        email : 'admin@nileride.com',
        mobile : '0911003994',
        password : 'awetawet_awet',
        token : ''
    }
    body.token = jwt.sign(body.email, 'JESUSMYHEALER');
    
    let PromiseHashedPassword = new Promise((res, rej) => {
      bcrypt.genSalt(10, (err, salt) => {
          bcrypt.hash(body.password, salt, (err, hash) => {
              if(err) {
                  rej(err);
              } else {
                  body.password = hash;
                  res(body);
              }
          });
      });
    });
   
    PromiseHashedPassword.then((_body) => {
      var admin = models.admins.build(_body);
      admin.save().then((admin)=> {
        console.log('admin token', admin.token);
        }, (err) => {
            console.log('er', err.errors[0]);
        }).catch((e) => {
            console.log('erro', e);
        });
    });
}

createAdmin();