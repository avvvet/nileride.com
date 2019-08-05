import React, { Component } from 'react';
import DriverLocation from './driver_location_map';
import  { Redirect } from 'react-router-dom';
import _ from 'lodash';

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
       if(localStorage.getItem("_auth_driver") === null) {
        return <Redirect to='/'  />
       }

       return(
           
           <div>
              <DriverLocation ></DriverLocation>
           </div>
       );
   }
}
export default DriverLogin;