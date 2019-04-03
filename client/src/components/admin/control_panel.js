import React, { Component } from 'react';
import L from 'leaflet';
import {NavLink, Redirect} from 'react-router-dom';
import { Grid, Image, Button, Input, Menu, Segment} from 'semantic-ui-react';
import Users from './users';
import Drivers from './drivers';
import DriversWithNoImage from './drivers_no_img';
import DriverPayments from './driver_payments';
import Rides from './rides';
import RidesWithNoImage from './rides_no_img';
import Home from './home';
import Trafics from './trafics';

class ControlPanel extends Component {
    constructor() {
        super();
        this.state = {
            activeItem: 'home',
            auth : sessionStorage.getItem("_auth_admin")
        }
    }

    handleItemClick = (e, { name }) => this.setState({ activeItem: name })
  
    render() {
      console.log('check', this.state.auth);
      if(!this.state.auth) {
        return <Redirect to='/admin' />
      }

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
              name='drivers*'
              active={activeItem === 'drivers*'}
              onClick={this.handleItemClick}
            />
            <Menu.Item
              name='rides*'
              active={activeItem === 'rides*'}
              onClick={this.handleItemClick}
            />
            <Menu.Item
              name='payments'
              active={activeItem === 'payments'}
              onClick={this.handleItemClick}
            />
            <Menu.Item
              name='trafics'
              active={activeItem === 'trafics'}
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
          </Menu>
  
          <Segment>
            {this.state.activeItem === 'home' ? <Home></Home> : ''}
            {this.state.activeItem === 'users' ? <Users></Users> : ''}
            {this.state.activeItem === 'drivers*' ? <DriversWithNoImage></DriversWithNoImage> : ''}
            {this.state.activeItem === 'rides*' ? <RidesWithNoImage></RidesWithNoImage> : ''}
            {this.state.activeItem === 'trafics' ? <Trafics></Trafics> : ''}
            {this.state.activeItem === 'drivers' ? <Drivers></Drivers> : ''}
            {this.state.activeItem === 'rides' ? <Rides></Rides> : ''}
            {this.state.activeItem === 'payments' ? <DriverPayments></DriverPayments> : ''}
          </Segment>
        </div>
      )
    }
}
export default ControlPanel;