import React, { Component } from 'react';
import { render } from 'react-dom';
import L from 'leaflet';
import {NavLink, Redirect} from 'react-router-dom';
import { Image, Table, Checkbox, Rating, Label, Button} from 'semantic-ui-react'
import $ from 'jquery';
import RideControlMap from './ride_control';

class Rides extends Component {
    constructor(){
        super();
        this.state = {
            rides : []
        }
    }
    
    componentDidMount(){
        this.showrides();
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

    _show_ride = () => {
        render(<RideControlMap ride_id={80}></RideControlMap>,document.getElementById('ride_control'));
    }

    createGrid = (rides) => {
        const row = rides.map((ride) =>
            <Table.Row key={ride.id}>
                <Table.Cell collapsing>
                  <Image size='mini' src={'/assets/profile/user/' + ride.user.profile} circular />
                </Table.Cell>
                <Table.Cell>{ride.user.firstName + ' ' + ride.user.middleName}</Table.Cell>
                <Table.Cell>{ride.user.mobile}</Table.Cell>
                <Table.Cell collapsing>
                  <Image size='mini' src={'/assets/profile/driver/' + ride.driver.profile} circular />
                </Table.Cell>
                <Table.Cell>{ride.driver.firstName + ' ' + ride.driver.middleName}</Table.Cell>
                <Table.Cell>{ride.driver.mobile}</Table.Cell>
                <Table.Cell>{ride.route_distance}</Table.Cell>
                <Table.Cell>{this.timeConvert(Number.parseInt(ride.route_time))}</Table.Cell>
                <Table.Cell>{ride.route_price}</Table.Cell>
                <Table.Cell><Label color='orange' size='tiny' onClick={(e) => this._show_ride(e)}>ride map</Label></Table.Cell>
                <Table.Cell>{ride.createdAt}</Table.Cell>
                <Table.Cell textAlign="center">{this.convert_status(ride.status)}</Table.Cell>
                <Table.Cell collapsing textAlign='right'><Checkbox slider /></Table.Cell>
            </Table.Row>
        );
        return row;
    }
    
    convert_status = (code) => {
        console.log("code ", code);
         if(code === 1) {
             return <Label size="mini" color="grey" circular>calling</Label>;
         } else if(code === 2 || code === 22 || code === 222) {
             return <Label size="mini" color="red" circular>missed ride</Label>
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
export default Rides