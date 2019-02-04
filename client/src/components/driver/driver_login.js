import React, { Component } from 'react';
import { Grid, Message, Form, Button, Header, Image } from 'semantic-ui-react'
import { render } from 'react-dom';
import  { Redirect } from 'react-router-dom'
import $ from 'jquery';

class DriverLoginForm extends Component {
  constructor(){
      super();
      this.state = {
          loginEmail: '',
          loginPassword: ''
      }
  }

    validateDriverLogin = () => {
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

    onDriverLogin = (e) => {
        e.preventDefault();
        const err = this.validateDriverLogin();
        if(err.length > 0){
            let error_list = this.getErrorList(err);
            render(
                <Message negative>
                    <Message.Header>There are some errors with your login</Message.Header>
                    <p>{error_list}</p>
                </Message>,
                document.getElementById('FormError')
            );
        } else {
            var login = {
                email: this.state.loginEmail,
                password: this.state.loginPassword
            }
            this.driverLogin(login)
            
            this.setState({
                loginEmail: '',
                loginPassword: '',
                errors: []
            });
        }
    }

  driverLogin = (login) => {
      console.log('test', login);
        $.ajax({ 
            type:"POST",
            url:"/driver/login",
            data: JSON.stringify(login), 
            contentType: "application/json",
            success: function(data, textStatus, jqXHR) {
            // localStorage.setItem("_auth_driver", data.token);
             sessionStorage.setItem("_auth_driver", data.token);
             this.setState({
                auth: data.token
             });   
            }.bind(this),
            error: function(xhr, status, err) {
                console.log('errrrr',err.toString());
                if(err.toString() === 'Unauthorized'){
                  render(<Message bsStyle="danger" onDismiss={this.handleDismiss}> Invalid account ! please check your email and password</Message>,document.getElementById('FormError'));
                } else {
                    render(<Message bsStyle="danger" onDismiss={this.handleDismiss}> Somthing wrong ! try again.</Message>,document.getElementById('FormError'));  
                }  
            }.bind(this)
        });  
  } 

  render(){
      if(this.state.auth) {
        return <Redirect to='/driver'  />
      }
      return(
        <div>
           <Header as='h3' textAlign='center' color='teal'>Driver Login</Header>
           <div className="driverLoginBox">
           <Grid container columns={1} centered  stackable>
                <Grid.Row columns={1}>
                    <Grid.Column mobile={12} tablet={12} computer={12}>
                        <Form>
                        <label>Email</label>
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

                    <Grid.Column mobile={12} tablet={12} computer={12}>
                        <Form>
                        <label>Password</label>
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

                <Grid.Row className="text-center">
                    <Grid.Column mobile={12} tablet={12} computer={12}>
                     <Button color='teal' size='large' onClick={e => this.onDriverLogin(e)}  fluid >LOGIN</Button>
                    </Grid.Column> 
                </Grid.Row>

                </Grid>
            </div>
        </div>
      )
  }
}
export default DriverLoginForm;