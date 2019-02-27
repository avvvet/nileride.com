import React, { Component } from 'react';
import { Grid, Message, Form, Button, Header, Label } from 'semantic-ui-react'
import { render } from 'react-dom';
import  { Redirect } from 'react-router-dom'
import $ from 'jquery';
var validator = require('validator');

class DriverLoginForm extends Component {
  constructor(){
      super();
      this.state = {
          mobile: '',
          password: ''
      }
  }

    validateDriverLogin = () => {
        let errors = [];
        
        if(this.state.mobile.length === 0 ){
            errors.push("ሞባይል ቁጥር ያስገቡ");
        }
        else if (validator.isNumeric(this.state.mobile, {no_symbols: true} ) === false) {
            errors.push("ትክክለኛ ሞባይል ቁጥር አይደለም !");
        }
        else if(validator.isMobilePhone(this.state.mobile) === false) {
             errors.push("ትክክለኛ ሞባይል ቁጥር አይደለም !");
        } else if (this.state.mobile.length < 10){
            errors.push("የሞባይል ቁጥሩ 10 አሀዝ መሆን አለበት !");
        }else if (this.state.mobile.length > 10){
            errors.push("የሞባይል ቁጥሩ 10 አሀዝ መሆን አለበት !");
        }

        if(this.state.password.length === 0 ){
            errors.push("የሚሲጢር ኮድ ያስገቡ !");
        }
        else if(validator.isLength(this.state.password, {min: 6}) === false){
            errors.push("የሚስጢር ኮድ ክ 6 አሀዝ ማነስ አይችልም !");
        }else if(validator.isLength(this.state.password, {max: 15}) === false){
            errors.push("የሚስጢር ኮድ በጣም ረዘመ !");
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
        $('.btn_login').addClass("loading");
        const err = this.validateDriverLogin();
        if(err.length > 0){
            $('.btn_login').removeClass("loading");
            let error_list = this.getErrorList(err);
            render(<Message negative >{error_list}</Message>,document.getElementById('FormError'));
        } else {
            $('.btn_login').removeClass("loading");
            var login = {
                mobile: this.state.mobile,
                password: this.state.password
            }
            this.driverLogin(login)
            
            this.setState({
                mobile: '',
                password: '',
                errors: []
            });
        }
    }

  driverLogin = (login) => {
       $('.btn_login').addClass("loading");
        $.ajax({ 
            type:"POST",
            url:"/driver/login",
            data: JSON.stringify(login), 
            contentType: "application/json",
            success: function(data, textStatus, jqXHR) {
             $('.btn_login').removeClass("loading");
             sessionStorage.setItem("_auth_driver", data.token);
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
        return <Redirect to='/driver'  />
      }
      return(
        <div>
           <Header as='h3' textAlign='center' color='teal'>የሹፊር መግብያ</Header>
           <Label textAlign='center' color="green" pointing="below">የስልክ ቁጥሮን እና የሚስጢር ኮዶን ያስገቡ !</Label>
           <div className="driverLoginBox">
           <Grid columns={1}>
                <Grid.Row columns={1}>
                    <Grid.Column mobile={18} tablet={18} computer={18}>
                        <Form>
                        <input
                        name="mobile"
                        type="text"
                        value={this.state.mobile}
                        placeholder="ስልክ ቁጥር mobile"
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
                        name="password"
                        type="password"
                        value={this.state.password}
                        placeholder="የሚስጢር ኮድ password"
                        onChange={e => this.change(e)}
                        >
                        </input>
                        </Form>
                    </Grid.Column>
                </Grid.Row>

                <Grid.Row>
                    <Grid.Column mobile={18} tablet={18} computer={18}>
                     <Button className="btn_login" color='teal' size='huge' onClick={e => this.onDriverLogin(e)}  fluid >አስገባኝ</Button>
                    </Grid.Column> 
                </Grid.Row>

                </Grid>
            </div>
        </div>
      )
  }
}
export default DriverLoginForm;