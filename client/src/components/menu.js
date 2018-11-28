import React, {Component} from 'react';
import {NavLink} from 'react-router-dom';
import {Nav, Navbar, NavItem , Image, Button} from 'react-bootstrap';
  
class Menu extends Component {
    
    render()
    {
        return(
            <Navbar>
            <Navbar.Toggle></Navbar.Toggle>
            <Navbar.Header>
                <Navbar.Brand>
                  <Image src="/assets/awet-ride-m.png" height={45}></Image>  
                </Navbar.Brand>
                <Navbar.Brand>
                <a href="">awet-ride</a>
                </Navbar.Brand>
            </Navbar.Header>
           <Navbar.Collapse >
            <Nav>
            <NavItem>
                <NavLink to="/">Home</NavLink>
                </NavItem>
                <NavItem>
                <NavLink to="/map">Map</NavLink>
                </NavItem>
                <NavItem>
                <NavLink to="/about">About</NavLink>
                </NavItem>
                <NavItem>
                <NavLink to="/contact">Contact</NavLink>
                </NavItem>
            </Nav>

            <Nav pullRight>
            <NavItem eventKey={1} href="#">
               
            </NavItem>
            <NavItem eventKey={2} href="#">
             <Button bsSize="small">Sign in</Button>
            </NavItem>
            </Nav>

            </Navbar.Collapse>
            </Navbar>
        );
    }
}
export default Menu;