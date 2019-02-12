import React, { Component } from 'react';
import L from 'leaflet';
import {NavLink, Redirect} from 'react-router-dom';
import { Grid, Image, Button, Input, Menu, Segment} from 'semantic-ui-react';

class Home extends Component {
    constructor() {
        super();
        this.state = {
            activeItem: 'home' 
        }
    }
    
    handleItemClick = (e, { name }) => this.setState({ activeItem: name })
  
    render() {  
      return (
        <div>
          <Grid>
              <Grid.Row>
                  <Grid.Column>
                      
                  </Grid.Column>
              </Grid.Row>
          </Grid>
        </div>
      )
    }
}
export default Home;