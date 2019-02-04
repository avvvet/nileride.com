import React, { Component } from 'react';
import PickUpMap from './pickup_map';

class PickUp extends Component {
    constructor(){
        super();
        this.state = {
            pickupAdress: 'Lord my God you have plan in my life',
            pickup_latlng: {
                lat: 0,
                lng: 0
            }
        }
    }

    render(){
        return(
            <div>
                <PickUpMap pickupAdress={this.state.pickup_latlng}></PickUpMap>
            </div>
        );
    }
}
export default PickUp;