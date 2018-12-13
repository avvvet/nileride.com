import React, { Component } from 'react';
import {Button, Grid, Row, Col, PageHeader, FormGroup} from 'react-bootstrap';
import ApplyToDrive from './apply_to_drive';
import DriverLoginForm from './driver_login';

class DriverLogin extends Component {
  constructor(){
    super();

    this.state = {
      auth: ''
    }
    localStorage.setItem("auth", '');
  }

  render() {
    const auth = localStorage.getItem("auth");
    console.log('received token', auth);
    return(
     <div>
       {auth ? (
         <div> Driver dashboard </div>
       ) : (
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
                <div className="driverApplyBox">
                  <ApplyToDrive></ApplyToDrive>
                </div>
                
              </Col>

              <Col xs={12} sm={6} md={6}>
                <div className="driverLoginBox">
                  <DriverLoginForm></DriverLoginForm>
                </div>
              </Col>
            </Row>
          </Grid>
         </div>
       )} 
     </div>
    );

  }
}
export default DriverLogin;