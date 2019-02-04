import React, {Component} from 'react';
import {NavLink} from 'react-router-dom';
import {Nav, Navbar, NavItem , NavDropdown, MenuItem, Image, Button, Badge} from 'react-bootstrap';
  
class DriverMenu extends Component {
    
    render()
    {
        return(
            <Navbar>
            <Navbar.Header>
                <Navbar.Brand>
                <a href="#home">awet</a>
                </Navbar.Brand>
                <Navbar.Toggle />
            </Navbar.Header>
            <Navbar.Collapse>
                <Navbar.Text>
                 Hi Sara !
                </Navbar.Text>
                <Navbar.Text>
                 earning <Badge>42,800.00 birr</Badge>
                </Navbar.Text>
                <Navbar.Text>
                 ride <Badge>170</Badge>
                </Navbar.Text>
                <Navbar.Text pullRight>
                 account <Badge>active</Badge>
                </Navbar.Text>
                <Navbar.Text pullRight>
                 charge <Badge>800 birr</Badge>
                </Navbar.Text>
            </Navbar.Collapse>
            </Navbar>          
        );
    }
}
export default DriverMenu;