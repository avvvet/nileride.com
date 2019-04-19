import React , { Component } from 'react';
import { render } from 'react-dom';
import  { Redirect } from 'react-router-dom'
import { Grid,Message, Form, Button, Header, Label, Input} from 'semantic-ui-react'
import $ from 'jquery';

var validator = require('validator');

const options = [
    { key: 'm', text: 'ወንድ', value: 'male' },
    { key: 'f', text: 'ሴት', value: 'female' },
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
            errors.push("ስም አላስገቡም !");
        }else if(this.state.firstName.length <  2) {
            errors.push("ትክክለኛ ስም ያስገቡ !");
        }else if(validator.isAlpha(this.state.firstName) === false) {
            errors.push("ስም የኢንግሊዘኛ ፊደል ብቻ ነው የሚቻለው !");
        }

        if(this.state.middleName.length === 0) {
            errors.push("የአባት ስም ያስገቡ !");
        } else if(this.state.middleName.length < 2) {
          errors.push("ትክክለኛ ስም ያስገቡ !");
        } else if(validator.isAlpha(this.state.middleName) === false) {
            errors.push("የአባት ስም የኢንግሊዘኛ ፊደል ብቻ ነው የሚቻለው !");
        }
    
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

        if(this.state.gender.length === 0){
            errors.push("ጾታ ከዝርዝሩ  ይምረጡ !");
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
                mobile: this.state.mobile,
                password: this.state.password,
                gender: this.state.gender,
                profile : 'nileride-profile.png',
                hasProfile : false
            }
            this.riderApply(rider)
            this.setState({
                firstName: '',
                middleName: '',
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
              this.props.callBackFromLogin(data);
              
              if(this.props.is_this_login) {
                document.getElementById('ride-price-dashboard').style.visibility = 'hidden';
              } else {
                document.getElementById('ride-price-dashboard').style.visibility = 'visible';
              }
              
              document.getElementById('user-info').style.visibility = 'visible';
              document.getElementById('div-notification-2').style.visibility = 'hidden';
              render('', document.getElementById('div-notification-2'));

              $('.btn_apply').removeClass("loading");
              localStorage.setItem("_auth_user", data.token);
              this.setState({
                  auth: data.token
              });  
            }.bind(this),
            error: function(xhr, status, err) {
                $('.btn_apply').removeClass("loading");
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
           
          }
        return(
            <div>
                <div className="driverLoginBox">
                <Grid columns={1}>
                <Grid.Row centered className="row_sr">
                    <Grid.Column mobile={18} tablet={18} computer={18}>
                    <Label color="teal" pointing="below">አዲስ ተሳፋሪ አጭር ምዝገባ</Label>
                    <Form>
                    <Input
                    label={{ icon: 'user', color:'teal' }} 
                    labelPosition="left corner"
                    name="firstName"
                    type="text"
                    value={this.state.firstName}
                    placeholder="የእርሶ ስም"
                    onChange={e => this.change(e)}
                    fluid
                    />
                    </Form>
                    </Grid.Column>
                </Grid.Row>   

                <Grid.Row className="row_sr"> 
                    <Grid.Column mobile={18} tablet={18} computer={18}>
                    <Form>
                    <Input
                    name="middleName"
                    type="text"
                    value={this.state.middleName}
                    placeholder="የአባት ስም"
                    onChange={e => this.change(e)}
                    fluid
                    />
                    </Form>
                    </Grid.Column>
                </Grid.Row>

                <Grid.Row className="row_sr">      
                    <Grid.Column mobile={18} tablet={18} computer={18}>
                    <Form>
                    <Input
                    label={{ icon: 'phone volume', color:'teal' }} 
                    labelPosition="left corner"
                    name="mobile"
                    type="text"
                    value={this.state.mobile}
                    placeholder="ሞባይል ቁጥር 10 አሀዝ"
                    onChange={e => this.change(e)}
                    fluid
                    />
                    </Form>
                    </Grid.Column>
                </Grid.Row>

                <Grid.Row className="row_sr">
                    <Grid.Column mobile={18} tablet={18} computer={18}>
                    <Form>
                    <Input
                    label={{ icon: 'asterisk', color:'teal' }} 
                    labelPosition="left corner"
                    name="password"
                    type="password"
                    value={this.state.password}
                    placeholder="የሚስጢር ኮድ (እንዳይረሱት)"
                    onChange={e => this.change(e)}
                    fluid
                    />
                    </Form>
                    </Grid.Column>
                </Grid.Row>   

                 <Grid.Row className="row_sr">
                    <Grid.Column mobile={18} tablet={18} computer={18}>
                    <Form>
                      <Form.Select name='gender' fluid options={options}  placeholder='ጾታ' onChange={this.onChangeGender} />
                    </Form>
                    </Grid.Column>
                </Grid.Row>

                <Grid.Row className="row_sr">
                 <Grid.Column mobile={18} tablet={18} computer={18}>
                  <div id='ApplyFormError' className='ApplyFormError'></div>
                  </Grid.Column>
                </Grid.Row>
                
                <Grid.Row className="row_xs">
                    <Grid.Column mobile={18} tablet={18} computer={18}>
                    <Button className="btn_apply"  content='መዝግበኝ ቀጥል' icon='right arrow' labelPosition='right'  color='teal' size='huge' onClick={e => this.onRiderApply(e)}  fluid ></Button>
                    </Grid.Column> 
                </Grid.Row>

                </Grid>
                </div>  
            </div>
        );
    }
}
export default ApplyToRide;