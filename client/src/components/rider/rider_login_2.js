import React, { Component } from 'react';
import  { Redirect } from 'react-router-dom'
import { render } from 'react-dom';
import { Grid, Message, Form, Button, Header, Image, Label, Input } from 'semantic-ui-react'
import $ from 'jquery';
import ApplyToRide from './apply_to_ride_2';

var validator = require('validator');

class RiderLoginForm extends Component {
  constructor(){
      super();
      this.state = {
          loginMobile: '',
          loginPassword: ''
      }
   }

   componentDidMount() {
     this.add_trafic('passenger');
   }
   
   add_trafic = (trafic_type) => {
    var data = {
        trafic_type : trafic_type, 
    };

    $.ajax({ 
        type:"POST",
        url:"/admin/add_trafic",
        data: JSON.stringify(data), 
        contentType: "application/json",
        success: function(data, textStatus, jqXHR) {
            console.log('trafic', data);
        }.bind(this),
        error: function(xhr, status, err) {
            console.error("erroorror", err.toString());
        }.bind(this)
    });  
   }
    validateRiderLogin = () => {
        let errors = [];
        
        if(this.state.loginMobile.length === 0 ){
            errors.push("ሞባይል ቁጥር ያስገቡ");
        } else if (validator.isNumeric(this.state.loginMobile, {no_symbols: true} ) === false) {
            errors.push("ትክክለኛ ሞባይል ቁጥር አይደለም !");
        } else if(validator.isMobilePhone(this.state.loginMobile) === false) {
            errors.push("ትክክለኛ ሞባይል ቁጥር አይደለም !");
        } else if (this.state.loginMobile.length < 10) {
            errors.push("የሞባይል ቁጥሩ 10 አሀዝ መሆን አለበት !");
        }else if (this.state.loginMobile.length > 10){
            errors.push("የሞባይል ቁጥሩ 10 አሀዝ መሆን አለበት !");
        }

        if(this.state.loginPassword.length === 0) {
            errors.push("የሚሲጢር ኮድ ያስገቡ !");
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
        $('.btn_login').addClass("loading");
        const err = this.validateRiderLogin();
        if(err.length > 0){
            $('.btn_login').removeClass("loading");
            let error_list = this.getErrorList(err);
            render(<Message negative >{error_list}</Message>,document.getElementById('FormError'));
        } else {
            $('.btn_login').removeClass("loading");
            var login = {
                mobile: this.state.loginMobile,
                password: this.state.loginPassword
            }
            this.riderLogin(login)
            
            this.setState({
                loginMobile: '',
                loginPassword: '',
                errors: []
            });
        }
    }

    riderLogin = (login) => {
        $('.btn_login').addClass("loading");
        $.ajax({ 
            type:"POST",
            url:"/user/login",
            data: JSON.stringify(login), 
            contentType: "application/json",
            success: function(user, textStatus, jqXHR) {
             $('.btn_login').removeClass("loading");
             localStorage.setItem("_auth_user", user.token);
             
             document.getElementById('div-notification-2').style.visibility = 'hidden';
             render('', document.getElementById('div-notification-2'));
             if(this.props.is_this_login) {
                document.getElementById('ride-price-dashboard').style.visibility = 'hidden';
                document.getElementById('user-info').style.visibility = 'visible'; 
             } else {
                document.getElementById('ride-price-dashboard').style.visibility = 'visible';
                document.getElementById('user-info').style.visibility = 'visible'; 
             }
             this.props.callBackFromLogin(user);
             this.setState({
                auth: user.token
             });   
            }.bind(this),
            error: function(xhr, status, err) {
                $('.btn_login').removeClass("loading");
                if(err.toString() === 'Unauthorized'){
                  render(<Message negative> ያስገቡት ስልክ ውይም የሚሲጢር ኮድ ትክክለኛ አይደለም ! አስተካክለው ይሞክሩ።</Message>,document.getElementById('FormError'));
                } else {
                    render(<Message negative> የኢንተርኔት ግንኙነት የለም ፡ እባኮትን እንደገና ይሞክሩ።</Message>,document.getElementById('FormError'));  
                }  
            }.bind(this)
        });  
  } 

  

  render(){
      return(
        <div>
           <div className="driverLoginBox">
           <Grid columns={1}>
                <Grid.Row centered>
                    
                    <Grid.Column mobile={18} tablet={18} computer={18}>
                    <Label color="green" pointing="below" size="large">
                    ከዚህ በፊት የተመዘገቡ መግብያ !</Label>
                    <Form>
                    <Input
                    name="loginMobile"
                    type="text"
                    label={{ icon: 'phone volume' }} 
                    labelPosition="left corner"
                    value={this.state.loginMobile}
                    placeholder="ስልክ ቁጥር mobile"
                    onChange={e => this.change(e)}
                    size="large"
                    fluid
                    />
                    </Form>
                    </Grid.Column>
                </Grid.Row>   
                <Grid.Row className="row_sm"> 
                    <Grid.Column mobile={18} tablet={18} computer={18}>
                    <Form>
                    <Input
                    name="loginPassword"
                    type="password"
                    label={{ icon: 'asterisk' }} 
                    labelPosition="left corner"
                    value={this.state.loginPassword}
                    placeholder="የሚስጢር ኮድ password"
                    onChange={e => this.change(e)}
                    size="large"
                    fluid
                    />
                    </Form>
                    </Grid.Column>
                </Grid.Row>
                
                <Grid.Row className="row_sm">
                    <Grid.Column mobile={18} tablet={18} computer={18}>
                    <Button className="btn_login"  content='ቀጥል' icon='right arrow' labelPosition='right' color='green' size='huge' onClick={e => this.onRiderLogin(e)}  fluid ></Button>
                    </Grid.Column> 
                </Grid.Row>

                <Grid.Row columns={1} className="row_sm">
                    <Grid.Column mobile={18} tablet={18} computer={18}>
                      <Button color="teal" content='አዲስ ተሳፋሪ' icon='right arrow' labelPosition='right' size="huge" onClick={(e) => this.props.show_apply_passenger(e)} fluid></Button>
                    </Grid.Column>
                </Grid.Row>

                <Grid.Row columns={1} className="row_sm">
                    <Grid.Column mobile={18} tablet={18} computer={18}>
                     <div id='FormError' className='FormError'></div>
                    </Grid.Column>
                </Grid.Row>

                </Grid>
                </div>
        </div>
      )
  }
}
export default RiderLoginForm;