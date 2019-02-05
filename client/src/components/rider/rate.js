import React, { Component } from 'react';
import { render } from 'react-dom';
import { Grid, Message, Button, Rating, Image } from 'semantic-ui-react'
import $ from 'jquery';
class Rate extends Component {
    constructor() {
       super();

       this.state = {
        rating : 0, 
        maxRating : 5,
        _driverImage: '',
        _driverCarImage: '',
        _driverName : ''
       }

    }

    componentDidMount(){
        this.setState({
             _ride_id : this.props.ride.id,
             _driver_id : this.props.ride.driver_id,
            _driverImage: "/assets/profile/driver/" + this.props.ride.driver.profile,
            _driverCarImage: "/assets/awet-ride.jpeg",
            _driverName : this.props.ride.driver.firstName + ' ' + this.props.ride.driver.middleName,
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
   
    _on_rating = (e) => {
       if(this.state.rating === 0) {
        render(<Message negative> Please select stars !   (1 star is bad and 5 star  is excellent)</Message>,document.getElementById('div-rateing-error'));
       } else {
           this._rating(e);
       }
    }

    _rating = (e) => {
        var data = {
            ride_id : this.state._ride_id,
            driver_id : this.state._driver_id,
            rating : this.state.rating
        };
        $.ajax({ 
            type:"POST",
            url:"/ride/rating",
            headers: { 'x-auth': sessionStorage.getItem("_auth_user")},
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

    handleRate = (e, { rating, maxRating }) => this.setState({ rating, maxRating });

    render(){
        return(
            <div>
                <Message>
                    <Message.Header>How was the driver and car ?</Message.Header>
                    <p>
                        Please rate from 1 to 5 star.
                    </p>
                    
                    <p>
                        <Grid container columns={1} centered>
                            <Grid.Row >
                                <Grid.Column mobile={16} tablet={16} computer={16} textAlign="center">
                                  <Rating maxRating={5} onRate={this.handleRate} icon='star' size='massive' />
                                </Grid.Column>
                            </Grid.Row>
                            <Grid.Row className="row_xs">
                                <Grid.Column mobile={5} tablet={5} computer={5} textAlign="center">
                                   <Image src={this.state._driverImage} height={40} circular></Image>
                                </Grid.Column>
                                <Grid.Column mobile={5} tablet={5} computer={5} textAlign="center">
                                   <Image src={this.state._driverCarImage} height={40} circular></Image>
                                </Grid.Column>
                                <Grid.Column mobile={6} tablet={6} computer={6} className="text-center" textAlign="center">
                                   {this.state._driverName}
                                </Grid.Column>
                            </Grid.Row>
                            <Grid.Row>
                                <Grid.Column mobile={16} tablet={16} computer={16} textAlign="center"> 
                                    <Button color="green" onClick={(e) => this._on_rating(e)} fluid>SEND</Button>
                                </Grid.Column>
                            </Grid.Row>
                            <Grid.Row>
                                <Grid.Column mobile={16} tablet={16} computer={16} textAlign="center"> 
                                    <div id="div-rateing-error"></div>
                                </Grid.Column>
                            </Grid.Row>
                        </Grid>
                    </p>
                </Message>
            </div>
        );
    }
}
export default Rate;