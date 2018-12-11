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
   console.log('ride request', req.body);
   //var p = Sequelize.fn('ST_GeomFromText', 'POINT(52.458415 16.904740)');
   var _pickup_latlng = Sequelize.fn('ST_GeomFromText', req.body.pickup_latlng);
   var _dropoff_latlng = Sequelize.fn('ST_GeomFromText', req.body.dropoff_latlng);

   req.body.pickup_latlng = _pickup_latlng;
   req.body.dropoff_latlng = _dropoff_latlng;
   console.log('p',_pickup_latlng);
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

//driver end point
app.post('/driver', (req, res) => {
  var body = _.pick(req.body, ['email', 'password', 'token']);
  body.token = jwt.sign(body.email, 'JESUSMYHEALER');
  bcrypt.genSalt(10, (err, salt) => {
      bcrypt.hash(body.password, salt, (err, hash) => {
          body.password = hash;
          console.log('hash', hash);
      });
  });
  console.log('create driver', body);

  var driver = models.drivers.build(body);
  
  driver.save().then((driver)=> {
    res.header('x-auth', driver.token).send(driver);
  }, (err) => {
      console.log('er', err.errors[0]);
      res.status(400).send(err.errors[0]);
  }).catch((e) => {
      res.status(400).send(e);
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
 