import React, { Component } from 'react';
import { render } from 'react-dom';
import { Grid, Message, Button, Image, Icon } from 'semantic-ui-react'
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

        var data = {
            driver_id : this.props.ride.driver_id
        };
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

    _convert_to_ride = (e) => {
        e.preventDefault(); 
        $('.btn_convert').addClass("loading");
        var data = {
            id : this.props.ride.id,
            driver_id : this.props.ride.driver_id
        };
 
        $.ajax({ 
            type:"POST",
            url:"/ride/convert_missed_to_ride",
            headers: { 'x-auth': sessionStorage.getItem("_auth_user")},
            data: JSON.stringify(data), 
            contentType: "application/json",
            success: function(data, textStatus, jqXHR) {
                $('.btn_convert').removeClass("loading");
                this.props.chkTimerRideStatus();
                document.getElementById("ride-price-dashboard").style.visibility = "hidden";
                document.getElementById("ride-request-dashboard").style.visibility = "visible";  
                document.getElementById("search_1").style.visibility = "hidden"; 
                document.getElementById("search_0").style.visibility = "hidden"; 
                render('',document.getElementById('div-notification-1'));
                document.getElementById('div-notification-1').style.visibility="hidden";
            }.bind(this),
            error: function(xhr, status, err) {
                $('.btn_convert').removeClass("loading"); 
            }.bind(this)
        });  
    }


    render(){
        return(
            <div>
                <Message negative>
                    <Message.Header>ይደውሉ ! ሹፌር online አይደልም</Message.Header>
                    <p>
                        እባኮትን ስልክ ደውለው ይግኝዋቸው ። 
                    </p>

                    <p>
                        <Grid columns={3} centered>
                            <Grid.Row>
                                <Grid.Column mobile={4} tablet={4} computer={4} textAlign="center">
                                   <Image src={"/assets/profile/driver/" + this.props.ride.driver.profile} height={40} circular></Image>
                                </Grid.Column>
                                <Grid.Column mobile={5} tablet={5} computer={5} textAlign="left">
                                   {this.props.ride.driver.firstName}
                                </Grid.Column>
                                <Grid.Column mobile={7} tablet={7} computer={7} className="text-center" textAlign="center">
                                  <Icon name="phone volume" color="purple"></Icon>
                                  <a href={'tel:' + this.state._driverMobile}>{this.props.ride.driver.mobile}</a>
                                </Grid.Column>
                            </Grid.Row>
                            <Grid.Row>
                                <Grid.Column mobile={16} tablet={16} computer={16}>
                                    <div className="div-error" id="driver-busy-error"></div>
                                </Grid.Column>
                            </Grid.Row>
                        </Grid>
                        <Grid container columns={1}>
                            <Grid.Row>
                                <Grid.Column mobile={16} tablet={16} computer={16} textAlign="center"> 
                                    <Button className="btn_busy_ok" onClick={(e) => this._driver_busy_ok(e)} fluid >ደውዬ አልተገኝም</Button>
                                </Grid.Column>
                            </Grid.Row>
                            <Grid.Row className="row_xs">
                                <Grid.Column mobile={16} tablet={16} computer={16} textAlign="center"> 
                                    <Button className="btn_convert" color='green' onClick={(e) => this._convert_to_ride(e)} content='ተግኝትዋል ቀጥል' icon='right arrow' labelPosition='right' fluid/>
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