import React, { Component } from 'react';
import {Grid, Row, Col, Nav, Navbar, NavItem , NavDropdown, MenuItem, Image, Button, Badge} from 'react-bootstrap';
import L from 'leaflet';
import $ from 'jquery';
import socketClient from 'socket.io-client';

import DriverMenu from './driver_menu';


const socket = socketClient('http://localhost:5000');

class DriverLocation extends Component {
   constructor() {
       super();
       this.state = {
           currentLatLng: {
               lat: 0,
               lng: 0
           },
           driver_id: '',
           markersLayer: '',
           map : '',
           auth: false,
           driver: {
               firstName: '',
               middleName: '',
               email: '',
               mobile: '',
               status: ''
           },
           ridePrice: '',
           rideDistance: '',
           rideTime: '',
           rideUser: '',
           userMobile: '',
           userPic: '',
           checkForRideTimer : ''
       }
   }
   
   getDriver = (token) => {
    $.ajax({ 
        type:"GET",
        url:"/driver/get",
        headers: { 'x-auth': token },
        contentType: "application/json",
        success: function(driver, textStatus, jqXHR) {
            console.log('hi', driver);
          //document.getElementById('driver_name').innerHTML = 'Hi, ' + driver.firstName;
          this.setState({
              driver: driver
          });   
        }.bind(this),
        error: function(xhr, status, err) {
            console.log('getdriver', err.toString());
            console.error(xhr, status, err.toString());
        }.bind(this)
    });  
   }

   socketConnect = (_obj) => {
    socket.on('connect', function(){
        console.log('client connected');

        socket.emit('join', _obj, function(err) {
            if(err) {
               alert(err);
            }
        });
    });
    
    socket.on('driveRequest' , function(msg) {
        console.log('drive request' , msg);
    })
    
    socket.on('disconnect', function(){
        console.log('client disconnected');
    });
   }
   
   socketJoin = (_obj) => {
    
   }

   componentDidMount(){
    this.getDriver(localStorage.getItem("auth"));   
    this.setState({
        auth: localStorage.getItem("auth")
    });

    var data = {
        driver_id : 4141
    };
    
    this.socketConnect(data);

    var map = L.map('mapid').setView([9.0092, 38.7645], 16);
    map.locate({setView: true, maxZoom: 17});
    
    this.setState({map : map});

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);

    var markersLayer = new L.LayerGroup().addTo(map);
    this.setState({markersLayer: markersLayer});

    this.setState({
        checkForRideTimer : setInterval(this.checkForRide, 5000)
    });
        
   }

   componentDidUpdate() {
    var map = this.state.map;
    var marker;
    var markersLayer = this.state.markersLayer;
    
    map.on('locationfound', (e) => {
        this.updateDriverLocation(e.latlng, localStorage.getItem("auth"));
        var radius = e.accuracy / 128;
        L.marker(e.latlng).addTo(map)
            .bindPopup("You are " + radius + " meters from this point").openPopup();
        L.circle(e.latlng, radius).addTo(map);
        this.setState({
            currentLatLng : e.latlng
        });       
    });

    function onLocationError(e) {
        alert(e.message);
    }
    map.on('locationerror', onLocationError);
   }

   updateDriverLocation = (latlng, token) => {
       console.log('current latlng', latlng);
    var current_latlng = {
        _latlng : `POINT(${latlng.lat} ${latlng.lng})`, 
    };

    $.ajax({ 
        type:"POST",
        url:"/driver/updateLocation",
        headers: { 'x-auth': token },
        data: JSON.stringify(current_latlng), 
        contentType: "application/json",
        success: function(data, textStatus, jqXHR) {
          
        }.bind(this),
        error: function(xhr, status, err) {
            console.error(xhr, status, err.toString());
        }.bind(this)
    });  
   }

   checkForRide = () => {
        console.log('checking for ride',localStorage.getItem("auth"));
        var driver = {
            status : 1
        };

        $.ajax({ 
            type:"POST",
            url:"/ride/check_ride",
            headers: { 'x-auth': localStorage.getItem("auth")},
            data: JSON.stringify(driver), 
            contentType: "application/json",
            success: function(data, textStatus, jqXHR) {
                 if(!data){
                    let PromiseSetRideData = new Promise((res, rejects)=>{
                        this.setState({
                            ridePrice: "120 br",
                            rideDistance: "18km",
                            rideTime: "18sec",
                            rideUser: 'Dawit',
                            userMobile: "0911404040",
                            userPic: "/assets/awet-ride-driver.jpeg"
                         });
                         res(true);
                    }); 
                    PromiseSetRideData.then(()=>{
                        document.getElementById('check-ride-dashboard').style.visibility="visible";
                        document.getElementById('div-accept-button').style.visibility="visible"; 
                    });
                     
                 }
            }.bind(this),
            error: function(xhr, status, err) {
                console.error(xhr, status, err.toString());
            }.bind(this)
        });  
    }

    render(){
        
        return(
            <div>
                <div className="driver-dashboard">
                <Grid fluid>
                    <Row>
                        <Col xs={12} sm={12} md={12}><div id="driver_name">Hi, {this.state.driver.firstName}</div></Col>
                    </Row>
                    <Row>
                        <Col xs={6} sm={6} md={6}>earning</Col>
                        <Col xs={6} sm={6} md={6}>ride </Col>
                    </Row>
                    <Row>
                        <Col xs={6} sm={6} md={6}><Badge>23,340 br</Badge></Col>
                        <Col xs={6} sm={6} md={6}><Badge>170</Badge></Col>
                    </Row>
                    <Row>
                        <Col xs={6} sm={6} md={6}>charge </Col>
                        <Col xs={6} sm={6} md={6}>account</Col>
                    </Row>
                    <Row>
                        <Col xs={6} sm={6} md={6}><Badge className="charge">800 birr</Badge></Col>
                        <Col xs={6} sm={6} md={6}><Badge className="account">active</Badge></Col>
                    </Row>
                </Grid>
                </div>

                <div className="check-ride-dashboard" id="check-ride-dashboard"> 
                <Grid fluid>
                    <Row>
                        <Col xs={4} sm={4} md={4}><Image src={this.state.userPic} height={45} circle></Image></Col>
                        <Col xs={4} sm={4} md={4}>{this.state.rideUser}</Col>
                        <Col xs={4} sm={4} md={4}>{this.state.userMobile}</Col>
                    </Row>
                    <Row>
                        <Col xs={4} sm={4} md={4}>Price</Col>
                        <Col xs={4} sm={4} md={4}>Distance</Col>
                        <Col xs={4} sm={4} md={4}> time</Col>
                    </Row>
                    <Row>
                        <Col xs={4} sm={4} md={4}>{this.state.ridePrice}</Col>
                        <Col xs={4} sm={4} md={4}>{this.state.rideDistance}</Col>
                        <Col xs={4} sm={4} md={4}>{this.state.rideTime}</Col>
                    </Row>
                </Grid>
                </div>

                <div id="div-accept-button"  className="div-accept-button">
                   <Button  bsStyle="success" bsSize="large" block>ACCEPT RIDE</Button>
                </div>

                <div className="mapid" id="mapid"></div>
                
            </div>
        );
    }
}
export default DriverLocation;