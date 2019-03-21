import React, { Component } from 'react';
import { Grid, Message, Form, Button, Header, Label , Input} from 'semantic-ui-react'
import { render } from 'react-dom';
import  { Redirect } from 'react-router-dom'
import DriverChangePassword from './change_password';
import $ from 'jquery';
import DriverChangePasswordRequest from './change_password_request';
var validator = require('validator');

class DriverLoginForm extends Component {
    constructor(){
      super();
      this.state = {
          mobile: '',
          password: '',
          mobile_2 : ''
      }
    }

    componentDidMount() {
        this.add_trafic('driver')
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

    validateMobile = () => {
        let errors = [];
        
        if(this.state.mobile_2.length === 0 ){
            errors.push("ሞባይል ቁጥር ያስገቡ");
        }
        else if (validator.isNumeric(this.state.mobile_2, {no_symbols: true} ) === false) {
            errors.push("ትክክለኛ ሞባይል ቁጥር አይደለም !");
        }
        else if(validator.isMobilePhone(this.state.mobile_2) === false) {
             errors.push("ትክክለኛ ሞባይል ቁጥር አይደለም !");
        } else if (this.state.mobile_2.length < 10){
            errors.push("የሞባይል ቁጥሩ 10 አሀዝ መሆን አለበት !");
        }else if (this.state.mobile_2.length > 10){
            errors.push("የሞባይል ቁጥሩ 10 አሀዝ መሆን አለበት !");
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
                  render(<Message negative > ትክክል አይደለም ። እባኮትን የሞባይል ቁጥሩን እና የሚሲጢር ኮድ ትክክል መሆኑን ያረጋግጡ።</Message>,document.getElementById('FormError'));
                } else {
                    render(<Message negative > ኢንተርኒት ግንኙነት የለመ ። እንደገና ይሞክሩ ። </Message>,document.getElementById('FormError'));  
                }  
            }.bind(this)
        });  
    } 

    on_password_change_request = (e) => {
        e.preventDefault();
        $('.btn_next').addClass("loading");
        const err = this.validateMobile();
        if(err.length > 0){
            $('.btn_next').removeClass("loading");
            let error_list = this.getErrorList(err);
            render(<Message negative >{error_list}</Message>,document.getElementById('FormError'));
        } else {
            $('.btn_next').removeClass("loading");
            var data = {
                mobile_2: this.state.mobile_2,
            }
            this._send_varification(data)
            this.setState({
                mobile_2: '',
                errors: []
            });
        }
    }

    _send_varification = (data) => {
        $('.btn_next').addClass("loading");
         $.ajax({ 
             type:"POST",
             url:"/driver/change_password",
             data: JSON.stringify(data), 
             contentType: "application/json",
             success: function(data, textStatus, jqXHR) {
              
             }.bind(this),
             error: function(xhr, status, err) {
                 $('.btn_next').removeClass("loading");
                 if(err.toString() === 'Unauthorized'){
                   render(<Message negative > Invalid account ! please check your email and password</Message>,document.getElementById('FormError'));
                 } else {
                     render(<Message negative > Somthing wrong ! try again.</Message>,document.getElementById('FormError'));  
                 }  
             }.bind(this)
         });  
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
   //I WORSHIP YOU LORD - HELP ME TO WORSHIP YOU THE WAY YOU LOVE IT 

   _show_change_pass = (e) => {
    render(<DriverChangePasswordRequest></DriverChangePasswordRequest>,document.getElementById('div-change-pass'));
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
                        <Input
                        name="mobile"
                        type="text"
                        label={{ icon: 'phone volume' }} 
                        labelPosition="left corner"
                        value={this.state.mobile}
                        placeholder="ስልክ ቁጥር mobile"
                        onChange={e => this.change(e)}
                        size="huge"
                        fluid
                        />
                        
                        </Form>
                    </Grid.Column>
                </Grid.Row>
                <Grid.Row>
                    <Grid.Column mobile={18} tablet={18} computer={18}>
                        <Form>
                        <Input
                        name="password"
                        type="password"
                        label={{ icon: 'asterisk' }} 
                        labelPosition="left corner"
                        value={this.state.password}
                        placeholder="የሚስጢር ኮድ password"
                        onChange={e => this.change(e)}
                        size="huge"
                        fluid
                        />
                        
                        </Form>
                    </Grid.Column>
                </Grid.Row>

                <Grid.Row>
                    <Grid.Column mobile={18} tablet={18} computer={18}>
                     <Button className="btn_login" color='teal' size='huge' onClick={e => this.onDriverLogin(e)}  fluid >አስገባኝ</Button>
                    </Grid.Column> 
                </Grid.Row>
                
                <Grid.Row>
                    <Grid.Column mobile={18} tablet={18} computer={18}>
                     <div className="div-change-pass" id="div-change-pass">
                     <Label size="medium" as="a"  onClick={(e) => this._show_change_pass(e)} textAlign='center' >
                      የሚስጢር ኮድ ቀይር 
                     </Label>
                     </div>
                    </Grid.Column> 
                </Grid.Row>

                </Grid>
            </div>
        </div>
      )
  }
}
export default DriverLoginForm;