const path = require('path');
const http = require('http');
const express = require('express');
const bodyParser = require('body-parser');
const socketIO = require('socket.io');
const models = require('./models');
const Sequelize = require('sequelize');

const publicPath = path.join(__dirname, '../client/build');

const port = process.env.PORT || 5000;

var app = express();
var server = http.createServer(app);
var io = socketIO(server);

app.use(bodyParser.json());
app.use(express.static(publicPath));


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
 