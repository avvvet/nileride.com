import React, { Component } from 'react';
import { render } from 'react-dom';
import L from 'leaflet';
import {Button, Grid, Row, Col, FormControl, FormGroup, ControlLabel} from 'react-bootstrap';
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
            map : '',
            markersLayer: '',
            list: [],
            currentDrivers : [],
            pickupText : '',
            dropoffText : ''
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

    componentDidMount(){
        var map = L.map('mapid').setView([9.0092, 38.7645], 16);
       // map.locate({setView: true, maxZoom: 17});
        
        this.setState({map : map});

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        }).addTo(map);

        var markersLayer = new L.LayerGroup().addTo(map);
        this.setState({markersLayer: markersLayer});

        function onLocationFound(e) {
            var radius = e.accuracy / 128;
        
            L.marker(e.latlng).addTo(map)
                .bindPopup("YOU are" + radius + " meters from this point").openPopup();
        
            L.circle(e.latlng, radius).addTo(map);
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
                    var session_pickup = e.latlng;
                    localStorage.setItem("session_pickup", JSON.stringify(session_pickup));
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
    }

    change = (e) => {
        this.setState({
            [e.target.name]: e.target.value
        })
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
              <div className="mapid" id="mapid"></div>
            </div>
        );
    }
}
export default PickUpMap;