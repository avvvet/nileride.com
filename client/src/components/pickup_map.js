import React, { Component } from 'react';
import { render } from 'react-dom';
import L from 'leaflet';
import {Button, Grid, Row, Col, FormControl, FormGroup, ControlLabel, Badge} from 'react-bootstrap';
import {NavLink} from 'react-router-dom';
import * as Nominatim from "nominatim-browser";
import $ from 'jquery';

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
            route_price : 0,
            route_distance : 0,
            route_time : 0,
            isRouteFound : false,
            map : '',
            markersLayer: '',
            list: [],
            currentDrivers : [],
            pickupText : '',
            dropoffText : '',
            locationFoundFlag : false,
            statusFlag : false
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
        $.ajax({ 
            type:"GET",
            url:"/drivers",
            contentType: "application/json",
            success: function(currentDrivers, textStatus, jqXHR) {
             for (var i = 0; i < currentDrivers.length; i++) {
                    L.marker([currentDrivers[i].currentLocation[0],currentDrivers[i].currentLocation[1]], {icon: awetRideIcon})
                     .bindPopup(currentDrivers[i].firstName + ' ' + currentDrivers[i].middleName +  ' <br> Plate : ' + currentDrivers[i].plateNo)
                     .addTo(map);
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

        var markersLayer = new L.LayerGroup().addTo(map);
        this.setState({markersLayer: markersLayer});

        function onLocationFound(e) {
            
            console.log('current location', e.latlng);
            var radius = e.accuracy / 128;
        
            L.marker(e.latlng).addTo(map)
                .bindPopup("You are " + radius + " meters from this point").openPopup();
        
            //L.circle(e.latlng, radius).addTo(map);
        }
        
        map.on('locationfound', onLocationFound);

        function onLocationError(e) {
            alert(e.message);
        }
        
        map.on('locationerror', onLocationError);

        this.getDrivers(map);
        
    };

    componentDidUpdate(){
        var map = this.state.map;
        var marker;
        var markersLayer = this.state.markersLayer;
        
        map.on('click', (e) => {
            Nominatim.reverseGeocode({
                lat: e.latlng.lat,
                lon: e.latlng.lng,
                addressdetails: true
            })
            .then((result : NominatimResponse) =>
            {
                if(this.state.pickup_flag === 'off'){
                    //markersLayer.clearLayers();
                    marker = L.marker(e.latlng).addTo(markersLayer).bindPopup("<div class='popup-title'> Your pickup </div>" + "<div class='popup-content'> driver will come here.</div>" );
                    markersLayer.addLayer(marker); 
                    this.setState({
                        pickupText: result.display_name,
                        pickup_latlng : e.latlng, 
                        pickup_flag: 'on',
                    });
                    this.getNearestDrivers(e.latlng);
                } else if(this.state.pickup_flag === 'on' && this.state.dropoff_flag === 'off'){
                    marker = L.marker(e.latlng).addTo(markersLayer).bindPopup("<div class='popup-title'> Your dropoff </div>" + "<div class='popup-content'> ride ends here.</div>" );
                    markersLayer.addLayer(marker); 
                    this.setState({
                        dropoffText: result.display_name,
                        dropoff_latlng : e.latlng, 
                        dropoff_flag: 'on',
                    });
                }

                console.log('pickup', this.state.pickup_flag);
                console.log('dropoff', this.state.dropoff_flag);
            })
            .catch((error) =>
            {
                console.error(error); 
            });        
        }); 
        
        if(this.state.dropoff_flag === 'on' && this.state.pickup_flag ==='on' & this.state.isRouteFound === false) {
            var latlng1 = this.state.pickup_latlng;
            var latlng2 = this.state.dropoff_latlng;
            this.findRoute(latlng1, latlng2);
        }
    }

    findRoute = (latlng1, latlng2) => {
        var map = this.state.map;
        L.Routing.control({
            waypoints: [
             L.latLng(latlng1),
             L.latLng(latlng2)
            ]
        })
        .on('routesfound', this.routeFound)
        .addTo(map);  
    }
    
    routeFound =(e) => {
        var routes = e.routes;
        var _distance = routes[0].summary.totalDistance;
        var _ride_time = routes[0].summary.totalTime;
        
        _distance = Number.parseFloat(_distance/1000).toFixed(2);
       var  _ride_time_string = timeConvert(Number.parseInt(_ride_time));

        this.setState({
             route_distance : Number.parseFloat(_distance).toFixed(2),
             route_price : _ride_price,
             route_time : _ride_time,
             isRouteFound : true 
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
        var price_per_km = 19;
        var _ride_price = Number.parseFloat(_distance * price_per_km).toFixed(2);
        
        document.getElementById('ride-price-dashboard').style.visibility = "visible";
        document.getElementById('ride_price').innerHTML = _ride_price + ' Birr';
        document.getElementById('distance').innerHTML = _distance + ' km';
        document.getElementById('ride_time').innerHTML = _ride_time_string;
    }

    rideRequest = (latlng) => {
        var objRideRequest = {
            user_id: '7141',
            driver_id: '0',
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
                // setInterval(this.requestWait(true).bind(this), 1000)
                 setInterval(this.requestWait, 1000);
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
    
    requestWait = () => {
        if(this.state.statusFlag){
           document.getElementById("ride-request-dashboard").style.visibility = "hidden";
           this.setState({statusFlag : false});
        } else {
            document.getElementById("ride-request-dashboard").style.visibility = "visible";
            this.setState({statusFlag : true});
        }
        
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
                          <Col xs={4} md={4}>
                            Price <Badge><div id="ride_price"></div></Badge>   
                          </Col>

                          <Col xs={4} md={4}>
                           Distance <Badge><div id="distance"></div></Badge>
                          </Col>

                          <Col xs={4} md={4}>
                           Time <Badge><div id="ride_time"></div></Badge>
                          </Col>
                      </Row>

                      <Row className="rowPadding">
                          <Col xs={6} sm={6} md={6}>
                          <Button  onClick={(e) => this.rideRequest(this.state.pickup_latlng, e)} bsStyle="success" bsSize="small">Request ride</Button>
                          </Col>

                          <Col xs={6} sm={6} md={6}>
                          <Button  bsStyle="danger" bsSize="small">Cancel ride</Button>
                          </Col>
                      </Row>

                  </Grid>
                  </div>
                  <div id="div-process" className="div-process">
                   <div className="div-pickup-btn-box"></div> 
                  </div>
              </div>
              
              <div className="ride-request-dashboard" id="ride-request-dashboard"> 
                    Connecting drivers <br />
                    wait !
              </div>

              <div className="mapid" id="mapid"></div>
            </div>
        );
    }
}
export default PickUpMap;