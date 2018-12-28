import React, { Component } from 'react';
import {Button, Grid, Row, Col, PageHeader, FormGroup} from 'react-bootstrap';
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
           <Grid>
            <Row>
              <Col xs={12} sm={12} md={12}>
                <PageHeader>
                    AWET
                </PageHeader>
              </Col>
            </Row>

            <Row className="text-center">
              <Col xs={12} sm={12} md={12}>
                <div id="FormError"></div>
              </Col>
            </Row>

            <Row>
              <Col xs={12} sm={6} md={6}>
                <div className="riderLoginBox">
                  <RiderLoginForm></RiderLoginForm>
                </div>
              </Col>

              <Col xs={12} sm={6} md={6}>
                <div className="riderApplyBox">
                  <ApplyToRide></ApplyToRide>
                </div>
              </Col>
            </Row>
          </Grid>
         </div>
     </div>
    );

  }
}
export default RiderLogin;