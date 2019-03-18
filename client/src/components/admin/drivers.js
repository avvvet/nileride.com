import React, { Component } from 'react';
import L from 'leaflet';
import {NavLink, Redirect} from 'react-router-dom';
import { Image, Table, Checkbox, Rating, Label} from 'semantic-ui-react'
import $ from 'jquery';
import _ from 'lodash';

class Drivers extends Component {
    constructor(){
        super();
        this.state = {
            drivers : []
        }
    }
    componentDidMount(){
        this.showDrivers();
    }

    showDrivers = () => {
        //$('.btn_apply').addClass("loading");
        var data = {};
        $.ajax({ 
            type:"POST",
            url:"/admin/drivers",
            data: JSON.stringify(data), 
            contentType: "application/json",
            success: function(drivers, textStatus, jqXHR) {
              //$('.btn_apply').removeClass("loading");
              this.setState({
                drivers : drivers
            });  
            }.bind(this),
            error: function(xhr, status, err) {
                //$('.btn_apply').removeClass("loading");
                console.error(xhr, status, err.toString());
            }.bind(this)
        });  
    }

    createGrid = (drivers) => {
        const row = drivers.map((driver) =>
            <Table.Row key={driver.id}>
                <Table.Cell collapsing>
                  <Image size='mini' src={'/assets/profile/driver/' + driver.profile} circular />
                </Table.Cell>
                <Table.Cell>{driver.firstName + ' ' + driver.middleName}</Table.Cell>
                <Table.Cell>{driver.gender}</Table.Cell>
                <Table.Cell>{driver.mobile}</Table.Cell>
                <Table.Cell>{driver.email}</Table.Cell>
                <Table.Cell>{driver.verified}</Table.Cell>
                <Table.Cell>{_.isNull(driver.currentLocation.coordinates) ? '0' : '1'}</Table.Cell>
                <Table.Cell>{driver.count_rating}</Table.Cell>
                <Table.Cell><Rating icon='star' defaultRating={driver.avg_rating} maxRating={5} /></Table.Cell>
                <Table.Cell textAlign="center">{this.convert_status(driver.status)}</Table.Cell>
                <Table.Cell collapsing textAlign='right'><Checkbox slider /></Table.Cell>
            </Table.Row>
        );
        return row;
    }

    convert_status = (code) => {
         if(code === 0) {
             return <Label size="mini" color="green" circular>waiting</Label>;
         } else if(code === 1 ) {
             return <Label size="mini" color="orange" circular>driving</Label>
         } else if(code === 2) {
             return <Label size="mini" color="red" circular>missed ride</Label>
         } else if(code === 3) {
            return <Label size="mini" color="grey" circular>disabled</Label>
         } 
    }

    render(){
        return(
            <div>
              <Table celled striped>
                <Table.Header>
                    <Table.Row>
                    <Table.HeaderCell />
                    <Table.HeaderCell>Name</Table.HeaderCell>
                    <Table.HeaderCell>Gener</Table.HeaderCell>
                    <Table.HeaderCell>Mobile</Table.HeaderCell>
                    <Table.HeaderCell>Email</Table.HeaderCell>
                    <Table.HeaderCell>verified</Table.HeaderCell>
                    <Table.HeaderCell>coordinates</Table.HeaderCell>
                    <Table.HeaderCell>Rides</Table.HeaderCell>
                    <Table.HeaderCell>Avg.Rating</Table.HeaderCell>
                    <Table.HeaderCell>Status</Table.HeaderCell>
                    <Table.HeaderCell>Account</Table.HeaderCell>
                    </Table.Row>
                </Table.Header>

                <Table.Body>
                {this.createGrid(this.state.drivers)}
                </Table.Body>
             </Table>
            </div>
        );
    }
}
export default Drivers