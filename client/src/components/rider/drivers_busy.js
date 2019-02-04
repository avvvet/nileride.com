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
        render('',document.getElementById('driver-busy'));
        document.getElementById('driver-busy').style.visibility="hidden"; 
    }
    
    render(){
        return(
            <div>
                <Message success>
                    <Message.Header>Sorry, all drivers are busy !</Message.Header>
                    <p>
                        we have tried to assign your ride to nearest drivers.
                        At this moment all drivers are busy. Please try to request
                        again.
                    </p>

                    <p>
                        <Grid columns={1}>
                            <Grid.Row>
                                <Grid.Column mobile={18} tablet={18} computer={18} textAlign="center"> 
                                    <Button color="green" onClick={(e) => this._no(e)} >OK</Button>
                                </Grid.Column>
                            </Grid.Row>
                            <Grid.Row>
                                <Grid.Column xs={18} sm={18} md={18}>
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