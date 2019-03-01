import React, { Component } from 'react';
import { render } from 'react-dom';
import L from 'leaflet';
import {NavLink, Redirect} from 'react-router-dom';
import { Grid, Image, Button, Header, Label } from 'semantic-ui-react'
import Faq from './faq';

class Branch extends Component {
    constructor(){
        super();
        this.state = {
            pickupAdress: 'Lord my God you have plan in my life',
            locationGroup: '',
            pickup_latlng: {
                lat: 0,
                lng: 0
            }
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
            locationGroup : new L.LayerGroup().addTo(map)
        });

        map.on('locationfound', (e) => {
            var locationGroup = this.state.locationGroup;
            //locationGroup.clearLayers();
              var radius = e.accuracy / 1024;
              radius = radius.toFixed(2);
              L.marker(e.latlng).addTo(locationGroup)
             .bindPopup("You are " + radius + " meters from this point").openPopup();
                
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

    _show_faq = (e) => {
        document.getElementById('div-branch').style.visibility = 'hidden';
        render(<Faq></Faq>,document.getElementById('div-faq-txt'));
    }

    render(){
        return(
            <div>
                
                <div className="div-branch" id="div-branch">
                <Image src='/assets/nile_ride_logo_blue.png' height={100} centered></Image>
                <Grid container columns={1} centered  stackable>

                  <Grid.Row columns={1}>
                    <Grid.Column mobile={12} tablet={12} computer={12}>
                       <Header size='huge' color='black' textAlign='center'>You are ?</Header>
                    </Grid.Column>
                  </Grid.Row>

                  <Grid.Row columns={1}>
                    <Grid.Column mobile={12} tablet={12} computer={12}>
                      <Button color='teal' size='massive' as={NavLink} to='/user/login'  fluid >ተሳፋሪ PASSENGER</Button>
                    </Grid.Column>
                  </Grid.Row>

                  <Grid.Row columns={1} >
                    <Grid.Column mobile={12} tablet={12} computer={12}>
                       <Header size='small' color='black' textAlign='center'>
                           <Label circular color="black">OR</Label>
                       </Header>
                    </Grid.Column>
                  </Grid.Row>

                  <Grid.Row columns={1}>
                    <Grid.Column mobile={12} tablet={12} computer={12}>
                      <Button color='green' size='massive' as={NavLink} to='/driver/login'  fluid >ሹፊር DRIVER</Button>
                    </Grid.Column>
                  </Grid.Row>

                </Grid>
                </div>

                <div id="div-faq-txt" className="div-faq-txt"></div>

                <div id="div-faq" className="div-faq">
                   <Label size="large" as="a" color="orange" onClick={(e) => this._show_faq(e)} pointing>
                      በተደጋጋሚ የሚጠየቁ ጥያቄዎች
                   </Label>
                </div>

                <div className="mapid" id="mapid"></div>
            </div>
        );
    }
}
export default Branch;