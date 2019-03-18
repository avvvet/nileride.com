import React, { Component } from 'react';
import L from 'leaflet';
import {NavLink, Redirect} from 'react-router-dom';
import { Image, Table, Checkbox} from 'semantic-ui-react'
import $ from 'jquery';
class Users extends Component {
    constructor(){
        super();
        this.state = {
            users : []
        }
    }
    componentDidMount(){
        this.showUsers();
    }

    showUsers = () => {
        //$('.btn_apply').addClass("loading");
        var data = {};
        $.ajax({ 
            type:"POST",
            url:"/admin/users",
            data: JSON.stringify(data), 
            contentType: "application/json",
            success: function(users, textStatus, jqXHR) {
              //$('.btn_apply').removeClass("loading");
              this.setState({
                users : users
            });  
            }.bind(this),
            error: function(xhr, status, err) {
                //$('.btn_apply').removeClass("loading");
                console.error(xhr, status, err.toString());
            }.bind(this)
        });  
    }

    createGrid = (users) => {
        const row = users.map((user) =>
            <Table.Row key={user.id}>
                <Table.Cell collapsing>
                  <Image size='mini' src={'/assets/profile/user/' + user.profile} circular />
                </Table.Cell>
                <Table.Cell>{user.firstName + ' ' + user.middleName}</Table.Cell>
                <Table.Cell>{user.gender}</Table.Cell>
                <Table.Cell>{user.mobile}</Table.Cell>
                <Table.Cell>{user.email}</Table.Cell>
                <Table.Cell textAlign="center">{user.total_rides}</Table.Cell>
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
                    <Table.HeaderCell>Rides</Table.HeaderCell>
                    <Table.HeaderCell>Account</Table.HeaderCell>
                    </Table.Row>
                </Table.Header>

                <Table.Body>
                {this.createGrid(this.state.users)}
                </Table.Body>
             </Table>
              
            </div>
        );
    }
}
export default Users