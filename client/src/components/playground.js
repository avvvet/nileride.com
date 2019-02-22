import React, { Component } from 'react';
import { render } from 'react-dom';
import L from 'leaflet';
import {NavLink, Redirect} from 'react-router-dom';
import { Grid, Form, Image, Button, Header, Label , Input, Table, List, Icon} from 'semantic-ui-react'
import { GeoSearchControl, OpenStreetMapProvider } from 'leaflet-geosearch';
import _ from 'lodash';
import $ from 'jquery';

const source = _.times(5, () => ({
    title: "yes",
    description: 'no',
    image: 'no',
    price: 20,
  }))
  var marker_a = L.icon({
    iconUrl: '/assets/marker_a.png',
    shadowUrl: '',

    iconSize:     [40, 40], // size of the icon
    shadowSize:   [50, 64], // size of the shadow
    iconAnchor:   [20, 39], // point of the icon which will correspond to marker's location
    shadowAnchor: [4, 62],  // the same for the shadow
    popupAnchor:  [-1, -45] // point from which the popup should open relative to the iconAnchor
});
class Playground extends Component {
    constructor(){
        super();
        this.state = {
            pickupAdress: 'Lord my God you have plan in my life',
            locationGroup: '',
            pickup_latlng: {
                lat: 0,
                lng: 0
            },
            results : [],
            search_data : '',
            map : ''
        }
    }

    componentDidMount(){
       
        //var map = L.map('mapid').setView([9.0092, 38.7645], 16);
        var map = L.map('mapid');
        map.locate({setView: true, maxZoom: 17});
        
      
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        }).addTo(map);

        this.setState({
            map : map,
            locationGroup : new L.LayerGroup().addTo(map)
        });

        map.on('locationfound', (e) => {
            var locationGroup = this.state.locationGroup;
            //locationGroup.clearLayers();
              var radius = e.accuracy / 1024;
              radius = radius.toFixed(2);
              L.marker(e.latlng).addTo(locationGroup)
             .bindPopup("You are " + radius + " meters from this point").openPopup();
                console.log(e.latlng);
              L.circle(e.latlng, radius).addTo(locationGroup);
              map.setView(e.latlng,15);
              this.setState({currentLatLng : e.latlng});
        });
        
        function onLocationError(e) {
            console.log('location error', e.message);
        }
        map.on('locationerror', onLocationError);

        //my Lord is greate  - Jesus I call your name 
    }

    _search = (search) => {
        if(search.length > 0){
            const provider = new OpenStreetMapProvider(); 
            provider
            .search({ query: search })
            .then((results) => { 
                $('.search_data').removeClass("loading");
              // do something with result;
              console.log('I am winner beacuse I have Jesus', results);
              this.setState({
                  results : results
              });
              document.getElementById('search_result').style.visibility = 'visible';
            });
        } else {
            $('.search_data').removeClass("loading");
        }
    }

    nomi = (results) => {
        var i = 0;
        const data = results.map((result) =>
        <Table.Row key={i++} >
            <Table.Cell onClick={() => this.handleRowClick(result)}>{result.label}</Table.Cell>
        </Table.Row>         
        );
        return data;
    }
    
    handleRowClick = (result) => {
        if(result) {
          document.getElementById('search_result').style.visibility = 'hidden';
          this.setState({
              search_data : result.label
          });
          //my lord thank you thank you 
          console.log('clicked', result.x);

          var latlng = {
              lat : parseFloat(result.y),
              lng : parseFloat(result.x)
          }
          console.log(latlng);
          var map = this.state.map;
          L.marker(latlng, {icon: marker_a}).addTo(map)
             .bindPopup("here");
             map.fitBounds(result.bounds);
          
          console.log(result.bounds);
        }
    }

    change = (e) => {
        e.preventDefault();
        $('.search_data').addClass("loading");
        this.setState({
            [e.target.name]: e.target.value
        });

        clearTimeout(this.timeout);

        this.timeout = setTimeout(this._search, 1000, e.target.value);
    }

    handleFocus = (event) => event.target.select();
    
    render(){
        const { isLoading, value, results } = this.state
        return(
            <div>
                <div className="search_1" id="search_1">
                    <Grid centered>
                        <Grid.Row>
                            <Grid.Column mobile={16} tablet={16} computer={16}>
                            <Form>
                            <Input  icon={<Icon name='search' inverted circular link />} placeholder='Search...' onClick={this.handleFocus} onFocus={this.handleFocus} onChange={e => this.change(e)}  value={this.state.search_data} name="search_data" className="search_data"/>
                            </Form>
                            </Grid.Column>

                        </Grid.Row>   
                    </Grid>
                    <div className="search_result" id="search_result">
                     <Table celled selectable>
                      <Table.Body>
                       {this.nomi(this.state.results)}
                      </Table.Body>
                     </Table>
                    </div>
                </div>
                
                <div className="mapid" id="mapid"></div>
            </div>
        );
    }
}
export default Playground;