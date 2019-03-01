import React, { Component } from 'react';
import { Grid, Image, Label } from 'semantic-ui-react'
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
           <Grid container columns={1} centered>
           <Grid.Row>
              <Grid.Column mobile={18} tablet={18} computer={18}>
                <div id='FormError' className='FormError'></div>
              </Grid.Column>
            </Grid.Row>

            <Grid.Row>
              <Grid.Column mobile={18} tablet={18} computer={18}>
                  <RiderLoginForm></RiderLoginForm>
              </Grid.Column>
            </Grid.Row>

            <Grid.Row>
              <Grid.Column mobile={18} tablet={18} computer={18}>
                  <ApplyToRide></ApplyToRide>
              </Grid.Column>
            </Grid.Row>
          </Grid>
         </div>
         <div id="div-logo" className="div-logo">
                 <Image src='/assets/nile_ride_logo_blue.png' height={75} centered></Image> 
                 <Label size="large" as="a" color="orange" onClick={(e) => this._show_faq(e)} pointing>
                      በተደጋጋሚ የሚጠየቁ ጥያቄዎች
                   </Label>
          </div>
     </div>
    );

  }
}
export default RiderLogin;