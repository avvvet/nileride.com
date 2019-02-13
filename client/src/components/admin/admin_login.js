import React, { Component } from 'react';
import { Grid, Message, Form, Button, Header, Image } from 'semantic-ui-react'
import { render } from 'react-dom';
import  { Redirect } from 'react-router-dom'
import $ from 'jquery';

class AdminLogin extends Component {
  constructor(){
      super();
      this.state = {
          loginEmail: '',
          loginPassword: ''
      }
  }

    validateAdminLogin = () => {
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

    onAdminLogin = (e) => {
        e.preventDefault();
        $('.btn_login').addClass("loading");
        const err = this.validateAdminLogin();
        if(err.length > 0){
            $('.btn_login').removeClass("loading");
            let error_list = this.getErrorList(err);
            render(<Message negative >{error_list}</Message>,document.getElementById('FormError'));
        } else {
            $('.btn_login').removeClass("loading");
            var login = {
                email: this.state.loginEmail,
                password: this.state.loginPassword
            }
            this.adminLogin(login)
            
            this.setState({
                loginEmail: '',
                loginPassword: '',
                errors: []
            });
        }
    }

  adminLogin = (login) => {
       $('.btn_login').addClass("loading");
        $.ajax({ 
            type:"POST",
            url:"/admin/login",
            data: JSON.stringify(login), 
            contentType: "application/json",
            success: function(data, textStatus, jqXHR) {
                console.log('data', data);
             $('.btn_login').removeClass("loading");
             sessionStorage.setItem("_auth_admin", data.token);
             this.setState({
                auth: data.token
             });   
            }.bind(this),
            error: function(xhr, status, err) {
                $('.btn_login').removeClass("loading");
                if(err.toString() === 'Unauthorized'){
                  render(<Message negative > Invalid account ! please check your email and password</Message>,document.getElementById('FormError'));
                } else {
                    render(<Message negative > Somthing wrong ! try again.</Message>,document.getElementById('FormError'));  
                }  
            }.bind(this)
        });  
  } 

  render(){
    if(this.state.auth) {
        return <Redirect to='/admin/control_panel'  />
      }
      return(
        <div>
           <Grid container columns={1} centered>
            <Grid.Row columns={1}>
              <Grid.Column mobile={18} tablet={18} computer={18}>
                <div id='FormError' className='FormError'></div>
              </Grid.Column>
            </Grid.Row>

            <Grid.Row>
              <Grid.Column mobile={18} tablet={18} computer={18}>
                <Header as='h3' textAlign='center' color='teal'>ADMIN LOGIN</Header>
                <div className="driverLoginBox">
                <Grid container columns={1} centered>
                <Grid.Row columns={1}>
                <Grid.Column mobile={18} tablet={18} computer={18}>
                    <Form>
                    <input
                    name="loginEmail"
                    type="text"
                    value={this.state.loginEmail}
                    placeholder="Email Address"
                    onChange={e => this.change(e)}
                    size="huge"
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
                    <Button className="btn_login" color='teal' size='huge' onClick={e => this.onAdminLogin(e)}  fluid >LOGIN</Button>
                </Grid.Column> 
                </Grid.Row>

                </Grid>
                </div>
              </Grid.Column>
            </Grid.Row>
              
            <Grid.Row>
              <Grid.Column mobile={18} tablet={18} computer={18}>
                  
              </Grid.Column>
            </Grid.Row>
          </Grid>
        </div>
      )
  }
}
export default AdminLogin;