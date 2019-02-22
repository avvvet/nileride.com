import React , { Component } from 'react';
import { render } from 'react-dom';
import  { Redirect } from 'react-router-dom'
import { Grid, Message, Form, Header, Button, Label } from 'semantic-ui-react'
import $ from 'jquery';

var validator = require('validator');

const options = [
    { key: 'm', text: 'ወንድ', value: 'male' },
    { key: 'f', text: 'ሴት', value: 'female' },
]

class ApplyToDrive extends Component {
    constructor(){
        super();
        this.state = {
            firstName: '',
            middleName: '',
            email: '',
            mobile: '',
            password: '',
            re_password: '',
            gender: '',
            plateNo: '',
            errors: [],
            auth: false,
            show_form : false
        }
    }

    validateDriverApply = () => {
        let errors = [];
        
        if(this.state.firstName.length === 0) {
            errors.push("ስም አላስገቡም !");
        }else if(this.state.firstName.length <  2) {
            errors.push("ትክክለኛ ስም ያስገቡ !");
        }
        else if(validator.isAlpha(this.state.firstName) === false) {
            errors.push("ስም የኢንግሊዘኛ ፊደል ብቻ ነው የሚቻለው !");
        }

        if(this.state.middleName.length === 0) {
            errors.push("የአባት ስም ያስገቡ !");
        } else if(this.state.middleName.length < 2) {
          errors.push("የአባት ስም ትክክል ያስገቡ !");
        } else if(validator.isAlpha(this.state.middleName) === false) {
            errors.push("የአባት ስም የኢንግሊዘኛ ፊደል ብቻ ነው የሚቻለው !");
        }
    
        if(validator.isEmail(this.state.email)===false) {
          errors.push("የ ኢሜል አድራሻ ልክ አይደለም !");
        }else if(this.state.email.length === 0) {
            errors.push("የሞባይል ቁጥር ልክ አይደለም !");
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
            errors.push("ከዝርዝሩ ጾታ ይምረጡ !");
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

    onDriverApply = (e) => {
        e.preventDefault();
        const err = this.validateDriverApply();
        if(err.length > 0){
            let error_list = this.getErrorList(err);
            render(<Message negative >{error_list}</Message>,document.getElementById('ApplyFormError'));
        } else {
            var driver = {
                firstName: this.state.firstName,
                middleName: this.state.middleName,
                email: this.state.email,
                mobile: this.state.mobile,
                password: this.state.password,
                re_password: this.state.re_password,
                gender: this.state.gender,
                plateNo: this.state.plateNo
            }
            this.driverApply(driver)
            this.setState({
                firstName: '',
                middleName: '',
                email: '',
                mobile: '',
                password: '',
                re_password: '',
                gender: '',
                plateNo: '',
                errors: []
            });
        }
    }

    driverApply = (driver) => {
        $('.btn_apply').addClass("loading");
        $.ajax({ 
            type:"POST",
            url:"/driver/apply",
            data: JSON.stringify(driver), 
            contentType: "application/json",
            success: function(data, textStatus, jqXHR) {
              $('.btn_apply').removeClass("loading");
              sessionStorage.setItem("_auth_driver", data.token);
              this.setState({
                  auth: data.token
              })  
              
              console.log('token', data.token);
              //render(<Message bsStyle="success" onDismiss={this.handleDismiss}><h4>{data.firstName}, You have successfully applied to drive. </h4> <br /> Please check your email to activate your driving account. <br /> after checking your email , login to your account using your email address, <h6>{data.email}</h6></Message>,document.getElementById('ApplyFormError'));
              console.log("driver applied success", data);
              
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
            return <Redirect to='/driver'  />
        }
        
        return(
            <div>
             
             {this.state.show_form === false ? 
             <div>
             <Label textAlign='center' color="red" pointing="below">አዲስ ሹፊር ፡ እዚህ ይመዝገቡ !</Label>
             <div className="driverLoginBox">
               <Grid  columns={1} centered  stackable>
                 <Grid.Row>
                     <Grid.Column mobile={18} tablet={18} computer={18}>
                         <Button color="olive" size="huge" onClick={(e) => this._yes(e)} fluid>አዲስ ሹፊር ምዝገባ</Button>
                     </Grid.Column>
                 </Grid.Row>
               </Grid>
             </div> 
             </div>
             :
                <div className="driverLoginBox">
                <Header as='h3' textAlign='center' color='grey'>አዲስ ሹፊር ምዝገባ</Header> 
                <Grid columns={1}>
                <Grid.Row>
                    <Grid.Column mobile={18} tablet={18} computer={18}>
                    <Form>
                    <label>ስም</label>
                    <input
                    name="firstName"
                    type="text"
                    value={this.state.firstName}
                    placeholder="የእርሶ ስም"
                    onChange={e => this.change(e)}
                    >
                    </input>
                    </Form>
                    </Grid.Column>
                </Grid.Row>  

                <Grid.Row>
                    <Grid.Column mobile={18} tablet={18} computer={18}>
                    <Form>
                    <label>የአባት ስም</label>
                    <input
                    name="middleName"
                    type="text"
                    value={this.state.middleName}
                    placeholder="የአባት ስም"
                    onChange={e => this.change(e)}
                    >
                    </input>
                    </Form>
                    </Grid.Column>
                </Grid.Row>

                <Grid.Row>
                    <Grid.Column mobile={18} tablet={18} computer={18}>
                    <Form>
                    <label>ኢሜል</label>
                    <input
                    name="email"
                    type="text"
                    value={this.state.email}
                    placeholder="የኢሜል አድራሻ"
                    onChange={e => this.change(e)}
                    >
                    </input>
                    </Form>
                    </Grid.Column>
                </Grid.Row> 

                <Grid.Row>
                    <Grid.Column mobile={18} tablet={18} computer={18}>
                    <Form>
                    <label>ሞባይል ቁጥር</label>
                    <input
                    name="mobile"
                    type="text"
                    value={this.state.mobile}
                    placeholder="ሞባይል ቁጥር 10 አሀዝ"
                    onChange={e => this.change(e)}
                    >
                    </input>
                    </Form>
                    </Grid.Column>
                </Grid.Row>

                <Grid.Row>
                    <Grid.Column mobile={18} tablet={18} computer={18}>
                    <Form>
                    <label>የሚስጢር ኮድ</label>
                    <input
                    name="password"
                    type="password"
                    value={this.state.password}
                    placeholder="የሚስጢር ኮድ "
                    onChange={e => this.change(e)}
                    >
                    </input>
                    </Form>
                    </Grid.Column>
                </Grid.Row>

                <Grid.Row>
                    <Grid.Column mobile={18} tablet={18} computer={18}>
                    <Form>
                    <Form.Select name='gender' fluid label='ጾታ' options={options} placeholder='ጾታ' onChange={this.onChangeGender}/>
                    </Form>
                    </Grid.Column>
                </Grid.Row>

                <Grid.Row>
                 <Grid.Column mobile={18} tablet={18} computer={18}>
                  <div id='ApplyFormError' className='ApplyFormError'></div>
                  </Grid.Column>
                </Grid.Row>

                <Grid.Row>
                    <Grid.Column>
                    <Button className="btn_apply" color='olive' size='huge' onClick={e => this.onDriverApply(e)}  fluid >መዝግበኝ</Button>
                    </Grid.Column> 
                </Grid.Row>
                </Grid>
                </div>  
             }

            </div>
        );
    }
}
export default ApplyToDrive;