import React, { Component } from 'react';
import { render } from 'react-dom';
import { Grid, Message, Button, Image } from 'semantic-ui-react'
import $ from 'jquery';
class DriverCancelRide extends Component {
    constructor() {
       super();

       this.state = {
         _ride_id : ''
       }

    }

    componentDidMount(){
        this.setState({
            _ride_id : this.props.ride.id
        })
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

    _driver_cancel_ride_ok = (e) => {
        var data = {
            ride_id : this.state._ride_id
        };
        $.ajax({ 
            type:"POST",
            url:"/user/driver_cancel_ride_ok",
            headers: { 'x-auth': localStorage.getItem("_auth_user")},
            data: JSON.stringify(data), 
            contentType: "application/json",
            success: function(data, textStatus, jqXHR) {
                this.props.resetRide();
                render('',document.getElementById('div-notification-1'));
                document.getElementById('div-notification-1').style.visibility="hidden";
            }.bind(this),
            error: function(xhr, status, err) {
                
            }.bind(this)
        });  
    }

    render(){
        return(
            <div>
                <Message negative>
                    <Message.Header><strong>ይቅርታ ! ሹፌሩ ሥራውን ሰረዘው !</strong></Message.Header>
                    <p>
                        በጣም ይቅርታ ፡ ሹፌሩ ለምን ሥራውን አንደሰረዘው አሁን እናጣራለን ። 
                        እባኮትን በድጋሚ ይሞክሩ።
                    </p>

                    <p>
                        <Grid container columns={1}>
                            <Grid.Row>
                                <Grid.Column mobile={16} tablet={16} computer={16} textAlign="center"> 
                                    <Button color="green" onClick={(e) => this._driver_cancel_ride_ok(e)} fluid>ቀጥል</Button>
                                </Grid.Column>
                            </Grid.Row>
                            <Grid.Row>
                                <Grid.Column xs={16} sm={16} md={16}>
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
export default DriverCancelRide;