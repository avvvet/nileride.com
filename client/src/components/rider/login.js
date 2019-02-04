import React, { Component } from 'react';
import { Grid, Image } from 'semantic-ui-react'
import ApplyToRide from './apply_to_ride';
import RiderLoginForm from './rider_login';

class RiderLogin extends Component {
  constructor(){
    super();

    this.state = {
      auth: ''
    }
    //localStorage.clear(); this clear all 
    localStorage.removeItem('_auth_user');
  }

  render() {
    return(
     <div>
         <div>
           <Grid container columns={1} centered  stackable>
           <Grid.Row columns={1}>
              <Grid.Column mobile={12} tablet={12} computer={12}>
                <div id='FormError' className='FormError'></div>
              </Grid.Column>
            </Grid.Row>

            <Grid.Row columns={2}>
              <Grid.Column mobile={12} tablet={12} computer={12}>
                  <RiderLoginForm></RiderLoginForm>
              </Grid.Column>

              <Grid.Column mobile={12} tablet={12} computer={12}>
                  <ApplyToRide></ApplyToRide>
              </Grid.Column>
            </Grid.Row>
          </Grid>
         </div>
     </div>
    );

  }
}
export default RiderLogin;