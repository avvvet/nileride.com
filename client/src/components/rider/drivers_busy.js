import React, { Component } from 'react';
import { render } from 'react-dom';
import { Grid, Message, Button, Image } from 'semantic-ui-react'
import $ from 'jquery';
class DriverBusy extends Component {
    constructor() {
       super();

       this.state = {
        _show_confirm : true,
        _show_reason : false,
        _reason : ''
       }

    }

    _yes = (e) => {
       this.setState({
         _show_confirm : false,
        _show_reason : true
       })
    }

    _no = (e) => {
        render('',document.getElementById('div-notification-1'));
        document.getElementById('div-notification-1').style.visibility="hidden"; 
    }

    _driver_busy_ok = (e) => {
        e.preventDefault(); 
        $('.btn_busy_ok').addClass("loading");

        var data = {};
        $.ajax({ 
            type:"POST",
            url:"/ride/busy_ok",
            headers: { 'x-auth': sessionStorage.getItem("_auth_user")},
            data: JSON.stringify(data), 
            contentType: "application/json",
            success: function(data, textStatus, jqXHR) {
                $('.btn_busy_ok').removeClass("loading");
                this.props.resetRide();
                render('',document.getElementById('div-notification-1'));
                document.getElementById('div-notification-1').style.visibility="hidden";
            }.bind(this),
            error: function(xhr, status, err) {
                $('.btn_busy_ok').removeClass("loading"); 
            }.bind(this)
        });  
    }

    render(){
        return(
            <div>
                <Message negative>
                    <Message.Header>Sorry, all drivers are busy !</Message.Header>
                    <p>
                        we have tried to assign your ride to nearest drivers.
                        At this moment all drivers are busy. Please try to request
                        again.
                    </p>

                    <p>
                        <Grid container columns={1}>
                            <Grid.Row>
                                <Grid.Column mobile={16} tablet={16} computer={16} textAlign="center"> 
                                    <Button className="btn_busy_ok" color="green" onClick={(e) => this._driver_busy_ok(e)} fluid >OK</Button>
                                </Grid.Column>
                            </Grid.Row>
                            <Grid.Row>
                                <Grid.Column mobile={16} tablet={16} computer={16}>
                                    <div className="div-error" id="driver-busy-error"></div>
                                </Grid.Column>
                            </Grid.Row>
                        </Grid>
                    </p>
                </Message>
            </div>
        );
    }
}
export default DriverBusy;