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
const multer = require('multer');
const sharp = require('sharp');
//const publicPath = path.join(__dirname, '../client/build');
const port = process.env.PORT || 4000;
const publicPath = path.join(__dirname, '../client/public');
const publicPathProfileUser = path.join(__dirname, '../client/public/assets/profile/user');
const publicPathProfileDriver = path.join(__dirname, '../client/public/assets/profile/driver');
const assets_path = path.join(__dirname, '../client/public/assets/profile');
var _ = require('lodash');
var validator = require('validator');
var Busboy = require('busboy');
var {authDriver} = require('./middleware/_auth_driver');
var {authUser} = require('./middleware/_auth_user');
var {send_mail, send_mail_driver, send_mail_user_change_password, send_mail_driver_change_password} = require('./utils/email');
var {setUserVerify, setDriverVerify} = require('./utils/verify');
const {ride_control_auto, ride_request} = require('./utils/ride_control');
const {add_trafic, get_trafic} = require('./utils/trafics');

var jump_this_driver = [];

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

setInterval(() => {
    ride_control_auto();
}, 4000); 



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

app.get('/user', (req, res)=>{
    res.sendFile(path.join(clientPath, '/index.html'));
});

app.get('/user/login', (req, res)=>{
    res.sendFile(path.join(clientPath, '/index.html'));
});

app.get('/admin', (req, res)=>{
    res.sendFile(path.join(clientPath, '/index.html'));
});

app.get('/admin/control_panel', (req, res)=>{
    res.sendFile(path.join(clientPath, '/index.html'));
});

app.get('/playground', (req, res)=>{
    res.sendFile(path.join(clientPath, '/index.html'));
});

app.get('/assets/pdf/*', (req, res)=>{
    res.sendFile(path.join(clientPath, '/index.html'));
});

app.get('/notes', (req, res)=>{
    res.sendFile(path.join(clientPath, '/index.html'));
});

app.get('/msg', (req, res)=>{
    res.sendFile(path.join(clientPath, '/index.html'));
});

app.get('/ride/id', (req, res)=>{
    res.sendFile(path.join(clientPath, '/index.html'));
});


console.log('client path', clientPath);
app.use(bodyParser.json());
//app.use(express.static('static'));s
app.use(express.static(publicPath, { dotfiles: 'allow' } ));

console.log('path', publicPath);

const storage_driver = multer.diskStorage({
    destination: publicPathProfileDriver,
    filename: function(req, file, cb){
       cb(null,"driver-" + Date.now() + path.extname(file.originalname));
    }
});

const storage_user = multer.diskStorage({
    destination: publicPathProfileUser,
    filename: function(req, file, cb){
       cb(null,"user-" + Date.now() + path.extname(file.originalname));
    }
});

const upload_driver = multer({
    storage: storage_driver
}).single("myImage");

const upload_user = multer({
    storage: storage_user
}).single("myImage");

app.post('/user/profile', function (req, res) {
    var token = req.header('x-auth');
    var busboy = new Busboy({ headers: req.headers });
    var f = null;
    busboy.on('file', function(fieldname, file, filename, encoding, mimetype) {
      f =  "user-" + Date.now() + filename;
      var saveTo = path.join(assets_path + "/user_img", f);
      console.log('Uploading: ' + saveTo);
      file.pipe(fs.createWriteStream(saveTo));
    });
    busboy.on('finish', function() {
        if(!_.isNull(f)) {
            //lets resize and crop the image using sharp
            let inputFile = assets_path + "/user_img/" + f;
            let outputFile = assets_path + "/user/" + f;
            sharp(inputFile).resize({ height: 100, width: 100, fit : 'cover'}).toFile(outputFile)
            .then(function(newFileInfo) {
              // newFileInfo holds the output file properties
              console.log("Success", newFileInfo);
              models.users.update(
                { profile : f, hasProfile : true},
                { where: { token: token } }
              ).then(user => {
                //res.writeHead(200, user);
                res.send(user);
                res.end("Jesus is my light");
              }).catch(err => {
                res.sendStatus(400).send();
              });
            })
            .catch(function(err) {
                var data = [];
                data.push(-1);   //image faild try again
                res.send(data);
                console.log("Error occured",err);
            });
           } else {
               res.sendStatus(400).send();
           } 
      console.log('Upload complete');

    });
    return req.pipe(busboy);
});

app.post('/driver/profile', function (req, res) {
    var token = req.header('x-auth');
    var busboy = new Busboy({ headers: req.headers });
    var f = null;
    busboy.on('file', function(fieldname, file, filename, encoding, mimetype) {
      f =  "driver-" + Date.now() + filename;
      var saveTo = path.join(assets_path + "/driver_img", f);
      console.log('Uploading: ' + saveTo);
      file.pipe(fs.createWriteStream(saveTo));
    });
    busboy.on('finish', function() {
        if(!_.isNull(f)) {
            //lets resize and crop the image using sharp
            let inputFile = assets_path + "/driver_img/" + f;
            let outputFile = assets_path + "/driver/" + f;
            sharp(inputFile).resize({ height: 100, width: 100, fit : 'cover'}).toFile(outputFile)
            .then(function(newFileInfo) {
              // newFileInfo holds the output file properties
              console.log("Success", newFileInfo);
              
              models.drivers.update(
                { profile : f, hasProfile : true},
                { where: { token: token } }
              ).then(driver => {
                //res.writeHead(200, user);
                res.send(driver);
                res.end("Jesus is my light");
              }).catch(err => {
                res.sendStatus(400).send();
              });

            })
            .catch(function(err) {
                res.sendStatus(400).send();
                console.log("Error occured",err);
            });
            
           } else {
               res.sendStatus(400).send();
           } 
      console.log('Upload complete- Jeus is Love');

    });
    return req.pipe(busboy);
});

app.post('/driver/profileOld', (req, res) => {
    var token = req.header('x-auth');
    upload_driver(req, res, (err) => {
       console.log("Request ---", req.body);
       console.log("Request file ---", req.file);//Here you get file.
       let img = _.pick(req.file, ['filename']);
       if(!_.isEmpty(img.filename)) {
        models.drivers.update(
            { profile : img.filename, hasProfile : true},
            { where: { token: token } }
         ).then(driver => {
              res.send(driver);
         }).catch(err => {
            res.sendStatus(400).send();
         });
       } else {
           res.sendStatus(400).send();
       } 
    })
});

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
            { where: { mobile : decoded } }
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
        models.users.findOne({ where: {mobile: decoded} }).then(user => {
          console.log('userrrrrrrrrrrr', user);
        if(!user) {
            res.sendStatus(401).send();
        }
          res.send(_.pick(user,['firstName', 'middleName', 'email', 'mobile', 'token', 'profile', 'hasProfile', 'verified', 'status']));  
        });
    } catch (e) {
      res.status(401).send();
    }
});

//user-apply
app.post('/user/apply', (req, res) => {
    var body = _.pick(req.body, ['firstName', 'middleName', 'mobile', 'gender', 'password', 'token', 'profile', 'hasProfile']);
    //body.token = jwt.sign(body.email, 'JESUSMYHEALER');
    body.token = jwt.sign(body.mobile, 'JESUSMYHEALER');

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
                            { where : { mobile: decoded } } ,
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
   
    var body = _.pick(req.body, ['mobile', 'password']);
    console.log(body);
    models.users.findOne({ where : {mobile: body.mobile}}).then( (user) => {
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
   let ride_id = _.pick(req.body, ['id']);
   let _pickup_latlng = Sequelize.fn('ST_GeomFromText', req.body.pickup_latlng);
   var _dropoff_latlng = Sequelize.fn('ST_GeomFromText', req.body.dropoff_latlng);

   body.pickup_latlng = _pickup_latlng;
   body.dropoff_latlng = _dropoff_latlng;
   let _r = ride_request(body,ride_id);  
   if(_.isNull(_r)){
      res.send(null);
   } else {
      res.send(_r);
   }
});

app.post('/ride/updateRide', (req, res) => { 
    let body = _.pick(req.body, ['ride_id', 'user_id', 'driver_id', 'pickup_latlng', 'dropoff_latlng', 'route_distance', 'route_time', 'route_price', 'status']);

    let _pickup_latlng = Sequelize.fn('ST_GeomFromText', req.body.pickup_latlng);
    var _dropoff_latlng = Sequelize.fn('ST_GeomFromText', req.body.dropoff_latlng);
 
    body.pickup_latlng = _pickup_latlng;
    body.dropoff_latlng = _dropoff_latlng;

    var sequelize = models.sequelize;
    return sequelize.transaction(function (t) {
        return models.users.findOne({
            where : {mobile : body.user_id}, transaction: t 
        }).then( (user) => {
            if(user){
              return models.drivers.findOne({
                where : {mobile : body.driver_id}, transaction: t 
              }).then((driver) => {
                   if(driver) {
                    return models.riderequests.update(
                        { user_id : user.token, driver_id : driver.token, pickup_latlng : body.pickup_latlng, dropoff_latlng : body.dropoff_latlng, route_distance : body.route_distance, route_time : body.route_time, route_price : body.route_price},
                        { where : {id : body.ride_id}, transaction: t }
                        ).then((ride) => {
                            if(ride) {
                                return ride;
                            } else {
                                throw new Error('ride not updated');
                            }
                    });
                   } else {
                    res.sendStatus(402).send();
                    throw new Error('driver not found');
                   }
              });
            } else {
                res.sendStatus(401).send();
                throw new Error('user not found');
            }
        });
      }).then(function (result) {
          res.send(result);
      }).catch(function (err) {
          
      });
});

app.post('/ride/manual_create_ride', (req, res) => { 
    let body = _.pick(req.body, ['ride_id', 'user_id', 'driver_id', 'pickup_latlng', 'dropoff_latlng', 'route_distance', 'route_time', 'route_price', 'status']);

    let _pickup_latlng = Sequelize.fn('ST_GeomFromText', req.body.pickup_latlng);
    var _dropoff_latlng = Sequelize.fn('ST_GeomFromText', req.body.dropoff_latlng);
 
    body.pickup_latlng = _pickup_latlng;
    body.dropoff_latlng = _dropoff_latlng;

    var sequelize = models.sequelize;
    return sequelize.transaction(function (t) {
        return models.users.findOne({
            where : {mobile : body.user_id}, transaction: t 
        }).then( (user) => {
            if(user){
              return models.drivers.findOne({
                where : {mobile : body.driver_id}, transaction: t 
              }).then((driver) => {
                   if(driver) {
                    body.user_id = user.token;
                    body.driver_id = driver.token;
                    return models.riderequests.create(
                       body ,
                        { transaction: t }
                        ).then((new_ride) => {
                            if(new_ride) {
                                return models.drivers.update(
                                    { status: 1 },
                                    { where: { token: driver.token } , transaction: t} 
                                ).then(r1 => {
                                    return r1
                                });
                            } else {
                                throw new Error('driver not ready');
                            }
                    });
                   } else {
                    res.sendStatus(402).send();
                    throw new Error('driver not found');
                   }
              });
            } else {
                res.sendStatus(401).send();
                throw new Error('user not found');
            }
        });
      }).then(function (result) {
          res.send(result);
      }).catch(function (err) {
          
      });
});
 
app.post('/ride/rideRequest2', authUser, (req, res) => {
   let body = _.pick(req.body, ['user_id','driver_id', 'pickup_latlng', 'dropoff_latlng', 'route_distance', 'route_time', 'route_price', 'status']);
   let _pickup_latlng = Sequelize.fn('ST_GeomFromText', req.body.pickup_latlng);
   var _dropoff_latlng = Sequelize.fn('ST_GeomFromText', req.body.dropoff_latlng);

   body.pickup_latlng = _pickup_latlng;
   body.dropoff_latlng = _dropoff_latlng;
   
    const getNearestDrivers = async (latlng) => {
       let drivers = null;
       var distance = Sequelize.fn('ST_Distance_Sphere', Sequelize.literal('currentLocation'), latlng);
       const Op = Sequelize.Op;
       await models.drivers.findAll({ 
          attributes: ['token','currentLocation', 'firstName',[Sequelize.fn('ST_Distance_Sphere', Sequelize.literal('currentLocation'), _pickup_latlng),'distance']],
          where: {verified: 1, status: 0, currentLocation: {[Op.ne]: null}},
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
                    if(_.isNull(_ride)){
                        req.body.driver_id = driver_token;
                        return models.riderequests.create(
                               body,
                              {transaction: t}
                            ).then((ride) => {
                            if(ride) {
                                return models.drivers.update(
                                    { status: 1 },
                                    { where: {token: driver_token, status: 0} , transaction: t} 
                                 ).then(r => {
                                     if(r[0]===1){
                                        return ride;
                                     } else {
                                        throw new Error('transaction driver status not updated');
                                     }
                                 })
                            } else {
                                throw new Error('t save err');
                            }
                        })
                    } else {
                        return null;
                    }
                });
        }).then(function (result) {
            console.log('trsancation commited   tttttttttttttttttttttttttttttt ', result);
            return result;
            
         
        }).catch(function (err) {
            console.log('trsancation rollback ', err);
            return null ;
        });   
    }

    const ride_request = async () => {
        const drivers = await getNearestDrivers(_pickup_latlng);
        let _r = null;
        async function processArray(drivers){
            for(let driver of drivers) {
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
         
        if(_.isNull(_r)){
            res.send(null);
        } else {
            res.send(_r);
        }
    }

    ride_request();   //starts from here 
});


app.post('/ride/accepted', (req, res) => {
    var body = _.pick(req.body, ['status']);
    var token = req.header('x-auth');
    const Op = Sequelize.Op;
    var sequelize = models.sequelize;
    return sequelize.transaction(function (t) {
        return models.riderequests.findOne({
            where : {driver_id: token, status: 1}, transaction: t 
        }).then( (ride) => {
            if(ride){
              return models.riderequests.update(
                    { status: 7 },
                    { where: { driver_id: token, status: 1} , transaction: t 
              }).then(result => {
                     if(result){
                       return models.riderequests.findOne({ 
                            where : {driver_id: token, status: 7},
                            include: [
                                { model: models.users,
                                  attributes: ['firstName','middleName','mobile', 'profile']
                                },
                                { model: models.drivers,
                                    attributes: ['status']
                                }
                            ]
                        }).then( (ride) => {
                          return ride;
                        });
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

app.post('/ride/busy_ok', (req, res) => {
    var token = req.header('x-auth');
    var sequelize = models.sequelize;
    return sequelize.transaction(function (t) {
        return models.riderequests.findOne({
            where : {user_id: token, status: 2}  
        }, {transaction: t}).then( (ride) => {
            if(ride){
              return models.riderequests.update(
                    { status: 22 },
                    { where: { user_id: token, status: 2} } ,
                    {transaction: t}
                  ).then(result => {
                     if(result){
                         return ride;  /// update successfull return ride
                     } else {
                         return ride;
                     }
                  }).catch(err => {
                    return err;
                  });
            } else {
                return null;
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

app.post('/ride/driver_not_located', (req, res) => {
    var body = _.pick(req.body, ['ride_id','driver_id']);
    var token = req.header('x-auth');
    var sequelize = models.sequelize;
    const Op = Sequelize.Op;
    return sequelize.transaction(function (t) {
        return models.drivers.update(
            { status: 3 },
            { where: {token: body.driver_id}, transaction: t}
        ).then(r => {
            if(r){
                return models.riderequests.update(
                    { status: 222 },
                    { where: {id: body.ride_id, driver_id: body.driver_id, status: {[Op.or] : [2, 22]}}, transaction: t } 
                  ).then(result => {
                     if(result) {
                        return r;
                     } else {
                         throw new Error('ride not found after update');
                     }
                  }).catch(err => {
                    return err;
                  });
            } else {
                throw new Error('Transaction driver not updated');
            }
        })
      }).then(function (result) {
          res.send(result);
      }).catch(function (err) {
        res.sendStatus(400).send();
      });
});

app.post('/driver/logout', (req, res) => {
    var token = req.header('x-auth');
    var sequelize = models.sequelize;
    return sequelize.transaction(function (t) {
        return models.drivers.findOne({
            where : {token: token, status: 0}  
        }, {transaction: t}).then( (ride) => {
            if(ride){
              return models.drivers.update(
                    { status: 4 },
                    { where: { token : token, status: 0} } ,
                    {transaction: t}
                  ).then(result => {
                     if(result){
                         return result;  
                     } else {
                         return result;
                     }
                  }).catch(err => {
                    return err;
                  });
            } else {
                return null;
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

app.post('/driver/ready_for_work', (req, res) => {
    var body = _.pick(req.body, ['ride_id']);
    var token = req.header('x-auth');
    var sequelize = models.sequelize;
    const Op = Sequelize.Op;
    return sequelize.transaction(function (t) {
        return models.drivers.update(
            { status: 0 },
            { where: {token: token, status:2 }, transaction: t}
        ).then(r => {
            if(r){
                return models.riderequests.update(
                    { status: 222 },
                    { where: {id: body.ride_id, driver_id: token, status: {[Op.or] : [2, 22]}}, transaction: t } 
                  ).then(result => {
                     if(result) {
                        return r;
                     } else {
                         throw new Error('ride not found after update');
                     }
                  }).catch(err => {
                    return err;
                  });
            } else {
                throw new Error('Transaction driver not updated');
            }
        })
      }).then(function (result) {
          res.send(result);
      }).catch(function (err) {
        res.sendStatus(400).send();
      });
});

app.post('/ride/convert_missed_to_ride', (req, res) => {
    var body = _.pick(req.body , ['id', 'driver_id']);
    var token = req.header('x-auth');
    var sequelize = models.sequelize;
    const Op = Sequelize.Op;
    return sequelize.transaction(function (t) {
        return models.drivers.update(
            { status: 1 },
            { where: {token: body.driver_id, status: 2 }, transaction: t}
        ).then(r => {
            if(r){
                return models.riderequests.update(
                    { status: 7 },
                    { where: { id: body.id}, transaction: t } 
                  ).then(result => {
                     if(result) {
                        return r;
                     } else {
                         throw new Error('ride not found after update');
                     }
                  }).catch(err => {
                    return err;
                  });
            } else {
                throw new Error('Transaction driver not updated');
            }
        })
      }).then(function (result) {
          res.send(result);
      }).catch(function (err) {
        res.sendStatus(400).send();
      });
});

app.post('/ride/busy_ok', (req, res) => {
    var body = _.pick(req.body , ['id', 'driver_id']);
    var token = req.header('x-auth');
    var sequelize = models.sequelize;
    return sequelize.transaction(function (t) {
        return models.riderequests.findOne({
            where : {id: body.id, user_id: token, status: 2}  
        }, {transaction: t}).then( (ride) => {
            if(ride){
              return models.riderequests.update(
                    { status: 22 },
                    { where: {id: body.id, user_id: token, status: 2} } ,
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
                return null;
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

app.post('/ride/rating', (req, res) => {
    var body = _.pick(req.body, ['ride_id','driver_id', 'rating']);
    console.log('tessssssssssssssssst', body);
    var token = req.header('x-auth');
    var sequelize = models.sequelize;
    const Op = Sequelize.Op;
    return sequelize.transaction(function (t) {
        return models.riderequests.findOne({
             where: {id: body.ride_id, status: 7777 }, transaction: t}
        ).then(r => {
            if(r){
                return models.riderequests.update(
                    { status: 777 },
                    { where: { id: body.ride_id, status: 7777}, transaction: t } 
                  ).then(result => {
                     if(result[0]===1) {
                         console.log("restuuuuuuuu", result[0]);
                        return models.ratings.create(
                               body,
                              {transaction: t}
                            ).then((rating) => { 
                                console.log("yyyyyyyyyy", rating);
                               return rating;
                            });
                     } else {
                         throw new Error('ride not found after update');
                     }
                  }).catch(err => {
                    return err;
                  });
            } else {
                throw new Error('Transaction driver not updated');
            }
        })
      }).then(function (result) {
          res.send(result);
      }).catch(function (err) {

          console.log(err);
        res.sendStatus(400).send();
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
                    { status: 7777 },
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
                         'charge_cr': ride.route_price * env.RIDE_PERCENTAGE,
                         'status': 0
                     }
                     var body = _.pick(paymentObj, ['pay_type','driver_id', 'ride_id', 'amount', 'charge_dr','charge_cr','status']);
                     const payment = models.payments.build(body, {transaction: t}); 
                    return payment.save().then((payment_data) => {
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

app.post('/actual_ride/completed', (req, res) => {
    var sequelize = models.sequelize;
    var body = _.pick(req.body, ['status','dropoff_latlng', 'route_distance', 'route_time', 'route_price']);
    var _dropoff_latlng = sequelize.fn('ST_GeomFromText', req.body.dropoff_latlng);
    body.dropoff_latlng = _dropoff_latlng;
    console.log(' ridddddddddddddddddddddddddddddddddd', _dropoff_latlng);
    var token = req.header('x-auth');
    
    return sequelize.transaction(function (t) {
        return models.riderequests.findOne({
            where : {driver_id: token, status: 77}  
        }, {transaction: t}).then( (ride) => {
            if(ride){  
                
              if(parseFloat(ride.route_price) > parseFloat(body.route_price)) { // lets take the greater price
                body.dropoff_latlng = ride.dropoff_latlng;
                body.route_distance = ride.route_distance;
                body.route_time = ride.route_time;
                body.route_price = ride.route_price;
              }

              //console.log(' ridddddddddddddddddddddddddddddddddd', body);
              return models.riderequests.update(
                    { status: 7777, dropoff_latlng: body.dropoff_latlng, route_distance : body.route_distance, route_time:body.route_time, route_price : body.route_price },
                    { where: { driver_id: token, status: 77} } ,
                    {transaction: t}
                  ).then(result => {
                    
                     //return result;
                     var actual_price = 0 ;
                     if(parseFloat(ride.route_price) < 50.00 || parseFloat(ride.route_price) === 50.00 ) {
                         actual_price = 50;
                     } else {
                        actual_price = ride.route_price;
                     }
                     console.log('actualaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa', actual_price, ride.route_price, ride.route_distance);
                     var paymentObj = {
                         'pay_type': 1,
                         'driver_id': ride.driver_id,
                         'ride_id': ride.id,
                         'amount': actual_price,
                         'charge_dr': 0.00,
                         'charge_cr': actual_price * env.RIDE_PERCENTAGE,
                         'status': 0
                     }
                     var body_payment = _.pick(paymentObj, ['pay_type','driver_id', 'ride_id', 'amount', 'charge_dr','charge_cr','status']);
                     const payment = models.payments.build(body_payment, {transaction: t}); 
                    return payment.save().then((payment_data) => {
                        return models.drivers.update(
                            { status: 0 },
                            { where: {token: token, status: 1 } },
                            {transaction: t}
                        ).then(r => {
                            if(r){
                                var rtn = {
                                    final_price : actual_price,
                                    final_distance : body.route_distance,
                                    final_time : body.route_time
                                }
                                return rtn;
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

app.post('/driver/ride/cancel', (req, res) => {
    var body = _.pick(req.body, ['reason','ride_id']);
    var token = req.header('x-auth');
    var sequelize = models.sequelize;
    return sequelize.transaction(function (t) {
        return models.riderequests.findOne({
            where : {driver_id: token, status: 7, id: body.ride_id}  
        }, {transaction: t}).then( (ride) => {
            if(ride){
              return models.riderequests.update(
                    { status: 4 },
                    { where: { driver_id: token, status: 7} } ,
                    {transaction: t}
                  ).then(result => {
                     if(result){
                        return models.drivers.update(
                            { status: 0 },
                            { where: {token: token, status: 1 } },
                            {transaction: t}
                        ).then(r => {
                            if(r){
                                return r;
                            } else {
                                throw new Error('Transaction driver not updated');
                            }
                        })
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

app.post('/user/driver_cancel_ride_ok', (req, res) => {
    var body = _.pick(req.body, ['ride_id']);
    var token = req.header('x-auth');
    var sequelize = models.sequelize;
    return sequelize.transaction(function (t) {
        return models.riderequests.findOne({
            where : {id : body.ride_id, user_id: token, status: 4}  
        }, {transaction: t}).then( (ride) => {
            if(ride){
              return models.riderequests.update(
                    { status: 444 },
                    { where: {id : body.ride_id, user_id: token, status: 4} } ,
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

app.post('/ride/id', (req, res) => {
    var body = _.pick(req.body, ['id']);
    var token = req.header('x-auth');
    //THANK YOU JESUS THANK YOU 
    const Op = Sequelize.Op;
    models.riderequests.findOne({ 
        where : {id : body.id },
        include: [
            { model: models.drivers,
              attributes: ['firstName','middleName','mobile', 'plateNo', 'profile', 'currentLocation'],
              include : [
                  { model : models.cars,
                    attributes : ['model','plate_no','side_token']
                  }
              ]
            }
        ]
    }).then( (ride) => {
        if(ride){
          res.send(ride);  
        } else {
          var ride = {
              status : null  // custom status = no ride on progress 
          }
          res.send(ride);
        }
    });
});

app.post('/ride/check_ride_user', (req, res) => {
    var body = _.pick(req.body, ['status']);
    var token = req.header('x-auth');
    //THANK YOU JESUS THANK YOU 
    const Op = Sequelize.Op;
    models.riderequests.findOne({ 
        where : {user_id: token, status: {[Op.and] : [{[Op.ne]: 777}, {[Op.ne]: 22}, {[Op.ne]: 222}, {[Op.ne]: 444}]}},
        order : [
            ['id', 'DESC']
        ],
        include: [
            { model: models.drivers,
              attributes: ['firstName','middleName','mobile', 'plateNo', 'profile', 'currentLocation'],
              include : [
                  { model : models.cars,
                    attributes : ['model','plate_no','side_token']
                  }
              ]
            }
        ]
    }).then( (ride) => {
        if(ride){
          res.send(ride);  
        } else {
          var ride = {
              status : null  // custom status = no ride on progress 
          }
          res.send(ride);
        }
    });
});

app.post('/ride/check_ride_driver', (req, res) => {
    var body = _.pick(req.body, ['status']);
    var token = req.header('x-auth');
    //I WORSHIP YOU JESUS YOU ARE GOOD GOOD FATHER 
    const Op = Sequelize.Op;
    models.riderequests.findOne({ 
        where : {driver_id: token, status: {[Op.and] : [{[Op.ne]: 777}, {[Op.ne]: 7777}, {[Op.ne]: 222}, {[Op.ne]: 4}, {[Op.ne]: 444}]}},
        order : [
            ['id', 'DESC']
        ],
        include: [
            { model: models.users,
              attributes: ['firstName','middleName','mobile', 'profile']
            },
            { model: models.drivers,
                attributes: ['status']
            }
        ]
    }).then( (ride) => {
      //console.log('ride request for this driver', ride);
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
  var body = _.pick(req.body, ['mobile', 'password']);
  models.drivers.findOne({ where : {mobile: body.mobile}}).then( (driver) => {
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
            models.drivers.update(
                { status: 0 },
                { where: { token : driver.token, status: 4} }
              ).then(result => {
              })
            res.header('x-auth', driver.token).send(driver);
         } else {
            res.status(401).send();
         }
     },(r) => {
         console.log('rrr', r);

     });

  });
 
});

app.post('/user/change_password_request', (req, res) => {
    var body = _.pick(req.body, ['mobile']);
    console.log(body);
    var sequelize = models.sequelize;
    return sequelize.transaction(function (t) { 
        return models.users.findOne({
            where : {mobile: body.mobile}  
            }, {transaction: t}).then((_user) => {
                if(_user){
                    return models.change_passwords.create(
                           body,
                          {transaction: t}
                        ).then((_change_passwords) => {
                        if(_change_passwords) {
                            const dataObj = _change_passwords.get({plain:true})
                            send_mail_user_change_password(_user, dataObj.verification_token);
                            const data = {
                                rply : 1
                            }
                            return data;
                        } else {
                            throw new Error('t save err');
                        }
                    })
                } else {
                    const data = {
                        rply : 0
                    }
                    return data;
                }
            });
    }).then(function (result) {
        console.log('trsancation commited   tttttttttttttttttttttttttttttt ', result);
        res.status(200).send(result);
    }).catch(function (err) {
        console.log('trsancation rollback ', err);
        return null ;
    });   
   
});

app.post('/driver/change_password_request', (req, res) => {
    var body = _.pick(req.body, ['mobile']);
    console.log(body);
    var sequelize = models.sequelize;
    return sequelize.transaction(function (t) { 
        return models.drivers.findOne({
            where : {mobile: body.mobile}  
            }, {transaction: t}).then((_driver) => {
                if(_driver){
                    return models.change_passwords.create(
                           body,
                          {transaction: t}
                        ).then((_change_passwords) => {
                        if(_change_passwords) {
                            const dataObj = _change_passwords.get({plain:true})
                            send_mail_driver_change_password(_driver, dataObj.verification_token);
                            const data = {
                                rply : 1
                            }
                            return data;
                        } else {
                            throw new Error('t save err');
                        }
                    })
                } else {
                    const data = {
                        rply : 0
                    }
                    return data;
                }
            });
    }).then(function (result) {
        console.log('trsancation commited   tttttttttttttttttttttttttttttt ', result);
        res.status(200).send(result);
    }).catch(function (err) {
        console.log('trsancation rollback ', err);
        return null ;
    });   
   
});

app.post('/user/change_password', (req, res) => {
    var body = _.pick(req.body, ['mobile','varification_code', 'password']);
    var token = req.header('x-auth');
    var sequelize = models.sequelize;
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
     
    PromiseHashedPassword.then((body) => {
        return sequelize.transaction(function (t) {
            return models.change_passwords.findOne({
                where : {mobile: body.mobile, status: 0, verification_token: body.varification_code}  
            }, {transaction: t}).then( (v) => {
                if(v){
                  return models.change_passwords.update(
                        { status: 1 },
                        { where : {mobile: body.mobile, status: 0} } ,
                        {transaction: t}
                      ).then(result => {
                         if(result){
                             //JESUSMYHEALER ጌታዬ ባለውለታዬ
                             return models.users.update(
                                { password: body.password },
                                { where : { mobile: body.mobile } } ,
                                {transaction: t}
                             ).then((_user)=>{
                                 if(_user){
                                     const data = {
                                         rply : 1
                                     }
                                     return data
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
          }).catch(function (err) {
            res.sendStatus(400).send();
            console.log('trsancation driver varified rollback ', err);
          });
    });
});

app.post('/driver/change_password', (req, res) => {
    var body = _.pick(req.body, ['mobile','varification_code', 'password']);
    var token = req.header('x-auth');
    var sequelize = models.sequelize;
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
     
    PromiseHashedPassword.then((body) => {
        return sequelize.transaction(function (t) {
            return models.change_passwords.findOne({
                where : {mobile: body.mobile, status: 0, verification_token: body.varification_code}  
            }, {transaction: t}).then( (v) => {
                if(v){
                  return models.change_passwords.update(
                        { status: 1 },
                        { where : {mobile: body.mobile, status: 0} } ,
                        {transaction: t}
                      ).then(result => {
                         if(result){
                             //JESUSMYHEALER ጌታዬ ባለውለታዬ
                             return models.drivers.update(
                                { password: body.password },
                                { where : { mobile: body.mobile } } ,
                                {transaction: t}
                             ).then((_driver)=>{
                                 if(_driver){
                                     const data = {
                                         rply : 1
                                     }
                                     return data
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
          }).catch(function (err) {
            res.sendStatus(400).send();
            console.log('trsancation driver varified rollback ', err);
          });
    });
});


app.post('/admin/login', (req, res) => {
    var body = _.pick(req.body, ['email', 'password']);
    console.log('data', body);
    //lets get the driver by email
    models.admins.findOne({ where : {email: body.email}}).then( (admin) => {
       if(!admin) {
          res.status(401).send();
       }
       
       let PromisePasswordCompare = new Promise((resolve, reject) => {
         bcrypt.compare(body.password, admin.password, (err, compareFlag) => {
             if(err){
                 reject(err);
             } else {
                 resolve(compareFlag);
             }
         });
       });
       
       PromisePasswordCompare.then((compareFlag) => {
           if(compareFlag === true){
              res.header('x-auth', admin.token).send(admin);
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
    //I praise you lord - you are means of all good things
    var token = req.header('x-auth');
    var _latlng = Sequelize.fn('ST_GeomFromText', req.body._latlng);
    var decoded;
    try {
        decoded = jwt.verify(token, 'JESUSMYHEALER');
        models.drivers.update(
            { currentLocation: _latlng },
            { where: { mobile : decoded } }
          ).then(result => {
            res.send(result);
             console.log('driver location updated llllllllllllllllllllllllllll', result);
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
    const Op = Sequelize.Op;
    models.drivers.findAll({ 
      attributes: ['token','currentLocation', 'firstName',[Sequelize.fn('ST_Distance_Sphere', Sequelize.literal('currentLocation'), _pickup_latlng),'distance']],
      where: {verified: 1, status: 0, currentLocation: {[Op.ne]: null}},
      order: distance,
      limit: 3,
      logging: console.log
    }).then(drivers => {
       res.send(drivers);
    });
});

app.get('/users_marker', (req, res) => {
    var sequelize = models.sequelize;
    const Op = Sequelize.Op;
    models.users.findAll({ 
        attributes: ['firstName', 'middleName', 'mobile', 'profile', 'hasProfile', 'currentLocation', 'updatedAt'],
        where: [ sequelize.where(sequelize.fn('TIMESTAMPDIFF', sequelize.literal('DAY'), sequelize.col('updatedAt'), sequelize.fn("now")), {
            [Op.lte] : env.PASSENGER_ONLINE_SINCE_DAY
        }), {currentLocation: {[Op.ne]: null}}], 
    }).then(users => {
        let data = [];
        var tmpObj;
        let objUsers = users.map(user => {
             tmpObj = {
                 firstName: user.firstName,
                 middleName: user.middleName,
                 mobile: user.mobile,
                 profile : user.profile,
                 hasProfile : user.hasProfile,
                 currentLocation : user.currentLocation.coordinates,
                 updatedAt : user.updatedAt
             }
            return tmpObj;
            
        });
       res.send(objUsers);
    });
});


//get drivers location  status 0 = waiting for job
app.get('/drivers', (req, res) => {
    var sequelize = models.sequelize;
    const Op = Sequelize.Op;
    models.drivers.findAll({ 
        attributes: ['firstName', 'middleName', 'mobile', 'plateNO', 'currentLocation', 'updatedAt'],
        where:[ sequelize.where(sequelize.fn('TIMESTAMPDIFF', sequelize.literal('DAY'), sequelize.col('updatedAt'), sequelize.fn("now")), {
            [Op.lte] : env.DRIVER_ONLINE_SINCE_HOUR
        }), {verified: 1, status: 0, currentLocation: {[Op.ne]: null}}], 
    }).then(drivers => {
        let data = [];
        var tmpObj;
        let objDrivers = drivers.map(driver => {
             tmpObj = {
                 firstName: driver.firstName,
                 middleName: driver.middleName,
                 mobile: driver.mobile,
                 plateNo: driver.plaleNO,
                 currentLocation : driver.currentLocation.coordinates,
                 updatedAt : driver.updatedAt
             }
            return tmpObj;
            
        });
       res.send(objDrivers);
    });
});

//list of drivers for ride control status 0 ready and 2 (missed) 
app.get('/drivers_for_ride_control', (req, res) => {
    var sequelize = models.sequelize;
    const Op = Sequelize.Op;
    models.drivers.findAll({ 
        attributes: ['firstName', 'middleName', 'mobile', 'plateNO', 'currentLocation', 'updatedAt'],
        where:[ sequelize.where(sequelize.fn('TIMESTAMPDIFF', sequelize.literal('DAY'), sequelize.col('updatedAt'), sequelize.fn("now")), {
            [Op.lte] : env.DRIVER_ONLINE_SINCE_HOUR
        }), {verified: 1, status: {[Op.or] : [0, 2]}, currentLocation: {[Op.ne]: null}}], 
    }).then(drivers => {
        let data = [];
        var tmpObj;
        let objDrivers = drivers.map(driver => {
             tmpObj = {
                 firstName: driver.firstName,
                 middleName: driver.middleName,
                 mobile: driver.mobile,
                 plateNo: driver.plaleNO,
                 currentLocation : driver.currentLocation.coordinates,
                 updatedAt : driver.updatedAt
             }
            return tmpObj;
            
        });
       res.send(objDrivers);
    });
});


//driver-get
app.get('/driver/get', (req, res) => {
    var token = req.header('x-auth');
    var decoded;
    try {
        decoded = jwt.verify(token, 'JESUSMYHEALER');
        models.drivers.findOne({ 
            attributes: ['id', 'firstName', 'middleName', 'email', 'mobile', 'token', 'gender', 'verified', 'isCarRegistered', 'isCarVerified', 'profile', 'hasProfile', 'status',
        ],
        where: {'mobile': decoded}
        }).then(driver => {
          if(!driver) {
            res.sendStatus(401).send();
          }
          res.send(driver);  
        });
    } catch (e) {
      res.status(401).send();
    }
});

app.get('/driver/rating', (req, res) => {
    var token = req.header('x-auth');
    models.drivers.findAll({
        attributes: [
                [Sequelize.literal('SUM(ratings.rating) / COUNT(ratings.id)'), 'avg_rating']
        ],
        where: {'token': token},
        raw: true,
        include: [
            {
                model: models.ratings,
                attributes: []
            }
        ],
        group: ['drivers.token',Sequelize.col('ratings.driver_id')]
    }).then(driver =>{
        console.log('Jesus', driver);
        if(driver){
         res.send(driver);
        }
    })
});


//driver-apply
app.post('/driver/apply', (req, res) => {
    var body = _.pick(req.body, ['firstName', 'middleName', 'email', 'mobile', 'gender', 'plateNo', 'password', 'token']);
    body.token = jwt.sign(body.mobile, 'JESUSMYHEALER');
    
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
                            { where : { mobile: decoded } } ,
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

app.post('/change_password_verification', (req, res) => {
    var body = _.pick(req.body, ['varification_code']);
    var token = req.header('x-auth');
        models.change_passwords.findOne({
            where : {mobile: token, status: 0, verification_token: body.varification_code}  
        }).then( (v) => {
            if(v){
              const data = {
                  rply : 1
              }
              res.send(data);
            } else {
              res.sendStatus(401).send();
            }
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
                       const car = models.cars.build(body,{transaction : t}); 
                       return car.save().then((_car) => {
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
                const car = models.cars.build(body, {transaction : t}); 
                return car.save().then((_car) => {
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

app.post('/admin/users', (req, res) => {
    models.users.findAll({
        attributes: ['id','firstName','middleName', 'email', 'mobile', 'gender', 'profile', 'isOnline', 'verified', 'status', [Sequelize.fn('count', Sequelize.col('ride_requests.id')), 'total_rides']],
        raw: true,
        include: [
        {
            model: models.riderequests,
            attributes: []
        }
        ],
        group: ['users.id']
    }).then(user =>{
        if(user){
         res.send(user);
        }
    })
});

app.post('/admin/drivers', (req, res) => {
    models.drivers.findAll({
        attributes: ['id','firstName','middleName', 'email', 'mobile', 'gender', 'profile', 'isOnline', 'verified', 'status', 'currentLocation', 'hasProfile',
                    [Sequelize.fn('count', Sequelize.col('ratings.id')), 'rating'],
                    [Sequelize.literal('SUM(ratings.rating) / COUNT(ratings.id)'), 'avg_rating'],
                    [Sequelize.literal('COUNT(ratings.id)'), 'count_rating']
        ],
        raw: true,
        include: [
            {
                model: models.ratings,
                attributes: []
            }
        ],
        group: ['drivers.token','ratings.driver_id']
    }).then(driver =>{
        console.log('Jesus', driver);
        if(driver){
         res.send(driver);
        }
    })
});

app.post('/admin/drivers/payment', (req, res) => {
    models.drivers.findAll({
        attributes: ['id','firstName','middleName', 'email', 'mobile', 'gender', 'profile', 'isOnline', 'verified', 'status', 
                    [Sequelize.fn('sum', Sequelize.col('payments.amount')), 'amount'], 
                    [Sequelize.fn('sum', Sequelize.col('payments.charge_dr')), 'charge_dr'],
                    [Sequelize.fn('sum', Sequelize.col('payments.charge_cr')), 'charge_cr'],
                    [Sequelize.literal('SUM(payments.charge_cr) - SUM(payments.charge_dr)'), 'charge'],
                    [Sequelize.fn('count', Sequelize.col('payments.id')), 'total_rides']
        ],
        raw: true,
        include: [
            {
                model: models.payments,
                attributes: []
            }
        ],
        group: ['drivers.token','payments.driver_id']
    }).then(driver =>{
        console.log('Jesus', driver);
        if(driver){
         res.send(driver);
        }
    })
});

app.post('/admin/drivers/count', (req, res) => {
    models.drivers.findAll({
        attributes: [
                    [Sequelize.fn('count', Sequelize.col('id')), 'total_drivers']
        ],
        where : {verified : true, hasProfile : true, isCarRegistered : true},
        raw: true
    }).then(driver =>{
        console.log('Jesus', driver);
        if(driver){
         res.send(driver);
        }
    })
});

app.post('/admin/users/count', (req, res) => {
    const Op = Sequelize.Op;
    models.users.findAll({
        attributes: [
                    [Sequelize.fn('count', Sequelize.col('id')), 'total_users']
        ],
        where : {verified : {[Op.or] : [false, true]}},
        raw: true
    }).then(user =>{
        console.log('Jesus', user);
        if(user){
         res.send(user);
        }
    })
});

app.post('/admin/payments/count', (req, res) => {
    models.payments.findAll({
        attributes: [
                        [Sequelize.fn('sum', Sequelize.col('amount')), 'amount'], 
                        [Sequelize.fn('sum', Sequelize.col('charge_dr')), 'charge_dr'],
                        [Sequelize.fn('sum', Sequelize.col('charge_cr')), 'charge_cr'],
                        [Sequelize.literal('SUM(charge_cr) - SUM(charge_dr)'), 'charge'],
        ],
        raw: true
    }).then(payments =>{
        console.log('Jesus', payments);
        if(payments){
         res.send(payments);
        }
    });
});

app.post('/admin/rides', (req, res) => {
    models.riderequests.findAll({
        attributes: ['id','pickup_latlng','dropoff_latlng', 'route_distance', 'route_time', 'route_price', 'status', 'createdAt', 
        ],
        raw: false,
        limit : 30,
        order : [
            ['id', 'DESC']
        ],
        include: [
            {
                model: models.drivers,
                attributes: ['firstName','middleName', 'email', 'mobile', 'profile', 'token']
            },
            {
                model: models.users,
                attributes: ['firstName','middleName', 'email', 'mobile', 'profile']
            }
        ]
    }).then(rides =>{
        console.log('Jesus', rides);
        if(rides){
         res.send(rides);
        }
    })
});

app.post('/admin/add_trafic', (req, res) => {
    var data = _.pick(req.body, ['trafic_type']);
    console.log(data);
    add_trafic(data);
})

app.get('/admin/get_trafic', (req, res) => {
    models.trafics.findAll({
        attributes: ['trafic_type',
                    [Sequelize.fn('DATE', Sequelize.col('createdAt')),'date'],
                    [Sequelize.fn('count', Sequelize.col('id')), 'trafic_count']
        ],
        order : [
            [Sequelize.col('date'), 'DESC']
        ],
        raw: true,
        group: ['date', 'trafic_type']
    }).then(trafic => {
        console.log('Jesus', trafic);
        res.send(trafic);
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