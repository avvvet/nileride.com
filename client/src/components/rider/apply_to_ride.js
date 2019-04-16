import React , { Component } from 'react';
import { render } from 'react-dom';
import  { Redirect } from 'react-router-dom'
import { Grid,Message, Form, Button, Header, Label} from 'semantic-ui-react'
import $ from 'jquery';

var validator = require('validator');

const options = [
    { key: 'm', text: 'Male', value: 'male' },
    { key: 'f', text: 'Female', value: 'female' },
]

class ApplyToRide extends Component {
    constructor(){
        super();
        this.state = {
            firstName: '',
            middleName: '',
            email: '',
            mobile: '',
            password: '',
            gender: '',
            errors: [],
            auth: false,
            show_form : false
        }
    }

    validateRiderApply = () => {
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

    onRiderApply = (e) => {
        e.preventDefault();
        const err = this.validateRiderApply();
        if(err.length > 0){
            let error_list = this.getErrorList(err);
            render(<Message negative >{error_list}</Message>,document.getElementById('ApplyFormError'));
        } else {
            var rider = {
                firstName: this.state.firstName,
                middleName: this.state.middleName,
                email: this.state.email,
                mobile: this.state.mobile,
                password: this.state.password,
                gender: this.state.gender
            }
            this.riderApply(rider)
            this.setState({
                firstName: '',
                middleName: '',
                email: '',
                mobile: '',
                password: '',
                gender: '',
                errors: []
            });
        }
    }

    riderApply = (rider) => {
        $('.btn_apply').addClass("loading");
        $.ajax({ 
            type:"POST",
            url:"/user/apply",
            data: JSON.stringify(rider), 
            contentType: "application/json",
            success: function(data, textStatus, jqXHR) {
              $('.btn_apply').removeClass("loading");
              localStorage.setItem("_auth_user", data.token);
              this.setState({
                  auth: data.token
              });  
            }.bind(this),
            error: function(xhr, status, err) {
                $('.btn_apply').removeClass("loading");
                console.error(xhr, status, err.toString());
            }.bind(this)
        });  
    }

    _yes = (e) => {
        this.setState({
          show_form : true
        })
     }

    render(){
        if(this.state.auth) {
            return <Redirect to='/user'  />
        }
        
        return(
            <div>
             {this.state.show_form === false ? 
             <div>
                 <Label textAlign='center' color="red" pointing="below">አዲስ ተሳፋሪ ፡ እዚህ ይመዝገቡ !</Label>
                 <div className="driverLoginBox">
               <Grid  columns={1} centered  stackable>
                 <Grid.Row>
                     <Grid.Column mobile={18} tablet={18} computer={18}>
                         <Button color="teal" size="huge" onClick={(e) => this._yes(e)} fluid>አዲስ ተሳፋሪ ምዝገባ NEW PASSENGER</Button>
                     </Grid.Column>
                 </Grid.Row>
               </Grid>
             </div> 
             </div>
             
             :
                <div className="driverLoginBox">
                <Header as='h3' textAlign='center' color='grey'>አዲስ ተሳፋሪ ምዝገባ NEW PASSENGER</Header> 
                <Grid columns={1}>
                <Grid.Row>
                    <Grid.Column mobile={18} tablet={18} computer={18}>
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
                    <Grid.Column mobile={18} tablet={18} computer={18}>
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
                    <Grid.Column mobile={18} tablet={18} computer={18}>
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
                    <Grid.Column mobile={18} tablet={18} computer={18}>
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
                    <Grid.Column mobile={18} tablet={18} computer={18}>
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
                    <Grid.Column mobile={18} tablet={18} computer={18}>
                    <Form>
                      <Form.Select name='gender' fluid label='Gender' options={options} placeholder='Gender' onChange={this.onChangeGender}/>
                    </Form>
                    </Grid.Column>
                </Grid.Row>

                <Grid.Row>
                 <Grid.Column mobile={18} tablet={18} computer={18}>
                  <div id='ApplyFormError' className='ApplyFormError'></div>
                  </Grid.Column>
                </Grid.Row>
                
                <Grid.Row>
                    <Grid.Column mobile={18} tablet={18} computer={18}>
                    <Button className="btn_apply" color='teal' size='huge' onClick={e => this.onRiderApply(e)}  fluid >መዝገበኝ REGISTER</Button>
                    </Grid.Column> 
                </Grid.Row>

                </Grid>
                </div>  
             }
            </div>
        );
    }
}
export default ApplyToRide;