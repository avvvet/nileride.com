import React, { Component } from 'react';
import {Grid, Row, Col, FormGroup, FormControl, ControlLabel, Tooltip, PageHeader, Button, Alert} from 'react-bootstrap';

class DriverLoginForm extends Component {
  constructor(){
      super();
      this.state = {
          loginEmail: '',
          loginPassword: ''
      }
  }
  render(){
      return(
        <div>
           <Grid fluid>
                <Row>
                    <Col xs={12} sm={12} md={12}>
                    <PageHeader>
                        Login
                        <Tooltip placement="bottom" className="in" id="tooltip-bottom">
                              Exsting driver login here.
                        </Tooltip>
                    </PageHeader>
                    </Col>
                </Row> 
                <form>
                <Row>
                    <Col xs={12} sm={12} md={12}>
                    <div id="loginFormError"></div>
                    </Col> 
                </Row>

                <Row>
                    <Col xs={12} sm={12} md={12}>
                    <FormGroup>
                    <ControlLabel>Email</ControlLabel>
                    <FormControl
                    name="loginEmail"
                    type="text"
                    value={this.state.loginEmail}
                    placeholder="Email Address"
                    onChange={e => this.change(e)}
                    >
                    </FormControl>
                    </FormGroup>
                    </Col>
                    <Col xs={12} sm={12} md={12}>
                    <FormGroup>
                    <ControlLabel>Password</ControlLabel>
                    <FormControl
                    name="loginPassword"
                    type="text"
                    value={this.state.loginPassword}
                    placeholder="Password"
                    onChange={e => this.change(e)}
                    >
                    </FormControl>
                    </FormGroup>
                    </Col>
                </Row>

                <Row className="text-center">
                    <Col xs={12} sm={12} md={12}>
                    <Button type="submit" bsSize="large" bsStyle="primary" onClick={e => this.onDriverApply(e)}  >LOGIN</Button>
                    </Col> 
                </Row>

                </form>
                </Grid>
        </div>
      )
  }
}
export default DriverLoginForm;