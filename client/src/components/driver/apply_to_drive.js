import React , { Component } from 'react';
import { render } from 'react-dom';
import  { Redirect } from 'react-router-dom'
import { Grid, Message, Form, Header, Button, Image } from 'semantic-ui-react'
import $ from 'jquery';

var validator = require('validator');

const options = [
    { key: 'm', text: 'Male', value: 'male' },
    { key: 'f', text: 'Female', value: 'female' },
]

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

    onChangeGender = (event, data) => {
        this.setState({
            gender : data.value
        });
    }

    onDriverApply = (e) => {
        e.preventDefault();
        const err = this.validateDriverApply();
        if(err.length > 0){
            let error_list = this.getErrorList(err);
            render(<Message bsStyle="danger" >{error_list}</Message>,document.getElementById('FormError'));
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
              //localStorage.setItem("_auth_driver", data.token);
              sessionStorage.setItem("_auth_driver", data.token);
              this.setState({
                  auth: data.token
              })  
              
              console.log('token', data.token);
              //render(<Message bsStyle="success" onDismiss={this.handleDismiss}><h4>{data.firstName}, You have successfully applied to drive. </h4> <br /> Please check your email to activate your driving account. <br /> after checking your email , login to your account using your email address, <h6>{data.email}</h6></Message>,document.getElementById('FormError'));
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
             <Header as='h3' textAlign='center' color='teal'>New Driver Registration</Header>
             <div className="driverLoginBox">
                <Grid container columns={1} centered  stackable>
                
                <Grid.Row>
                    <Grid.Column mobile={12} tablet={12} computer={12}>
                    <Form>
                    <label>First Name</label>
                    <input
                    name="firstName"
                    type="text"
                    value={this.state.firstName}
                    placeholder="First Name"
                    onChange={e => this.change(e)}
                    >
                    </input>
                    </Form>
                    </Grid.Column>
                </Grid.Row>  

                <Grid.Row>
                    <Grid.Column mobile={12} tablet={12} computer={12}>
                    <Form>
                    <label>Father Name</label>
                    <input
                    name="middleName"
                    type="text"
                    value={this.state.middleName}
                    placeholder="Father Name"
                    onChange={e => this.change(e)}
                    >
                    </input>
                    </Form>
                    </Grid.Column>
                </Grid.Row>

                <Grid.Row>
                    <Grid.Column mobile={12} tablet={12} computer={12}>
                    <Form>
                    <label>Email</label>
                    <input
                    name="email"
                    type="text"
                    value={this.state.email}
                    placeholder="email address"
                    onChange={e => this.change(e)}
                    >
                    </input>
                    </Form>
                   </Grid.Column>
                </Grid.Row> 

                <Grid.Row>
                    <Grid.Column mobile={12} tablet={12} computer={12}>
                    <Form>
                    <label>Mobile</label>
                    <input
                    name="mobile"
                    type="text"
                    value={this.state.mobile}
                    placeholder="Mobile number"
                    onChange={e => this.change(e)}
                    >
                    </input>
                    </Form>
                    </Grid.Column>
                </Grid.Row>

                <Grid.Row>
                    <Grid.Column mobile={12} tablet={12} computer={12}>
                    <Form>
                    <label>Password</label>
                    <input
                    name="password"
                    type="password"
                    value={this.state.password}
                    placeholder="Password"
                    onChange={e => this.change(e)}
                    >
                    </input>
                    </Form>
                    </Grid.Column>
                </Grid.Row>

                <Grid.Row>
                    <Grid.Column mobile={12} tablet={12} computer={12}>
                    <Form>
                      <Form.Select name='gender' fluid label='Gender' options={options} placeholder='Gender' onChange={this.onChangeGender}/>
                    </Form>
                    </Grid.Column>
                </Grid.Row>

                <Grid.Row className="text-center">
                    <Grid.Column mobile={12} tablet={12} computer={12}>
                    <Button color='teal' size='large' onClick={e => this.onDriverApply(e)}  fluid >APPLY TO DRIVE</Button>
                    </Grid.Column> 
                </Grid.Row>
                </Grid>
              </div>  
            </div>
        );
    }
}
export default ApplyToDrive;