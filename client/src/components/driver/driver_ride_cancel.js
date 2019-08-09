import React, { Component } from 'react';
import { render } from 'react-dom';
import {Grid, Button, Form , Message} from 'semantic-ui-react';
import $ from 'jquery';

const options_reason = [
    { key: '1', text: 'መስራት አልችልም', value: 'I-DO-NOT-WANT-TO-WORK' },
    { key: '2', text: 'ተሳፋሪውን ማግኘት አልቻልኩም', value: 'PASSANGER-NOT-FOUND' },
]

class DriverRideCancel extends Component {
    constructor() {
       super();

       this.state = {
        _show_confirm : true,
        _show_reason : false,
        _reason : ''
       }

    }


    _onchange = (e, data) => {
        this.setState({
            _reason : data.value
        });

    }


    _onsubmit = (e) => {
     e.preventDefault();
     e.target.disabled = true;
     if(this.state._reason.length === 0) {
        render(<Message negative >ምከንያት ይምረጡ </Message>,document.getElementById('div-error-reason'));
        e.target.disabled = false;
     } else {
        var data = {
            reason : this.state._reason,
            ride_id : this.props.ride_id
        }

        this.submit_reason(data, e);
        this.setState({
            _show_confirm : false,
            _show_reason : false,
            _reason : '',
            errors: []
        });
     }
    }

    submit_reason = (data,e) => {
        e.preventDefault(); 
        $('.btn_reason_submit').addClass("loading");
        $.ajax({ 
            type:"POST",
            url:"/driver/ride/cancel",
            headers: { 'x-auth': localStorage.getItem("_auth_driver")},
            data: JSON.stringify(data), 
            contentType: "application/json",
            success: function(data, textStatus, jqXHR) {
               $('.btn_reason_submit').removeClass("loading");
               if(data.length > 0){
                 if(data[0] === 1) {
                    this.props.rideCompletedAction();
                    document.getElementById('div-notification-1').style.visibility="hidden";
                    render('',document.getElementById('div-notification-1'));
                 }
               } 
            }.bind(this),
            error: function(xhr, status, err) {
                $('.btn_reason_submit').removeClass("loading");
                render(<div className="div-error">ኢንተርኒት መኖሩን እርግጠኛ ይሁኑ እንደገና ይሞክሩ !</div>,document.getElementById('div-error-reason'));
            }
        });  
    }

    _yes = (e) => {
       this.setState({
         _show_confirm : false,
        _show_reason : true
       })
    }

    _no = (e) => {
        $('.btn_ride_cancel').removeClass("disabled");
        document.getElementById('div-notification-1').style.visibility="hidden";
        render('',document.getElementById('div-notification-1'));
    }

    render(){
        return(
            <div>
              {this.state._show_confirm === true ?
              <Message>
                 <Message.Header> እርግጠኛ ኖት ጎዞውን ለመሰረዝ ?</Message.Header>
                 <p>
                 <div className='ui two buttons'>
                    <Button  onClick={(e) => this._no(e)}   color="green" >ይቅር</Button>
                    <Button  onClick={(e) => this._yes(e)}  color="red" >እርግጠኛ ነኝ</Button>
                </div>
                </p>
              </Message>
              : ''
              }

              {this.state._show_reason === true ? 
                        <Message>
                        <Message.Header>ጉዞው ለምን ይሰረዛል ?</Message.Header>
                        <p>
                            <Grid columns={1}>
                                <Grid.Row>
                                    <Grid.Column mobile={16} tablet={16} computer={16}>
                                    <Form>
                                    <Form.Select name='_reason' fluid label='ምክንያት' options={options_reason} placeholder='ምከንያት' onChange={this._onchange}/>
                                    </Form>
                                    </Grid.Column>
                               </Grid.Row>

                               <Grid.Row className="row_xs">
                                    <Grid.Column mobile={16} tablet={16} computer={16}>
                                    <Button className="btn_reason_submit" color="green" onClick={(e) => this._onsubmit(e)} fluid>አሳውቅ</Button>
                                    </Grid.Column>
                               </Grid.Row>

                               <Grid.Row className="row_sm">
                                    <Grid.Column mobile={16} tablet={16} computer={16}>
                                    <Button color="red" onClick={(e) => this._no(e)} fluid>ይቅር</Button>
                                    </Grid.Column>
                               </Grid.Row>

                               <Grid.Row>
                                <Grid.Column mobile={16} tablet={16} computer={16}>
                                  <div className="div-error-reason" id="div-error-reason"></div>
                                </Grid.Column>
                               </Grid.Row>
                           </Grid>
                        </p>
                    </Message>

              : ''
              }
            </div>
        );
    }
}
export default DriverRideCancel;