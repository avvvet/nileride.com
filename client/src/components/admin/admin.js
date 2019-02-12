import React, { Component } from 'react';
import L from 'leaflet';
import {NavLink, Redirect} from 'react-router-dom';
import { Grid, Image, Button, Input, Menu, Segment} from 'semantic-ui-react';
import Users from './users';
import Drivers from './drivers';
import DriverPayments from './driver_payments';
import Rides from './rides';

class Admin extends Component {
    constructor() {
        super();
        this.state = {
            activeItem: 'home' 
        }
    }
    
    handleItemClick = (e, { name }) => this.setState({ activeItem: name })
  
    render() {
      const { activeItem } = this.state
  
      return (
        <div>
          <Menu pointing>
            <Menu.Item name='home' active={activeItem === 'home'} onClick={this.handleItemClick} />
            <Menu.Item
              name='users'
              active={activeItem === 'users'}
              onClick={this.handleItemClick}
            />
            <Menu.Item
              name='drivers'
              active={activeItem === 'drivers'}
              onClick={this.handleItemClick}
            />
            <Menu.Item
              name='rides'
              active={activeItem === 'rides'}
              onClick={this.handleItemClick}
            />
            <Menu.Item
              name='payments'
              active={activeItem === 'payments'}
              onClick={this.handleItemClick}
            />
            <Menu.Item
              name='vistors'
              active={activeItem === 'vistors'}
              onClick={this.handleItemClick}
            />
            <Menu.Menu position='right'>
              <Menu.Item>
                <Input icon='search' placeholder='Search...' />
              </Menu.Item>
            </Menu.Menu>
          </Menu>
  
          <Segment>
            {this.state.activeItem === 'users' ? <Users></Users> : ''}
            {this.state.activeItem === 'drivers' ? <Drivers></Drivers> : ''}
            {this.state.activeItem === 'payments' ? <DriverPayments></DriverPayments> : ''}
            {this.state.activeItem === 'rides' ? <Rides></Rides> : ''}
          </Segment>
        </div>
      )
    }
}
export default Admin;