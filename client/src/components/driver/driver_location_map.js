import React, { Component } from 'react';
import {Button} from 'react-bootstrap';
import {NavLink} from 'react-router-dom';
import L from 'leaflet';
import socketClient from 'socket.io-client';

const socket = socketClient('http://localhost:5000');

class DriverLocation extends Component {
   constructor() {
       super();
       this.state = {
           currentLatLng: {
               lat: 0,
               lng: 0
           },
           driver_id: '',
           markersLayer: '',
           map : ''
       }
   }
   
   socketConnect = (_obj) => {
    socket.on('connect', function(){
        console.log('client connected');

        socket.emit('join', _obj, function(err) {
            if(err) {
               alert(err);
            }
        });
    });
    
    socket.on('driveRequest' , function(msg) {
        console.log('drive request' , msg);
    })
    
    socket.on('disconnect', function(){
        console.log('client disconnected');
    });
   }
   
   socketJoin = (_obj) => {
    
   }

   componentDidMount(){
    var data = {
        driver_id : 4141
    };
    
    this.socketConnect(data);

    var map = L.map('mapid').setView([9.0092, 38.7645], 16);
    map.locate({setView: true, maxZoom: 17});
    
    this.setState({map : map});

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);

    var markersLayer = new L.LayerGroup().addTo(map);
    this.setState({markersLayer: markersLayer});

   }

   componentDidUpdate() {
    var map = this.state.map;
    var marker;
    var markersLayer = this.state.markersLayer;
    
    map.on('locationfound', (e) => {
        var radius = e.accuracy / 128;
        L.marker(e.latlng).addTo(map)
            .bindPopup("You are " + radius + " meters from this point").openPopup();
        L.circle(e.latlng, radius).addTo(map);
        this.setState({
            currentLatLng : e.latlng
        });       
    });

    function onLocationError(e) {
        alert(e.message);
    }
    map.on('locationerror', onLocationError);

   }

    render(){
        return(
            <div>
                <div className="mapid" id="mapid"></div>
                <div className="driver-box">
                online
                </div>
            </div>
        );
    }
}
export default DriverLocation;