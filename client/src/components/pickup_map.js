import React, { Component } from 'react';
import { render } from 'react-dom';
import L from 'leaflet';
import {Button} from 'react-bootstrap';
import * as Nominatim from "nominatim-browser";


class PickUpMap extends Component {
    constructor(){
        super();
        this.state = {
            pickup_flag: false,
            pickup_location : 'Select your pickup location',
            pickup_latlng : {
                lat: 0,
                lng: 0
            },
            map : '',
            markersLayer: ''
        }
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
                marker = L.marker(e.latlng).addTo(markersLayer).bindPopup("<div class='popup-title'> Your pickup location is </div>" + "<div class='popup-content'>" + result.display_name + "</div>" ).openPopup();
                markersLayer.addLayer(marker); 
                this.setState({
                    pickup_location: result.display_name,
                    pickup_latlng : e.latlng, 
                    pickup_flag: true,
                });
                var session_pickup = e.latlng;
                localStorage.setItem("session_pickup", JSON.stringify(session_pickup));
            })
            .catch((error) =>
            {
                console.error(error); 
            });        
        }); 
    }
    
    render(){    
        return(
            <div>
              <div className="mapid" id="mapid"></div>
                <div className="div-pickup">
                <div className="style-1"><h6>First step : Pickup location</h6></div>
                <div className="div-pickup-address">{this.state.pickup_location}</div>
                <div className="div-pickup-btn-box"><Button href="/drop-off" bsStyle="success" bsSize="large" block>Continue</Button></div> 
              </div>
            </div>
        );
    }
}
export default PickUpMap;