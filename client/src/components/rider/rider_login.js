import React, { Component } from 'react';
import {Grid, Row, Col, FormGroup, FormControl, ControlLabel, Tooltip, PageHeader, Button, Alert} from 'react-bootstrap';
import { render } from 'react-dom';
import  { Redirect } from 'react-router-dom'
import $ from 'jquery';

class RiderLoginForm extends Component {
  constructor(){
      super();
      this.state = {
          loginEmail: '',
          loginPassword: ''
      }
  }

    validateRiderLogin = () => {
        let errors = [];
        
        if(this.state.loginEmail.length === 0) {
            errors.push("Email field is empty.");
        }

        if(this.state.loginPassword.length === 0) {
            errors.push("Password field is empty.");
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

    onRiderLogin = (e) => {
        e.preventDefault();
        const err = this.validateRiderLogin();
        if(err.length > 0){
            let error_list = this.getErrorList(err);
            render(<Alert bsStyle="danger" >{error_list}</Alert>,document.getElementById('FormError'));
        } else {
            var login = {
                email: this.state.loginEmail,
                password: this.state.loginPassword
            }
            this.riderLogin(login)
            
            this.setState({
                loginEmail: '',
                loginPassword: '',
                errors: []
            });
        }
    }

  riderLogin = (login) => {
        $.ajax({ 
            type:"POST",
            url:"/user/login",
            data: JSON.stringify(login), 
            contentType: "application/json",
            success: function(data, textStatus, jqXHR) {
             localStorage.setItem("_auth_user", data.token);
             this.setState({
                auth: data.token
             });   
            }.bind(this),
            error: function(xhr, status, err) {
                if(err.toString() === 'Unauthorized'){
                  render(<Alert bsStyle="danger" onDismiss={this.handleDismiss}> Invalid account ! please check your email and password</Alert>,document.getElementById('FormError'));
                } else {
                    render(<Alert bsStyle="danger" onDismiss={this.handleDismiss}> Somthing wrong ! try again.</Alert>,document.getElementById('FormError'));  
                }  
            }.bind(this)
        });  
  } 

  render(){
      if(this.state.auth) {
        return <Redirect to='/'  />
      }
      return(
        <div>
           <Grid fluid>
                <Row>
                    <Col xs={12} sm={12} md={12}>
                    <PageHeader>
                        LOGIN
                        <Tooltip placement="bottom" className="in" id="tooltip-bottom">
                              Exsting user login here.
                        </Tooltip>
                    </PageHeader>
                    </Col>
                </Row> 
                <form>
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
                    type="password"
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
                    <Button type="submit" bsSize="large" bsStyle="primary" onClick={e => this.onRiderLogin(e)}  block>LOGIN</Button>
                    </Col> 
                </Row>

                </form>
                </Grid>
        </div>
      )
  }
}
export default RiderLoginForm;