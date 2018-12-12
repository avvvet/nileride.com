import React, { Component } from 'react';
import {Button, Grid, Row, Col, PageHeader, FormGroup} from 'react-bootstrap';
import ApplyToDrive from './apply_to_drive';

class DriverLogin extends Component {
  render() {
    return(
        <Grid>
            <Row>
              <Col xs={12} sm={6} md={12}>
                <PageHeader>
                    AWET
                </PageHeader>
              </Col>
            </Row>

            <Row>
              <Col xs={12} sm={6} md={6}>
                <ApplyToDrive></ApplyToDrive>
              </Col>

              <Col xs={12} sm={6} md={6}>
                 driver login
              </Col>
            </Row>
        </Grid>
    );

  }
}
export default DriverLogin;