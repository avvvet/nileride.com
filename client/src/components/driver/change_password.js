import React, { Component } from 'react';
import { Grid, Message, Form, Button, Input} from 'semantic-ui-react'
import { render } from 'react-dom';
import $ from 'jquery';
import DriverChangePasswordVarify from './change_password_varify';
var validator = require('validator');

class DriverChangePassword extends Component {
    constructor(){
      super();
      this.state = {
          password_2 : ''
      }
    }

    validateMobile = () => {
        let errors = [];
        
        if(this.state.password_2.length === 0 ){
            errors.push("የሚሲጢር ኮድ ያስገቡ !");
        }
        else if(validator.isLength(this.state.password_2, {min: 6}) === false){
            errors.push("የሚስጢር ኮድ ክ 6 አሀዝ ማነስ አይችልም !");
        }else if(validator.isLength(this.state.password_2, {max: 15}) === false){
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

    on_password_change = (e) => {
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
                mobile : localStorage.getItem("_change_password_mobile"),
                password : this.state.password_2,
                varification_code : localStorage.getItem("_change_password_varificationCode")
            }
            this._change_password(data);
        }
    }

    _change_password = (data) => {
        $('.btn_next').addClass("loading");
         $.ajax({ 
             type:"POST",
             url:"/driver/change_password",
             data: JSON.stringify(data), 
             contentType: "application/json",
             success: function(data, textStatus, jqXHR) {
                if(data.rply === 1){
                    render(<Message positive > የሚሲጢር ኮድ ተቀይርዋል። እባኮትን የሞባይል ቁጥር እና አዲሱን የሚሲጢር ኮድ ያስገቡ ፡ አስገባኝ ይጫኑ።</Message>,document.getElementById('div-change-pass'));
                    localStorage.removeItem("_change_password_varificationCode");
                    localStorage.removeItem("_change_password_mobile"); 
                }
                this.setState({
                    mobile: '',
                    password : '',
                    varification_code : '',
                    errors: []
                }); 
             }.bind(this),
             error: function(xhr, status, err) {
                 $('.btn_next').removeClass("loading");
                 render(<Message negative > የሚሲጢር ኮድ መቀየር አልተሳካም ፡ እንደገና ይሞክሩ ።</Message>,document.getElementById('div-change-pass'));
                 localStorage.removeItem("_change_password_varificationCode");
                 localStorage.removeItem("_change_password_mobile");
                 this.setState({
                    mobile: '',
                    password : '',
                    varification_code : '',
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
                        name="password_2"
                        type="password"
                        label={{ icon: 'asterisk', color : 'orange' }} 
                        labelPosition="left corner"
                        value={this.state.password_2}
                        placeholder="አዲስ የሚስጢር ኮድ ያስገቡ"
                        onChange={e => this.change(e)}
                        size="huge"
                        fluid
                        />
                        </Form>
                    </Grid.Column>
             </Grid.Row>
             <Grid.Row>
                    <Grid.Column mobile={18} tablet={18} computer={18}>
                     <Button className="btn_next" content='ቀይር' icon='right arrow' color="orange" labelPosition='right' size='huge' onClick={e => this.on_password_change(e)}  fluid />
                    </Grid.Column> 
             </Grid.Row>
             <Grid.Row>
                    <Grid.Column mobile={18} tablet={18} computer={18}>
                    <div id='div-rply' className='div-rply'>
                    <Message positive >
                     አሁን ፡ አዲስ የሚቀይሩትን የሚሲጢር ኮድ ያስገቡ ። እንዳይረሱት !
                    </Message>
                    </div>
                    </Grid.Column> 
             </Grid.Row>
          </Grid>
        </div>
      )
  }
}
export default DriverChangePassword;