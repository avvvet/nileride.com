import React , { Component } from 'react';
import { render } from 'react-dom';
import {Grid, Row, Col, FormGroup, FormControl, ControlLabel, HelpBlock, PageHeader, Button, Alert} from 'react-bootstrap';
import $ from 'jquery';

class ApplyToDrive extends Component {
    constructor(){
        super();
        this.state = {
            firstName: '',
            middleName: '',
            email: '',
            mobile: '',
            password: '',
            re_password: '',
            plateNo: '',
            errors: []
        }
    }

    validateDriverApply = () => {
        let errors = [];
        
        if(this.state.firstName.length === 0) {
            errors.push("First name field is empty.");
        }

        if(this.state.middleName.length === 0) {
            errors.push("Father name field is empty.");
        }

        if(this.state.firstName.length < 3) {
          errors.push("Name field need to be at least 2 characters.");
        }
    
        if(this.state.email.indexOf('@') === -1) {
          errors.push("Email address is not valid.");
        }
    
        if(this.state.mobile.length === 0) {
          errors.push("Mobile field is empty.");
        }
    
        return errors;
    }

    getErrorList(errors){
        var i = 0;
        let error_list = errors.map(error => {
            return <li key={i++}>{error}</li>
        });
        return error_list;
    }

    change = (e) => {
        this.setState({
            [e.target.name]: e.target.value
        })
    }

    onDriverApply = (e) => {
        e.preventDefault();
        const err = this.validateDriverApply();
        if(err.length > 0){
            let error_list = this.getErrorList(err);
            render(<Alert bsStyle="danger" >{error_list}</Alert>,document.getElementById('applyFormError'));
        } else {
            var driver = {
                firstName: this.state.firstName,
                middleName: this.state.middleName,
                email: this.state.email,
                mobile: this.state.mobile,
                password: this.state.password,
                re_password: this.state.re_password,
                plateNo: this.state.plateNo
            }
            this.driverApply(driver)
            this.setState({
                firstName: '',
                middleName: '',
                email: '',
                mobile: '',
                password: '',
                re_password: '',
                plateNo: '',
                errors: []
            });
        }
    }

    driverApply = (driver) => {
        $.ajax({ 
            type:"POST",
            url:"/driver/apply",
            data: JSON.stringify(driver), 
            contentType: "application/json",
            success: function(data, textStatus, jqXHR) {
              render(<Alert bsStyle="success" onDismiss={this.handleDismiss}><h4>{data.firstName}, You have successfully applied. </h4> <br /> Please check your email to activate your driving account. <br /> after checking your email , login to your account using your email address, <h6>{data.email}</h6></Alert>,document.getElementById('applyFormError'));
              console.log("driver applied success", data);
              
            }.bind(this),
            error: function(xhr, status, err) {
                console.error(xhr, status, err.toString());
            }.bind(this)
        });  
    }


    render(){
        return(
          <div>
              <Grid fluid>
                <Row>
                  <Col xs={12} sm={12} md={12}>
                    <PageHeader>
                      APPLY TO DRIVE
                     </PageHeader>
                  </Col>
                </Row> 
                <form>
                <Row>
                  <Col xs={12} sm={12} md={12}>
                    <div id="applyFormError"></div>
                  </Col> 
                </Row>

                <Row>
                  <Col xs={12} sm={6} md={6}>
                    <FormGroup>
                    <ControlLabel>First Name</ControlLabel>
                    <FormControl
                     name="firstName"
                     type="text"
                     value={this.state.firstName}
                     placeholder="First Name"
                     onChange={e => this.change(e)}
                    >
                    </FormControl>
                    </FormGroup>
                  </Col>
                  <Col xs={12} sm={6} md={6}>
                    <FormGroup>
                    <ControlLabel>Father Name</ControlLabel>
                    <FormControl
                     name="middleName"
                     type="text"
                     value={this.state.middleName}
                     placeholder="Father Name"
                     onChange={e => this.change(e)}
                    >
                    </FormControl>
                    </FormGroup>
                  </Col>
                </Row>

                <Row>
                  <Col xs={12} sm={6} md={6}>
                    <FormGroup>
                    <ControlLabel>Email</ControlLabel>
                    <FormControl
                     name="email"
                     type="text"
                     value={this.state.email}
                     placeholder="email address"
                     onChange={e => this.change(e)}
                    >
                    </FormControl>
                    </FormGroup>
                  </Col>
                  <Col xs={12} sm={6} md={6}>
                    <FormGroup>
                    <ControlLabel>Mobile</ControlLabel>
                    <FormControl
                     name="mobile"
                     type="text"
                     value={this.state.mobile}
                     placeholder="Mobile number"
                     onChange={e => this.change(e)}
                    >
                    </FormControl>
                    </FormGroup>
                  </Col>
                </Row>

                <Row>
                  <Col xs={12} sm={6} md={6}>
                    <FormGroup>
                    <ControlLabel>Password</ControlLabel>
                    <FormControl
                     name="password"
                     type="password"
                     value={this.state.password}
                     placeholder="Password"
                     onChange={e => this.change(e)}
                    >
                    </FormControl>
                    </FormGroup>
                  </Col>
                  <Col xs={12} sm={6} md={6}>
                    <FormGroup>
                    <ControlLabel>Retype Password</ControlLabel>
                    <FormControl
                     name="re_password"
                     type="password"
                     value={this.state.re_password}
                     placeholder="Retype password"
                     onChange={e => this.change(e)}
                    >
                    </FormControl>
                    </FormGroup>
                  </Col>
                </Row>
                <Row className="text-center">
                  <Col xs={12} sm={12} md={12}>
                  <Button type="submit" bsSize="large" bsStyle="success" onClick={e => this.onDriverApply(e)}  >APPLY TO DRIVE</Button>
                  </Col> 
                </Row>


                </form>
              </Grid>
          </div>

        );
    }
}
export default ApplyToDrive;