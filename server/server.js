const path = require('path');
const http = require('http');
const express = require('express');
const bcrypt = require('bcryptjs');
const bodyParser = require('body-parser');
const socketIO = require('socket.io');
const models = require('./models');
const Sequelize = require('sequelize');
const {SHA256} = require('crypto-js');
const jwt = require('jsonwebtoken');
const publicPath = path.join(__dirname, '../client/build');

const port = process.env.PORT || 5000;

var validator = require('validator');
var {authenticate} = require('./middleware/authenticate');
var _ = require('lodash');
var app = express();
var server = http.createServer(app);
var io = socketIO(server);

app.use(bodyParser.json());
app.use(express.static(publicPath));

app.get('/driver/ride', authenticate, (req, res) => {
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

app.post('/ride/rideRequest', (req, res) => {
   var _pickup_latlng = Sequelize.fn('ST_GeomFromText', req.body.pickup_latlng);
   var _dropoff_latlng = Sequelize.fn('ST_GeomFromText', req.body.dropoff_latlng);

   req.body.pickup_latlng = _pickup_latlng;
   req.body.dropoff_latlng = _dropoff_latlng;
   
   const ride_request = models.riderequests.build(req.body); 
   ride_request.save().then(() => {
      console.log('ride request ', 'saved');
      models.riderequests.findOne({ where: {user_id: '7141'} }).then(ride => {
        console.log('resutl', ride.dataValues.pickup_latlng);
       });
   });

   var driver =  {
        id: '1',
        driver_name : 'Nati Sahle',
        driver_phone : '0911003994',
        model : 'Lifan x345 i',
        plate : 'A47839',
        car_pic : '/assets/awet-ride.jpeg',
        driver_pic : '/assets/awet-ride-driver.jpeg'
    };
    res.json(driver);
});

app.post('/ride/check_ride', (req, res) => {
    var body = _.pick(req.body, ['status']);
    var token = req.header('x-auth');

    models.riderequests.findOne({ 
        where : {driver_id: token, status: body.status}
    }).then( (ride) => {
      console.log('ride request for this driver', ride);
       res.send(ride);
    });
   
  });

//driver end point
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
    console.log("hi hi");
    var token = req.header('x-auth');
    var _latlng = Sequelize.fn('ST_GeomFromText', req.body._latlng);
    var decoded;
    try {
        decoded = jwt.verify(token, 'JESUSMYHEALER');
        models.drivers.findOne({ where: {email: decoded} }).then(driver => {
          if(!driver) {
            res.send(401).send();
          }
          
          models.drivers.update(
            { currentLocation: _latlng },
            { where: { email: decoded } }
          ).then(result => {
             console.log('update result', result);
          }).catch(err => {
             console.log('update error', err);
          });
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
      attributes: ['firstName',[Sequelize.fn('ST_Distance_Sphere', Sequelize.literal('currentLocation'), _pickup_latlng),'distance']],
      order: distance,
      limit: 3,
      logging: console.log
    }).then(drivers => {
       res.send(drivers);
    });
});

//get drivers location
app.get('/drivers', (req, res) => {
    models.drivers.findAll({ 
        attributes: ['firstName', 'middleName', 'mobile', 'plateNO', 'currentLocation'],
        where: {status: null} 
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
            res.send(401).send();
          }
          res.send(_.pick(driver,['firstName', 'middleName', 'email', 'mobile', 'status']));  
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
        }, (err) => {
            console.log('er', err.errors[0]);
            res.status(400).send(err.errors[0]);
        }).catch((e) => {
            res.status(400).send(e);
        });
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


server.listen(port, () => {
    console.log(`Express server is up on port ${port}`);
});
 