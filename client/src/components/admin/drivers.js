import React, { Component } from 'react';
import L from 'leaflet';
import {NavLink, Redirect} from 'react-router-dom';
import { Image, Table, Checkbox, Rating} from 'semantic-ui-react'
import $ from 'jquery';
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
                <Table.Cell>{driver.isOnline}</Table.Cell>
                <Table.Cell>{driver.count_rating}</Table.Cell>
                <Table.Cell><Rating icon='star' defaultRating={driver.avg_rating} maxRating={5} /></Table.Cell>
                <Table.Cell collapsing textAlign='right'><Checkbox slider /></Table.Cell>
            </Table.Row>
        );
        return row;
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
                    <Table.HeaderCell>Verified</Table.HeaderCell>
                    <Table.HeaderCell>Online</Table.HeaderCell>
                    <Table.HeaderCell>Rides</Table.HeaderCell>
                    <Table.HeaderCell>Avg.Rating</Table.HeaderCell>
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