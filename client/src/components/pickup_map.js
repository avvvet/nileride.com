import React, { Component } from 'react';
import { render } from 'react-dom';
import L from 'leaflet';
import {Button, Grid, Row, Col, FormControl, FormGroup, Alert, Badge, Image} from 'react-bootstrap';
import {NavLink} from 'react-router-dom';
import * as Nominatim from "nominatim-browser";
import $ from 'jquery';

var yourLocation = L.icon({
    iconUrl: '/assets/awet-rider-m.png',
    shadowUrl: '',

    iconSize:     [50, 50], // size of the icon
    shadowSize:   [50, 64], // size of the shadow
    iconAnchor:   [12, 50], // point of the icon which will correspond to marker's location
    shadowAnchor: [4, 62],  // the same for the shadow
    popupAnchor:  [-1, -45] // point from which the popup should open relative to the iconAnchor
});

class PickUpMap extends Component {
    constructor(){
        super();
        this.state = {
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
            first_time_flag : false,
            route_price : 0,
            route_distance : 0,
            route_time : 0,
            route_time_string : 0,
            isRouteFound : false,
            map : '',
            markerGroup: '',
            list: [],
            currentDrivers : [],
            pickupText : '',
            dropoffText : '',
            locationFoundFlag : false,
            statusFlag : false,
            timerWait : '',
            timerRideStatus: '',
            _driverImage: '',
            _driverCarImage: '',
            _driverName : '',
            _driverPlateNo: '',
            _driverMobile: '',
            _driverCarModel: '',
            rideCompleteFlag: false
        }
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
        
            iconSize:     [80, 49], // size of the icon
            shadowSize:   [50, 64], // size of the shadow
            iconAnchor:   [22, 94], // point of the icon which will correspond to marker's location
            shadowAnchor: [4, 62],  // the same for the shadow
            popupAnchor:  [-3, -76] // point from which the popup should open relative to the iconAnchor
        });
        var markerGroup = this.state.markerGroup;
        $.ajax({ 
            type:"GET",
            url:"/drivers",
            contentType: "application/json",
            success: function(currentDrivers, textStatus, jqXHR) {
             for (var i = 0; i < currentDrivers.length; i++) {
                    L.marker([currentDrivers[i].currentLocation[0],currentDrivers[i].currentLocation[1]], {icon: awetRideIcon})
                     .bindPopup(currentDrivers[i].firstName + ' ' + currentDrivers[i].middleName +  ' <br> Plate : ' + currentDrivers[i].plateNo)
                     .addTo(markerGroup);
             }
            }.bind(this),
            error: function(xhr, status, err) {
                console.log('getdrivers error', err.toString());
                
            }.bind(this)
        });  
    }

    getNearestDrivers = (pickup_latlng) => {
        console.log('test getNearestDriver function');
        var objRideRequest = {
            pickup_latlng: `POINT(${this.state.pickup_latlng.lat} ${this.state.pickup_latlng.lng})`, 
        };

        $.ajax({ 
            type:"POST",
            url:"/drivers/nearest",
            data: JSON.stringify(objRideRequest), 
            contentType: "application/json",
            success: function(drivers, textStatus, jqXHR) {
                console.log("Nearest driver object", drivers);
            }.bind(this),
            error: function(xhr, status, err) {
                console.error("erroorror", err.toString());
            }.bind(this)
        });  
    }

    componentDidMount(){
        var map = L.map('mapid').setView([9.0092, 38.7645], 16);
        map.locate({setView: true, maxZoom: 17});
        
        this.setState({map : map});

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        }).addTo(map);

        this.setState({
            markerGroup : new L.LayerGroup().addTo(map)
        });
    
        this.getDrivers(map);

        map.on('locationfound', (e) => {
            alert('location found');
            var markerGroup = this.state.markerGroup;
            //this.updateDriverLocation(e.latlng, localStorage.getItem("auth"));
              var radius = e.accuracy / 1024;
              radius = radius.toFixed(2);
              L.marker(e.latlng, {icon: yourLocation}).addTo(markerGroup)
              .bindPopup("You are " + radius + " meters from this point").openPopup();
                
              L.circle(e.latlng, radius).addTo(markerGroup);
              map.setView(e.latlng,15);
              this.setState({currentLatLng : e.latlng});
        });
        
        function onLocationError(e) {
                alert(e.message);
        }
        map.on('locationerror', onLocationError);

        //my Lord is greate  - Jesus I call your name 
        map.on('click', (e) => {
            alert('map clicked');
            
            var markerGroup = this.state.markerGroup;
            this.setState({first_time_flag: false});
            if(this.state.pickup_flag === 'off'){
                L.marker(e.latlng).addTo(markerGroup).bindPopup("<div class='popup-title'> Your pickup </div>" + "<div class='popup-content'> driver will come here.</div>" );
                this.setState({
                    pickup_flag : 'on',
                    pickup_latlng : e.latlng,
                    first_time_flag : true
                });
            }
            
            if(this.state.dropoff_flag === 'off' && this.state.pickup_flag === 'on' && this.state.first_time_flag === false){
                L.marker(e.latlng).addTo(markerGroup).bindPopup("<div class='popup-title'> Your dropoff </div>" + "<div class='popup-content'> ride ends here.</div>" );
                this.setState({
                    dropoff_flag: 'on',
                    dropoff_latlng: e.latlng
                });
            }
            
            if(this.state.dropoff_flag === 'on' && this.state.pickup_flag ==='on' & this.state.isRouteFound === false) {
                var latlng1 = this.state.pickup_latlng;
                var latlng2 = this.state.dropoff_latlng;
                document.getElementById('ride-route-status').innerHTML = 'Please wait ...';
                document.getElementById('ride-route-status').style.visibility = 'visible';
                this.findRoute(latlng1, latlng2);
            }
        }); 
        
    };

    componentDidUpdate(){
       
    }

    findRoute = (latlng1, latlng2) => {
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
            }
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
    }

    rideRequest = (latlng) => {
        var objRideRequest = {
            user_id: '7141',
            driver_id: 'eyJhbGciOiJIUzI1NiJ9.YXdldEBnbWFpbC5jb20.5Eu6IK9S86VYqJrrAKZK2I0wCDOFAsbPxbYfaIf4xog',
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
            data: JSON.stringify(objRideRequest), 
            contentType: "application/json",
            success: function(data, textStatus, jqXHR) {
                document.getElementById("ride-price-dashboard").style.visibility = "hidden";
                document.getElementById("ride-request-dashboard").style.visibility = "visible";
                this.timerB = setInterval(this.checkRideStatus, 5000);
                console.log("ride request", data);
            }.bind(this),
            error: function(xhr, status, err) {
                console.error(xhr, status, err.toString());
            }.bind(this)
        });  
    }

    change = (e) => {
        this.setState({
            [e.target.name]: e.target.value
        })
    }
    
    checkRideStatus = () => {
        var driver = {
            status : 7
        };
        $.ajax({ 
            type:"POST",
            url:"/ride/check_ride_user",
            headers: { 'x-auth': localStorage.getItem("auth")},
            data: JSON.stringify(driver), 
            contentType: "application/json",
            success: function(ride, textStatus, jqXHR) {
              if(ride){
                if(ride.status === 1) {  // wait for driver to accept 
                    
                } else if (ride.status === 7) {  //driver is commming 
                    // LORD JESUS THANK YOU FOR GIVING ME THIS TIME I WORSHIP YOU MY LORD MY GOD
                    let PromiseSetDriverData = new Promise((res, rejects)=>{
                        this.setState({
                            _driverImage: "/assets/awet-ride-driver.jpeg",
                            _driverCarImage: "/assets/awet-ride.jpeg",
                            _driverName : ride.driver.firstName + ' ' + ride.driver.middleName,
                            _driverPlateNo: '02-B78098',
                            _driverMobile: ride.driver.mobile,
                            _driverCarModel: 'LIFAN J450'
                        });
                        res(true);
                    }); 
                    PromiseSetDriverData.then(()=>{
                        document.getElementById('ride-request-dashboard').style.visibility="hidden";
                        document.getElementById('u-driver-dashboard').style.visibility="visible"; 
                    });      
                } else if(ride.status === 77) {  //ride on progress 
                    document.getElementById('u-driver-dashboard').style.visibility="hidden";
                    document.getElementById('u-driver-dashboard-2').style.visibility="visible"; 
                } else if(ride.status === 0) { // no ride found so end the existing 
                    document.getElementById('ride-request-dashboard').style.visibility="hidden";
                    document.getElementById('u-driver-dashboard').style.visibility="hidden";
                    document.getElementById('u-driver-dashboard-2').style.visibility="hidden";
                    
                    clearInterval(this.timerB);
                    this.resetRide();
                }
              }
            }.bind(this),
            error: function(xhr, status, err) {
                console.error(xhr, status, err.toString());
            }.bind(this)
        });  

    }

    resetRide = () => {
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
    }
    
    render(){    
        return(
            <div>
              <div className="user-dashboard">
                 <Grid fluid>
                   <Row>
                       <Col xs={9} sm={9} md={9}>
                            <FormGroup>
                            <FormControl
                            bsSize="sm"
                            name="pickupText"
                            type="text"
                            value={this.state.pickupText}
                            placeholder="Select pickup"
                            onChange={e => this.change(e)}
                            >
                            </FormControl>
                            </FormGroup>
                            </Col>
                       <Col xs={1} sm={1} md={1}>
                          <Button bsSize="sm" bsStyle="link">Cancel</Button>
                       </Col>
                   </Row>

                   <Row>
                       <Col xs={9} sm={9} md={9}>
                            <FormGroup>
                            <FormControl
                            bsSize="sm"
                            name="dropoffText"
                            type="text"
                            value={this.state.dropoffText}
                            placeholder="Select your dropoff"
                            onChange={e => this.change(e)}
                            >
                            </FormControl>
                            </FormGroup>
                            </Col>
                       <Col xs={1} sm={1} md={1}>
                           <Button bsSize="sm" bsStyle="link">Cancel</Button>
                       </Col>
                   </Row>
                 </Grid>
              </div>
              
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
                          <Button  onClick={(e) => this.rideRequest(this.state.pickup_latlng, e)} bsStyle="success" bsSize="small" block>REQUEST RIDE</Button>
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
                <strong>Oh! </strong> Something wrong. Try again it will work.
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
                <div className="notify-rider" id="notify-rider"> Ride inprogress</div>
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