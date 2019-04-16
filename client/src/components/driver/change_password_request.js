import React, { Component } from 'react';
import { Grid, Message, Form, Button, Input} from 'semantic-ui-react'
import { render } from 'react-dom';
import $ from 'jquery';
import DriverChangePasswordVarify from './change_password_varify';
var validator = require('validator');

class DriverChangePasswordRequest extends Component {
    constructor(){
      super();
      this.state = {
          mobile_2 : ''
      }
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

    on_password_change_request = (e) => {
        e.preventDefault();
        $('.btn_next').addClass("loading");
        const err = this.validateMobile();
        if(err.length > 0){
            $('.btn_next').removeClass("loading");
            let error_list = this.getErrorList(err);
            render(<Message negative >{error_list}</Message>,document.getElementById('div-rply'));
        } else {
            $('.btn_next').removeClass("loading");
            var data = {
                mobile: this.state.mobile_2,
            }
            this._send_varification(data);
        }
    }

    _send_varification = (data) => {
        $('.btn_next').addClass("loading");
         $.ajax({ 
             type:"POST",
             url:"/driver/change_password_request",
             data: JSON.stringify(data), 
             contentType: "application/json",
             success: function(data, textStatus, jqXHR) {
              $('.btn_next').removeClass("loading");
              if(data.rply === 1){
                localStorage.setItem("_change_password_mobile", this.state.mobile_2);
                render(<DriverChangePasswordVarify></DriverChangePasswordVarify>,document.getElementById('div-change-pass'));
                this.setState({
                    mobile_2: '',
                    errors: []
                });
              } else {
                render(<Message negative > ያስገቡት ሞባይል ቁጥር ምዝገባ ላይ የለም ! እባኮትን እንደገና በትክክል ይሞክሩ ። </Message>,document.getElementById('div-rply')); 
              }
             }.bind(this),
             error: function(xhr, status, err) {
                 $('.btn_next').removeClass("loading");
                 render(<Message negative > እንደገና ይሞክሩ ! </Message>,document.getElementById('div-rply')); 
                 this.setState({
                    mobile_2: '',
                    errors: []
                }); 
             }.bind(this)
         });  
     } 

   //I WORSHIP YOU LORD - HELP ME TO WORSHIP YOU THE WAY YOU LOVE IT 
  render(){
      return(
        <div>
         <Grid columns={1}>
             <Grid.Row columns={1}>
                    <Grid.Column mobile={18} tablet={18} computer={18}>
                        <Form>
                        <Input
                        name='mobile_2'
                        type='text'
                        label={{ icon: 'phone volume' }} 
                        labelPosition="left corner"
                        value={this.state.mobile_2}
                        placeholder='ስልክ ቁጥር'
                        onChange={e => this.change(e)}
                        size='huge'
                        fluid
                        />
                        </Form>
                    </Grid.Column>
             </Grid.Row>
             <Grid.Row>
                    <Grid.Column mobile={18} tablet={18} computer={18}>
                     <Button className="btn_next" content='ቀጥል' icon='right arrow' labelPosition='right' size='huge' onClick={e => this.on_password_change_request(e)}  fluid />
                    </Grid.Column> 
             </Grid.Row>
             <Grid.Row>
                    <Grid.Column mobile={18} tablet={18} computer={18}>
                    <div id='div-rply' className='div-rply'>
                    </div>
                    </Grid.Column> 
             </Grid.Row>
          </Grid>
        </div>
      )
  }
}
export default DriverChangePasswordRequest;