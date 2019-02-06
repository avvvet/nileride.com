import React, { Component } from 'react';
import { render } from 'react-dom';
import {Grid, Button, Form , Message} from 'semantic-ui-react';
import $ from 'jquery';

const options_reason = [
    { key: '1', text: 'I DO NOT WANT TO WORK', value: 'I-DO-NOT-WANT-TO-WORK' },
    { key: '2', text: 'PASSANGER-NOT-FOUND', value: 'PASSANGER-NOT-FOUND' },
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
        render(<Message negative >select reason !</Message>,document.getElementById('div-error-reason'));
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
        $.ajax({ 
            type:"POST",
            url:"/driver/ride/cancel",
            headers: { 'x-auth': sessionStorage.getItem("_auth_driver")},
            data: JSON.stringify(data), 
            contentType: "application/json",
            success: function(data, textStatus, jqXHR) {
               if(data.length > 0){
                 if(data[0] === 1) {
                    this.props.rideCompletedAction();
                    document.getElementById('div-notification-1').style.visibility="hidden";
                    render('',document.getElementById('div-notification-1'));
                 }
               } 
            }.bind(this),
            error: function(xhr, status, err) {
                render(<div className="div-error">connection error, try again</div>,document.getElementById('div-error-reason'));
            }.bind(this)
        });  
    }

    _yes = (e) => {
       this.setState({
         _show_confirm : false,
        _show_reason : true
       })
    }

    _no = (e) => {
        document.getElementById('div-notification-1').style.visibility="hidden";
        render('',document.getElementById('div-notification-1'));
    }

    render(){
        return(
            <div>
              {this.state._show_confirm === true ?
              <Message>
                 <Message.Header> Are you sure to cancel ?</Message.Header>
                 <p>
                 <div className='ui two buttons'>
                    <Button  onClick={(e) => this._no(e)}   color="green" >NO</Button>
                    <Button  onClick={(e) => this._yes(e)}  color="red" >YES</Button>
                </div>
                </p>
              </Message>
              : ''
              }

              {this.state._show_reason === true ? 
                        <Message>
                        <Message.Header>Why you are cancelling ?</Message.Header>
                        <p>
                            <Grid columns={1}>
                                <Grid.Row>
                                    <Grid.Column mobile={16} tablet={16} computer={16}>
                                    <Form>
                                    <Form.Select name='_reason' fluid label='Reason' options={options_reason} placeholder='Reason' onChange={this._onchange}/>
                                    </Form>
                                    </Grid.Column>
                               </Grid.Row>

                               <Grid.Row className="row_xs">
                                    <Grid.Column mobile={16} tablet={16} computer={16}>
                                    <Button color="green" onClick={(e) => this._onsubmit(e)} fluid>SUBMIT</Button>
                                    </Grid.Column>
                               </Grid.Row>

                               <Grid.Row className="row_sm">
                                    <Grid.Column mobile={16} tablet={16} computer={16}>
                                    <Button color="red" onClick={(e) => this._no(e)} fluid>NO</Button>
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