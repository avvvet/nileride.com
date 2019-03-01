import React, { Component } from 'react';
import { render } from 'react-dom';
import L from 'leaflet';
import { Grid, Message, Form , Label, Button , Card, Image, Icon, Table, Input } from 'semantic-ui-react'
import {NavLink, Redirect} from 'react-router-dom';
import * as Nominatim from "nominatim-browser";
import $ from 'jquery';
import _ from 'lodash';

import DriverBusy from './rider/drivers_busy';
import Rate from './rider/rate';
import DriverCancelRide from './rider/driver_cancel_ride';
import VerificationRply from './verfication_rply';
import { ETIME } from 'constants';
import { OpenStreetMapProvider } from 'leaflet-geosearch';
const env = require('../env');
var validator = require('validator');
var yourLocation = L.icon({
    iconUrl: '/assets/awet-rider-m.png',
    shadowUrl: '',

    iconSize:     [35, 35], // size of the icon
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
var img = `<img src='/assets/nile_ride_driver.png' />`;
var driver_icon = L.divIcon({
    html: img,
    shadowUrl: '',
    className: 'image-icon-driver',
    iconSize:     [25, 25], // size of the icon
    shadowSize:   [50, 64], // size of the shadow
    iconAnchor:   [12, 14], // point of the icon which will correspond to marker's location
    shadowAnchor: [4, 62],  // the same for the shadow
    popupAnchor:  [0, -10] // point from which the popup should open relative to the iconAnchor
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
            pickup_eta_flag : false,
            dropoff_eta_flag : false,
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
            _nearest_driver_eta : '0 min' ,
            _nearest_driver_available : false,
            _nearest_driver_latlng : {
                lat: 0,
                lng:0
            },
            count_driver : 0,
            _signInFlag : false,
            _fire_driver_eta_flag : false,
            errors: [],
            init_map_click : false,
            dropoff_search_results : [],
            dropoff_search : '',
            pickup_search_results : [],
            pickup_search : '',
            input_pickup_size : 'mini',
            input_dropoff_size : 'large',
            user_searched_pickup_flag : false,
            user_searched_pickup_latlng : {
                lat: 0,
                lng: 0
            },
        }
    }

    userCurrentLocation = () => {
        let PromiseLocateDriver = new Promise((resolve, reject)=>{
                this.getDrivers();
                var map = this.state.map;
                map.locate({setView: false, maxZoom: 16});
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
        $.ajax({ 
            type:"GET",
            url:"/drivers",
            contentType: "application/json",
            success: function(currentDrivers, textStatus, jqXHR) {
                var carMarkerGroup = this.state.carMarkerGroup;
                carMarkerGroup.clearLayers();  //lets clear and update it 
                var count_driver = 0;
                if(currentDrivers){
                    count_driver = currentDrivers.length;
                    for (var i = 0; i < currentDrivers.length; i++) {
                        L.marker([currentDrivers[i].currentLocation[0],currentDrivers[i].currentLocation[1]], {icon: driver_icon})
                        .bindPopup(currentDrivers[i].firstName + ' ' + currentDrivers[i].middleName)
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
                  this.nearest_driver_eta(pickup_latlng, driver[0].currentLocation.coordinates);
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
       // this.nameInput.focus();
        var map = L.map('mapid').setView([9.0092, 38.7645], 16);
        //var map = L.map('mapid');
        map.locate({setView: true, maxZoom: 17});
        //Lord you are good - you are more than anything that is what I know
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
            var radius = e.accuracy / 1024;
            radius = radius.toFixed(2);
            if(radius < env.LOCATION_ACCURACY){
                var locationGroup = this.state.locationGroup;
                locationGroup.clearLayers();
                this.setState({current_latlng : e.latlng});
                var img;
                if(this.state.user.hasProfile === true) {
                    img = `<img src='/assets/profile/user/${this.state.user.profile}' />` 
                } else {
                    img = `<img src='/assets/awet-rider-m.png' />`
                }
                var user_icon = L.divIcon({
                    html: img,
                    shadowUrl: '',
                    className: 'image-icon',
                    iconSize:     [25, 25], // size of the icon
                    shadowSize:   [50, 64], // size of the shadow
                    iconAnchor:   [12, 14], // point of the icon which will correspond to marker's location
                    shadowAnchor: [4, 62],  // the same for the shadow
                    popupAnchor:  [0, -10] // point from which the popup should open relative to the iconAnchor
                });

                L.marker(e.latlng, {icon: user_icon}).addTo(locationGroup)
                .bindPopup("You are here.");
                L.circle(e.latlng, radius).addTo(locationGroup);
                // map.setView(e.latlng,15);
                this.setState({
                    currentLatLng : e.latlng,
                    pickup_flag : 'on',
                    pickup_latlng : e.latlng,   //current location become as pickup 
                    first_time_flag : true
                });
                    
            }     
        });
        
        function onLocationError(e) {
            console.log('location error', e.message);
        }
        map.on('locationerror', onLocationError);

        //my Lord is greate  - Jesus I call your name 
        map.on('click', (e) => {
            // var markerGroup = this.state.markerGroup;
            // this.setState({first_time_flag: false});
            // if(this.state.pickup_flag === 'off'){
            //     L.marker(e.latlng, {icon: marker_a}).addTo(markerGroup).bindPopup("<div class='popup-title'> Your pickup </div>" + "<div class='popup-content'> driver will come here.</div>" );
            //     this.setState({
            //         pickup_flag : 'on',
            //         pickup_latlng : e.latlng,
            //         first_time_flag : true
            //     });
            //     this.getNearestDrivers(e.latlng);
            // }
            
            // if(this.state.dropoff_flag === 'off' && this.state.pickup_flag === 'on' && this.state.first_time_flag === false){
            //     L.marker(e.latlng, {icon: marker_b}).addTo(markerGroup).bindPopup("<div class='popup-title'> Your dropoff </div>" + "<div class='popup-content'> ride ends here.</div>" );
            //     this.setState({
            //         dropoff_flag: 'on',
            //         dropoff_latlng: e.latlng
            //     });
            // }
            
            // if(this.state.dropoff_flag === 'on' && this.state.pickup_flag ==='on' & this.state.isRouteFound === false) {
            //     var latlng1 = this.state.pickup_latlng;
            //     var latlng2 = this.state.dropoff_latlng;
            //     this.findRoute(latlng1, latlng2);
            // }
            
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
        console.log('Jesus loves you', e.routes);
        var markerGroup = this.state.markerGroup;
        markerGroup.clearLayers();

        var routes = e.routes;
        var _distance = routes[0].summary.totalDistance;
        var _ride_time = routes[0].summary.totalTime;
        
        _distance = (_distance/1000).toFixed(2);
        var  _ride_time_string = timeConvert(Number.parseInt(_ride_time));
        //this holdes the new changes 
        this.setState({
            pickup_latlng : routes[0].waypoints[0].latLng,
            dropoff_latlng : routes[0].waypoints[1].latLng
        });
        console.log('son of God',this.state.pickup_latlng, this.state.dropoff_latlng);
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
       //this.nearestDriverRouteInfo(this.state.pickup_latlng, this.state._nearest_driver_latlng);
    }

    nearest_driver_eta = (user_pickup_latlng, nearest_driver_latlng) => {
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
            console.log('route', e);
            var routes = e.routes;
            var _distance = routes[0].summary.totalDistance;
            var _ride_time = routes[0].summary.totalTime;
            
            _distance = (_distance/1000).toFixed(2);
            var  _ride_time_string = timeConvert(Number.parseInt(_ride_time));
           console.log('time', _ride_time_string);
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

    rideRequest = (e) => {
        e.preventDefault(); 
        //e.target.disabled = true;
        $('.btn').addClass("disabled");

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
            success: function(ride, e) {
                $('.btn').removeClass("disabled");
                console.log('repy of request ', ride);
                if(!_.isNull(ride)) {
                    console.log('yes yes yes ');
                    this.rideRequestAction(ride);
                }
            }.bind(this),
            error: function(xhr, status, err) {
                e.target.disabled = false;
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
        document.getElementById("search_1").style.visibility = "hidden";  
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
              if(!_.isNull(ride.status)){
                let _model;
                let _plate;
                if(ride.driver.cars.length>0){
                  _model = ride.driver.cars[0].model;
                  _plate = ride.driver.cars[0].plate_no;
                }
                let PromiseSetDriverData;
                if(ride.status !== 0){
                    PromiseSetDriverData = new Promise((res, rejects)=>{
                        //beacuse ride is already started lets stop map click pickup_flag on and dropoff_flag on
                        this.setState({
                            _driverImage: "/assets/profile/driver/" + ride.driver.profile,
                            _driverCarImage: "/assets/nile_ride_driver.png",
                            _driverName : ride.driver.firstName + ' ' + ride.driver.middleName,
                            _driverPlateNo: _plate,
                            _driverMobile: ride.driver.mobile,
                            _driverCarModel: _model,
                            _driverCurrentLocation : ride.driver.currentLocation.coordinates,
                            pickup_latlng : ride.pickup_latlng.coordinates,
                            dropoff_latlng : ride.dropoff_latlng.coordinates,
                            pickup_flag : 'on', 
                            dropoff_flag : 'on',
                            isRouteFound : true
                        });
                        //clearInterval(this.timerUserLocation);  //lets stop current location as the user already on request
                        
                        res(true);
                    });   
                } 

                if(ride.status === 1) {  // wait for driver to accept 1=waiting 2=driver notreply but waiting
                    this.rideRequestAction(ride);
                } else if (ride.status === 7) {  //driver is commming 
                    // LORD JESUS THANK YOU FOR GIVING ME THIS TIME I WORSHIP YOU MY LORD MY GOD ALWAYS
                    PromiseSetDriverData.then(() => {
                        document.getElementById('ride-request-dashboard').style.visibility="hidden";
                        document.getElementById('u-driver-dashboard').style.visibility="visible"; 
                        //this.checkEtaPickUp(this.state.pickup_latlng, 'pickup');

                        //show route from driver to pickup only one time 
                        if(this.state.pickup_eta_flag === false){
                            this._pickup_route(this.state.pickup_latlng, this.state._driverCurrentLocation);
                            this.timer_pickup_eta = setInterval(this._pickup_eta, 10000);
                        }

                    });   
                } else if(ride.status === 77) {  //ride on progress 
                    PromiseSetDriverData.then(()=> {
                        document.getElementById('ride-request-dashboard').style.visibility="hidden";
                        document.getElementById('u-driver-dashboard').style.visibility="hidden";
                        document.getElementById('u-driver-dashboard-2').style.visibility="visible"; 

                        if(this.state.dropoff_eta_flag === false){
                            this._dropoff_route(this.state.pickup_latlng, this.state.dropoff_latlng);
                            clearInterval(this.timer_pickup_eta);
                            this.timer_dropoff_eta = setInterval(this._dropoff_eta, 10000);
                        }
                    });

                } else if(ride.status === 4) { // driver cancel the ride after accepting  
                    PromiseSetDriverData.then(()=> {
                        document.getElementById('ride-request-dashboard').style.visibility="hidden";
                        document.getElementById('u-driver-dashboard').style.visibility="hidden";
                        document.getElementById('u-driver-dashboard-2').style.visibility="hidden";

                        document.getElementById('div-notification-1').style.visibility="visible";
                        render(<DriverCancelRide resetRide={this.resetRide} ride={ride}></DriverCancelRide>,document.getElementById('div-notification-1'));
                    
                        clearInterval(this.timerRideStatus);
                        clearInterval(this.timer_pickup_eta);
                        clearInterval(this.timer_dropoff_eta);
                    });
                        
                } else if(ride.status === 0) { // no ride found so end the existing 
                    document.getElementById('ride-request-dashboard').style.visibility="hidden";
                    document.getElementById('u-driver-dashboard').style.visibility="hidden";
                    document.getElementById('u-driver-dashboard-2').style.visibility="hidden";
                    
                    clearInterval(this.timerRideStatus);
                    clearInterval(this.timer_pickup_eta);
                    clearInterval(this.timer_dropoff_eta);
                    this.resetRide();
                } else if(ride.status === 2) { // your request could not get driver
                    document.getElementById('ride-request-dashboard').style.visibility="hidden";
                    document.getElementById('u-driver-dashboard').style.visibility="hidden";
                    document.getElementById('u-driver-dashboard-2').style.visibility="hidden";
                   
                    document.getElementById('div-notification-1').style.visibility="visible";
                    render(<DriverBusy resetRide={this.resetRide}></DriverBusy>,document.getElementById('div-notification-1'));
                   
                    clearInterval(this.timer_pickup_eta);
                    clearInterval(this.timer_dropoff_eta);
                    clearInterval(this.timerRideStatus);
                    
                }  else if(ride.status === 7777) { // rate your ride 
                    document.getElementById('ride-request-dashboard').style.visibility="hidden";
                    document.getElementById('u-driver-dashboard').style.visibility="hidden";
                    document.getElementById('u-driver-dashboard-2').style.visibility="hidden";
                   
                    document.getElementById('div-notification-1').style.visibility="visible";
                    render(<Rate resetRide={this.resetRide} ride={ride}></Rate>,document.getElementById('div-notification-1'));
                    
                    clearInterval(this.timer_pickup_eta);
                    clearInterval(this.timer_dropoff_eta);
                    clearInterval(this.timerRideStatus);
                    
                }

                
              } else {
                document.getElementById('ride-request-dashboard').style.visibility="hidden";
                document.getElementById('u-driver-dashboard').style.visibility="hidden";
                document.getElementById('u-driver-dashboard-2').style.visibility="hidden";
                clearInterval(this.timer_pickup_eta);
                clearInterval(this.timer_dropoff_eta);
                clearInterval(this.timerRideStatus);
                this.timerRideStatus = null;
                this.timer_pickup_eta = null;
                this.timer_dropoff_eta = null;
                this.resetRide();
              }
            }.bind(this),
            error: function(xhr, status, err) {
                console.error(xhr, status, err.toString());
            }.bind(this)
        });  

    }

    _pickup_route = (latlng1, latlng2) => {
        var map = this.state.map;
        var markerGroup = this.state.markerGroup;
        markerGroup.clearLayers();  
        L.marker(latlng1, {icon: marker_a}).addTo(markerGroup)
        .bindPopup("Pickup location.");
        L.marker(latlng2, {icon: driver_icon}).addTo(markerGroup)
        .bindPopup("Final dropoff location.");

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
         .on('routesfound', (route) => {
            this.setState({
                pickup_eta_flag : true
            })
         })
         .on('routingerror', (err) => {
             console.log(err.error.status);
             this.setState({
                pickup_eta_flag : false
            })
         })
         .addTo(map);  
     }

     _dropoff_route = (latlng1, latlng2) => {
        var map = this.state.map;
        var markerGroup = this.state.markerGroup;
        markerGroup.clearLayers();  
        L.marker(latlng1, {icon: marker_a}).addTo(markerGroup)
        .bindPopup("Pickup location.");
        L.marker(latlng2, {icon: marker_b}).addTo(markerGroup)
        .bindPopup("Final dropoff location.");

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
        .on('routesfound', (route) => {
           this.setState({
               dropoff_eta_flag : true
           })
        })
        .on('routingerror', (err) => {
            console.log(err.error.status);
            this.setState({
               dropoff_eta_flag : false
           })
        })
        .addTo(map);  
    }

    _pickup_eta = () => {
        
        var latlng1 = this.state.pickup_latlng;
        var latlng2 = this.state._driverCurrentLocation;
        var waypoints = [
            L.Routing.waypoint(latlng1),
            L.Routing.waypoint(latlng2)
           ]
        var router = L.Routing.osrmv1({
            serviceUrl: env.ROUTING_SERVICE,
        });
        
        router.route(waypoints, (error, routes) => {
            if(!_.isUndefined(routes)) {
                var _ride_time = routes[0].summary.totalTime;
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
            }
           
        });
    }

    _dropoff_eta = () => {
        var latlng1 = this.state._driverCurrentLocation;
        var latlng2 = this.state.dropoff_latlng;
        var waypoints = [
            L.Routing.waypoint(latlng1),
            L.Routing.waypoint(latlng2)
           ]
        var router = L.Routing.osrmv1({
            serviceUrl: env.ROUTING_SERVICE,
        });
        
        router.route(waypoints, (error, routes) => {
            if(!_.isUndefined(routes)) {
                var _ride_time = routes[0].summary.totalTime;
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
            }
           
        });
    }

    resetRide = () => {
        document.getElementById('ride-price-dashboard').style.visibility = "hidden";
        document.getElementById('ride-route-try').style.visibility = "hidden";

        if(this.state.user.verified === true && this.state.user.hasProfile === true) {
            document.getElementById('search_1').style.visibility = "visible" 
        }

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
            rideCompleteFlag: false,
            pickup_eta_flag : false,
            dropoff_eta_flag: false,
            dropoff_search : '',
            pickup_search : ''
        });
        map.locate({setView: true, maxZoom: 15});
        //this.timerUserLocation = setInterval(this.userCurrentLocation, 10000);
        this.timerRideStatus = null;
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
            rideCompleteFlag: false,
            pickup_eta_flag : false,
            dropoff_eta_flag: false,
            dropoff_search : '',
            pickup_search : ''
        });
        map.locate({setView: true, maxZoom: 15});
        //this.timerUserLocation = setInterval(this.userCurrentLocation, 10000);
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
        e.target.disabled = true;
        e.preventDefault();
        const err = this.validateProfile();
        if(err.length > 0){
            e.target.disabled = false;
            let error_list = this.getErrorList(err);
            render(<Message bsStyle="danger" >{error_list}</Message>,document.getElementById('ProfileError'));
        } else {
            this.uploadProfile(e);
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
            render(<div>{error_list}</div>,document.getElementById('FormError'));
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
        $('.btn_mobile_varify').addClass("loading");
        $.ajax({ 
            type:"POST",
            url:"/user/mobile_verification",
            headers: { 'x-auth': sessionStorage.getItem("_auth_user")},
            data: JSON.stringify(data), 
            contentType: "application/json",
            success: function(data, textStatus, jqXHR) {
                $('.btn_mobile_varify').removeClass("loading");
               if(data){
                render(<VerificationRply></VerificationRply>,document.getElementById('account-verfiy'));
                //document.getElementById('account-verfiy').style.visibility = 'hidden';
                this.getUser(sessionStorage.getItem("_auth_user")); //reload user after varification
               } 
            }.bind(this),
            error: function(xhr, status, err) {
                $('.btn_mobile_varify').removeClass("loading");
                render(<Message bsStyle="danger" >Verification faild !</Message>,document.getElementById('FormError'));
                console.error(xhr, status, err.toString());
            }.bind(this)
        });  
    }

    uploadProfile = (e) => {
        $('.btn_upload').addClass("loading");
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
              $('.btn_upload').removeClass("loading");
              if(data.length > 0) {
                if(data[0] === 1) {
                   document.getElementById('div-profile').style.visibility = 'hidden';
                   
                   this.getUser(sessionStorage.getItem("_auth_user"));
                } else {
                    e.target.disabled = false;
                    render(<Message bsStyle="danger" >Not updated. Try again !</Message>,document.getElementById('ProfileError'));
                }
              }
            }.bind(this),
            error: function(xhr, status, err) {
                $('.btn_upload').removeClass("loading");
                e.target.disabled = false;
                render(<Message bsStyle="danger" >Connection error, try again !</Message>,document.getElementById('ProfileError'));
            }.bind(this)
        });  
    }

    _search_pickup = (search) => {
        if(search.length > 0){
            const provider = new OpenStreetMapProvider(); 
            provider
            .search({ query: search + ' addis ababa' })
            .then((results) => { 
              $('.pickup_search').removeClass("loading");
              // do something with result;
              console.log('I am winner beacuse I have Jesus', results);
              this.setState({
                pickup_search_results : results
              });
              document.getElementById('search_result_pickup').style.visibility = 'visible';
            });
        } else {
            $('.pickup_search').removeClass("loading");
        }
    }

    pickup_nomi = (results) => {
        var i = 0;
        const data = results.map((result) =>
        <Table.Row key={i++} >
            <Table.Cell onClick={() => this.handleRowClick_pickup(result)}>{result.label}</Table.Cell>
        </Table.Row>         
        );
        return data;
    }
    
    handleRowClick_pickup = (result) => {
         //my lord thank you thank you 
        if(result) {
          document.getElementById('search_result_pickup').style.visibility = 'hidden';
          var latlng = {
            lat : parseFloat(result.y),
            lng : parseFloat(result.x)
          }
          this.setState({
              pickup_search : result.label,
              pickup_flag : 'on',
              user_searched_pickup_flag : true,
              user_searched_pickup_latlng : latlng,
              first_time_flag : true
          });
        
          var markerGroup = this.state.markerGroup;
          var map = this.state.map;
          L.marker(latlng, {icon: marker_a}).addTo(markerGroup);
          map.fitBounds(result.bounds);

          if(this.state.dropoff_flag ==='on' ) {
            var latlng1 = latlng;
            var latlng2 = this.state.dropoff_latlng;
            this.findRoute(latlng1, latlng2);
          }

        }
    }

    _search_pickup_on_change = (e) => {
        e.preventDefault();
        $('.pickup_search').addClass("loading");
        this.setState({
            [e.target.name]: e.target.value
        });

        clearTimeout(this.timeout_pickup);

        this.timeout_pickup = setTimeout(this._search_pickup, 1000, e.target.value);
    }

    handleFocusPickup = (event) => event.target.select();

    handlClickPickup = (event) => {
        event.target.select();
        this.setState({
            input_pickup_size : 'large',
        })
    }

    handleClickDropOff = (event) => {
        event.target.select();
        this.setState({
            input_pickup_size : 'mini',
        })
    }

    _search_dropoff = (search) => {
        if(search.length > 0){
            const provider = new OpenStreetMapProvider(); 
            provider
            .search({ query: search + ' addis ababa' })
            .then((results) => { 
              if(results.length > 0) {
                $('.dropoff_search').removeClass("loading");
                // do something with result;
                console.log('I am winner beacuse I have Jesus', results);
                this.setState({
                  dropoff_search_results : results
                });
                console.log('again winner');
                document.getElementById('search_result_dropoff').style.visibility = 'visible';
              } else {
                $('.dropoff_search').removeClass("loading");
                this.setState({
                    dropoff_search_results : [{'label' : 'No result !'}]
                });
                console.log('again again winner');
                document.getElementById('search_result_dropoff').style.visibility = 'visible';
              }
            });
        } else {
            this.setState({
                dropoff_search_results : ''
              });
              document.getElementById('search_result_dropoff').style.visibility = 'visible';
            $('.dropoff_search').removeClass("loading");
        }
    }

    dropoff_nomi = (results) => {

        if(results) {
            var i = 0;
            const data = results.map((result) =>
            <Table.Row key={i++} >
                <Table.Cell onClick={() => this.handleRowClick_dropoff(result)}>{result.label}</Table.Cell>
            </Table.Row>         
            );
            return data;
        } 
    }
    
    handleRowClick_dropoff = (result) => {
        //my lord thank you thank you 
        if(result) {
          var latlng = {
                lat : parseFloat(result.y),
                lng : parseFloat(result.x)
          }
          document.getElementById('search_result_dropoff').style.visibility = 'hidden';
          this.setState({
              dropoff_search : result.label,
              dropoff_flag: 'on',
              dropoff_latlng: latlng
          });
          var markerGroup = this.state.markerGroup;
          var map = this.state.map;
          L.marker(latlng, {icon: marker_b}).addTo(markerGroup);
          map.fitBounds(result.bounds);

          if(this.state.pickup_flag ==='on') {
            var latlng1;
            if(this.state.user_searched_pickup_flag) {
                latlng1 = this.state.user_searched_pickup_latlng;
            } else {
                latlng1 = this.state.pickup_latlng;
            }
            
            var latlng2 = latlng;
            this.findRoute(latlng1, latlng2);
          }

        }
    }

    _search_dropoff_on_change = (e) => {
        e.preventDefault();
        $('.dropoff_search').addClass("loading");
        this.setState({
            [e.target.name]: e.target.value
        });

        clearTimeout(this.timeout_dropoff);

        this.timeout_dropoff = setTimeout(this._search_dropoff, 1000, e.target.value);
    }

    handleFocusDropOff = (event) => event.target.select();

    focus_pickup_search = () => {
        $('.dropoff_search').focus();
    }

    _show_pickup_input = () => {
        render(
            <div>
                <Grid columns={1} centered>
                <Grid.Row>
                    <Grid.Column mobile={16} tablet={16} computer={16}>
                    <Form>
                    <Input  
                        icon={<Icon name='search' 
                        inverted circular link />} 
                        placeholder='መነሻ ቦታ' 
                        onClick={this.handlClickPickup} 
                        onFocus={this.handleFocusPickup} 
                        onChange={e => this._search_pickup_on_change(e)}  
                        value={this.state.pickup_search} 
                        name="pickup_search" 
                        className="pickup_search"
                        size={this.state.input_pickup_size}
                        fluid
                    />
                    </Form>
                    </Grid.Column>
                </Grid.Row>   
                </Grid>
                <div className="search_result_pickup" id="search_result_pickup">
                <Table celled selectable>
                <Table.Body>
                {this.pickup_nomi(this.state.pickup_search_results)}
                </Table.Body>
                </Table>
                </div> 
            </div>               
         ,document.getElementById('div-pickup-input')
        );
    }

    render(){ 
        console.log('test test test ', this.state.user.verified,this.state.user.hasProfile)
        if(this.state._signInFlag) {
            return <Redirect to='/user/login'  />
        }  
        return(
            <div>
               {this.state.user.verified === true && this.state.user.hasProfile === true ? 
               <div className="search_1" id="search_1">
                       <div id="div-pickup-input" className="div-pickup-input">
                       </div>
                        <div>
                            <Label size="large" color="teal" pointing="below">የሚሄዱበትን ቦታ እዚህጋ ይፈልጉ</Label>
                            <Grid columns={1} centered>
                                <Grid.Row>
                                    <Grid.Column mobile={16} tablet={16} computer={16}>
                                    <Form>
                                    <Input  
                                        icon={<Icon name='search' inverted circular link />} 
                                        label={{ icon: 'map marker alternate' }} 
                                        labelPosition="left corner"
                                        placeholder='የሚሄዱት ወዴት ነው ?' 
                                        onClick={this.handleClickDropOff} 
                                        onFocus={this.handleFocusDropOff} 
                                        onChange={e => this._search_dropoff_on_change(e)}  
                                        value={this.state.dropoff_search} 
                                        name="dropoff_search" 
                                        className="dropoff_search"
                                        size={this.state.input_dropoff_size}
                                        fluid
                                        ref={(input) => { this.nameInput = input; }} 
                                    />
                                    </Form>
                                    </Grid.Column>

                                </Grid.Row>   
                            </Grid>
                            <div className="search_result_dropoff" id="search_result_dropoff">
                            <Table celled selectable>
                            <Table.Body>
                            {this.dropoff_nomi(this.state.dropoff_search_results)}
                            </Table.Body>
                            </Table>
                            </div>                                  
                        </div>
              </div>  
              : ''
              }
              <div className="user-info" id="user-info">
                <Grid container columns={2} centered>
                    <Grid.Row>
                        <Grid.Column mobile={8} tablet={8} computer={8}>
                            {this.state.user.hasProfile === true ?  
                                <Image floated='left'  height={25} src={'/assets/profile/user/' + this.state.user.profile} circular avatar/>
                                : 
                                <Image floated='left' height={30}  src={'/assets/awet-rider-m.png'} />
                            }                         
                        </Grid.Column>
                        <Grid.Column mobile={8} tablet={8} computer={8} textAlign="center">
                            {this.state.isLogedIn === true ?
                                <Label size="mini" as={NavLink} to="/" basic pointing="left" color="green">
                                LOGOUT
                                </Label>  
                            :
                                <Label size="mini" as={NavLink} to="/" basic pointing="left" color="blue" centered>
                                LOGIN
                                </Label>
                            }
                        </Grid.Column>
                    </Grid.Row>
                </Grid>
              </div>
              
              {this.state.user.verified === false ?  
              <div className="account-verify" id="account-verfiy">
                        <form>
                        <Message  positive>
                            <Message.Header>ስልኮን ያረጋግጡ varify your mobile!</Message.Header>
                            <p>
                                አጭር የጽሁፍ መልዕክት ወደ ተመዘገበው ስልክ ልከናል ፡ እባኮትን የተላከውን
                                ቁጥር ያስገቡ።
                            </p>
                            <p>
                                Enter the text message sent to your mobile
                                and click varify.
                            </p>
                            <p>
                               <Grid centered>
                                   <Grid.Row>
                                     
                                      <Grid.Column mobile={8} tablet={8} computer={8}>
                                        <Form>
                                        <input
                                        name="varificationCode"
                                        type="text"
                                        value={this.state.varificationCode}
                                        placeholder="XXXXX"
                                        onChange={e => this.change(e)}
                                        
                                        >
                                        </input>
                                        </Form>
                                      </Grid.Column>

                                      <Grid.Column mobile={8} tablet={8} computer={8}> 
                                         <Button className="btn_mobile_varify" color='teal' size='large' onClick={e => this.onVarify(e)} >VARIFY</Button>
                                       </Grid.Column>
                                       <div className="FormError" id="FormError"></div>
                                   </Grid.Row>
                                   
                                   
                               </Grid>
                            </p>
                        </Message>
                        </form>
              </div>
              : ''}
              
              {this.state.user.verified === true && this.state.user.hasProfile === false ? 
               <div className="div-profile" id="div-profile">
               <Grid>
                     <Message info>
                      <Message.Header>ፍቶ ያስገቡ profile picture !</Message.Header>
                            <p>
                             እባኮትን መልኮን በግልጽ የሚይሳይ ጉርድ ፎቶ ይመረጡ እና ያያይዙ።
                            </p>
                               
                            <p>
                                Helps to identify who you are.
                            </p>
                           
                    <Grid.Row> 
                        <Grid.Column>
                            <Form>
                            <input
                                title=" "
                                className="file1"
                                name="profile_pic"
                                type="file"
                                onChange={e => this._onChange_profile(e)}
                            >
                            </input> 
                            </Form>
                        </Grid.Column>
                    </Grid.Row>

                    <Grid.Row>     
                        <Grid.Column >
                         <Image src = {this.state.imagePreviewUrl} width="35px" circular></Image>
                        </Grid.Column>
                    </Grid.Row>

                    <Grid.Row>
                        <Grid.Column>
                            <Button className="btn_upload" fluid color="teal" onClick={(e) => this.onProfileUpload(e)}>Upload Image</Button>
                        </Grid.Column>
                    </Grid.Row>

                    <Grid.Row>
                        <Grid.Column>
                            <div className="ProfileError" id="ProfileError"></div>
                        </Grid.Column>
                    </Grid.Row>
                           
                 </Message>
               </Grid>
              </div>
              : '' }
              
              <div className="div-notification-1" id="div-notification-1"></div>

              <div className="ride-price-dashboard" id="ride-price-dashboard">
                <div>
                <Card color='teal'>
                    <Card.Content>       
                        <Card.Description>
                        <Grid columns={3} divided>
                            <Grid.Row>
                                <Grid.Column>
                                   <h3>{this.state.route_price + ' birr'}</h3>
                                </Grid.Column>
                                <Grid.Column>
                                  <h3>{this.state.route_distance + ' km'}</h3>
                                </Grid.Column>
                                <Grid.Column>
                                 <h3>{this.state.route_time_string} </h3>
                                </Grid.Column>
                            </Grid.Row>
                        </Grid>
                        </Card.Description>
                    </Card.Content>
                    <Card.Content extra>
                     <div className='ui two buttons'>
                        <Button className="btn" color='green' onClick={(e) => this.rideRequest(e)}>
                            CALL DRIVER 
                        </Button>
                        <Button basic color='red' onClick={(e) => this.cancelRide(e)}>
                            CANCEL
                        </Button>
                     </div>
                    </Card.Content>
                    </Card>
                  </div>
                 
              </div>
              
              <div className="ride-request-dashboard shake-ride-request" id="ride-request-dashboard"> 
                    Calling nearest drivers wait !
              </div>

              <div className="ride-route-status" id="ride-route-status"> 
              </div>

              <div className="ride-route-try" id="ride-route-try"> 
                <Message>
                 <Message.Header>Oh! No connection. Try again.</Message.Header>
                 <p>
                 <div className='ui two buttons'>
                    <Button  onClick={(e) => this.findRoute(this.state.pickup_latlng, this.state.dropoff_latlng, e)}   color="green" >TRY AGAIN</Button>
                    <Button  onClick={(e) => this.resetRide(e)}  color="red" >CANCEL</Button>
                </div>
                </p>
              </Message>
              </div>

              <div className="u-driver-dashboard shake-ride-to-pickup" id="u-driver-dashboard"> 
                <div className="notify-rider" id="notify-rider"> Get ready ! driver coming.</div>
                 <Grid container columns={3}>
                    <Grid.Row className="row_xs">
                        <Grid.Column mobile={5} tablet={5} computer={5}>
                           <Image src={this.state._driverImage} height={45} circular></Image>
                        </Grid.Column>
                        <Grid.Column mobile={5} tablet={5} computer={5} textAlign="center" textAlign="center">
                           <Image src={this.state._driverCarImage} height={45} circular></Image>
                        </Grid.Column>
                        <Grid.Column mobile={6} tablet={6} computer={6} textAlign="center">
                         {this.state._driverCarModel} <Label color="blue">{this.state._driverPlateNo}</Label>
                        </Grid.Column>
                    </Grid.Row>
                    <Grid.Row className="row_xs">
                        <Grid.Column mobile={8} tablet={8} computer={8}>
                           <Label>{this.state._driverName}</Label>
                        </Grid.Column>
                        <Grid.Column mobile={8} tablet={8} computer={8}>
                         <Label as="a" color="green"><Icon name="phone volume"/>
                         <a href={'tel:' + this.state._driverMobile}>{this.state._driverMobile}</a>
                         </Label>
                        </Grid.Column>
                    </Grid.Row>
                 </Grid>
              </div>

              <div className="u-driver-dashboard-2 shake-ride-to-pickup" id="u-driver-dashboard-2"> 
                <div className="notify-rider_2" id="notify-rider_2"> Ride inprogress</div>
                 <Grid columns={3}>
                    <Grid.Row className="row_xs">
                        <Grid.Column mobile={5} tablet={5} computer={6} textAlign="center" textAlign="center">
                          <Image src={this.state._driverImage} height={45} circular></Image>
                        </Grid.Column>
                        <Grid.Column mobile={5} tablet={5} computer={6} textAlign="center" textAlign="center">
                          <Image src={this.state._driverCarImage} height={45} circular></Image>
                        </Grid.Column>
                        <Grid.Column mobile={5} tablet={5} computer={6} textAlign="center" textAlign="center">
                         {this.state._driverCarModel} {this.state._driverPlateNo}
                        </Grid.Column>
                    </Grid.Row>
                    <Grid.Row className="row_xs">
                        <Grid.Column mobile={8} tablet={8} computer={8}>
                          {this.state._driverName}
                        </Grid.Column>
                        <Grid.Column mobile={8} tablet={8} computer={8}>
                        {this.state._driverMobile}
                        </Grid.Column>
                    </Grid.Row>
                 </Grid>
              </div>

              <div id="div-logo" className="div-logo">
                 <Image src='/assets/nile_ride_logo_blue.png' height={75} centered></Image> 
                 <Label color="green" pointing="above">ከዓለም ረዥሙ ወንዝ</Label>
              </div>

              <div className="mapid" id="mapid"></div>
            </div>
        );
    }
}
export default PickUpMap;