const path = require('path');
const http = require('http');
const express = require('express');
const bodyParser = require('body-parser');
const socketIO = require('socket.io');

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

app.post('/driver/getNearestDriver', (req, res) => {
    console.log('pickup_latlng', req.body);
    //getNearestDriver
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
   console.log('Client connected');
   
   socket.on('request_driver', function(){
       console.log('driver requested')
   })
});

server.listen(port, () => {
    console.log(`Express server is up on port ${port}`);
});
