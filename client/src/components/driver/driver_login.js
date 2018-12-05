import React, { Component } from 'react';
import DriverLocation from './driver_location_map';

class DriverLogin extends Component {
   constructor(){
       super();
       this.state = {
           latlng : {
               lat: 0,
               lng: 0
           }
       }
   }

   render(){
       return(
           <div>
              <DriverLocation ></DriverLocation>
           </div>
       );
   }
}
export default DriverLogin;