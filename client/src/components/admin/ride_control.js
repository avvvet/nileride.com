import React, { Component } from 'react';
import { render } from 'react-dom';
import L from 'leaflet';
import $ from 'jquery';
import { Grid, Message, Form , Label, Button , Card, Image, Icon, Table, Input } from 'semantic-ui-react'
const env = require('../../env');

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

class RideControlMap extends Component {
    constructor(){
        super();
        this.state = {
            dropoff_flag: false,
            pickup_flag: true,
            dropoff_location : 'Select your pickup location',
            dropoff_latlng : {
                lat: 0,
                lng: 0
            },
            pickup_latlng : {
                lat: 0,
                lng: 0
            },
            route_price : 0,
            route_distance : 0,
            route_time : 0,
            isRouteFound : false,
            map : '',
            markerGroup: '',
            carMarkerGroup: '',
            userMarkerGroup : '',
            locationGroup: '',
            driver: {
                id: '',
                driver_name: '',
                driver_phone: '',
                model: '',
                plate: '',
                car_pic : '',
                driver_pic : ''
            },
            socket_data : ''
        }

    }

    componentDidMount(){
        var map = L.map('mapid').setView([9.0092, 38.7645], 16);
        this.setState({map : map});

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        }).addTo(map);

        this.setState({
            markerGroup : new L.LayerGroup().addTo(map),
            locationGroup : new L.LayerGroup().addTo(map),
            carMarkerGroup : new L.LayerGroup().addTo(map),
            userMarkerGroup : new L.LayerGroup().addTo(map)
        });

        this.getRide(this.props.ride_id);
        this.getDrivers();
        this.timerDrivers = setInterval(this.getDrivers, 7000);
    };

    getDrivers = () => {
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
                        .bindPopup(currentDrivers[i].firstName + ' ' + currentDrivers[i].middleName + ' ' + "<a href=tel:" + currentDrivers[i].mobile + ">" + currentDrivers[i].mobile + "</a>")
                        .addTo(carMarkerGroup);
                    }
                }

            }.bind(this),
            error: function(xhr, status, err) {
                console.log('getdrivers error', err.toString());
                
            }.bind(this)
        });  
    }

    getRide = (ride_id) => {
        var objRideRequest = {
            id : ride_id
        };
        console.log('ride ride', ride_id);
        $.ajax({ 
            type:"POST",
            url:"/ride/id",
            data: JSON.stringify(objRideRequest), 
            contentType: "application/json",
            success: function(ride, textStatus, jqXHR) {
                console.log('returend', ride);
                this.setState({
                    _ride_id : ride.id,
                    _driverImage: "/assets/profile/driver/" + ride.driver.profile,
                    _driverName : ride.driver.firstName + ' ' + ride.driver.middleName,
                    _driverCurrentLocation : ride.driver.currentLocation.coordinates,
                    pickup_latlng : ride.pickup_latlng.coordinates,
                    dropoff_latlng : ride.dropoff_latlng.coordinates,
                });
                this._ride_route(this.state.pickup_latlng, this.state.dropoff_latlng);
            }.bind(this),
            error: function(xhr, status, err) {
                console.error(xhr, status, err.toString());
            }.bind(this)
        });  
    }

    _ride_route_old = (latlng1, latlng2) => {
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


    _ride_route = (latlng1, latlng2) => {
        // alert('jesus');my lord help me 
         document.getElementById('ride-price-dashboard').style.visibility = "hidden";
         
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
         var _ride_price = (_distance * price_per_km).toFixed(2);
         
         this.setState({
             route_distance : Number.parseFloat(_distance).toFixed(2),
             route_price : _ride_price,
             route_time : _ride_time,
             route_time_string :_ride_time_string,
             isRouteFound : true 
         });
        //lord your are God of order, I beg you father not now. THANK YOU FATHER - Let your will be done
        
        document.getElementById('ride-price-dashboard').style.visibility = "visible";
        //this.nearestDriverRouteInfo(this.state.pickup_latlng, this.state._nearest_driver_latlng);
    }

    _clear_map = () => {
        render('',document.getElementById('ride_control'));
    }

    render(){    
        
        return(
            <div>
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
                      <Button content='UPDATE' icon={<Icon name='car' size="large" />} labelPosition='left' color="green" className="btn" onClick={(e) => this.checkLogin(e)} />
                      <Button content='CANCEL'  onClick={(e) => this._clear_map(e)} />
                     </div>
                    </Card.Content>
                    </Card>
                  </div>
              </div>
              <div className="mapid" id="mapid"></div>
            </div>
        );
    }
}
export default RideControlMap;