import React , { Component } from 'react';
import { render } from 'react-dom';
import  { Redirect } from 'react-router-dom'
import {Grid, Row, Col, FormGroup, FormControl, ControlLabel, Tooltip, PageHeader, Button, Alert} from 'react-bootstrap';
import $ from 'jquery';

var validator = require('validator');

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
            gender: '',
            plateNo: '',
            errors: [],
            auth: false
        }
    }

    validateDriverApply = () => {
        let errors = [];
        
        if(this.state.firstName.length === 0) {
            errors.push("First name field is empty.");
        }else if(this.state.firstName.length <  2) {
            errors.push("Your first name is very short.");
        }else if(validator.isAlpha(this.state.firstName) === false) {
            errors.push("First name needs to be alphabet");
        }

        if(this.state.middleName.length === 0) {
            errors.push("Father name field is empty.");
        } else if(this.state.middleName.length < 2) {
          errors.push("Father name is very short");
        } else if(validator.isAlpha(this.state.middleName) === false) {
            errors.push("Father name needs to be alphabet");
        }
    
        if(validator.isEmail(this.state.email)===false) {
          errors.push("Email address is not valid.");
        }else if(this.state.email.length === 0) {
            errors.push("Mobile field is empty.");
        }

        if(this.state.mobile.length === 0 ){
          errors.push("Mobile field is empty");
        }
        else if (validator.isNumeric(this.state.mobile, {no_symbols: true} ) === false) {
            errors.push("Mobile number is not valid");
        }
        else if(validator.isMobilePhone(this.state.mobile) === false) {
          errors.push("Mobile field is not correct");
        } else if (this.state.mobile.length < 10){
            errors.push("Mobile number needs to be 10 digits");
        }else if (this.state.mobile.length > 10){
            errors.push("Mobile number needs to be 10 digits");
        }

        if(this.state.password.length === 0 ){
            errors.push("Password field is empty");
        }
        else if(validator.isLength(this.state.password, {min: 6}) === false){
            errors.push("Password length must not be less than 6 characters");
        }else if(validator.isLength(this.state.password, {max: 15}) === false){
            errors.push("Password length very long");
        }

        if(this.state.gender.length === 0){
            errors.push("Gender field is not selected");
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
            render(<Alert bsStyle="danger" >{error_list}</Alert>,document.getElementById('FormError'));
        } else {
            var driver = {
                firstName: this.state.firstName,
                middleName: this.state.middleName,
                email: this.state.email,
                mobile: this.state.mobile,
                password: this.state.password,
                re_password: this.state.re_password,
                gender: this.state.gender,
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
                gender: '',
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
              localStorage.setItem("_auth_driver", data.token);
              this.setState({
                  auth: data.token
              })  
              
              console.log('token', data.token);
              //render(<Alert bsStyle="success" onDismiss={this.handleDismiss}><h4>{data.firstName}, You have successfully applied to drive. </h4> <br /> Please check your email to activate your driving account. <br /> after checking your email , login to your account using your email address, <h6>{data.email}</h6></Alert>,document.getElementById('FormError'));
              console.log("driver applied success", data);
              
            }.bind(this),
            error: function(xhr, status, err) {
                console.error(xhr, status, err.toString());
            }.bind(this)
        });  
    }


    render(){
        if(this.state.auth) {
            return <Redirect to='/driver'  />
        }
        
        return(
            <div>
                <Grid fluid>
                <Row>
                    <Col xs={12} sm={12} md={12}>
                    <div>
                        <PageHeader>
                            NEW DRIVER
                            <Tooltip placement="bottom" className="in" id="tooltip-bottom">
                              New driver apply here.
                            </Tooltip>
                        </PageHeader>
                    </div>
                    </Col>
                </Row> 
                <form>
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
                    <ControlLabel>Gender</ControlLabel>
                    <FormControl name="gender" componentClass="select" placeholder="select" onChange={e => this.change(e)}>
                        <option value="">select</option>
                        <option value="male">Male</option>
                        <option value="female">Female</option>
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