import React, { Component } from 'react';
import { render } from 'react-dom';
import {Grid, Row, Col, Alert, Image, Button, Badge, FormControl, FormGroup, ControlLabel} from 'react-bootstrap';
import $ from 'jquery';
class DriverRideCancel extends Component {
    constructor() {
       super();

       this.state = {
        _show_confirm : true,
        _show_reason : false,
        _reason : ''
       }

    }

    getErrorList(errors){
        var i = 0;
        let error_list = errors.map(error => {
            return <li key={i++}>{error}</li>
        });
        return error_list;
    }

    _onchange = (e) => {
        this.setState({
            [e.target.name]: e.target.value
        })
    }

    validateReason = () => {
       
        let errors = [];
        if(this.state._reason.length === 0) {
            errors.push("Select reason for cancel.");
        } 
        return errors;
    }

    _onsubmit = (e) => {
        console.log('reason', this.state._reason);
        e.target.disabled = true;
        e.preventDefault();
        const err = this.validateReason();
        if(err.length > 0){
            e.target.disabled = false;
            let error_list = this.getErrorList(err);
            render(<div className="div_error">{error_list}</div>,document.getElementById('div-error-reason'));
        } else {
            var data = {
                reason : this.state._reason,
                ride_id : this.props.ride_id
            }

            this.submit_reason(data, e);
            this.setState({
                _show_confirm : true,
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
                console.log('so what comes', data);
               if(data.length > 0){
                 if(data[0] === 1) {
                    render('',document.getElementById('driver-ride-cancel'));
                    this.props.rideCompletedAction();
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
        render('',document.getElementById('driver-ride-cancel'));
    }

    render(){
        return(
            <div>
              {this.state._show_confirm === true ?
              <div className="div-confirm" id="div-confirm"> 
                <strong>Are you sure ! </strong> . you want to cancel ?
                <p> 
                 <Grid fluid>
                     <Row className="rowPaddingSm">
                          <Col xs={6} sm={6} md={6}>
                           <Button  onClick={(e) => this._no(e)}  bsSize="small" block>NO</Button>
                          </Col>
                          <Col xs={6} sm={6} md={6}>
                           <Button  onClick={(e) => this._yes(e)} bsStyle="danger" bsSize="small" block>YES</Button>
                          </Col>
                     </Row>
                 </Grid>   
                 </p> 
              </div>
              : ''
              }

              {this.state._show_reason === true ? 
                    <div>
                        <div className="div-reason" id="div-reason"> 
                            <p> 
                            <form>
                            <Grid fluid>
                                <Row className="rowPaddingSm">
                                    <Col xs={12} sm={12} md={12}>
                                    <FormGroup>
                                        <ControlLabel>SELECT REASON</ControlLabel>
                                        <FormControl name="_reason" componentClass="select" placeholder="select" onChange={e => this._onchange(e)}>
                                            <option value="">select</option>
                                            <option value="MY-CAR-NOT-WORKING">MY CAR NOT WORKING</option>
                                            <option value="PASSANGE-NOT-FOUND">PASSANGE NOT FOUND</option>
                                            <option value="HIGHT-TRAFIC">HIGHT TRAFIC</option>
                                            <option value="OTHER">OTHER</option>
                                        </FormControl>
                                        </FormGroup>
                                    </Col>
                                </Row>
                                <Row className="rowPaddingSm">
                                    <Col xs={6} sm={6} md={6}>
                                    <Button  onClick={(e) => this._onsubmit(e)} bsStyle="danger" bsSize="small" block>SUBMIT</Button>
                                    </Col>
                                    <Col xs={6} sm={6} md={6}>
                                    <Button  onClick={(e) => this._no(e)}  bsSize="small" bsStyle="success" block>BACK</Button>
                                    </Col>
                                </Row>

                                <Row>
                                    <Col xs={12} sm={12} md={12}>
                                        <div className="div-error-reason" id="div-error-reason"></div>
                                    </Col>
                                </Row>
                            </Grid>
                            </form>   
                            </p> 
                        </div>
                    </div>
              : ''
              }
            </div>
        );
    }
}
export default DriverRideCancel;