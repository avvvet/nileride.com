import React, { Component } from 'react';
import { render } from 'react-dom';
import L from 'leaflet';
import {Button, Grid, Row, Col, FormControl, FormGroup, Alert, Badge, Image} from 'react-bootstrap';
import {NavLink, Redirect} from 'react-router-dom';
import * as Nominatim from "nominatim-browser";
import $ from 'jquery';
import _ from 'lodash';

import VerificationRply from './verfication_rply';

const env = require('../env');
var validator = require('validator');
var yourLocation = L.icon({
    iconUrl: '/assets/awet-rider-m.png',
    shadowUrl: '',

    iconSize:     [40, 40], // size of the icon
    shadowSize:   [50, 64], // size of the shadow
    iconAnchor:   [12, 50], // point of the icon which will correspond to marker's location
    shadowAnchor: [4, 62],  // the same for the shadow
    popupAnchor:  [-1, -45] // point from which the popup should open relative to the iconAnchor
});
var marker_a = L.icon({
    iconUrl: '/assets/marker_a.png',
    shadowUrl: '',

    iconSize:     [40, 40], // size of the icon
    shadowSize:   [50, 64], // size of the shadow
    iconAnchor:   [20, 39], // point of the icon which will correspond to marker's location
    shadowAnchor: [4, 62],  // the same for the shadow
    popupAnchor:  [-1, -45] // point from which the popup should open relative to the iconAnchor
});
var marker_b = L.icon({
    iconUrl: '/assets/marker_b.png',
    shadowUrl: '',

    iconSize:     [40, 40], // size of the icon
    shadowSize:   [50, 64], // size of the shadow
    iconAnchor:   [20, 39], // point of the icon which will correspond to marker's location
    shadowAnchor: [4, 62],  // the same for the shadow
    popupAnchor:  [-1, -45] // point from which the popup should open relative to the iconAnchor
});

class PickUpMap extends Component {
    constructor(){
        super();
        this.state = {
            current_latlng: {
                lat: 0,
                lng: 0
            },
            last_current_latlng : {
                lat: 0,
                lng: 0
            },
            isLogedIn : false,
            pickup_flag: 'off',
            dropoff_flag: 'off',
            pickup_location : 'Select your pickup location',
            pickup_latlng : {
                lat: 0,
                lng: 0
            },
            dropoff_latlng : {
                lat: 0,
                lng: 0
            },
            currentLatLng : {
                lat: 0,
                lng: 0
            },
            _driverCurrentLocation : {
                lat: 0,
                lng: 0
            },
            user: {
                firstName: '',
                middleName: '',
                email: '',
                mobile: '',
                profile : '',
                hasProfile : '',
                 verified: '',
                status: ''
            },
            profile_pic : '',
            imagePreviewUrl : '/assets/awet-rider-m.png',
            file : '',
            varificationCode: '',
            first_time_flag : false,
            route_price : 0,
            route_distance : 0,
            route_time : 0,
            route_time_string : 0,
            isRouteFound : false,
            map : '',
            markerGroup: '',
            carMarkerGroup: '',
            locationGroup: '',
            list: [],
            currentDrivers : [],
            pickupText : '',
            dropoffText : '',
            locationFoundFlag : false,
            statusFlag : false,
            timerWait : '',
            _driverImage: '',
            _driverCarImage: '',
            _driverName : '',
            _driverPlateNo: '',
            _driverMobile: '',
            _driverCarModel: '',
            rideCompleteFlag: false,
            _nearest_driver_token : '',
            _nearest_driver_distance : 0,
            _nearest_driver_eta : 0 ,
            _nearest_driver_available : false,
            _nearest_driver_latlng : {
                lat: 0,
                lng:0
            },
            _signInFlag : false,
            _fire_driver_eta_flag : false,
            errors: []
        }
    }

    userCurrentLocation = () => {
        let PromiseLocateDriver = new Promise((resolve, reject)=>{
                this.getDrivers();
                var map = this.state.map;
                map.locate({setView: true, maxZoom: 17});
                resolve(true);
        });

        PromiseLocateDriver.then((r)=>{
            if(!_.isEqual(this.state.current_latlng,this.state.last_current_latlng)){
                this.setState({last_current_latlng : this.state.current_latlng})
                var current_latlng = {
                    _latlng : `POINT(${this.state.current_latlng.lat} ${this.state.current_latlng.lng})`, 
                };
                var token = sessionStorage.getItem("_auth_user");
                $.ajax({ 
                    type:"POST",
                    url:"/user/updateLocation",
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
            
        }); 
    }

    getList = () => {
        var obj = { name: "John", age: 30, city: "New York" }; 
        fetch('/api/getList')
        .then(res => res.json())
        .then(list => this.setState({ list }))
    }
    
    getDrivers = (map) => {
        var awetRideIcon = L.icon({
            iconUrl: '/assets/awet-ride-marker-1.png',
            shadowUrl: '',
        
            iconSize:     [70, 39], // size of the icon
            shadowSize:   [50, 64], // size of the shadow
            iconAnchor:   [22, 94], // point of the icon which will correspond to marker's location
            shadowAnchor: [4, 62],  // the same for the shadow
            popupAnchor:  [-3, -76] // point from which the popup should open relative to the iconAnchor
        });
        
        $.ajax({ 
            type:"GET",
            url:"/drivers",
            contentType: "application/json",
            success: function(currentDrivers, textStatus, jqXHR) {
                var carMarkerGroup = this.state.carMarkerGroup;
                carMarkerGroup.clearLayers();  //lets clear and update it 
                if(currentDrivers){
                    
                    for (var i = 0; i < currentDrivers.length; i++) {
                        L.marker([currentDrivers[i].currentLocation[0],currentDrivers[i].currentLocation[1]], {icon: awetRideIcon})
                        .bindPopup(currentDrivers[i].firstName + ' ' + currentDrivers[i].middleName +  ' <br> Plate : ' + currentDrivers[i].plateNo)
                        .addTo(carMarkerGroup);
                    }
                }
 
            }.bind(this),
            error: function(xhr, status, err) {
                console.log('getdrivers error', err.toString());
                
            }.bind(this)
        });  
    }

    getNearestDrivers = (pickup_latlng) => {
        var objRideRequest = {
            pickup_latlng: `POINT(${this.state.pickup_latlng.lat} ${this.state.pickup_latlng.lng})`, 
        };

        $.ajax({ 
            type:"POST",
            url:"/drivers/nearest",
            data: JSON.stringify(objRideRequest), 
            contentType: "application/json",
            success: function(driver, textStatus, jqXHR) {
                console.log('nearest driver', driver, 'pickup', pickup_latlng);
                if(driver.length > 0){
                  this.setState({
                      _nearest_driver_token : driver[0].token,
                      _nearest_driver_distance : driver[0].distance,
                      _nearest_driver_latlng : driver[0].currentLocation.coordinates,
                      _nearest_driver_available : true
                  })
                } else {
                  this.setState({
                    _nearest_driver_available : false
                  });
                }
            }.bind(this),
            error: function(xhr, status, err) {
                console.error("erroorror", err.toString());
            }.bind(this)
        });  
    }

    componentDidMount(){
        this.getUser(sessionStorage.getItem("_auth_user"));
        //var map = L.map('mapid').setView([9.0092, 38.7645], 16);
        var map = L.map('mapid');
        map.locate({setView: true, maxZoom: 17});
        
        this.setState({map : map});

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        }).addTo(map);

        this.setState({
            markerGroup : new L.LayerGroup().addTo(map),
            locationGroup : new L.LayerGroup().addTo(map),
            carMarkerGroup : new L.LayerGroup().addTo(map)
        });
    
        this.getDrivers(map);

        map.on('locationfound', (e) => {
            var locationGroup = this.state.locationGroup;
            locationGroup.clearLayers();
            this.setState({current_latlng : e.latlng});
              var radius = e.accuracy / 1024;
              radius = radius.toFixed(2);
            //   L.marker(e.latlng, {icon: yourLocation}).addTo(locationGroup)
            //   .bindPopup("You are " + radius + " meters from this point").openPopup();
                
              L.circle(e.latlng, radius).addTo(locationGroup);
              map.setView(e.latlng,15);
              this.setState({currentLatLng : e.latlng});
        });
        
        function onLocationError(e) {
            console.log('location error', e.message);
        }
        map.on('locationerror', onLocationError);

        //my Lord is greate  - Jesus I call your name 
        map.on('click', (e) => {
            var markerGroup = this.state.markerGroup;
            this.setState({first_time_flag: false});
            if(this.state.pickup_flag === 'off'){
                L.marker(e.latlng, {icon: marker_a}).addTo(markerGroup).bindPopup("<div class='popup-title'> Your pickup </div>" + "<div class='popup-content'> driver will come here.</div>" );
                this.setState({
                    pickup_flag : 'on',
                    pickup_latlng : e.latlng,
                    first_time_flag : true
                });
                this.getNearestDrivers(e.latlng);
            }
            
            if(this.state.dropoff_flag === 'off' && this.state.pickup_flag === 'on' && this.state.first_time_flag === false){
                L.marker(e.latlng, {icon: marker_b}).addTo(markerGroup).bindPopup("<div class='popup-title'> Your dropoff </div>" + "<div class='popup-content'> ride ends here.</div>" );
                this.setState({
                    dropoff_flag: 'on',
                    dropoff_latlng: e.latlng
                });
            }
            
            if(this.state.dropoff_flag === 'on' && this.state.pickup_flag ==='on' & this.state.isRouteFound === false) {
                var latlng1 = this.state.pickup_latlng;
                var latlng2 = this.state.dropoff_latlng;
                document.getElementById('div-intro').style.visibility = "hidden"
                this.findRoute(latlng1, latlng2);
            }
             
            if(this.state.pickup_flag ==='on') {  //ready nearest driver
                clearInterval(this.timerUserLocation);  //user start selecting location stop current location change
            }
        }); 
        
        this.timerRideStatus = setInterval(this.checkRideStatus, 7000);
        this.timerUserLocation = setInterval(this.userCurrentLocation, 10000);
    };

    componentDidUpdate(){
       
    }

    getUser = (token) => {
        $.ajax({ 
            type:"GET",
            url:"/user/get",
            headers: { 'x-auth': token },
            contentType: "application/json",
            success: function(user, textStatus, jqXHR) {
              if(user){
                console.log('user is ', user);
                this.setState({
                    user: user,
                    isLogedIn : true,
                    _signInFlag : false
                });   
              }
            }.bind(this),
            error: function(xhr, status, err) {
                console.log('getdriver', err.toString());
                console.error(xhr, status, err.toString());
            }.bind(this)
        });  
    }

    findRoute = (latlng1, latlng2) => {
       // alert('jesus');my lord help me 
        document.getElementById('ride-route-status').innerHTML = 'Please wait ...';
        document.getElementById('ride-route-status').style.visibility = 'visible';
        document.getElementById('ride-price-dashboard').style.visibility = "hidden";
        document.getElementById('ride-route-try').style.visibility = 'hidden';

        var map = this.state.map;
        if(this.routeControl){
            map.removeControl(this.routeControl);
            this.routeControl = null;
        }
        this.routeControl = L.Routing.control({
            waypoints: [
             L.latLng(latlng1),
             L.latLng(latlng2)
            ],
            routeWhileDragging: false,
            addWaypoints : false, //disable adding new waypoints to the existing path
            show: false,
            showAlternatives: false,
            createMarker: function (){
                return null;
            },
            lineOptions: {
                styles: [{color: 'red', opacity: 1, weight: 3}]
            },
            router: L.Routing.osrmv1({
                serviceUrl: env.ROUTING_SERVICE
            })
        })
        .on('routesfound', this.routeFound)
        .on('routingerror', (err) => {
            console.log(err.error.status);
            if(err.error.status === -1){
                document.getElementById('ride-price-dashboard').style.visibility = "hidden";
                document.getElementById('ride-route-status').style.visibility = 'hidden';
                document.getElementById('ride-route-try').style.visibility = 'visible';
            }
        })
        .addTo(map);  
    }
    
    routeFound =(e) => {
        var routes = e.routes;
        var _distance = routes[0].summary.totalDistance;
        var _ride_time = routes[0].summary.totalTime;
        
        _distance = (_distance/1000).toFixed(2);
        var  _ride_time_string = timeConvert(Number.parseInt(_ride_time));

        function timeConvert(n) {
            var num = n;
            var hours = (num / 3600);
            var rhours = Math.floor(hours);
            var minutes = (hours - rhours) * 60;
            var rminutes = Math.round(minutes);
            
            var hDisplay = rhours > 0 ? rhours + " hr" : "";
            var mDisplay = rminutes > 0 ? rminutes + " min" : "";
            return hDisplay + mDisplay; 
         }
        var price_per_km = 10;
        var _ride_price = (_distance * price_per_km).toFixed(2);
        
        this.setState({
            route_distance : Number.parseFloat(_distance).toFixed(2),
            route_price : _ride_price,
            route_time : _ride_time,
            route_time_string :_ride_time_string,
            isRouteFound : true 
        });
       //lord your are God of order, I beg you father not now. THANK YOU FATHER
       document.getElementById('ride-route-try').style.visibility = 'hidden';
       document.getElementById('ride-route-status').style.visibility = 'hidden';
       document.getElementById('ride-price-dashboard').style.visibility = "visible";
       this.nearestDriverRouteInfo(this.state.pickup_latlng, this.state._nearest_driver_latlng);
    }

    nearestDriverRouteInfo = (user_pickup_latlng, nearest_driver_latlng) => {
        console.log('neareest data ', nearest_driver_latlng, user_pickup_latlng);
        var map = this.state.map;
        if(this._neearest_driver_routeControl){
            map.removeControl(this._neearest_driver_routeControl);
            this._neearest_driver_routeControl = null;
        }
        this._neearest_driver_routeControl = L.Routing.control({
            waypoints: [
             L.latLng(user_pickup_latlng),
             L.latLng(nearest_driver_latlng)
            ],
            routeWhileDragging: false,
            addWaypoints : false, //disable adding new waypoints to the existing path
            show: false,
            showAlternatives: false,
            createMarker: function (){
                return null;
            },
            router: L.Routing.osrmv1({
                serviceUrl: env.ROUTING_SERVICE
            })
        })
        .on('routesfound', (e)=> {
            var routes = e.routes;
            var _distance = routes[0].summary.totalDistance;
            var _ride_time = routes[0].summary.totalTime;
            
            _distance = (_distance/1000).toFixed(2);
            var  _ride_time_string = timeConvert(Number.parseInt(_ride_time));
            this.setState({
                _nearest_driver_eta : _ride_time_string 
            });
           
            function timeConvert(n) {
                var num = n;
                var hours = (num / 3600);
                var rhours = Math.floor(hours);
                var minutes = (hours - rhours) * 60;
                var rminutes = Math.round(minutes);
                
                var hDisplay = rhours > 0 ? rhours + " hr" : "";
                var mDisplay = rminutes > 0 ? rminutes + " min" : "";
                return hDisplay + mDisplay; 
            }
            var map = this.state.map;
            if(this._neearest_driver_routeControl){
                map.removeControl(this._neearest_driver_routeControl);
                this._neearest_driver_routeControl = null;
            }
        })
        .on('routingerror', (err) => {
            console.log(err.error.status);
            if(err.error.status === -1){
                
            }
        })
        .addTo(map);  
    }

    getDriverEta = (_to_picup_dropoff, _status) => {
        console.log('data data ', _to_picup_dropoff);
        var map = this.state.map;
        if(this.routeControl){
            map.removeControl(this.routeControl);
            this.routeControl = null;
        }
        this.routeControl = L.Routing.control({
            waypoints: [
             L.latLng(this.state._driverCurrentLocation),
             L.latLng(_to_picup_dropoff)
            ],
            routeWhileDragging: false,
            addWaypoints : false, //disable adding new waypoints to the existing path
            show: false,
            showAlternatives: false,
            createMarker: function (){
                return null;
            },
            lineOptions: {
                styles: [{color: 'blue', opacity: 1, weight: 4}]
            },
            router: L.Routing.osrmv1({
                serviceUrl: env.ROUTING_SERVICE
            })
        })
        .on('routesfound', (e)=> {
            var routes = e.routes;
            var _distance = routes[0].summary.totalDistance;
            var _ride_time = routes[0].summary.totalTime;
            
            _distance = (_distance/1000).toFixed(2);
            var  _ride_time_string = timeConvert(Number.parseInt(_ride_time));
            if(_status === 'pickup'){
                document.getElementById('notify-rider').innerHTML = 'Get ready, driver is ' + _ride_time_string + ' away !';
            } else {
                document.getElementById('notify-rider_2').innerHTML = 'Ride inprogress. ' + _ride_time_string + ' to dropoff !';
            }
            
            function timeConvert(n) {
                var num = n;
                var hours = (num / 3600);
                var rhours = Math.floor(hours);
                var minutes = (hours - rhours) * 60;
                var rminutes = Math.round(minutes);
                
                var hDisplay = rhours > 0 ? rhours + " hr" : "";
                var mDisplay = rminutes > 0 ? rminutes + " min" : "";
                return hDisplay + mDisplay; 
            }
            var map = this.state.map;
            if(this._neearest_driver_routeControl){
                map.removeControl(this._neearest_driver_routeControl);
                this._neearest_driver_routeControl = null;
            }
        })
        .on('routingerror', (err) => {
            console.log("driver eta route erro", err.error.status);
            if(err.error.status === -1){
                // may be change text of eta 
            }
        })
        .addTo(map);  
    }

    rideRequest = (latlng) => {
        
            var user_token = sessionStorage.getItem("_auth_user");
            var objRideRequest = {
                user_id: user_token,
                driver_id: this.state._nearest_driver_token,
                pickup_latlng: `POINT(${this.state.pickup_latlng.lat} ${this.state.pickup_latlng.lng})`, 
                dropoff_latlng: `POINT(${this.state.dropoff_latlng.lat} ${this.state.dropoff_latlng.lng})`,
                route_distance: this.state.route_distance,
                route_time: this.state.route_time,
                route_price: this.state.route_price,
                status: 1
            };
    
            $.ajax({ 
                type:"POST",
                url:"/ride/rideRequest",
                headers: { 'x-auth': sessionStorage.getItem("_auth_user")},
                data: JSON.stringify(objRideRequest), 
                contentType: "application/json",
                success: function(ride, textStatus, jqXHR) {
                    if(!_.isNull(ride)) {
                        this.rideRequestAction(ride);
                    }
                }.bind(this),
                error: function(xhr, status, err) {
                    // if(xhr.status === 401){
                    //    this.setState({_signInFlag:true});
                    // }
                    console.log('ride request reply error', xhr.status);
                    console.error(xhr, status, err.toString());
                }.bind(this)
            });  
    }

    chkTimerRideStatus = () => {
        if(_.isNull(this.timerRideStatus)){
            this.timerRideStatus = setInterval(this.checkRideStatus, 7000);
        }
    }

    rideRequestAction = (ride) => {
        document.getElementById("ride-price-dashboard").style.visibility = "hidden";
        document.getElementById("ride-request-dashboard").style.visibility = "visible";   
        this.chkTimerRideStatus();
        console.log("ride request sucess res ", ride);
    }
    
    checkRideStatus = () => {
        var driver = {
            status : 7
        };
        $.ajax({ 
            type:"POST",
            url:"/ride/check_ride_user",
            headers: { 'x-auth': sessionStorage.getItem("_auth_user")},
            data: JSON.stringify(driver), 
            contentType: "application/json",
            success: function(ride, textStatus, jqXHR) {
                console.log('what is this ', ride.status);
              if(!_.isNull(ride.status)){
                  
                let PromiseSetDriverData;
                if(ride.status !== 0){
                    PromiseSetDriverData = new Promise((res, rejects)=>{
                        //beacuse ride is already started lets stop map click pickup_flag on and dropoff_flag on
                        this.setState({
                            _driverImage: "/assets/profile/driver/" + ride.driver.profile,
                            _driverCarImage: "/assets/awet-ride.jpeg",
                            _driverName : ride.driver.firstName + ' ' + ride.driver.middleName,
                            _driverPlateNo: '02-B78098',
                            _driverMobile: ride.driver.mobile,
                            _driverCarModel: 'LIFAN J450',
                            _driverCurrentLocation : ride.driver.currentLocation.coordinates,
                            pickup_latlng : ride.pickup_latlng.coordinates,
                            dropoff_latlng : ride.dropoff_latlng.coordinates,
                            pickup_flag : 'on', 
                            dropoff_flag : 'on'
                        });
                        clearInterval(this.timerUserLocation);  //lets stop current location as the user already on request
                        
                        res(true);
                    });   
                }

                if(ride.status === 1) {  // wait for driver to accept 
                    this.rideRequestAction(ride);
                } else if (ride.status === 7) {  //driver is commming 
                    // LORD JESUS THANK YOU FOR GIVING ME THIS TIME I WORSHIP YOU MY LORD MY GOD ALWAYS
                    PromiseSetDriverData.then(() => {
                        document.getElementById('ride-request-dashboard').style.visibility="hidden";
                        document.getElementById('u-driver-dashboard').style.visibility="visible"; 
                        this.checkEtaPickUp(this.state.pickup_latlng, 'pickup');
                    });   
                } else if(ride.status === 77) {  //ride on progress 
                    PromiseSetDriverData.then(()=> {
                        document.getElementById('u-driver-dashboard').style.visibility="hidden";
                        document.getElementById('u-driver-dashboard-2').style.visibility="visible"; 
                        this.checkEtaDropOff(this.state.dropoff_latlng, 'dropoff');
                    });

                } else if(ride.status === 0) { // no ride found so end the existing 
                        document.getElementById('ride-request-dashboard').style.visibility="hidden";
                        document.getElementById('u-driver-dashboard').style.visibility="hidden";
                        document.getElementById('u-driver-dashboard-2').style.visibility="hidden";
                        clearInterval(this.timerDriverEta_pickup); 
                        clearInterval(this.timerDriverEta_dropoff);
                        clearInterval(this.timerRideStatus);
                        this.resetRide();
                }
              } else {
                document.getElementById('ride-request-dashboard').style.visibility="hidden";
                document.getElementById('u-driver-dashboard').style.visibility="hidden";
                document.getElementById('u-driver-dashboard-2').style.visibility="hidden";
                clearInterval(this.timerDriverEta_pickup); 
                clearInterval(this.timerDriverEta_dropoff);
                clearInterval(this.timerRideStatus);
                this.timerRideStatus = null;
                this.resetRide();
              }
            }.bind(this),
            error: function(xhr, status, err) {
                console.error(xhr, status, err.toString());
            }.bind(this)
        });  

    }

    checkEtaPickUp = (latlng, status) => {
        if(_.isUndefined(this.timerDriverEta_pickup)){
            this.timerDriverEta_pickup = setInterval(this.getDriverEta, 10000, latlng, status);  // eta from driver current latlng to pickup 
        }
    }

    checkEtaDropOff = (latlng, status) => {
        if(_.isUndefined(this.timerDriverEta_dropoff)){
            clearInterval(this.timerDriverEta_pickup);
            this.timerDriverEta_dropoff = setInterval(this.getDriverEta, 10000, latlng, status);  // eta from driver current latlng to pickup 
        }
    }

    resetRide = () => {
        document.getElementById('ride-price-dashboard').style.visibility = "hidden";
        document.getElementById('ride-route-try').style.visibility = "hidden";
        var map = this.state.map;
        if(this.routeControl){
            map.removeControl(this.routeControl);
            this.routeControl = null;
        }
        var markerGroup = this.state.markerGroup;
        markerGroup.clearLayers();
        
        this.setState({
            pickup_flag: 'off',
            dropoff_flag: 'off',
            isRouteFound : false,
            rideCompleteFlag: false
        });
        map.locate({setView: true, maxZoom: 15});
        this.timerUserLocation = setInterval(this.userCurrentLocation, 10000);
    }

    cancelRide = () => {
        document.getElementById('ride-price-dashboard').style.visibility = "hidden";
        var map = this.state.map;
        if(this.routeControl){
            map.removeControl(this.routeControl);
            this.routeControl = null;
        }
        var markerGroup = this.state.markerGroup;
        markerGroup.clearLayers();
        
        this.setState({
            pickup_flag: 'off',
            dropoff_flag: 'off',
            isRouteFound : false,
            rideCompleteFlag: false
        });
        map.locate({setView: true, maxZoom: 15});
        this.timerUserLocation = setInterval(this.userCurrentLocation, 10000);
    }

    validateVarification = () => {
        let errors = [];
        
        if(this.state.varificationCode.length === 0) {
            errors.push("Varification field is empty.");
        } else if (validator.isLength(this.state.varificationCode, {min: 5}) === false){
            errors.push("Code must not be less than 5 characters");
        }else if(validator.isLength(this.state.varificationCode, {max: 5}) === false){
            errors.push("Code is greater than 5 characters");
        } else if (validator.isNumeric(this.state.varificationCode, {no_symbols: true} ) === false) {
            errors.push("Varification number is not valid");
        }
    
        return errors;
    }

    validateProfile = () => {
        console.log('file', this.state.file);
        let errors = [];
        
        if(this.state.file.length === 0) {
            errors.push("Picture is empty. Browse first.");
        } 

        if(this.state.file.size > 1024000) {
            errors.push("Selected Picture is very large");
        }
       
        if(this.state.file.size > 0) {
            
            var t = this.state.file.type.split('/').pop().toLowerCase();
            console.log('ttt', t);
            if (t != "jpeg" && t != "jpg" && t != "png" && t != "bmp" && t != "gif") {
                errors.push('Please select a valid image file');
            }
        }
        
        return errors;
    }

    getErrorList(errors){
        var i = 0;
        let error_list = errors.map(error => {
            return <li key={i++}>{error}</li>
        });
        return error_list;
    }

    change = (e) => {
        this.setState({
            [e.target.name]: e.target.value
        })
        
    }

    _onChange_profile = (e) => {
        e.preventDefault();

        let reader = new FileReader();
        let file = e.target.files[0];
    
        reader.onloadend = () => {
          this.setState({
            file: file,
            imagePreviewUrl: reader.result
          });
        }
    
        reader.readAsDataURL(file)
    }

    onProfileUpload = (e) => {
        e.preventDefault();
        const err = this.validateProfile();
        if(err.length > 0){
            let error_list = this.getErrorList(err);
            render(<Alert bsStyle="danger" >{error_list}</Alert>,document.getElementById('ProfileError'));
        } else {
            this.uploadProfile();
            this.setState({
                file : '',
                imagePreviewUrl : '',
                errors: []
            });
        }
    }

    onVarify = (e) => {
        e.preventDefault();
        const err = this.validateVarification();
        if(err.length > 0){
            let error_list = this.getErrorList(err);
            render(<Alert bsStyle="danger" >{error_list}</Alert>,document.getElementById('FormError'));
        } else {
            var data = {
                varification_code : this.state.varificationCode
            }
            this.varify(data)
            this.setState({
                varificationCode : '',
                errors: []
            });
        }
    }

    varify = (data) => {
        $.ajax({ 
            type:"POST",
            url:"/user/mobile_verification",
            headers: { 'x-auth': sessionStorage.getItem("_auth_user")},
            data: JSON.stringify(data), 
            contentType: "application/json",
            success: function(data, textStatus, jqXHR) {
               if(data){
                render(<VerificationRply></VerificationRply>,document.getElementById('account-verfiy'));
                //document.getElementById('account-verfiy').style.visibility = 'hidden';
                this.getUser(sessionStorage.getItem("_auth_user")); //reload user after varification
               } 
            }.bind(this),
            error: function(xhr, status, err) {
                render(<Alert bsStyle="danger" >Verification faild !</Alert>,document.getElementById('FormError'));
                console.error(xhr, status, err.toString());
            }.bind(this)
        });  
    }

    uploadProfile = () => {
        const formData = new FormData();
        formData.append('myImage',this.state.file);
        console.log('dataaa', formData, this.state.file);
        $.ajax({ 
            type:"POST",
            url:"/user/profile",
            headers: { 'x-auth': sessionStorage.getItem("_auth_user")},
            data: formData, 
            cache: false,
            contentType: false,
            processData: false,
            success: function(data, textStatus, jqXHR) {
              if(data.length > 0) {
                if(data[0] === 1) {
                   document.getElementById('div-profile').style.visibility = 'hidden';
                   
                   this.getUser(sessionStorage.getItem("_auth_user"));
                } else {
                    render(<Alert bsStyle="danger" >Not updated. Try again !</Alert>,document.getElementById('ProfileError'));
                }
              }
            }.bind(this),
            error: function(xhr, status, err) {
                render(<Alert bsStyle="danger" >Connection error !</Alert>,document.getElementById('ProfileError'));
            }.bind(this)
        });  
    }

    render(){ 

        if(this.state._signInFlag) {
            return <Redirect to='/user/login'  />
        }  
        return(
            <div>
              <div className="user-info" id="user-info">
                <Grid fluid>
                    <Row>
                      {this.state.user.hasProfile === true ?  
                      <Col xs={4} sm={4} md={4}><Image src={'/assets/profile/user/' + this.state.user.profile} height={35} circle></Image></Col>
                      : 
                      <Col xs={4} sm={4} md={4}><Image src={'/assets/awet-rider-m.png'} height={35} circle></Image></Col>
                      }
                      
                      <Col xs={4} sm={4} md={4} className="colPadding">{this.state.isLogedIn === true ? 'hi ' + this.state.user.firstName : 'hi rider'}</Col>
                      <Col xs={4} sm={4} md={4} className="colPadding">{this.state.isLogedIn === true ? <NavLink to="/user/login">Logout</NavLink> : <NavLink to="/user/login">Login</NavLink>}</Col>
                    </Row>
                </Grid>
              </div>
              
              {this.state.user.verified === false ?  
              <div className="account-verify" id="account-verfiy">
                        <form>
                        <Alert bsStyle="success" onDismiss={this.handleDismiss}>
                            <h4>Final step! Varify your mobile!</h4>
                            <p>
                                If the mobile number {this.state.user.mobile} is yours. 
                                Enter the text message sent to your mobile
                                and click varify.
                            </p>
                            <p>
                               <Grid fluid>
                                   <Row>
                                   <Col xs={6} sm={6} md={6}>
                                        <FormGroup>
                                        <FormControl
                                        name="varificationCode"
                                        type="text"
                                        value={this.state.varificationCode}
                                        placeholder="XXXXX"
                                        onChange={e => this.change(e)}
                                        >
                                        </FormControl>
                                        </FormGroup>
                                   </Col>
                                   <Col xs={6} sm={6} md={6}> 
                                     <Button bsStyle="primary" onClick={(e) => this.onVarify(e)} block>VARIFY</Button>
                                   </Col>
                                   </Row>
                                   <Row>
                                    <Col xs={12} sm={12} md={12}>
                                      <div className="FormError" id="FormError"></div>
                                    </Col>
                                   </Row>
                               </Grid>
                            </p>
                        </Alert>
                        </form>
              </div>
              : ''}

              <div className="div-intro" id="div-intro">
               <Grid fluid>
                 <Row> 
                     <Col xs={12} sm={12} sm={12}>Start by clicking your pickup and dropoff from the map.</Col>
                 </Row>
               </Grid>
              </div>


              {this.state.user.verified === true && this.state.user.hasProfile === false ? 
               <div className="div-profile" id="div-profile">
               <Grid fluid>
               <Alert bsStyle="success" onDismiss={this.handleDismiss}>
                            <h4>Profile picture !</h4>
                            <p>
                                Helps to identify who you are.
                            </p>
                            <p>
                                <form>
                                    <Row className="text-center"> 
                                        <Col xs={6} sm={6} sm={6}>
                                        <FormGroup>
                                        <FormControl
                                            title=" "
                                            className="file1"
                                            name="profile_pic"
                                            type="file"
                                            onChange={e => this._onChange_profile(e)}
                                        >
                                        </FormControl> 
                                        </FormGroup>
                                        </Col>

                                        <Col xs={6} sm={6} sm={6}>
                                        <Image src = {this.state.imagePreviewUrl} height={35} circle></Image>
                                      </Col>
                                    </Row>

                                    <Row className="rowPaddingSm text-center">
                                        <Col xs={12} sm={12} md={12}>
                                        <Button  onClick={(e) => this.onProfileUpload(e)} bsStyle="info" bsSize="small">Upload Image</Button>
                                        </Col>
                                    </Row>
                                    <Row>
                                    <Col xs={12} sm={12} md={12}>
                                      <div className="ProfileError" id="ProfileError"></div>
                                    </Col>
                                   </Row>
                                </form>
                            </p>
                        </Alert>
               </Grid>
              </div>
              : '' }
              

              <div className="ride-price-dashboard" id="ride-price-dashboard">
                <div>
                  <Grid fluid={true}>
                      <Row>
                          <Col xs={4} sm={4} md={4}>
                            Price   
                          </Col>

                          <Col xs={4} sm={4} md={4}>
                            Distance
                          </Col>

                          <Col xs={4} sm={4} md={4}>
                           Time 
                          </Col>
                      </Row>
                      
                      <Row>
                          <Col xs={4} sm={4} md={4}>
                            <Badge>{ this.state.route_price + ' br'}</Badge>   
                          </Col>

                          <Col xs={4} sm={4} md={4}>
                            <Badge>{this.state.route_distance + ' km'}</Badge>
                          </Col>

                          <Col xs={4} sm={4} md={4}>
                           <Badge>{this.state.route_time_string}</Badge>
                          </Col>
                      </Row>
                      
                      <Row className="rowPaddingSm">
                          <Col xs={12} sm={12} md={12}>
                             <div>driver is <Badge>{this.state._nearest_driver_eta}</Badge> away.</div>
                          </Col>
                      </Row>

                      <Row className="rowPaddingSm">
                          <Col xs={12} sm={12} md={12}>
                          {this.state._nearest_driver_available ? 
                           <Button  onClick={(e) => this.rideRequest(this.state.pickup_latlng, e)} bsStyle="success" bsSize="small" block>REQUEST RIDE</Button>
                           : 
                           ''
                          }
                           </Col>
                      </Row>
                      <Row className="rowPaddingSm">
                          <Col xs={12} sm={12} md={12}>
                          <Button  onClick={(e) => this.cancelRide(e)} bsStyle="default" bsSize="small" block>CANCEL RIDE</Button>
                          </Col>
                      </Row>

                  </Grid>
                  </div>
                 
              </div>
              
              <div className="ride-request-dashboard shake-ride-request" id="ride-request-dashboard"> 
                    Connecting nearest drivers <br />
                    wait !
              </div>

              <div className="ride-route-status" id="ride-route-status"> 
              </div>

              <div className="ride-route-try" id="ride-route-try"> 
                <strong>Oh! </strong> No connection. Try again.
                <p> 
                 <Grid fluid>
                     <Row className="rowPaddingSm">
                          <Col xs={6} sm={6} md={6}>
                           <Button  onClick={(e) => this.findRoute(this.state.pickup_latlng, this.state.dropoff_latlng, e)} bsStyle="warning" bsSize="small" block>TRY AGAIN</Button>
                          </Col>

                          <Col xs={6} sm={6} md={6}>
                           <Button  onClick={(e) => this.resetRide(e)}  bsSize="small" block>CANCEL</Button>
                          </Col>

                     </Row>
                 </Grid>   
                 </p> 
              </div>

              <div className="u-driver-dashboard shake-ride-to-pickup" id="u-driver-dashboard"> 
                <div className="notify-rider" id="notify-rider"> Get ready ! driver coming.</div>
                 <Grid fluid>
                    <Row>
                        <Col xs={4} sm={4} md={4}><Image src={this.state._driverImage} height={45} circle></Image></Col>
                        <Col xs={4} sm={4} md={4}><Image src={this.state._driverCarImage} height={45} circle></Image></Col>
                        <Col xs={4} sm={4} md={4}>{this.state._driverCarModel} {this.state._driverPlateNo}</Col>
                    </Row>
                    <Row>
                        <Col xs={6} sm={6} md={6}>{this.state._driverName}</Col>
                        <Col xs={6} sm={6} md={6}>{this.state._driverMobile}</Col>
                    </Row>
                 </Grid>
              </div>

              <div className="u-driver-dashboard-2 shake-ride-to-pickup" id="u-driver-dashboard-2"> 
                <div className="notify-rider_2" id="notify-rider_2"> Ride inprogress</div>
                 <Grid fluid>
                    <Row>
                        <Col xs={4} sm={4} md={4}><Image src={this.state._driverImage} height={45} circle></Image></Col>
                        <Col xs={4} sm={4} md={4}><Image src={this.state._driverCarImage} height={45} circle></Image></Col>
                        <Col xs={4} sm={4} md={4}>{this.state._driverCarModel} {this.state._driverPlateNo}</Col>
                    </Row>
                    <Row>
                        <Col xs={6} sm={6} md={6}>{this.state._driverName}</Col>
                        <Col xs={6} sm={6} md={6}>{this.state._driverMobile}</Col>
                    </Row>
                 </Grid>
              </div>


              <div className="mapid" id="mapid"></div>
            </div>
        );
    }
}
export default PickUpMap;