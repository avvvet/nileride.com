import React, { Component } from 'react';
import { render } from 'react-dom';
import L from 'leaflet';
import {NavLink, Redirect} from 'react-router-dom';
import { Image, Table, Checkbox, Rating, Label, Button} from 'semantic-ui-react'
import RideControlMap from './ride_control';
import $ from 'jquery';

class RidesWithNoImage extends Component {
    constructor(){
        super();
        this.state = {
            rides : []
        }
    }
    componentDidMount(){
        this.showrides();
    }

    _accept_ride = (ride_id, driver_id) => {    //this changes the ride to accepted 
        $('.'+ride_id).addClass("loading");
        if (window.confirm('Are you sure ?')) {
            var data = {
                id : ride_id,
                driver_id : driver_id
            };
     
            $.ajax({ 
                type:"POST",
                url:"/ride/manual_accept_ride",
                headers: { 'x-auth': sessionStorage.getItem("_auth_user")},
                data: JSON.stringify(data), 
                contentType: "application/json",
                success: function(data, textStatus, jqXHR) {
                    $('.'+ride_id).removeClass("loading");
                    $('.'+ride_id).remove();
                }.bind(this),
                error: function(xhr, status, err) {
                    $('.btn_convert').removeClass("loading"); 
                }.bind(this)
            });  
        } else {
            $('.'+ride_id).removeClass("loading");
        }
        
    }

    _complete_ride = (ride_id, driver_id) => {    //this changes the ride to completed  
        $('.'+ride_id).addClass("loading");
        if (window.confirm('Are you sure ride completed ?')) {
            var data = {
                ride_id : ride_id,
                driver_id : driver_id
            };
     
            $.ajax({ 
                type:"POST",
                url:"/ride/manual_ride_complete",
                headers: { 'x-auth': sessionStorage.getItem("_auth_user")},
                data: JSON.stringify(data), 
                contentType: "application/json",
                success: function(data, textStatus, jqXHR) {
                    $('.'+ride_id).removeClass("loading");
                    $('.'+ride_id).remove();
                }.bind(this),
                error: function(xhr, status, err) {
                    $('.btn_convert').removeClass("loading"); 
                }.bind(this)
            });  
        } else {
            $('.'+ride_id).removeClass("loading");
        }
    }

    showrides = () => {
        //$('.btn_apply').addClass("loading");
        var data = {};
        $.ajax({ 
            type:"POST",
            url:"/admin/rides",
            data: JSON.stringify(data), 
            contentType: "application/json",
            success: function(rides, textStatus, jqXHR) {
              //$('.btn_apply').removeClass("loading");
              this.setState({
                rides : rides
            });  
            }.bind(this),
            error: function(xhr, status, err) {
                //$('.btn_apply').removeClass("loading");
                console.error(xhr, status, err.toString());
            }.bind(this)
        });  
    }
    
    timeConvert = (n) => {
        var num = n;
        var hours = (num / 3600);
        var rhours = Math.floor(hours);
        var minutes = (hours - rhours) * 60;
        var rminutes = Math.round(minutes);
        
        var hDisplay = rhours > 0 ? rhours + " hr" : "";
        var mDisplay = rminutes > 0 ? rminutes + " min" : "";
        return hDisplay + mDisplay; 
    }

    createGrid = (rides) => {
        const row = rides.map((ride) =>
            <Table.Row key={ride.id}>
                <Table.Cell collapsing>
                  
                </Table.Cell>
                <Table.Cell>{ride.user.firstName + ' ' + ride.user.middleName}</Table.Cell>
                <Table.Cell>{ride.user.mobile}</Table.Cell>
                <Table.Cell collapsing>
                 
                </Table.Cell>
                <Table.Cell>{ride.driver.firstName + ' ' + ride.driver.middleName}</Table.Cell>
                <Table.Cell>{ride.driver.mobile}</Table.Cell>
                <Table.Cell>{ride.route_distance}</Table.Cell>
                <Table.Cell>{this.timeConvert(Number.parseInt(ride.route_time))}</Table.Cell>
                <Table.Cell>{ride.route_price}</Table.Cell>
                <Table.Cell><Label color='blue' size='tiny' circular onClick={() => this._show_ride(ride.id, ride)}>map</Label></Table.Cell> 
                <Table.Cell>{ride.createdAt}</Table.Cell>
                
                <Table.Cell>
                    {ride.status === 2 || ride.status === 22 || ride.status === 222 ? 
                      <Label className={ride.id} color='teal' size='tiny' onClick={() => this._accept_ride(ride.id, ride.driver.token)} circular>accept</Label>
                    :
                      ''
                    }

                    {ride.status === 7 || ride.status === 77 ? 
                      <Label className={ride.id} color='blue' size='tiny' onClick={() => this._complete_ride(ride.id, ride.driver.token)} circular>finish</Label>
                    :
                      ''
                    }
                </Table.Cell>

                <Table.Cell textAlign="center">{this.convert_status(ride.status)}</Table.Cell>
                <Table.Cell collapsing textAlign='right'><Checkbox slider /></Table.Cell>
            </Table.Row>
        );
        return row;
    }
    
    convert_status = (code) => {
         if(code === 1) {
             return <Label size="mini" color="grey" circular>calling</Label>;
         } else if(code === 2 || code === 22 ) {
            return <Label size="mini" color="red" circular>missed ride</Label>
         } else if(code === 222) {
             return <Label size="mini" color="brown" circular>missed ride</Label>
         } else if(code === 777 || code === 7777) {
             return <Label size="mini" color="green" circular>completed</Label>
         } else if(code === 4 || code === 444) {
            return <Label size="mini" color="black" circular>canceled</Label>
         } else if(code === 7) {
            return <Label size="mini" color="teal" circular>accepted</Label>
        } else if(code === 77) {
            return <Label size="mini" color="orange" circular>driving</Label>
        } 
    }

    _show_ride = (ride_id, ride) => {
        render(<RideControlMap ride_id={ride_id} ride={ride}></RideControlMap>,document.getElementById('ride_control'));
    }

    render(){
        return(
            <div>
             <div className="ride_control" id="ride_control"></div>
              <Table celled striped>
                <Table.Header>
                    <Table.Row>
                    <Table.HeaderCell />
                    <Table.HeaderCell>Passenger</Table.HeaderCell>
                    <Table.HeaderCell>Mobile</Table.HeaderCell>
                    <Table.HeaderCell/>
                    <Table.HeaderCell>Driver</Table.HeaderCell>
                    <Table.HeaderCell>Mobile</Table.HeaderCell>
                    <Table.HeaderCell>Distance</Table.HeaderCell>
                    <Table.HeaderCell>Time</Table.HeaderCell>
                    <Table.HeaderCell>Price</Table.HeaderCell>
                    <Table.HeaderCell>Map</Table.HeaderCell>
                    <Table.HeaderCell>when</Table.HeaderCell>
                    <Table.HeaderCell>Action</Table.HeaderCell>
                    <Table.HeaderCell>Status</Table.HeaderCell>
                    <Table.HeaderCell>Cancel</Table.HeaderCell>
                    </Table.Row>
                </Table.Header>

                <Table.Body>
                {this.createGrid(this.state.rides)}
                </Table.Body>
                <Table.Footer fullWidth>
                    <Table.Row>
                        <Table.HeaderCell />
                        <Table.HeaderCell colSpan='10'>
                        <Label size="mini" color="grey" floated="right" circular>calling</Label>
                        <Label size="mini" color="teal" floated="right" circular>accepted</Label>
                        <Label size="mini" color="orange" floated="right" circular>pax found</Label>
                        <Label size="mini" color="red" floated="right" circular>missed ride</Label>
                        <Label size="mini" color="black" floated="right" circular>canceled</Label>
                        <Label size="mini" color="green" floated="right" circular>completed</Label>
                        </Table.HeaderCell>
                    </Table.Row>
                </Table.Footer>
             </Table>
            </div>
        );
    }
}
export default RidesWithNoImage