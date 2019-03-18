import React, { Component } from 'react';
import { render } from 'react-dom';
import  {Route, Redirect, BrowserRouter, NavLink } from 'react-router-dom';
import { Grid, Message, Button, Label ,Form, Image, Header, Card } from 'semantic-ui-react'
import L from 'leaflet';
import $ from 'jquery';
import _ from 'lodash';
//import socketClient from 'socket.io-client';

import VerificationRply from '../verfication_rply';
import DriverRideCancel from './driver_ride_cancel';
import MissedRide from './missed_ride';
import DriverDashBoard from './driver_dashboard'

var validator = require('validator');

//const socket = socketClient('http://localhost:7000');
const env = require('../../env')
const {Howl, Howler} = require('howler');
const sound = new Howl({
    src: ["/assets/sounds/awet-ride.mp3","/assets/sounds/awet-ride.ogg","/assets/sounds/awet-ride.m4r"],
    autoplay: true,
    loop: true,
    volume: 0.0
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
var pickUpIcon = L.icon({
    iconUrl: '/assets/awet-rider-m.png',
    shadowUrl: '',

    iconSize:     [50, 50], // size of the icon
    shadowSize:   [50, 64], // size of the shadow
    iconAnchor:   [12, 50], // point of the icon which will correspond to marker's location
    shadowAnchor: [4, 62],  // the same for the shadow
    popupAnchor:  [-1, -45] // point from which the popup should open relative to the iconAnchor
});
var dropOffIcon = L.icon({
    iconUrl: '/assets/awet-ride-dropoff-marker.png',
    shadowUrl: '',
    iconSize:     [80, 80], // size of the icon
    shadowSize:   [50, 64], // size of the shadow
    iconAnchor:   [0, 75], // point of the icon which will correspond to marker's location
    shadowAnchor: [4, 62],  // the same for the shadow
    popupAnchor:  [-3, -75] // point from which the popup should open relative to the iconAnchor
});
var currentLocationIcon = L.icon({
    iconUrl: '/assets/awet-ride-marker-1.png',
    shadowUrl: '',
    iconSize:     [80, 49], // size of the icon
    shadowSize:   [50, 64], // size of the shadow
    iconAnchor:   [20, 20], // point of the icon which will correspond to marker's location
    shadowAnchor: [4, 62],  // the same for the shadow
    popupAnchor:  [20, -5] // point from which the popup should open relative to the iconAnchor
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

const options_model = [
    { key: '1', text: 'VITZ', value: 'VITZ' },
    { key: '2', text: 'COROLLA', value: 'COROLLA' },
    { key: '3', text: 'YARIS', value: 'YARIS' },
    { key: '4', text: 'PLATIZ', value: 'PLATIZ' },
    { key: '5', text: 'HYUNDAI', value: 'HYUNDAI' },
    { key: '6', text: 'LIFAN', value: 'LIFAN' },
    { key: '7', text: 'OTHER', value: 'OTHER' },
]

const options_model_year = [
    { key: '1', text: '2001', value: '2001' },
    { key: '2', text: '2002', value: '2002' },
    { key: '3', text: '2003', value: '2003' },
    { key: '4', text: '2004', value: '2004' },
    { key: '5', text: '2005', value: '2005' },
    { key: '6', text: '2006', value: '2006' },
    { key: '7', text: '2007', value: '2007' },
    { key: '8', text: '2008', value: '2008' },
    { key: '9', text: '2009', value: '2009' },
    { key: '5', text: '2010', value: '2010' },
    { key: '5', text: '2011', value: '2011' },
    { key: '5', text: '2012', value: '2012' },
    { key: '5', text: '2013', value: '2013' },
    { key: '5', text: '2014', value: '2014' },
    { key: '5', text: '2015', value: '2015' },
    { key: '5', text: '2016', value: '2016' },
    { key: '5', text: '2017', value: '2017' },
    { key: '5', text: '2018', value: '2018' }
]

const options_code = [
    { key: '1', text: '01', value: '01' },
    { key: '2', text: '02', value: '02' },
    { key: '3', text: '03', value: '03' },
]

class DriverLocation extends Component {
   constructor() {
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
           pickup_latlng: '',
           dropoff_latlng: '',
           driver_id: '',
           markerGroup: '',
           locationGroup: '',
           map : '',
           auth: false,
           soundFlag : false,
           driver: {
               firstName: '',
               middleName: '',
               email: '',
               mobile: '',
               gender:'',
               profile: '',
               hasProfile: '',
               verified: '',
               isCarRegistered: '',
               status: ''
           },
           profile_pic : '',
           imagePreviewUrl : '/assets/awet-rider-m.png',
           file : '',
           varificationCode: '',
           ride_id : '',
           ridePrice: '',
           rideDistance: '',
           rideTime: '',
           rideUser: '',
           userMobile: '',
           userPic: '',
           driverName : '',
           driverMobile : '',
           amount: '',
           charge: '',
           total_rides: '',
           pickupRoutFlag : false,
           locationFoundFlag : false,
           stopMapViewFlag : false,
           model : '',
           model_year : '',
           code: '',
           plate_no : ''
       }

    
   }
   
   getDriver = (token) => {
    $.ajax({ 
        type:"GET",
        url:"/driver/get",
        headers: { 'x-auth': token },
        contentType: "application/json",
        success: function(driver, textStatus, jqXHR) {
            console.log('driver data is ', driver)
          this.setState({
              driver: driver,
              isLogedIn : true,
          });   
        }.bind(this),
        error: function(xhr, status, err) {
            console.log('getdriver', err.toString());
            console.error(xhr, status, err.toString());
        }.bind(this)
    });  
   }

//    socketConnect = (_obj) => {
//     socket.on('connect', function(){
//         console.log('client connected');

//         socket.emit('join', _obj, function(err) {
//             if(err) {
//                alert(err);
//             }
//         });
//     });
    
//     socket.on('driveRequest' , function(msg) {
//         console.log('drive request' , msg);
//     })
    
//     socket.on('disconnect', function(){
//         console.log('client disconnected');
//     });
//    }
   
//    socketJoin = (_obj) => {
    
//    }

   componentDidMount(){
    this.getDriver(sessionStorage.getItem("_auth_driver"));   
    this.setState({
        auth: sessionStorage.getItem("_auth_driver")
    });

    this.driverRidesInfo();
    
    //this.socketConnect(data);

    var map = L.map('mapid').setView([9.0092, 38.7645], 17);
    map.locate({setView: true, maxZoom: 17});
    
    this.setState({map : map});

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);

    
    this.setState({
        markerGroup : new L.LayerGroup().addTo(map),
        locationGroup : new L.LayerGroup().addTo(map)
    });
   
    this.timerCheckForRide = setInterval(this.checkForRide, 5000);
    this.timerDriverLocation = setInterval(this.driverCurrentLocation, 10000);

    map.on('locationfound', (e) => {
        var radius = e.accuracy / 1024;
        radius = radius.toFixed(2);
        var locationGroup = this.state.locationGroup;
        locationGroup.clearLayers();
        
        L.marker(e.latlng, {icon: driver_icon}).addTo(locationGroup)
        .bindPopup("You are here");
        
        L.circle(e.latlng, radius).addTo(locationGroup);
        //map.setView(e.latlng,17);
        
        if(radius < env.LOCATION_ACCURACY){
            this.setState({current_latlng : e.latlng});
        } 
    });
    
    function onLocationError(e) {
        console.log("location error", e.message);
    }

    map.on('locationerror', onLocationError);

   }

   componentDidUpdate() {
     
   }

   driverCurrentLocation = () => {
    let PromiseLocateDriver = new Promise((resolve, reject)=>{
            var map = this.state.map;
            map.locate({setView: false, maxZoom: 15});
            resolve(true); 
    });

    PromiseLocateDriver.then((r)=>{
        if(!_.isEqual(this.state.current_latlng,this.state.last_current_latlng)){
            console.log('current latlng', this.state.current_latlng, this.state.last_current_latlng);
            var token = sessionStorage.getItem("_auth_driver");
            var current_latlng = {
                _latlng : `POINT(${this.state.current_latlng.lat} ${this.state.current_latlng.lng})`, 
            }; 
            console.log('token', token);
            $.ajax({ 
                type:"POST",
                url:"/driver/updateLocation",
                headers: { 'x-auth': token },
                data: JSON.stringify(current_latlng), 
                contentType: "application/json",
                success: function(data, textStatus, jqXHR) {
                  console.log('drive location update', data);
                }.bind(this),
                error: function(xhr, status, err) {
                    console.error(xhr, status, err.toString());
                }.bind(this)
            });
            this.setState({last_current_latlng : this.state.current_latlng})
        } 
    }); 
   }

   driverRidesInfo = () => {
    var driver = {
        status : 777
    };
    $.ajax({ 
        type:"POST",
        url:"/driver/getRidesInfo",
        headers: { 'x-auth': sessionStorage.getItem("_auth_driver")},
        data: JSON.stringify(driver), 
        contentType: "application/json",
        success: (driver) => {
            if(driver.length > 0){
                console.log('driver info', driver);
                this.setState({
                    driverName : driver[0].driver.firstName,
                    driverMobile : driver[0].driver.mobile,
                    amount : driver[0].amount,
                    charge : driver[0].charge,
                    total_rides: driver[0].total_rides
                });
            } else {
                console.log('driver has no payment', this.state.driver);
                this.setState({
                    driverName : this.state.driver.firstName,
                    driverMobile : this.state.driver.mobile,
                    amount : 0.00,
                    charge : 0.00,
                    total_rides: 0
                });
            }  
        },
        error: function(xhr, status, err) {
            console.error('ride completed error', err.toString());
        }.bind(this)
    });  
   }

   checkForRide = () => {
        var driver = {
            status : 1
        };

        $.ajax({
            type:"POST",
            url:"/ride/check_ride_driver",
            headers: { 'x-auth': sessionStorage.getItem("_auth_driver")},
            data: JSON.stringify(driver), 
            contentType: "application/json"
         })
         .done( (ride) => {
            console.log('done done', ride);
         })
         .fail(function (errorHandler, soapResponse, errorMsg) {
             console.log('Error', errorMsg);
         })
         .always((ride) => {
             console.log('always ', ride);
             
             if(!_.isNull(ride) && !_.isUndefined(ride.driver)) {
                if(ride.status === 1) {
                   this.ride_alert(ride);
                } else if (ride.status === 7) {
                    let PromiseOneTimeCall = new Promise((res,rej) => {
                        clearInterval(this.timerCheckForRide);
                        res(true);
                    });
                    PromiseOneTimeCall.then(() => {
                        this.acceptRideAction(ride);
                    });
                } else if (ride.status === 77) {
                    this.setState({
                        ridePrice: ride.route_price,
                        rideDistance: ride.route_distance,
                        rideTime: ride.route_time,
                        rideUser: ride.user.firstName + ' ' + ride.user.middleName,
                        userMobile: ride.user.mobile,
                        userPic: "/assets/profile/user/" + ride.user.profile,
                        pickup_latlng : ride.pickup_latlng.coordinates,
                        dropoff_latlng: ride.dropoff_latlng.coordinates,
                        stopMapViewFlag : true
                    });
                    let PromiseSetlatlng = new Promise((res,rej) => {
                        this.setState({
                            pickup_latlng : ride.pickup_latlng.coordinates,
                            dropoff_latlng: ride.dropoff_latlng.coordinates,
                            stopMapViewFlag : true
                        });

                        res(true);
                    });

                    PromiseSetlatlng.then(()=>{
                        this.showDropOffLocation(this.state.pickup_latlng, this.state.dropoff_latlng);
                        clearInterval(this.timerCheckForRide);
                    })
                    
                } else if (ride.driver.status === 2) {   //you have missed the ride 
                    sound.volume(0,this.soundAccept);
                    document.getElementById('check-ride-dashboard').style.visibility="hidden"; 
                    document.getElementById('missed-ride').style.visibility="visible"; 
                    render(<MissedRide></MissedRide>,document.getElementById('missed-ride'));
                }        
             }
             
         }); 
    }

    ride_alert = (ride) => {
            sound.volume(0.7, this.soundAccept);        
            this.setState({
                ridePrice: ride.route_price,
                rideDistance: ride.route_distance,
                rideTime: ride.route_time,
                rideUser: ride.user.firstName + ' ' + ride.user.middleName,
                userMobile: ride.user.mobile,
                userPic: "/assets/profile/user/" + ride.user.profile,
            });
            document.getElementById('check-ride-dashboard').style.visibility="visible";
            this.showPickUpLocation(ride.pickup_latlng.coordinates, this.state.current_latlng); 
            //clearInterval(this.timerCheckForRide);
            clearInterval(this.timerUserLocation);  //stop locating while accepting the request
    }

    acceptRide = (e) => {
        e.preventDefault(); 
        $('.btn_accept_ride').addClass("loading");
        var driver = {
            status : 7
        };
        $.ajax({ 
            type:"POST",
            url:"/ride/accepted",
            headers: { 'x-auth': sessionStorage.getItem("_auth_driver")},
            data: JSON.stringify(driver), 
            contentType: "application/json",
            success: function(ride, textStatus, jqXHR) {
                //alert('Jesus');
               // 
                console.log('jsesu', ride);
                if(ride){
                   this.acceptRideAction(ride);
                }  
            }.bind(this),
            error: function(xhr, status, err) {
                $('.btn_accept_ride').removeClass("loading");
                console.error('accept test case error', err.toString());
            }.bind(this)
        });  
    }

    acceptRideAction = (ride) => {
        this.setState({
            ridePrice: ride.route_price,
            rideDistance: ride.route_distance,
            rideTime: ride.route_time,
            rideUser: ride.user.firstName + ' ' + ride.user.middleName,
            userMobile: ride.user.mobile,
            userPic: "/assets/profile/user/" + ride.user.profile,
            ride_id : ride.id
        });
        sound.volume(0,this.soundAccept); 
        let PromiseSlientAlert = new Promise((resolve, rejects) => {
         document.getElementById('check-ride-dashboard').style.visibility="hidden"; 
         document.getElementById("driver-dashboard").style.visibility = "hidden";
         document.getElementById("driver-pax-action").style.visibility = "visible";
         sound.volume(0,this.soundAccept); 
         this.setState({
             pickup_latlng : ride.pickup_latlng.coordinates,
             dropoff_latlng: ride.dropoff_latlng.coordinates,
             stopMapViewFlag : true
         });
         $('.btn_accept_ride').removeClass("loading");
         resolve();
        });
         
        PromiseSlientAlert.then(()=>{
           //show the driver the pickup location 
           this.showPickUpLocation(ride.pickup_latlng.coordinates);
           this.timerDriverLocation = setInterval(this.driverCurrentLocation, 10000);  //start showing curreent location 
        });
    }

    rideCompleted = (e) => {
        e.preventDefault(); 
        $('.btn_ride_completed').addClass("loading");
        var driver = {
            status : 777
        };
        $.ajax({ 
            type:"POST",
            url:"/ride/completed",
            headers: { 'x-auth': sessionStorage.getItem("_auth_driver")},
            data: JSON.stringify(driver), 
            contentType: "application/json",
            success: (_ride) => {
                $('.btn_ride_completed').removeClass("loading");
                if(_ride){
                    this.rideCompletedAction(_ride);
                }  
            },
            error: function(xhr, status, err) {
                e.target.disabled = true;
                console.error('ride completed error', err.toString());
            }.bind(this)
        });  
    }

    rideCompletedAction = (ride) => {
        let PromiseRemoveAll = new Promise((resolve, rejects) => {
            document.getElementById("driver-pax-action").style.visibility = "hidden";
            document.getElementById("driver-pax-end-action").style.visibility = "hidden";
            document.getElementById("check-ride-dashboard").style.visibility = "hidden";
            
            var map = this.state.map;
            if(this.routeControl){
                map.removeControl(this.routeControl);
                this.routeControl = null;
            }
            var markerGroup = this.state.markerGroup;
            markerGroup.clearLayers();
            
            //map.locate({setView: true, maxZoom: 17});
           
            this.setState({
                pickupRoutFlag : false,
                stopMapViewFlag : false
             });

            resolve(true);
        });

        PromiseRemoveAll.then(()=>{
            this.driverRidesInfo();
            this.timerCheckForRide = setInterval(this.checkForRide, 5000); //lets wait for ride again
            document.getElementById("driver-dashboard").style.visibility = "visible"; 
        });
    }

    paxFound = (e) => {
        e.preventDefault(); 
        $('.btn_pax_found').addClass("loading");
        var driver = {
            status : 77
        };
        $.ajax({ 
            type:"POST",
            url:"/ride/paxFound",
            headers: { 'x-auth': sessionStorage.getItem("_auth_driver")},
            data: JSON.stringify(driver), 
            contentType: "application/json",
            success: (_ride) => {
                $('.btn_pax_found').removeClass("loading");
                if(_ride){
                    this.showDropOffLocation(this.state.pickup_latlng, this.state.dropoff_latlng);
                }  
            },
            error: function(xhr, status, err) {
                $('.btn_pax_found').removeClass("loading");
                console.error('ride completed error', err.toString());
            }.bind(this)
        });  
    }

    
    showPickUpLocation = (_pickup_latlng, current_latlng) => {
        var map = this.state.map;
        var markerGroup = this.state.markerGroup;
        L.marker(_pickup_latlng, {icon: marker_a}).addTo(markerGroup)
        .bindPopup("Pick passenger here.");

        console.log('current loooooocaaaaationnn', this.state.current_latlng);
       // map.setView(_pickup_latlng,15);
        this.showPickUpRoute(this.state.current_latlng, _pickup_latlng);
    }

    showPickUpRoute = (latlng1, latlng2) => {
      if(!this.state.pickupRoutFlag){
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
            createMarker: function (){
                return null;
            },
            router: L.Routing.osrmv1({
                serviceUrl: env.ROUTING_SERVICE
            })
        })
        .on('routesfound', this.routeFound)
        .addTo(map); 
      }
    }

    routeFound = () => {
        this.setState({
            pickupRoutFlag : true
         });
    }

    showDropOffLocation = (latlng1,latlng2) => {
        
         let PromiseRemoveShowDropoff = new Promise((resolve, rejects) => {
            document.getElementById("driver-pax-action").style.visibility = "hidden";
            document.getElementById("driver-pax-end-action").style.visibility = "visible";
            resolve(true);
        });

        PromiseRemoveShowDropoff.then(()=>{
            
            var map = this.state.map;
            var markerGroup = this.state.markerGroup;
            L.marker(latlng1, {icon: marker_a}).addTo(markerGroup)
            .bindPopup("Pickup location.");
            L.marker(latlng2, {icon: marker_b}).addTo(markerGroup)
            .bindPopup("Final dropoff location.");
            //map.setView(latlng2,15);
            
            this.showDropOffRoute(latlng1,latlng2);
        });
    }

    showDropOffRoute = (latlng1, latlng2) => {
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
        .on('routesfound', (route) => {
           console.log(route);
        })
        .on('routingerror', (err) => {
            console.log(err.error.status);
        })
        .addTo(map);  
        
    }

    timeConvert = (n) => {
        var num = n;
        var hours = (num / 3600);
        var rhours = Math.floor(hours);
        var minutes = (hours - rhours) * 60;
        var rminutes = Math.round(minutes);
        
        var hDisplay = rhours > 0 ? rhours + " hr" : "";
        var mDisplay = rminutes > 0 ? rminutes + " min" : "";
        return hDisplay + mDisplay; 
    }

    validateVarification = () => {
        let errors = [];
        
        if(this.state.varificationCode.length === 0) {
            errors.push("የተላከውን ቁጥር አላስገቡም !");
        } else if (validator.isLength(this.state.varificationCode, {min: 5}) === false){
            errors.push("ቁጥሩ 5 አሀዝ ቁጥር መሆን አለበት !");
        }else if(validator.isLength(this.state.varificationCode, {max: 5}) === false){
            errors.push("ቁጥሩ 5 አሀዝ ቁጥር መሆን አለበት !");
        } else if (validator.isNumeric(this.state.varificationCode, {no_symbols: true} ) === false) {
            errors.push("ትክክለኛ ቁጥር አላስገቡም !");
        }
    
        return errors;
    }

    validateCarRegistration = () => {
        let errors = [];
        
        if(this.state.model.length === 0) {
            errors.push("ከዝርዝሩ ሞዴል ይምረጡ !");
        } else if (this.state.model_year.length === 0){
            errors.push("ዓመት ይምረጡ !");
        }

        if(this.state.code.length === 0){
        errors.push("የታርጋ ኮድ ይምረጡ !");
        } 

        if(this.state.plate_no.length === 0 ) {
            errors.push("ታርጋ ቁጥር አላስገቡም !");
        } else if(validator.isAlphanumeric(this.state.plate_no) === false) {
            errors.push("ታርጋ ቁጥሩ ትክክል አይደለም !");
        } else if(validator.isLength(this.state.plate_no, {min: 5, max: 6}) === false){
            errors.push("ታርጋ ቁጥሩ ትክክል አይደለም !");
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

    onVarify = (e) => {
        e.preventDefault();
      
        const err = this.validateVarification();
        if(err.length > 0){
            let error_list = this.getErrorList(err);
            render(<Message negative>{error_list}</Message>,document.getElementById('FormError'));
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
            url:"/driver/mobile_verification",
            headers: { 'x-auth': sessionStorage.getItem("_auth_driver")},
            data: JSON.stringify(data), 
            contentType: "application/json",
            success: function(data, textStatus, jqXHR) {
               $('.btn_mobile_varify').removeClass("loading");
               if(data){
                render(<VerificationRply></VerificationRply>,document.getElementById('account-verfiy'));
                //document.getElementById('account-verfiy').style.visibility = 'hidden';
                this.getDriver(sessionStorage.getItem("_auth_driver")); //reload user after varification
               } 
            }.bind(this),
            error: function(xhr, status, err) {
                $('.btn_mobile_varify').removeClass("loading");
                render(<Message negative>ትክክለኛ ቁጥሩ አላስገቡም !</Message>,document.getElementById('FormError'));
                console.error(xhr, status, err.toString());
            }.bind(this)
        });  
    }

    onValidateCarRegister = (e) => {
        e.preventDefault();
        const err = this.validateCarRegistration();
        if(err.length > 0){
            let error_list = this.getErrorList(err);
            render(<Message negative >{error_list}</Message>,document.getElementById('err_car_register'));
        } else {
            var data = {
                model : this.state.model,
                model_year : this.state.model_year,
                code : this.state.code,
                plate_no : this.state.plate_no
            }

            this.validateCarRegister(data);
            this.setState({
                model : '',
                model_year : '',
                code : '',
                plate_no : '',
                errors: []
            });
        }
    }

    validateCarRegister = (data) => {
        $('.btn_car_register').addClass("loading");
        $.ajax({ 
            type:"POST",
            url:"/car/register",
            headers: { 'x-auth': sessionStorage.getItem("_auth_driver")},
            data: JSON.stringify(data), 
            contentType: "application/json",
            success: function(data, textStatus, jqXHR) {
                $('.btn_car_register').removeClass("loading");
               if(data){
                render(<VerificationRply></VerificationRply>,document.getElementById('register-car'));
                //document.getElementById('account-verfiy').style.visibility = 'hidden';
                this.getDriver(sessionStorage.getItem("_auth_driver")); //reload user after varification
               } 
            }.bind(this),
            error: function(xhr, status, err) {
                $('.btn_car_register').removeClass("loading");
                render(<Message negative >መመዝገብ አልተቻለም እንደገና ይሞክሩ ኢንተርኔት መኖሩን ያረጋግጡ !</Message>,document.getElementById('err_car_register'));
                console.error(xhr, status, err.toString());
            }.bind(this)
        });  
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

    validateProfile = () => {
        console.log('file', this.state.file);
        let errors = [];
        
        if(this.state.file.length === 0) {
            errors.push("ፎቶ አልመረጡም ! Browse የሚለውን ይጫኑ።");
        } 

        if(this.state.file.size > 3024000) {
            errors.push("የመረጡት ፎቶ መጠን ትልቅ ነው ! አነስተኛ ፎቶ ይምረጡ።");
        }
       
        if(this.state.file.size > 0) {
            
            var t = this.state.file.type.split('/').pop().toLowerCase();
            console.log('ttt', t);
            if (t != "jpeg" && t != "jpg" && t != "png" && t != "bmp" && t != "gif") {
                errors.push('ትክክለኛ የፎቶ ዓይነት ይምረጡ !');
            }
        }
        
        return errors;
    }

    onProfileUpload = (e) => {
        e.preventDefault();
        const err = this.validateProfile();
        if(err.length > 0){
            e.target.disabled = false;
            let error_list = this.getErrorList(err);
            render(<Message negative >{error_list}</Message>,document.getElementById('ProfileError'));
        } else {
            this.uploadProfile(e);
            this.setState({
                file : '',
                imagePreviewUrl : '',
                errors: []
            });
        }
    }

    uploadProfile = (e) => {
        $('.btn_upload').addClass("loading");
        const formData = new FormData();
        formData.append('myImage',this.state.file);
        console.log('dataaa', formData, this.state.file);
        $.ajax({ 
            type:"POST",
            url:"/driver/profile",
            headers: { 'x-auth': sessionStorage.getItem("_auth_driver")},
            data: formData, 
            cache: false,
            contentType: false,
            processData: false,
            success: function(data, textStatus, jqXHR) {
              $('.btn_upload').removeClass("loading");
              if(data.length > 0) {
                if(data[0] === 1) {
                   document.getElementById('div-profile').style.visibility = 'hidden';
                   this.getDriver(sessionStorage.getItem("_auth_driver"));
                } else {
                    render(<Message bsStyle="danger" >በድጋሚ ይሞክሩ ! </Message>,document.getElementById('ProfileError'));
                }
              }
            }.bind(this),
            error: function(xhr, status, err) {
                $('.btn_upload').removeClass("loading");
                render(<Message bsStyle="danger" >በድጋሚ ይሞክሩ ! ኢንተርኔት መኖሩን ያረጋግጡ !</Message>,document.getElementById('ProfileError'));
            }.bind(this)
        });  
    }

    cancelRide = (e) => {
        e.preventDefault(); 
        $('.btn_ride_cancel').addClass("disabled");
        document.getElementById('div-notification-1').style.visibility="visible";
        render(<DriverRideCancel ride_id={this.state.ride_id} rideCompletedAction={this.rideCompletedAction}></DriverRideCancel>,document.getElementById('div-notification-1'));
    }

    onChangeModel = (event, data) => {
        this.setState({
            model : data.value
        });
    }

    onChangeModelYear = (event, data) => {
        this.setState({
            model_year : data.value
        });
    }

    onChangeCode = (event, data) => {
        this.setState({
           code : data.value
        });
    }

    render(){
        return(
            <div>
                <div className="driver-dashboard" id="driver-dashboard">
                    <Grid container columns={3} centered>
                        <Grid.Row className="row_sm">
                            <Grid.Column mobile={6} tablet={6} computer={6} textAlign="center">
                              {this.state.isLogedIn === true ? 'hi ' + this.state.driver.firstName : 'hi there!'}
                            </Grid.Column>
                            <Grid.Column mobile={5} tablet={5} computer={5} textAlign="center">
                            {this.state.isLogedIn === true ?
                                <Label as={NavLink} to="/" basic pointing="left" color="green">
                                LOGOUT
                                </Label>  
                            :
                                <Label as={NavLink} to="/" basic pointing="left" color="blue">
                                LOGIN
                                </Label>
                            }
                            </Grid.Column>
                            <Grid.Column mobile={5} tablet={5} computer={5} textAlign="center">
                                {this.state.driver.hasProfile === true ?  
                                <Image floated='right' size='mini' src={'/assets/profile/driver/' + this.state.driver.profile} circular />
                                : 
                                <Image floated='right' size='mini' src={'/assets/awet-rider-m.png'} />
                                }
                            </Grid.Column>
                        </Grid.Row>
                    </Grid>
                        
                    <Grid container columns={2} centered divided>
                        <Grid.Row className="row_sm"> 
                            <Grid.Column mobile={8} tablet={8} computer={8} textAlign="center">
                                ክፍያ <Label size="medium" color="green" circular>{this.state.amount} </Label>
                            </Grid.Column>
                            <Grid.Column mobile={8} tablet={8} computer={8} textAlign="center">
                                ተቀናሽ <Label size="medium" color="yellow" circular>{this.state.charge}</Label>
                            </Grid.Column>
                        </Grid.Row>
                        <Grid.Row className="row_sm">
                            <Grid.Column mobile={8} tablet={8} computer={8} textAlign="center" >
                                ጉዞ <Label color="teal" size="medium" circular>{this.state.total_rides}</Label> 
                            </Grid.Column>
                            <Grid.Column mobile={8} tablet={8} computer={8} textAlign="center">
                                <Label color="olive">የተፈቀደለት</Label>
                            </Grid.Column>
                        </Grid.Row>
                    </Grid>
                </div>
                
                {this.state.driver.isCarRegistered === false && this.state.driver.verified === true ? 
                <div className="register-car" id="register-car">
                        <Message>
                            <Message.Header>የሚነዱትን መኪና ይመዝግቡ !</Message.Header>
                            <p>
                                የሚነዱትን መኪና መረጃ ትክክለኛ ይመዝግቡ። 
                                ትክክለኛ ያልሆነ መረጃ ከሲስተሙ እንዲሰረዙ ያስደርጋል።
                            </p>
                            <p>
                               <Grid columns={2}>
                                    <Grid.Row>
                                        <Grid.Column mobile={8} tablet={8} computer={8}>
                                        <Form>
                                        <Form.Select name='model' fluid label='ሞዴል' options={options_model} placeholder='ሞዴል' onChange={this.onChangeModel}/>
                                        </Form>
                                        </Grid.Column>
                                    
                                        <Grid.Column mobile={8} tablet={8} computer={8}>
                                        <Form>
                                        <Form.Select name='model_year' fluid label='የምርት ዓመት' options={options_model_year} placeholder='ዓመት' onChange={this.onChangeModelYear}/>
                                        </Form>
                                        </Grid.Column>
                                    </Grid.Row>

                                   <Grid.Row>
                                        <Grid.Column mobile={8} tablet={8} computer={8}>
                                        <Form>
                                        <Form.Select name='code' fluid label='የታርጋ ኮድ' options={options_code} placeholder='የታርጋ ኮድ' onChange={this.onChangeCode}/>
                                        </Form>
                                        </Grid.Column>

                                        <Grid.Column mobile={8} tablet={8} computer={8}>  
                                        <Form>
                                        ታርጋ ቁጥሩ
                                        <input
                                        name="plate_no"
                                        type="text"
                                        value={this.state.plate_no}
                                        placeholder="ታርጋ ቁጥር"
                                        onChange={e => this.change(e)}
                                        >
                                        </input>
                                        </Form>
                                        </Grid.Column>
                                   </Grid.Row>

                                   <Grid.Row>
                                        <Grid.Column mobile={16} tablet={16} computer={16}>
                                        <Button className="btn_car_register" color="green" onClick={(e) => this.onValidateCarRegister(e)} fluid>መዝግብ</Button>
                                        </Grid.Column>
                                   </Grid.Row>

                                   <Grid.Row >
                                    <Grid.Column mobile={16} tablet={16} computer={16}>
                                      <div className="err_car_register" id="err_car_register"></div>
                                    </Grid.Column>
                                   </Grid.Row>
                               </Grid>
                            </p>
                        </Message>
                       
                </div>
                : ''}

                {this.state.driver.verified === false ?  
                <div className="account-verify" id="account-verfiy">
                        <form>
                        <Message success>
                            <Message.Header>ስልኮን ያረጋግጡ !</Message.Header>
                            <p>
                                አጭር የጽሁፍ መልዕክት ወደ ተመዘገበው ስልክ ልከናል ፡ 
                                እባኮትን የተላከውን ቁጥር ያስገቡ።
                            </p>
                            <p>
                               <Grid columns={2}>
                                   <Grid.Row>
                                     <Grid.Column mobile={8} tablet={8} computer={8} >
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
                                       <Button className="btn_mobile_varify" color="green" onClick={(e) => this.onVarify(e)} fluid>አረጋግጥ</Button>
                                     </Grid.Column>
                                     
                                   </Grid.Row>

                                   <Grid.Row >
                                    <Grid.Column mobile={16} tablet={16} computer={16}>
                                      <div className="FormError" id="FormError"></div>
                                    </Grid.Column>
                                   </Grid.Row>
                                  
                               </Grid>
                            </p>
                        </Message>
                        </form>
                </div>
                : ''}

                {this.state.driver.verified === true && this.state.driver.isCarRegistered === true && this.state.driver.hasProfile === false ? 
                <div className="div-profile" id="div-profile">
                    <Grid columns={1} >
                            <Message info>
                              <Message.Header>ፍቶ ያስገቡ !</Message.Header>
                                <p>
                                 እባኮትን መልኮን በግልጽ የሚይሳይ ጉርድ ፎቶ ይመረጡ። 
                                 እራሶን በሞባይሎ ፎቶ ያንሱና ያያይዙ። መርጦ ሲጨርሱ መዝግብ የሚለውን ይጫኑ።
                                </p>
                                <p>
                                        <Grid.Row>
                                           <Grid.Column mobile={16} tablet={16} computer={16}>
                                            <Image src = {this.state.imagePreviewUrl} height={35} circle centered></Image>
                                           </Grid.Column>
                                        </Grid.Row>

                                        <Grid.Row> 
                                            <Grid.Column mobile={16} tablet={16} computer={16}>
                                            <Form>
                                            <input
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
                                            <Grid.Column mobile={16} tablet={16} computer={16}>
                                            <Button className="btn_upload" color="green" onClick={(e) => this.onProfileUpload(e)}  fluid>መዝግብ</Button>
                                            </Grid.Column>
                                        </Grid.Row>

                                        <Grid.Row>
                                        <Grid.Column mobile={16} tablet={16} computer={16}>
                                           <div className="ProfileError" id="ProfileError"></div>
                                        </Grid.Column>
                                    </Grid.Row>
                                </p>
                            </Message>
                </Grid>
                </div>
                : '' }

                <div id="missed-ride" className="missed-ride"></div>

                <div className="check-ride-dashboard shake-ride-request" id="check-ride-dashboard"> 
                <Grid container columns={4} centered>
                    <Grid.Row>
                        <Grid.Column mobile={4} tablet={4} computer={4} textAlign="center">
                          <Image src={this.state.userPic} height={40} circular></Image>
                        </Grid.Column>
                        <Grid.Column mobile={4} tablet={4} computer={4} textAlign="center">
                            <h3>{this.state.ridePrice}</h3> ብር
                        </Grid.Column>
                        <Grid.Column mobile={4} tablet={4} computer={4} textAlign="center">
                           <h3>{this.state.rideDistance}</h3>ኪ/ሜ
                        </Grid.Column>
                        <Grid.Column mobile={4} tablet={4} computer={4} textAlign="center">
                          <h3>{this.timeConvert(Number.parseInt(this.state.rideTime))} </h3>
                        </Grid.Column>
                    </Grid.Row>
                    
                    <Grid.Row className="row_xs">
                      <Grid.Column mobile={16} tablet={16} computer={16}>
                       <Button className="btn_accept_ride" size="huge" color="green" onClick={(e) => this.acceptRide(e)}  bsSize="large" fluid>እሰራለሁ ACCEPT</Button>
                      </Grid.Column>
                    </Grid.Row>
                </Grid>
                </div>

                <div id="driver-pax-action"  className="driver-pax-action shake-ride-to-pickup">
                  <Grid columns={4}>
                    <Grid.Row className="row_sm">
                        <Grid.Column mobile={4} tablet={4} computer={4} textAlign="center">
                           <Image src={this.state.userPic} height={40} circular></Image>
                        </Grid.Column>
                        <Grid.Column mobile={4} tablet={4} computer={4} textAlign="center">
                         {this.state.ridePrice + ' ብር'}
                        </Grid.Column>
                        <Grid.Column mobile={4} tablet={4} computer={4} textAlign="center">
                          {this.state.rideDistance + ' ኪ/ሜ'}
                         </Grid.Column>
                        <Grid.Column mobile={4} tablet={4} computer={4} textAlign="center">
                          {this.timeConvert(Number.parseInt(this.state.rideTime))}
                        </Grid.Column>
                    </Grid.Row>
                    <Grid.Row className="row_sm">
                      <Grid.Column mobile={8} tablet={8} computer={8}>
                       {this.state.rideUser}
                      </Grid.Column>
                      <Grid.Column mobile={8} tablet={8} computer={8}>
                       {this.state.userMobile}
                      </Grid.Column>
                    </Grid.Row>
                    
                    <Grid.Row className="row_sm">
                        <Grid.Column mobile={16} tablet={16} computer={16}>
                          <Button className="btn_pax_found" size="medium" color="green" onClick={(e) => this.paxFound(e)}  fluid>ተሳፋሪውን አግኝቸዋለሁ</Button>
                        </Grid.Column>
                    </Grid.Row>
                    <Grid.Row className="row_sm">
                        <Grid.Column mobile={16} tablet={16} computer={16}>
                          <Button className="btn_ride_cancel" size="medium" color="red" onClick={(e) => this.cancelRide(e)} fluid>ጉዞውን ሰርዝ</Button>
                        </Grid.Column>
                    </Grid.Row>
                  </Grid>
                   
                </div>

                <div id="driver-pax-end-action"  className="driver-pax-end-action shake-finish-ride">
                  <Grid columns={4}>
                  <Grid.Row className="row_sm">
                        <Grid.Column mobile={4} tablet={4} computer={4} textAlign="center">
                          <Image src={this.state.userPic} height={40} circular></Image>
                        </Grid.Column>
                        <Grid.Column mobile={4} tablet={4} computer={4} textAlign="center">
                          {this.state.ridePrice + ' ብር'}
                        </Grid.Column>
                        <Grid.Column mobile={4} tablet={4} computer={4} textAlign="center">
                          {this.state.rideDistance + ' ኪ/ሜ'}
                        </Grid.Column>
                        <Grid.Column mobile={4} tablet={4} computer={4} textAlign="center">
                         {this.timeConvert(Number.parseInt(this.state.rideTime))}
                        </Grid.Column>
                    </Grid.Row>
                    <Grid.Row className="row_sm">
                      <Grid.Column mobile={8} tablet={8} computer={8}>
                       {this.state.rideUser}
                      </Grid.Column>
                      <Grid.Column mobile={8} tablet={8} computer={8}>
                       {this.state.userMobile}
                      </Grid.Column>
                    </Grid.Row>
                    <Grid.Row className="row_sm">
                        <Grid.Column mobile={16} tablet={16} computer={16}>
                          <Button className="btn_ride_completed" color="orange" size="medium"  onClick={(e) => this.rideCompleted(e)} fluid>ጉዞው አለቀ</Button>
                        </Grid.Column>
                    </Grid.Row>
                  </Grid>  
                </div>

                <div className="div-notification-1" id="div-notification-1"></div>

                <div id="div-logo" className="div-logo">

                 <Label color="purple" as="a" href='/assets/pdf/nileride_driver_manual.pdf' target="_blank" pointing="below">የአጠቃቀም መመርያ</Label>
                 <Image src='/assets/nile_ride_logo_blue.png' height={75} centered></Image> 
                 <Label color="green" pointing="above">ከዓለም ረዥሙ ወንዝ</Label>
                </div>
                
                <div className="mapid" id="mapid"></div>
                
            </div>
        );
    }
}
export default DriverLocation;