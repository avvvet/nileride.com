import React, { Component } from 'react';
import { render } from 'react-dom';
import L from 'leaflet';
import { Grid, Message, Form , Label, Button , Card, Image, Icon, Table, Input } from 'semantic-ui-react';
import {NavLink, Redirect} from 'react-router-dom';
import {Routing} from 'leaflet-routing-machine';
import * as Nominatim from "nominatim-browser";
import $ from 'jquery';
import _ from 'lodash';

import DriverBusy from './rider/drivers_busy';
import Rate from './rider/rate';
import DriverCancelRide from './rider/driver_cancel_ride';
import VerificationRply from './verfication_rply';
import { ETIME } from 'constants';
import { OpenStreetMapProvider } from 'leaflet-geosearch';
import RiderLoginForm from './rider/rider_login_2';
import ApplyToRide from './rider/apply_to_ride_2';
import Faq from './faq';

const env = require('../env');
var validator = require('validator');
var moment = require('moment');
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
var controller_driver_icon = L.divIcon({
    html: img,
    shadowUrl: '',
    className: 'image-icon-controller-driver',
    iconSize:     [25, 25], // size of the icon
    shadowSize:   [50, 64], // size of the shadow
    iconAnchor:   [12, 14], // point of the icon which will correspond to marker's location
    shadowAnchor: [4, 62],  // the same for the shadow
    popupAnchor:  [0, -10] // point from which the popup should open relative to the iconAnchor
});
var driver_icon_green = L.divIcon({
    html: img,
    shadowUrl: '',
    className: 'image-icon-green',
    iconSize:     [25, 25], // size of the icon
    shadowSize:   [50, 64], // size of the shadow
    iconAnchor:   [12, 14], // point of the icon which will correspond to marker's location
    shadowAnchor: [4, 62],  // the same for the shadow
    popupAnchor:  [0, -10] // point from which the popup should open relative to the iconAnchor
});
var driver_icon_orange = L.divIcon({
    html: img,
    shadowUrl: '',
    className: 'image-icon-orange',
    iconSize:     [25, 25], // size of the icon
    shadowSize:   [50, 64], // size of the shadow
    iconAnchor:   [12, 14], // point of the icon which will correspond to marker's location
    shadowAnchor: [4, 62],  // the same for the shadow
    popupAnchor:  [0, -10] // point from which the popup should open relative to the iconAnchor
});
var driver_icon_brown = L.divIcon({
    html: img,
    shadowUrl: '',
    className: 'image-icon-brown',
    iconSize:     [25, 25], // size of the icon
    shadowSize:   [50, 64], // size of the shadow
    iconAnchor:   [12, 14], // point of the icon which will correspond to marker's location
    shadowAnchor: [4, 62],  // the same for the shadow
    popupAnchor:  [0, -10] // point from which the popup should open relative to the iconAnchor
});
var driver_icon_gray = L.divIcon({
    html: img,
    shadowUrl: '',
    className: 'image-icon-gray',
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
            userMarkerGroup : '',
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
            pickup_searchbox_selected : false,
            dropoff_searchbox_selected : false,
            is_this_login : '',
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
                var token = localStorage.getItem("_auth_user");
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

    getUsersMarker = (map) => {
        $.ajax({ 
            type:"GET",
            url:"/users_marker",
            contentType: "application/json",
            success: function(currentUsers, textStatus, jqXHR) {
                var userMarkerGroup = this.state.userMarkerGroup;
                userMarkerGroup.clearLayers();  //lets clear and update it 
                var count_user = 0;
                if(currentUsers){
                    count_user = currentUsers.length;
                    var img;
                    for (var i = 0; i < currentUsers.length; i++) {
                        if(currentUsers[i].hasProfile === true) {
                            img = `<img src='/assets/profile/user/nileride-profile.png' />`
                        } else {
                            img = `<img src='/assets/profile/user/nileride-profile.png' />`
                        }
                        var user_icon = L.divIcon({
                            html: img,
                            shadowUrl: '',
                            className: 'image-icon-user',
                            iconSize:     [20, 20], // size of the icon
                            shadowSize:   [50, 64], // size of the shadow
                            iconAnchor:   [12, 14], // point of the icon which will correspond to marker's location
                            shadowAnchor: [4, 62],  // the same for the shadow
                            popupAnchor:  [0, -10] // point from which the popup should open relative to the iconAnchor
                        });

                        L.marker([currentUsers[i].currentLocation[0],currentUsers[i].currentLocation[1]], {icon: user_icon})
                        .bindPopup('የናይል ተሳፋሪ' + '<br>' + moment(moment(currentUsers[i].updatedAt).zone('+03:00'), "YYYYMMDD").fromNow())
                        .addTo(userMarkerGroup);
                    }
                }

            }.bind(this),
            error: function(xhr, status, err) {
               // console.log('passenger error', err.toString());
                
            }.bind(this)
        });  
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
                    let now;
                    let last_update;
                    let diff;
                    let diffDuration;
                    let total_minutes = 0;
                    for (var i = 0; i < currentDrivers.length; i++) {
                        now = moment();
                        last_update = moment(moment(currentDrivers[i].updatedAt).zone('+03:00'), "YYYYMMDD");
                        diff = now.diff(last_update);
                        diffDuration = moment.duration(diff); //put it as duration
                        total_minutes = diffDuration.days() * 24 * 60 + diffDuration.hours() * 60 + diffDuration.minutes();

                        if(currentDrivers[i].mobile === '0911003994' || currentDrivers[i].mobile === '0987880729') {
                            L.marker([currentDrivers[i].currentLocation[0],currentDrivers[i].currentLocation[1]], {icon: controller_driver_icon})
                            .bindPopup('nile controller '
                            + "<a href=tel:" + currentDrivers[i].mobile 
                            + ">" + currentDrivers[i].mobile + "</a>" 
                            + '<br>' + moment(moment(currentDrivers[i].updatedAt).zone('+03:00'), "YYYYMMDD").fromNow())
                            .addTo(carMarkerGroup);
                        }    
                        else if(total_minutes < 10 || total_minutes === 10){
                            L.marker([currentDrivers[i].currentLocation[0],currentDrivers[i].currentLocation[1]], {icon: driver_icon_green})
                            .bindPopup(currentDrivers[i].firstName + ' ' + currentDrivers[i].middleName + '<br>' + moment(moment(currentDrivers[i].updatedAt).zone('+03:00'), "YYYYMMDD").fromNow())
                            .addTo(carMarkerGroup);
                        }
                        else if((total_minutes > 10 && total_minutes < 240 ) || total_minutes === 240){
                                L.marker([currentDrivers[i].currentLocation[0],currentDrivers[i].currentLocation[1]], {icon: driver_icon_orange})
                                .bindPopup(currentDrivers[i].firstName + ' ' + currentDrivers[i].middleName + '<br>' + moment(moment(currentDrivers[i].updatedAt).zone('+03:00'), "YYYYMMDD").fromNow())
                                .addTo(carMarkerGroup);  
                        } 
                        else if((total_minutes > 240 && total_minutes < 1440) || total_minutes === 1440){
                                    L.marker([currentDrivers[i].currentLocation[0],currentDrivers[i].currentLocation[1]], {icon: driver_icon_brown})
                                    .bindPopup(currentDrivers[i].firstName + ' ' + currentDrivers[i].middleName + '<br>' + moment(moment(currentDrivers[i].updatedAt).zone('+03:00'), "YYYYMMDD").fromNow())
                                    .addTo(carMarkerGroup);         
                        } else {
                            L.marker([currentDrivers[i].currentLocation[0],currentDrivers[i].currentLocation[1]], {icon: driver_icon_gray})
                            .bindPopup(currentDrivers[i].firstName + ' ' + currentDrivers[i].middleName + '<br>' + moment(moment(currentDrivers[i].updatedAt).zone('+03:00'), "YYYYMMDD").fromNow())
                            .addTo(carMarkerGroup);
                        }
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
                //console.log('nearest driver', driver, 'pickup', pickup_latlng);
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
        this.getUser(localStorage.getItem("_auth_user"));
        var map = L.map('mapid').setView([9.0092, 38.7645], 16);
        //var map = L.map('mapid');
        map.locate({setView: true, maxZoom: 15});
        //Lord you are good - you are more than anything that is what I know
        this.setState({map : map});

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">ናይል ራይድ OpenStreetMap</a> contributors'
        }).addTo(map);

        this.setState({
            markerGroup : new L.LayerGroup().addTo(map),
            locationGroup : new L.LayerGroup().addTo(map),
            carMarkerGroup : new L.LayerGroup().addTo(map),
            userMarkerGroup : new L.LayerGroup().addTo(map)
        });
    
        this.getDrivers(map);
        this.getUsersMarker(map);

        map.on('locationfound', (e) => {
            var radius = e.accuracy / 1024;
            radius = radius.toFixed(2);
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

               // L.marker(e.latlng, {icon: user_icon}).addTo(locationGroup);
                L.circle(e.latlng, radius).addTo(locationGroup);
                //map.setView(e.latlng,15);
                // ጌታ እየሱስ ይባረክ አባቴ ይህንን ሥራ አሳልፈህ ስለምትሰጠኝ አመሰግናለሁኝ አቅምን ጨምርልኝ    
                this.setState({
                    currentLatLng : e.latlng,
                    pickup_flag : 'on',
                    pickup_latlng : e.latlng,   //current location become as pickup 
                    first_time_flag : true
                });   
            if(radius < env.LOCATION_ACCURACY) {
                if(this.state.dropoff_searchbox_selected === false && _.isNull(document.getElementById('search_1')) === false) {
                    document.getElementById('search_1').style.visibility = 'visible';
                    document.getElementById('search_0').style.visibility = 'hidden';
                }
            } else {
                if(this.state.pickup_searchbox_selected === false && _.isNull(document.getElementById('search_0')) === false) {
                    document.getElementById('search_0').style.visibility = 'visible';
                }
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
        this.timerUserLocation = setInterval(this.userCurrentLocation, 15000);
        this.timerUserMarker = setInterval(this.getUsersMarker, 10000);
    };
 
    getUser = (token) => {
        $.ajax({ 
            type:"GET",
            url:"/user/get",
            headers: { 'x-auth': token },
            contentType: "application/json",
            success: function(user, textStatus, jqXHR) {
              if(user){
                this.setState({
                    user: user,
                    isLogedIn : true,
                    _signInFlag : false
                });   
              }
            }.bind(this),
            error: function(xhr, status, err) {
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
        document.getElementById('fast-nile').style.visibility = 'hidden';

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
            createMarker: function(i, wp, nWps) {    //እኔ ዝም ብዬ አመልካለሁ 
                
                if (i === 0) {
                    return L.marker(wp.latLng, {icon: marker_a , draggable: true});
                } else {
                    return L.marker(wp.latLng, {icon: marker_b , draggable: true });
                }
            },
            lineOptions: {
                styles: [{color: 'red', opacity: 1, weight: 5}]
            },
            router: L.Routing.osrmv1({
                serviceUrl: env.ROUTING_SERVICE
            })
        })
        .on('routesfound', this.routeFound)
        .on('routingerror', (err) => {
            
            if(err.error.status === -1){
                document.getElementById('ride-price-dashboard').style.visibility = "hidden";
                document.getElementById('ride-route-status').style.visibility = 'hidden';
                document.getElementById('ride-route-try').style.visibility = 'visible';
            }
        })
        .addTo(map);  
    }
    
    routeFound =(e) => {
        
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
        var price_per_km = env.RIDE_PER_KM;
        var _ride_price = ((_distance * price_per_km) + env.RIDE_STARTING_PAYMENT).toFixed(2);
        
        this.setState({
            route_distance : Number.parseFloat(_distance).toFixed(2),
            route_price : _ride_price,
            route_time : _ride_time,
            route_time_string :_ride_time_string,
            isRouteFound : true 
        });
       //lord your are God of order, I beg you father not now. THANK YOU FATHER - Let your will be done
       document.getElementById('ride-route-try').style.visibility = 'hidden';
       document.getElementById('ride-route-status').style.visibility = 'hidden';
       document.getElementById('ride-price-dashboard').style.visibility = "visible";
       //this.nearestDriverRouteInfo(this.state.pickup_latlng, this.state._nearest_driver_latlng);
    }

    nearest_driver_eta = (user_pickup_latlng, nearest_driver_latlng) => {
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

    checkLogin = (e) => {
       if(this.state.isLogedIn === true) {
           
           this.rideRequest(e);
           this.add_trafic('call-driver');
           this.setState({
               is_this_login : null
           })
       } else {
           document.getElementById('ride-price-dashboard').style.visibility = 'hidden';
           document.getElementById('search_0').style.visibility = 'hidden';
           document.getElementById('search_1').style.visibility = 'hidden';
           document.getElementById('user-info').style.visibility = 'hidden';
           document.getElementById('fast-nile').style.visibility = 'hidden';
           document.getElementById('user-manual').style.visibility = 'hidden';
           this.setState({
            is_this_login : false
            });
           render(<RiderLoginForm callBackFromLogin={this.callBackFromLogin} is_this_login={false} show_apply_passenger={this.show_apply_passenger}></RiderLoginForm>, document.getElementById('div-notification-2'));
       }
    }

    _fast_nile = (e) => {
        if(this.state.isLogedIn === true) {
            
            this.fast_ride_request(e);
            this.add_trafic('fast-nile');
            this.setState({
                is_this_login : null
            })
        } else {
            document.getElementById('ride-price-dashboard').style.visibility = 'hidden';
            document.getElementById('fast-nile').style.visibility = 'hidden';
            document.getElementById('search_0').style.visibility = 'hidden';
            document.getElementById('search_1').style.visibility = 'hidden';
            document.getElementById('user-info').style.visibility = 'hidden';
            document.getElementById('user-manual').style.visibility = 'hidden';
            this.setState({
             is_this_login : true
             });
            render(<RiderLoginForm callBackFromLogin={this.callBackFromLogin} is_this_login={true} show_apply_passenger={this.show_apply_passenger}></RiderLoginForm>, document.getElementById('div-notification-2'));
        }
     }

    pax_login = (e) => {
           document.getElementById('ride-price-dashboard').style.visibility = 'hidden';
           document.getElementById('search_0').style.visibility = 'hidden';
           document.getElementById('search_1').style.visibility = 'hidden';
           document.getElementById('user-info').style.visibility = 'hidden';
           document.getElementById('user-manual').style.visibility = 'hidden';
           document.getElementById('fast-nile').style.visibility = 'hidden';
           document.getElementById('div-notification-2').style.visibility = 'visible';
           this.setState({
             is_this_login : true
           });
           render(<RiderLoginForm callBackFromLogin={this.callBackFromLogin} is_this_login={true} show_apply_passenger={this.show_apply_passenger}></RiderLoginForm>, document.getElementById('div-notification-2'));
    }

    callBackFromLogin = (user) => {
        this.setState({
            user: user,
            isLogedIn : true,
            _signInFlag : false
        }); 
        //this.chkTimerRideStatus();
    }

    show_apply_passenger = (e) => {
        document.getElementById('div-notification-2').style.visibility = 'visible';
        if(this.state.is_this_login) {
            render(<ApplyToRide callBackFromLogin={this.callBackFromLogin} is_this_login={true} show_apply_passenger={this.show_apply_passenger}></ApplyToRide>, document.getElementById('div-notification-2'));
        } else {
            render(<ApplyToRide callBackFromLogin={this.callBackFromLogin} is_this_login={false} show_apply_passenger={this.show_apply_passenger}></ApplyToRide>, document.getElementById('div-notification-2'));
        } 
    }

    rideRequest = (e) => {
        e.preventDefault(); 
        //e.target.disabled = true;
        $('.btn').addClass("disabled");
        document.getElementById('fast-nile').style.visibility = 'hidden';
        var user_token = localStorage.getItem("_auth_user");
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
            headers: { 'x-auth': localStorage.getItem("_auth_user")},
            data: JSON.stringify(objRideRequest), 
            contentType: "application/json",
            success: function(ride, e) {
                $('.btn').removeClass("disabled");
                //console.log('repy of request ', ride);
                if(!_.isNull(ride)) {
                    //console.log('yes yes yes ');
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

    fast_ride_request = (e) => {
        e.preventDefault(); 
        //e.target.disabled = true;
        $('.btn').addClass("disabled");
        document.getElementById('fast-nile').style.visibility = 'hidden';
        var user_token = localStorage.getItem("_auth_user");
        var objRideRequest = {
            user_id: user_token,
            driver_id: 0,
            pickup_latlng: `POINT(${this.state.pickup_latlng.lat} ${this.state.pickup_latlng.lng})`, 
            dropoff_latlng: `POINT(${this.state.pickup_latlng.lat} ${this.state.pickup_latlng.lng})`, 
            route_distance: 5,
            route_time: 180,
            route_price: 70,
            status: 1
        };

        $.ajax({ 
            type:"POST",
            url:"/ride/rideRequest",
            headers: { 'x-auth': localStorage.getItem("_auth_user")},
            data: JSON.stringify(objRideRequest), 
            contentType: "application/json",
            success: function(ride, e) {
                $('.btn').removeClass("disabled");
                //console.log('repy of request ', ride);
                if(!_.isNull(ride)) {
                    //console.log('yes yes yes ');
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
    }
    
    checkRideStatus = () => {
        var driver = {
            status : 7
        };
        $.ajax({ 
            type:"POST",
            url:"/ride/check_ride_user",
            headers: { 'x-auth': localStorage.getItem("_auth_user")},
            data: JSON.stringify(driver), 
            contentType: "application/json",
            success: function(ride, textStatus, jqXHR) {
              if(_.isNull(ride.status) === false && _.isNull(document.getElementById('ride-request-dashboard')) === false){
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
                    render(<DriverBusy chkTimerRideStatus={this.chkTimerRideStatus} resetRide={this.resetRide} ride={ride}></DriverBusy>,document.getElementById('div-notification-1'));
                   
                    clearInterval(this.timer_pickup_eta);
                    clearInterval(this.timer_dropoff_eta);
                    clearInterval(this.timerRideStatus);
                    this.timerRideStatus = null;
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
                if(!_.isNull(document.getElementById('ride-request-dashboard'))){
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
        document.getElementById('fast-nile').style.visibility = 'visible';
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
            pickup_search : '',
            dropoff_searchbox_selected : false,
            pickup_searchbox_selected : false,
        });
        map.locate({setView: true, maxZoom: 15});
        //this.timerUserLocation = setInterval(this.userCurrentLocation, 10000);
        this.timerRideStatus = null;
    }

    cancelRide = () => {
        document.getElementById('ride-price-dashboard').style.visibility = "hidden";
        document.getElementById('fast-nile').style.visibility = 'visible';
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
            pickup_search : '',
            dropoff_searchbox_selected : false,
            pickup_searchbox_selected : false,
        });
        map.locate({setView: true, maxZoom: 15});
        //this.timerUserLocation = setInterval(this.userCurrentLocation, 10000);
        this.add_trafic('call-driver-cancel');
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
        // e.target.disabled = true;
        // e.preventDefault();
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
            headers: { 'x-auth': localStorage.getItem("_auth_user")},
            data: JSON.stringify(data), 
            contentType: "application/json",
            success: function(data, textStatus, jqXHR) {
                $('.btn_mobile_varify').removeClass("loading");
               if(data){
                render(<VerificationRply></VerificationRply>,document.getElementById('account-verfiy'));
                //document.getElementById('account-verfiy').style.visibility = 'hidden';
                this.getUser(localStorage.getItem("_auth_user")); //reload user after varification
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
        
        $.ajax({ 
            type:"POST",
            url:"/user/profile",
            headers: { 'x-auth': localStorage.getItem("_auth_user")},
            data: formData, 
            cache: false,
            contentType: false,
            processData: false,
            success: function(data, textStatus, jqXHR) {
              $('.btn_upload').removeClass("loading");
              if(data.length > 0) {
                if(data[0] === 1) {
                   document.getElementById('div-profile').style.visibility = 'hidden';
                   this.getUser(localStorage.getItem("_auth_user"));
                } else {
                    
                    $('.btn_upload').removeClass("disabled");
                    $('.btn_upload').removeClass("loading");
                    render(<Message bsStyle="danger" >እባኮትን ሌላ ፎት ይምረጡ ! አልተመዘገበም።</Message>,document.getElementById('ProfileError'));
                }
              }
            }.bind(this),
            error: function(xhr, status, err) {
                $('.btn_upload').removeClass("loading");
                
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
              //console.log('I am winner beacuse I have Jesus', results);
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
         //my lord thank you thank you thank you father thank you thank you hallelujia
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
              first_time_flag : true,
              pickup_searchbox_selected : true
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
          document.getElementById('search_0').style.visibility = 'hidden';
          document.getElementById('driver-page').style.visibility = 'hidden';
          document.getElementById('search_1').style.visibility = 'visible';

          this.add_trafic('search-pickup');
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
                //console.log('I am winner beacuse I have Jesus', results);
                this.setState({
                  dropoff_search_results : results
                });
                //console.log('again winner');
                document.getElementById('search_result_dropoff').style.visibility = 'visible';
              } else {
                $('.dropoff_search').removeClass("loading");
                this.setState({
                    dropoff_search_results : [{'label' : 'No result !'}]
                });
                //console.log('again again winner');
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
              dropoff_latlng: latlng,
              dropoff_searchbox_selected : true
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
          document.getElementById('search_0').style.visibility = 'hidden';
          document.getElementById('search_1').style.visibility = 'hidden';
          document.getElementById('driver-page').style.visibility = 'hidden';
          
          this.add_trafic('search-dropoff');
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

    clearThisPage = (e) => {
        //console.log('do somthing bright');
        clearInterval(this.checkRideStatus);
        clearInterval(this.userCurrentLocation);
    }

    _trafic_user_manual = (e) => {
        this.add_trafic('passenger-manual');
    }

    add_trafic = (trafic_type) => {
        var data = {
            trafic_type : trafic_type, 
        };
    
        $.ajax({ 
            type:"POST",
            url:"/admin/add_trafic",
            data: JSON.stringify(data), 
            contentType: "application/json",
            success: function(data, textStatus, jqXHR) {
                //console.log('trafic', data);
            }.bind(this),
            error: function(xhr, status, err) {
                console.error("erroorror", err.toString());
            }.bind(this)
        });  
    }

    _show_faq = (e) => {
        document.getElementById('user-info').style.visibility = 'hidden';
        document.getElementById('user-manual').style.visibility = 'hidden'
        document.getElementById('driver-page').style.visibility = 'hidden';
        document.getElementById('div-logo-user').style.visibility = 'hidden';
        document.getElementById('faq-page').style.visibility = 'hidden';
        document.getElementById('fast-nile').style.visibility = 'hidden'
        render(<Faq></Faq>,document.getElementById('div-faq-txt'));
    }

    _pax_logout = (e) => {
        localStorage.setItem("_auth_user", false);
        this.setState({
            user : {
                hasProfile : '',
                verified : ''
            },
            isLogedIn : false,
        });
    }

    render(){ 
        return(
            <div>
               <div className="search_0" id="search_0">
                       <div id="div-pickup-input" className="div-pickup-input">
                       </div>
                        <div>
                            
                            <Label size="medium" color="green" pointing="below"><Label color="grey" circular>1</Label> ያሉበትን አከባቢ ይፈልጉ</Label>
                            <Grid columns={1} centered>
                                <Grid.Row>
                                    <Grid.Column mobile={16} tablet={16} computer={16}>
                                    <Form>
                                    <Input  
                                        label={{ icon: 'map marker alternate', color : 'green' }} 
                                        labelPosition="left corner"
                                        icon={<Icon name='search' inverted circular link color='green' />} 
                                        placeholder='መነሻ ቦታ' 
                                        onClick={this.handlClickPickup} 
                                        onFocus={this.handleFocusPickup} 
                                        onChange={e => this._search_pickup_on_change(e)}  
                                        value={this.state.pickup_search} 
                                        name="pickup_search" 
                                        className="pickup_search"
                                        size= "huge"
                                        fluid
                                        ref={(input) => { this.nameInput = input; }} 
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
              </div>  
               <div className="search_1" id="search_1">
                       <div id="div-pickup-input" className="div-pickup-input">
                       </div>
                        <div>
                            <Label size="medium" color="orange" pointing="below"><Label color="grey" circular>2</Label>የሚሄዱበትን አከባቢ ይፈልጉ</Label>
                            <Grid columns={1} centered>
                                <Grid.Row>
                                    <Grid.Column mobile={16} tablet={16} computer={16}>
                                    <Form>
                                    <Input  
                                        icon={<Icon name='search' inverted circular link color='orange' />} 
                                        label={{ icon: 'map marker alternate', color : 'orange' }} 
                                        labelPosition="left corner"
                                        placeholder='የሚሄዱት ወዴት ነው ?' 
                                        onClick={this.handleClickDropOff} 
                                        onFocus={this.handleFocusDropOff} 
                                        onChange={e => this._search_dropoff_on_change(e)}  
                                        value={this.state.dropoff_search} 
                                        name="dropoff_search" 
                                        className="dropoff_search"
                                        size='huge'
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
              
              <div className="user-info" id="user-info">
                <Grid>
                        <Grid.Row className="row_xs">
                            <Grid.Column mobile={6} tablet={6} computer={6} textAlign="center">
                                {this.state.isLogedIn === true && this.state.user.hasProfile === true ?  
                                <Image floated='right' height={25} src={'/assets/profile/user/' + this.state.user.profile} circular />
                                : 
                                <Image floated='right' height={25} src={'/assets/awet-rider-m.png'} />
                                }
                            </Grid.Column>
                            <Grid.Column mobile={10} tablet={10} computer={10} textAlign="center">
                            {this.state.isLogedIn === true ?
                                <Label size='mini' as={NavLink} to="/" basic color="green" pointing='left' onClick={(e) => this._pax_logout(e)}>
                                LOGOUT
                                </Label>  
                            :
                                <Label size='mini' as='a' pointing='left' basic color="blue" onClick={(e) => this.pax_login(e)}>
                                ተሳፋሪ LOGIN
                                </Label>
                            }
                            </Grid.Column>
                            
                        </Grid.Row>
                </Grid>
              </div>

              {this.state.isLogedIn === 'yes' ?  
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
              
              {this.state.user.hasProfile === "nexttime" ? 
               <div className="div-profile" id="div-profile">
               <Grid>
                     <Message info>
                      <Message.Header>እባኮትን ፍቶ ያስገቡ </Message.Header>
                            <p>
                             ለሹፌሩ ደህንነት ፡ መልኮን የሚይሳያ ፎቶ እራሶን አንስተው ያያይዙ።
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
                            <Button className="btn_upload" fluid color="teal" onClick={(e) => this.onProfileUpload(e)}>መዝግብ</Button>
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
              <div className="div-notification-2" id="div-notification-2"></div>

              <div className="ride-price-dashboard" id="ride-price-dashboard">
                <div>
                <Card color='teal'>
                    <Card.Content>       
                        <Card.Description>
                        
                        <Grid  divided>
                            <Grid.Row columns={1}>
                                <Grid.Column>
                                <Label size="medium"><Icon color='green' size="large" name='map marker alternate' /><Icon color='red' size="large" name='map marker alternate' />ምልክቶችን በመግፋት ቦታ ያስተካክሉ ፡ ከጨረሱ ሹፊር ጥራ ይጫኑ ። ቢሳሳቱ ችግር የለም ! </Label>
                                </Grid.Column>
                            </Grid.Row>
                            <Grid.Row columns={3}>
                                <Grid.Column>
                                   <h3>{this.state.route_price + ' ብር'}</h3>
                                </Grid.Column>
                                <Grid.Column>
                                  <h3>{this.state.route_distance + ' ኪ/ሜ'}</h3>
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
                      <Button content='ሹፌር ጥራ' icon={<Icon name='car' size="large" />} labelPosition='left' color="green" className="btn" onClick={(e) => this.checkLogin(e)} />
                      <Button content='ይቅር'  onClick={(e) => this.cancelRide(e)} />
                     </div>
                    </Card.Content>
                    </Card>
                  </div>
                 
              </div>
              
              <div className="ride-request-dashboard shake-ride-request" id="ride-request-dashboard">
                    calling ...
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

              <div id="div-logo-user" className="div-logo-user">
                 <Image src='/assets/nile_ride_logo_blue.png' height={75} centered></Image> 
                 <Label color="green" pointing="above">ከዓለም ረዥሙ ወንዝ</Label>
              </div>

              <div className="fast-nile" id="fast-nile">
                <Label  content='ናይል ጥራ' icon='car'  color='green' as="a" onClick={(e) => this._fast_nile(e)}/> 
              </div>

              <div className="driver-page" id="driver-page">
                 <Label  content='ሹፌር' icon='user'  size='tiny' color='teal' as={NavLink} to='/driver/login' onClick={(e) => this.clearThisPage(e)}/> 
              </div>

              <div className="user-manual" id="user-manual">
                 <Label  content='አጠቃቀም' icon='help circle'  color='blue' as="a" href='/assets/pdf/nileride_passenger_manual.pdf' target="_blank" onClick={(e) => this._trafic_user_manual(e)}/>             
              </div>

              <div className="faq-page" id="faq-page">
                 <Label  content='ጥያቄ' icon='help'  size='tiny' color='olive' as="a"  onClick={(e) => this._show_faq(e)}/> 
              </div>
             
              <div id="div-faq-txt" className="div-faq-txt"></div>

              <div className="mapid" id="mapid"></div>
            </div>
        );
    }
}
export default PickUpMap;