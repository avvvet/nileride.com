import React, { Component } from 'react';
import { Grid, Header, Image } from 'semantic-ui-react'
import ApplyToDrive from './apply_to_drive';
import DriverLoginForm from './driver_login';

class DriverLogin extends Component {
  constructor(){
    super();

    this.state = {
      auth: ''
    }
    localStorage.removeItem('_auth_driver')
  }

  render() {
    const auth = localStorage.getItem("_auth_driver");
    console.log('received token', auth);
    return(
     <div>
       {auth ? (
         <div> Driver dashboard </div>
       ) : (
         <div>
           <Grid container columns={1} centered>
            <Grid.Row columns={1}>
              <Grid.Column mobile={18} tablet={18} computer={18}>
                <div id='FormError' className='FormError'></div>
              </Grid.Column>
            </Grid.Row>

            <Grid.Row>
              <Grid.Column mobile={18} tablet={18} computer={18}>
                <DriverLoginForm></DriverLoginForm>
              </Grid.Column>
            </Grid.Row>
              
            <Grid.Row>
              <Grid.Column mobile={18} tablet={18} computer={18}>
                  <ApplyToDrive></ApplyToDrive>
              </Grid.Column>
            </Grid.Row>
          </Grid>
         </div>
       )} 
     </div>
    );

  }
}
export default DriverLogin;