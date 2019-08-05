import React, { Component } from 'react';
import {Redirect} from 'react-router-dom';
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
        //this to support old code in case if there is browser cache - will be removed in future commit
        if(localStorage.getItem("_auth_driver") === false){
             localStorage.removeItem("_auth_driver");
        }

        if(localStorage.getItem("_auth_driver") !== null) {
            return <Redirect to='/driver'  />
        }

        return(
            <div>
                <PickUpMap pickupAdress={this.state.pickup_latlng}></PickUpMap>
            </div>
        );
    }
}
export default PickUp;