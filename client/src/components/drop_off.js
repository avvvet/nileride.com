import React, { Component } from 'react';
import DropOffMap from './dropoff_map';

class DropOff extends Component {
    constructor(){
        super();
        this.state = {
            dropoff_location: 'Lord my God you have plan in my life',
            dropoff_latlng: {
                lat: 0,
                lng: 0
            }
        }
    }

    render(){
        return(
            <div>
                <DropOffMap dropoff_latlng={this.state.dropoff_latlang}></DropOffMap>
            </div>
        );
    }
}
export default DropOff;