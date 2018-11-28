import React, { Component } from 'react';
import { render } from 'react-dom';
import L from 'leaflet';
import {Button, Image, Badge, Grid, Row, Col} from 'react-bootstrap';
import * as Nominatim from "nominatim-browser";
import GeometryUtil from 'leaflet-geometryutil';
import {Routing} from 'leaflet-routing-machine';

class DropOffMap extends Component {
    constructor(){
        super();
        this.state = {
            dropoff_flag: false,
            pickup_flag: true,
            dropoff_location : 'Select your pickup location',
            dropoff_latlng : {
                lat: 9.0092,
                lng: 38.7545
            },
            pickup_latlng : {
                lat: 9.0092,
                lng: 38.7645
            },
            map : '',
            markersLayer: ''
        }
    }

    onRequest = () => {
       document.getElementById('div-process').innerHTML='';
       //send ajax request pickup address and wait for driver - this will return the driver
       document.getElementById('div-request').style.visibility = 'visible';
    }

    componentDidMount(){
        var map = L.map('mapid').setView([9.0092, 38.7645], 16);
        this.setState({map : map});

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        }).addTo(map);

        var markersLayer = new L.LayerGroup().addTo(map);
        this.setState({markersLayer: markersLayer});
        this.setState({pickup_latlng: JSON.parse(localStorage.getItem("session_pickup"))});
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
                markersLayer.clearLayers();
                marker = L.marker(e.latlng).addTo(markersLayer).bindPopup("<div class='popup-title'> Your dropoff location is </div>" + "<div class='popup-content'>" + result.display_name + "</div>" ).openPopup();
                markersLayer.addLayer(marker); 
                this.setState({
                    dropoff_location: result.display_name,
                    dropoff_latlng : e.latlng, 
                    dropoff_flag: true,
                });
            })
            .catch((error) =>
            {
                console.error(error); 
            });        
        }); 

        if(this.state.dropoff_flag && this.state.pickup_flag) {
            var latlng1 = this.state.pickup_latlng;
            var latlng2 = this.state.dropoff_latlng;
            shortesRoute(latlng1, latlng2);
        }
 
        function shortesRoute(latlng1, latlng2){
            L.Routing.control({
                waypoints: [
                 latlng1,
                 latlng2
                ]
            })
            .on('routesfound', function(e) {
                var routes = e.routes;
                var _distance = routes[0].summary.totalDistance;
                var _ride_time = routes[0].summary.totalTime;
                
                _distance = Number.parseFloat(_distance/1000).toFixed(2);
                _ride_time = timeConvert(Number.parseInt(_ride_time));

                var price_per_km = 25;
                var _ride_price = Number.parseFloat(_distance * price_per_km).toFixed(2);
                
                document.getElementById('ride_price').innerHTML = _ride_price + ' Birr';
                document.getElementById('distance').innerHTML = _distance + ' km';
                document.getElementById('ride_time').innerHTML = _ride_time;
            })
            .addTo(map);  
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
    }

    render(){    
        return(
            
            <div>
              <div className="mapid" id="mapid"></div>
              <div className="div-request" id="div-request">
                    <div>
                    <Grid fluid={true}>
                        <Row>
                            <Col xs={6} md={6}>
                               <Image src="/assets/awet-ride.jpeg" height={45} circle></Image>  
                            </Col>

                            <Col xs={6} md={6}>
                               <Image src="/assets/awet-ride-driver.jpeg" height={45} circle></Image>
                            </Col>
                        </Row>

                        <Row>
                            <Col xs={6} md={6}>
                                Lifan x345 i
                            </Col>

                            <Col xs={6} md={6}>
                                Nati Sahle
                            </Col>
                        </Row>

                        <Row>
                            <Col xs={6} md={6}>
                                A34587
                            </Col>

                            <Col xs={6} md={6}>
                               0911003994
                            </Col>
                        </Row>

                    </Grid>
                    </div>
                       
                    
                </div>

                <div className="div-ride-price">
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
                  </Grid>
                  </div>
                  <div id="div-process" className="div-process">
                   <div className="div-pickup-btn-box"><Button  onClick={this.onRequest} bsStyle="success" bsSize="small">Request Driver</Button></div> 
                  </div>
              </div>
            </div>
        );
    }
}
export default DropOffMap;