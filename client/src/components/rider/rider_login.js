import React, { Component } from 'react';
import  { Redirect } from 'react-router-dom'
import { render } from 'react-dom';
import { Grid, Message, Form, Button, Header, Image } from 'semantic-ui-react'
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
            render(<Message negative >{error_list}</Message>,document.getElementById('FormError'));
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
            success: function(user, textStatus, jqXHR) {
             console.log('this user login', user);
             sessionStorage.setItem("_auth_user", user.token);
             this.setState({
                auth: user.token
             });   
            }.bind(this),
            error: function(xhr, status, err) {
                if(err.toString() === 'Unauthorized'){
                  render(<Message negative> Invalid account ! please check your email and password</Message>,document.getElementById('FormError'));
                } else {
                    render(<Message negative> Somthing wrong ! try again.</Message>,document.getElementById('FormError'));  
                }  
            }.bind(this)
        });  
  } 

  render(){
      if(this.state.auth) {
        return <Redirect to='/user'  />
      }
      return(
        <div>
           <Header as='h3' textAlign='center' color='teal'>PASSENGER LOGIN</Header>
           <div className="driverLoginBox">
           <Grid columns={1}>
                
                <Grid.Row>
                    <Grid.Column mobile={18} tablet={18} computer={18}>
                    <Form>
                    <input
                    name="loginEmail"
                    type="text"
                    value={this.state.loginEmail}
                    placeholder="Email Address"
                    onChange={e => this.change(e)}
                    >
                    </input>
                    </Form>
                    </Grid.Column>
                </Grid.Row>   
                <Grid.Row> 
                    <Grid.Column mobile={18} tablet={18} computer={18}>
                    <Form>
                    <input
                    name="loginPassword"
                    type="password"
                    value={this.state.loginPassword}
                    placeholder="Password"
                    onChange={e => this.change(e)}
                    >
                    </input>
                    </Form>
                    </Grid.Column>
                </Grid.Row>

                <Grid.Row>
                    <Grid.Column mobile={18} tablet={18} computer={18}>
                    <Button color='green' size='huge' onClick={e => this.onRiderLogin(e)}  fluid >LOGIN</Button>
                    </Grid.Column> 
                </Grid.Row>
                </Grid>
                </div>
        </div>
      )
  }
}
export default RiderLoginForm;