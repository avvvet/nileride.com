import React, { Component } from 'react';
import { Grid, Message, Form, Button, Input} from 'semantic-ui-react'
import { render } from 'react-dom';
import $ from 'jquery';
import UserChangePassword from './change_password';
var validator = require('validator');

class ChangePasswordVarify extends Component {
    constructor(){
      super();
      this.state = {
        varificationCode : ''
      }
    }

    validateVarification = () => {
        let errors = [];
        
        if(this.state.varificationCode.length === 0) {
            errors.push("የተላከውን ቁጥር አላስገቡም !");
        } else if (validator.isLength(this.state.varificationCode, {min: 5}) === false){
            errors.push("ቁጥሩ 5 አሀዝ ቁጥር መሆን አለበት !");
        }else if(validator.isLength(this.state.varificationCode, {max: 5}) === false){
            errors.push("ቁጥሩ 5 አሀዝ ቁጥር መሆን አለበት !");
        } else if (validator.isNumeric(this.state.varificationCode, {no_symbols: true} ) === false) {
            errors.push("ትክክለኛ ቁጥር አላስገቡም !");
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

    onVarify = (e) => {
        e.preventDefault();
        const err = this.validateVarification();
        if(err.length > 0){
            let error_list = this.getErrorList(err);
            render(<Message negative>{error_list}</Message>,document.getElementById('div-rply'));
        } else {
            var data = {
                varification_code : this.state.varificationCode
            }
            this.varify(data)
        }
    }

    varify = (data) => {
        $('.btn_mobile_varify').addClass("loading");
        $.ajax({ 
            type:"POST",
            url:"/change_password_verification",
            headers: { 'x-auth': localStorage.getItem("_change_password_mobile")},
            data: JSON.stringify(data), 
            contentType: "application/json",
            success: function(data, textStatus, jqXHR) {
               $('.btn_mobile_varify').removeClass("loading");
               if(data.rply === 1){
                localStorage.setItem("_change_password_varificationCode", this.state.varificationCode);
                render(<UserChangePassword></UserChangePassword>,document.getElementById('div-change-pass'));
               } 
               this.setState({
                varificationCode : '',
                errors: []
               });
            }.bind(this),
            error: function(xhr, status, err) {
                $('.btn_mobile_varify').removeClass("loading");
                render(<Message negative>ትክክለኛ ቁጥሩ አላስገቡም !</Message>,document.getElementById('div-rply'));
                console.error(xhr, status, err.toString());
                this.setState({
                    varificationCode : '',
                    errors: []
                });
            }.bind(this)
        });  
    }


  //I WORSHIP YOU LORD - ፍቅሩን ሳስብ ይገርመኛል ፡ ምህረቱ በዘ በእኔ በሀጥያተኛው ።
  render(){
      return(
        <div>
            <Grid columns={1}>
             <Grid.Row columns={1}>
                    <Grid.Column mobile={18} tablet={18} computer={18}>
                        <Form>
                        <Input
                        name='varificationCode'
                        type='text'
                        label={{ icon: 'mail', color: 'blue' }} 
                        labelPosition="left corner"
                        value={this.state.varificationCode}
                        placeholder='5 አሀዝ ቁጥር'
                        onChange={e => this.change(e)}
                        size='huge'
                        fluid
                        />
                        </Form>
                    </Grid.Column>
             </Grid.Row>
             <Grid.Row>
                    <Grid.Column mobile={18} tablet={18} computer={18}>
                     <Button className="btn_mobile_varify" content='አረጋግጥ' icon='right arrow' color="green" labelPosition='right' size='huge' onClick={(e) => this.onVarify(e)}  fluid />
                    </Grid.Column> 
             </Grid.Row>
             <Grid.Row>
                    <Grid.Column mobile={18} tablet={18} computer={18}>
                    <div id='div-rply' className='div-rply'>
                    <Message positive >
                    ይጠብቁ ፡ አጭር የጽሁፍ መልዕክት ወደ ተመዘገበው ስልክ ልከናል ፡ 
                    እባኮትን የተላከውን ቁጥር ያስገቡ እና አረጋግጥ ይጫኑ።
                    </Message>
                    </div>
                    </Grid.Column> 
             </Grid.Row>
          </Grid>  
        </div>
      )
  }
}
export default ChangePasswordVarify;