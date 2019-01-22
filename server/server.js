
const fs = require('fs');
const path = require('path');
const http = require('http');
const https = require('https');
const express = require('express');
const bcrypt = require('bcryptjs');
const bodyParser = require('body-parser');
const socketIO = require('socket.io');
const models = require('./models');
const Sequelize = require('sequelize');
const {SHA256} = require('crypto-js');
const jwt = require('jsonwebtoken');
//const publicPath = path.join(__dirname, '../client/build');
const port = process.env.PORT || 4000;
const publicPath = path.join(__dirname, '../client/public');
var validator = require('validator');
var {authDriver} = require('./middleware/_auth_driver');
var {authUser} = require('./middleware/_auth_user');
var {send_mail, send_mail_driver} = require('./utils/email');
var {setUserVerify, setDriverVerify} = require('./utils/verify');
var _ = require('lodash');
var proxy = require('express-http-proxy');

const env = require('../env');

var app = express();

var httpServer;
var httpsServer;
// Certificate
if(env.NODE_ENV === 'production') {
    const privateKey = fs.readFileSync('/etc/letsencrypt/live/nileride.com/privkey.pem', 'utf8');
    const certificate = fs.readFileSync('/etc/letsencrypt/live/nileride.com/cert.pem', 'utf8');
    const ca = fs.readFileSync('/etc/letsencrypt/live/nileride.com/chain.pem', 'utf8');
    
    const credentials = {
        key: privateKey,
        cert: certificate,
        ca: ca
    };   
    
    // Starting both http & https servers
    httpServer = http.createServer(app);
    httpsServer = https.createServer(credentials, app);
} else {
    httpServer = http.createServer(app);
}


//var server = http.createServer(app);
var io = socketIO(httpServer);

const clientPath = path.join(__dirname, '../client/build');
app.use(express.static(clientPath, { dotfiles: 'allow' } ));


app.get('/', (req, res)=>{
  res.sendFile(path.join(clientPath, '/index.html'));
});

app.get('/driver', (req, res)=>{
    res.sendFile(path.join(clientPath, '/index.html'));
});

app.get('/driver/login', (req, res)=>{
    res.sendFile(path.join(clientPath, '/index.html'));
});


console.log('client path', clientPath);
app.use(bodyParser.json());
//app.use(express.static('static'));s
app.use(express.static(publicPath, { dotfiles: 'allow' } ));

console.log('path', publicPath);


app.get('/driver/ride', authDriver, (req, res) => {
   res.send(req.driver);
});

// An api endpoint that returns a short list of items
app.get('/api/getList', (req,res) => {
    var list = ["item1", "item2", "item3"];
    res.json(list);
    console.log('Sent list of items');
});

app.post('/api/postList', (req, res) => {
    console.log('post', req.body);
    res.json(req.body);
});

app.post('/user/updateLocation', (req, res) => {
    var token = req.header('x-auth');
    var _latlng = Sequelize.fn('ST_GeomFromText', req.body._latlng);
    var decoded;
    try {
        decoded = jwt.verify(token, 'JESUSMYHEALER');
        models.users.update(
            { currentLocation: _latlng },
            { where: { email: decoded } }
          ).then(result => {
             console.log('user location updated', result);
          }).catch(err => {
             console.log('user location update error', err);
          });
    } catch (e) {
      res.status(401).send();
    }
});

app.get('/user/get', (req, res) => {
    var token = req.header('x-auth');
    console.log('yesyes',token);
    var decoded;
    try {
        decoded = jwt.verify(token, 'JESUSMYHEALER');
        models.users.findOne({ where: {email: decoded} }).then(user => {
          console.log('userrrrrrrrrrrr', user);
        if(!user) {
            res.sendStatus(401).send();
        }
          res.send(_.pick(user,['firstName', 'middleName', 'email', 'mobile', 'token', 'verified', 'status']));  
        });
    } catch (e) {
      res.status(401).send();
    }
});

//user-apply
app.post('/user/apply', (req, res) => {
    var body = _.pick(req.body, ['firstName', 'middleName', 'email', 'mobile', 'gender', 'password', 'token']);
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
      var users = models.users.build(_body);
      users.save().then((user)=> {
        res.header('x-auth', user.token).send(user);
        setUserVerify(body.token, 'mobile', 'user', 1, function(varification_token){
            send_mail(user, varification_token);
        }); 
        }, (err) => {
            res.status(400).send(err);
        }).catch((e) => {
            res.status(400).send(e);
        });
    });
});

app.post('/user/mobile_verification', (req, res) => {
    var body = _.pick(req.body, ['varification_code']);
    var token = req.header('x-auth');
    var sequelize = models.sequelize;
    return sequelize.transaction(function (t) {
        return models.verifications.findOne({
            where : {email: token, verify_type: 'mobile', user_type:'user', status: 1, verification_token: body.varification_code}  
        }, {transaction: t}).then( (v) => {
            if(v){
              return models.verifications.update(
                    { status: 0 },
                    { where : {email: token, verify_type: 'mobile', user_type:'user', status: 1} } ,
                    {transaction: t}
                  ).then(result => {
                     if(result){
                         var decoded = jwt.verify(token, 'JESUSMYHEALER');
                         return models.users.update(
                            { verified: true },
                            { where : { email: decoded } } ,
                            {transaction: t}
                         ).then((_user)=>{
                             if(_user){
                                 return _user
                             } else {
                                 throw new Error('in transaction user not found on varification update');
                             }
                         })
                     }
                  }).catch(err => {
                    return err;
                  });
            } else {
                throw new Error('varification not found');
            }
        });
      
      }).then(function (result) {
          res.send(result);
          console.log('trsancation varified commited   tttttttttttttttttttttttttttttt ', result);
        // Transaction has been committed
        // result is whatever the result of the promise chain returned to the transaction callback
      }).catch(function (err) {
        res.sendStatus(400).send();
        console.log('trsancation varified rollback ', err);
        // Transaction has been rolled back
        // err is whatever rejected the promise chain returned to the transaction callback
      });
});


app.post('/user/login', (req, res) => {
    var body = _.pick(req.body, ['email', 'password']);
    models.users.findOne({ where : {email: body.email}}).then( (user) => {
       if(!user) {
          res.status(401).send();
       }
       
       let PromisePasswordCompare = new Promise((resolve, reject) => {
         bcrypt.compare(body.password, user.password, (err, compareFlag) => {
             if(err){
                 reject(err);
             } else {
                 resolve(compareFlag);
             }
         });
       });
       
       PromisePasswordCompare.then((compareFlag) => {
           if(compareFlag === true){
              res.header('x-auth', user.token).send(user);
           } else {
              res.status(401).send();
           }
       },(r) => {
           console.log('rrr', r);
       });
  
    });
   
});

app.post('/ride/rideRequest', authUser, (req, res) => {
   let body = _.pick(req.body, ['user_id','driver_id', 'pickup_latlng', 'dropoff_latlng', 'route_distance', 'route_time', 'route_price', 'status']);
   let _pickup_latlng = Sequelize.fn('ST_GeomFromText', req.body.pickup_latlng);
   var _dropoff_latlng = Sequelize.fn('ST_GeomFromText', req.body.dropoff_latlng);

   body.pickup_latlng = _pickup_latlng;
   body.dropoff_latlng = _dropoff_latlng;
   
    const getNearestDrivers = async (latlng) => {
       let drivers = null;
       var distance = Sequelize.fn('ST_Distance_Sphere', Sequelize.literal('currentLocation'), latlng);
       await models.drivers.findAll({ 
          attributes: ['token','currentLocation', 'firstName',[Sequelize.fn('ST_Distance_Sphere', Sequelize.literal('currentLocation'), _pickup_latlng),'distance']],
          where: {verified: 1, status: 0},
          order: distance,
          limit: 3,
          raw: true,
          logging: console.log
        }).then(_drivers => {
           drivers = _drivers;
        });
      return drivers;
    }

    const request_driver = (driver_token) => {
        var sequelize = models.sequelize;
        return sequelize.transaction(function (t) { 
            return models.riderequests.findOne({
                where : {driver_id: driver_token, status: 1}  
                }, {transaction: t}).then((_ride) => {
                    console.log('drrrrrrrrrrrrrrrrrr 22222222', driver_token);
                    if(_.isNull(_ride)){
                        body.driver_id = driver_token;
                        const ride_request = models.riderequests.build(body, {transaction: t}); 
                        return ride_request.save().then((ride) => {
                            return ride;
                        }).catch(err => {
                            throw new Error('t: save error')
                        });
                    } else {
                        return null;
                    }
                });
        }).then(function (result) {
            return result;
            console.log('trsancation commited   tttttttttttttttttttttttttttttt ', result);
         
        }).catch(function (err) {
            return null ;
            console.log('trsancation rollback ', err);
           
        });   
    }

    const ride_request = async () => {
        const drivers = await getNearestDrivers(_pickup_latlng);
        let _r = null;
        let i = 0 ;
        async function processArray(drivers){
            for(let driver of drivers) {
                i++;
                console.log('current driverrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrr ', driver.token, i);
                const  _ride = await request_driver(driver.token);
                if(!_.isNull(_ride)) {
                    _r =_ride;
                    break;
                } else {
                    _r = null
                }
            }
        }
        
        await processArray(drivers);

        console.log('gggggggggggggggggggggggggggggggggggggggggg', i);
         
        if(_.isNull(_r)){
            res.send(null);
        } else {
            res.send(_r);
        }

    }

    ride_request();

});

app.post('/ride/rideRequest2', authUser, (req, res) => {
   var body = _.pick(req.body, ['user_id','driver_id', 'pickup_latlng', 'dropoff_latlng', 'route_distance', 'route_time', 'route_price', 'status']);
   var _pickup_latlng = Sequelize.fn('ST_GeomFromText', req.body.pickup_latlng);
   var _dropoff_latlng = Sequelize.fn('ST_GeomFromText', req.body.dropoff_latlng);

   body.pickup_latlng = _pickup_latlng;
   body.dropoff_latlng = _dropoff_latlng;
   
   var distance = Sequelize.fn('ST_Distance_Sphere', Sequelize.literal('currentLocation'), _pickup_latlng);
   var sequelize = models.sequelize;
   
   return models.riderequests.findOne({
    where : {driver_id: driver.token, status: 1}  
    }, {transaction: t}).then((_ride) => {
        console.log('drrrrrrrrrrrrrrrrrr 22222222', driver.token,i);
        if(_.isNull(_ride)){
            _flag_found = true;
            body.driver_id = driver.token;
            const ride_request = models.riderequests.build(body, {transaction: t}); 
            return ride_request.save().then((ride) => {
                return ride;
            }).catch(err => {
                throw new Error('t: save error')
            });
        }
    });

   
});

app.post('/ride/accepted', (req, res) => {
    var body = _.pick(req.body, ['status']);
    var token = req.header('x-auth');
    var sequelize = models.sequelize;
    return sequelize.transaction(function (t) {
        return models.riderequests.findOne({
            where : {driver_id: token, status: 1}  
        }, {transaction: t}).then( (ride) => {
            if(ride){
              return models.riderequests.update(
                    { status: 7 },
                    { where: { driver_id: token, status: 1} } ,
                    {transaction: t}
                  ).then(result => {
                     if(result){
                         return models.riderequests.findOne({
                             where : {driver_id: token, status: 7}
                         }, {transaction: t}).then((_ride)=>{
                             if(_ride){
                                 return models.drivers.update(
                                    { status: 1 },
                                    { where: {token: token, status: 0} } ,
                                    {transaction: t}
                                 ).then(r => {
                                     if(r){
                                        return _ride;
                                     } else {
                                        throw new Error('transaction driver status not updated');
                                     }
                                 })
                             } else {
                                 throw new Error('transaction ride not found');
                             }
                         })
                     }
                  }).catch(err => {
                    return err;
                  });
            } else {
                throw new Error('ride not found');
            }
        });
      
      }).then(function (result) {
          res.send(result);
          console.log('trsancation commited   tttttttttttttttttttttttttttttt ', result);
        // Transaction has been committed
        // result is whatever the result of the promise chain returned to the transaction callback
      }).catch(function (err) {
        res.sendStatus(400).send();
        console.log('trsancation rollback ', err);
        // Transaction has been rolled back
        // err is whatever rejected the promise chain returned to the transaction callback
      });
});

app.post('/ride/paxFound', (req, res) => {
    var body = _.pick(req.body, ['status']);
    var token = req.header('x-auth');
    var sequelize = models.sequelize;
    return sequelize.transaction(function (t) {
        return models.riderequests.findOne({
            where : {driver_id: token, status: 7}  
        }, {transaction: t}).then( (ride) => {
            if(ride){
              return models.riderequests.update(
                    { status: 77 },
                    { where: { driver_id: token, status: 7} } ,
                    {transaction: t}
                  ).then(result => {
                     if(result){
                         return ride;  /// update successfull return ride
                     } else {
                         throw new Error('ride not found after update');
                     }
                  }).catch(err => {
                    return err;
                  });
            } else {
                throw new Error('ride not found');
            }
        });
      
      }).then(function (result) {
          res.send(result);
          console.log('trsancation commited   tttttttttttttttttttttttttttttt ', result);
      }).catch(function (err) {
        res.sendStatus(400).send();
        console.log('trsancation rollback ', err);
      });
});

app.post('/ride/completed', (req, res) => {
    var body = _.pick(req.body, ['status']);
    var token = req.header('x-auth');
    var sequelize = models.sequelize;
    return sequelize.transaction(function (t) {
        return models.riderequests.findOne({
            where : {driver_id: token, status: 77}  
        }, {transaction: t}).then( (ride) => {
            if(ride){
              return models.riderequests.update(
                    { status: 777 },
                    { where: { driver_id: token, status: 77 } } ,
                    {transaction: t}
                  ).then(result => {
                     //return result;
                     var paymentObj = {
                         'pay_type': 1,
                         'driver_id': ride.driver_id,
                         'ride_id': ride.id,
                         'amount': ride.route_price,
                         'charge_dr': 0.00,
                         'charge_cr': ride.route_price * 0.2,
                         'status': 0
                     }
                     var body = _.pick(paymentObj, ['pay_type','driver_id', 'ride_id', 'amount', 'charge_dr','charge_cr','status']);
                     const payment = models.payments.build(body, {transaction: t}); 
                    return payment.save().then((payment_data) => {
                        console.log('payment data ', payment_data);
                        return models.drivers.update(
                            { status: 0 },
                            { where: {token: token, status: 1 } },
                            {transaction: t}
                        ).then(r => {
                            if(r){
                                return payment_data;
                            } else {
                                throw new Error('Transaction driver not updated');
                            }
                        })
                     }).catch(err => {
                         throw new Error(err);
                     });
                  }).catch(err => {
                    return err;
                  });
            } else {
                throw new Error('ride not found');
            }
        });
      
      }).then(function (result) {
          res.send(result);
          console.log('ride completed t commited', result);
        // Transaction has been committed
        // result is whatever the result of the promise chain returned to the transaction callback
      }).catch(function (err) {
        res.sendStatus(400).send();
        console.log('ride completed rollback ', err);
        // Transaction has been rolled back
        // err is whatever rejected the promise chain returned to the transaction callback
      });
});

app.post('/ride/check_ride_user', (req, res) => {
    var body = _.pick(req.body, ['status']);
    var token = req.header('x-auth');
    //THANK YOU JESUS THANK YOU 
    const Op = Sequelize.Op;
    models.riderequests.findOne({ 
        where : {user_id: token, status: {[Op.ne]: 777}},
        include: [
            { model: models.drivers,
              attributes: ['firstName','middleName','mobile', 'plateNo', 'currentLocation']
            }
        ]
    }).then( (ride) => {
        if(ride){
          res.send(ride);  
        } else {
          var ride = {
              status : 0  // custom status = no ride on progress 
          }
          res.send(ride);
        }
    });
});

app.post('/ride/check_ride_driver', (req, res) => {
    var body = _.pick(req.body, ['status']);
    var token = req.header('x-auth');

    models.riderequests.findOne({ 
        where : {driver_id: token, status: body.status},
        include: [
            { model: models.users,
              attributes: ['firstName','middleName','mobile']
            }
        ]
    }).then( (ride) => {
      console.log('ride request for this driver', ride);
       res.send(ride);
    });
   
});

//driver end point
app.post('/driver/getRidesInfo', (req, res) => {
    var body = _.pick(req.body, ['status']);
    var token = req.header('x-auth');

    models.payments.findAll({ 
        group: ['payments.driver_id'],
        attributes:  [
           'payments.driver_id', 
          [Sequelize.fn('sum', Sequelize.col('amount')), 'amount'], 
          [Sequelize.fn('sum', Sequelize.col('charge_dr')), 'charge_dr'],
          [Sequelize.fn('sum', Sequelize.col('charge_cr')), 'charge_cr'],
          [Sequelize.literal('SUM(charge_cr) - SUM(charge_dr)'), 'charge'],
          [Sequelize.fn('count', Sequelize.col('payments.id')), 'total_rides']
        ],
        where : {'driver_id': token},
        include: [
            { 
                model: models.drivers,
                attributes: ['firstName','middleName','mobile']
            }
        ]
    }).then( (data) => {
      console.log('ride request for this driver', data);
       res.send(data);
    });
   
});



app.post('/driver/login', (req, res) => {
  console.log('reqqqqq', req.body);

  var body = _.pick(req.body, ['email', 'password']);
  console.log('data', body);
  //lets get the driver by email
  models.drivers.findOne({ where : {email: body.email}}).then( (driver) => {
    console.log('driveeeeerrr', driver);
     if(!driver) {
        res.status(401).send();
     }
     
     let PromisePasswordCompare = new Promise((resolve, reject) => {
       bcrypt.compare(body.password, driver.password, (err, compareFlag) => {
           if(err){
               reject(err);
           } else {
               resolve(compareFlag);
           }
       });
     });
     
     PromisePasswordCompare.then((compareFlag) => {
         if(compareFlag === true){
            res.header('x-auth', driver.token).send(driver);
         } else {
            res.status(401).send();
         }
     },(r) => {
         console.log('rrr', r);

     });

  });
 
});

app.post('/driver', (req, res) => {
  var body = _.pick(req.body, ['email', 'password', 'token']);
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
    var driver = models.drivers.build(_body);
    driver.save().then((driver)=> {
        res.header('x-auth', driver.token).send(driver);
      }, (err) => {
          console.log('er', err.errors[0]);
          res.status(400).send(err.errors[0]);
      }).catch((e) => {
          res.status(400).send(e);
      });
  });
});

//driver location updatet
app.post('/driver/updateLocation', (req, res) => {
    var token = req.header('x-auth');
    var _latlng = Sequelize.fn('ST_GeomFromText', req.body._latlng);
    var decoded;
    try {
        decoded = jwt.verify(token, 'JESUSMYHEALER');
        models.drivers.update(
            { currentLocation: _latlng },
            { where: { email: decoded } }
          ).then(result => {
            res.send(result);
             console.log('driver location updated', result);
          }).catch(err => {
             console.log('update error', err);
          });
    } catch (e) {
      res.status(401).send();
    }
});

//get nearest driver
app.post('/drivers/nearest', (req, res) => {
    var _pickup_latlng = Sequelize.fn('ST_GeomFromText', req.body.pickup_latlng);
    console.log('pickup_latlng is ', _pickup_latlng);
    var distance = Sequelize.fn('ST_Distance_Sphere', Sequelize.literal('currentLocation'), _pickup_latlng);
    models.drivers.findAll({ 
      attributes: ['token','currentLocation', 'firstName',[Sequelize.fn('ST_Distance_Sphere', Sequelize.literal('currentLocation'), _pickup_latlng),'distance']],
      where: {verified: 1, status: 0},
      order: distance,
      limit: 3,
      logging: console.log
    }).then(drivers => {
       res.send(drivers);
    });
});

//get drivers location  status 0 = waiting for job
app.get('/drivers', (req, res) => {
    models.drivers.findAll({ 
        attributes: ['firstName', 'middleName', 'mobile', 'plateNO', 'currentLocation'],
        where: {verified: 1, status: 0}, 
    }).then(drivers => {
        let data = [];
        var tmpObj;
        let objDrivers = drivers.map(driver => {
             tmpObj = {
                 firstName: driver.firstName,
                 middleName: driver.middleName,
                 mobile: driver.mobile,
                 plateNo: driver.plaleNO,
                 currentLocation : driver.currentLocation.coordinates
             }
            return tmpObj;
            
        });
       res.send(objDrivers);
    });
});


//driver-get
app.get('/driver/get', (req, res) => {
    var token = req.header('x-auth');
    console.log('yesyes',token);
    var decoded;
    try {
        decoded = jwt.verify(token, 'JESUSMYHEALER');
        models.drivers.findOne({ where: {email: decoded} }).then(driver => {
          if(!driver) {
            res.sendStatus(401).send();
          }
          res.send(_.pick(driver,['firstName', 'middleName', 'email', 'mobile', 'gender', 'verified', 'isCarRegistered', 'isCarVerified', 'status']));  
        });
    } catch (e) {
      res.status(401).send();
    }
});

//driver-apply
app.post('/driver/apply', (req, res) => {
    var body = _.pick(req.body, ['firstName', 'middleName', 'email', 'mobile', 'plateNo', 'password', 'token']);
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
        console.log('new body', _body);
      var driver = models.drivers.build(_body);
      driver.save().then((driver)=> {
        res.header('x-auth', driver.token).send(driver);
        setDriverVerify(body.token, 'mobile', 'driver', 1, function(varification_token){
          send_mail_driver(driver, varification_token)
        });
        }, (err) => {
            console.log('er', err.errors[0]);
            res.status(400).send(err.errors[0]);
        }).catch((e) => {
            res.status(400).send(e);
        });
    });
});

app.post('/driver/mobile_verification', (req, res) => {
    var body = _.pick(req.body, ['varification_code']);
    var token = req.header('x-auth');
    var sequelize = models.sequelize;
    return sequelize.transaction(function (t) {
        return models.verifications.findOne({
            where : {email: token, verify_type: 'mobile', user_type:'driver', status: 1, verification_token: body.varification_code}  
        }, {transaction: t}).then( (v) => {
            if(v){
              return models.verifications.update(
                    { status: 0 },
                    { where : {email: token, verify_type: 'mobile', user_type:'driver', status: 1} } ,
                    {transaction: t}
                  ).then(result => {
                     if(result){
                         var decoded = jwt.verify(token, 'JESUSMYHEALER');
                         return models.drivers.update(
                            { verified: true },
                            { where : { email: decoded } } ,
                            {transaction: t}
                         ).then((_driver)=>{
                             if(_driver){
                                 return _driver
                             } else {
                                 throw new Error('in transaction driver not found on varification update');
                             }
                         })
                     }
                  }).catch(err => {
                    return err;
                  });
            } else {
                throw new Error('varification not found');
            }
        });
      
      }).then(function (result) {
          res.send(result);
          console.log('trsancation varified driver commited   tttttttttttttttttttttttttttttt ', result);
        // Transaction has been committed
        // result is whatever the result of the promise chain returned to the transaction callback
      }).catch(function (err) {
        res.sendStatus(400).send();
        console.log('trsancation driver varified rollback ', err);
        // Transaction has been rolled back
        // err is whatever rejected the promise chain returned to the transaction callback
      });
});


app.post('driver/status', (req, res) => {
    console.log('online_status', req.body);
    var driver_id = req.body.driver.driver_id;
    //lets find the the driver id
    models.drivers.findById(driver_id).then(driver => {
        console.log(driver);
    });

    //update it 
    task.title = 'foooo'
    task.description = 'baaaaaar'
    task.save({fields: ['title']}).then(() => {
    // title will now be 'foooo' but description is the very same as before
    })
});

app.post('/car/register', (req, res) => {
    var token = req.header('x-auth');
    var sequelize = models.sequelize;
    return sequelize.transaction(function (t) {
        return models.cars.findOne({
            where : {driver_id: token, status: 1}  
        }, {transaction: t}).then( (car) => {
            if(car){
              return models.cars.update(
                    { status: 0 },
                    { where : {driver_id: token, status: 1} } ,
                    {transaction: t}
                  ).then((_cars) => {
                     if(_cars){
                       var body = req.body;
                       body = _.pick(body, ['model','model_year','code','plate_no']);
                       body.driver_id = token;   //I know man can do nothing - only God 
                       const car = models.cars.build(body); 
                       return car.save({transaction : t}).then((_car) => {
                           if(_car){
                               return models.drivers.update(
                                { isCarRegistered : true},
                                { where : { token : token}},
                                {transaction : t}
                               ).then( (_driver) => {
                                   if(_driver[0] === 1){
                                       return _driver;
                                   } else {
                                       throw new Error('driver on transaction not updated');
                                   }
                               }).catch(err => {
                                throw new Error(err);
                               });
                           }
                        }).catch(err => {
                            throw new Error(err);
                        });
                     } else {
                         throw new Error('Update error');
                     }
                  }).catch(err => {
                    return err;
                  });
            } else {
                var body = req.body;
                body = _.pick(body, ['model','model_year','code','plate_no']);
                body.driver_id = token;
                const car = models.cars.build(body); 
                return car.save({transaction : t}).then((_car) => {
                    if(_car){
                        return models.drivers.update(
                            { isCarRegistered : true},
                            { where : { token : token}},
                            {transaction : t}
                           ).then( (_driver) => {
                               if(_driver[0] === 1){
                                   return _driver;
                               } else {
                                   throw new Error('driver on transaction not updated');
                               }
                           }).catch(err => {
                            throw new Error(err);
                           });
                    } else {
                        throw new Error('car intransaction not registered ')
                    }
                 }).catch(err => {
                     throw new Error(err);
                 });
            }
        });
      
      }).then(function (result) {
          res.send(result);
          console.log('trsancation car registation commited   tttttttttttttttttttttttttttttt ', result);
      }).catch(function (err) {
        res.sendStatus(400).send();
        console.log('trsancation car registration rollback ', err);
      });
});

io.on('connect', (socket)=> {
   console.log('Client connected', socket.id);
   
   socket.on('join', (_obj, callback) => {
     if(_obj.driver_id === '') {
         callback('driver not valid');
     }

     socket.join('4141');
   });  
   
});


driveRequest = () => {
    io.on('connect', (socket) => {
        io.to('4141').emit('driveRequest', {
            msg : 'test test'
        });
    });
}


if(env.NODE_ENV === 'production') {
    httpServer.listen(4000, () => {
        console.log('Express server is up on port 4000');
    });
    
    // httpsServer.listen(443, () => {
    // 	console.log('HTTPS Server running on port 443');
    // });
} else {
    httpServer.listen(port, () => {
        console.log(`Express server is up on port ${port}`);
    });
}


// server.listen(port, () => {
//     console.log(`Express server is up on port ${port}`);
// });