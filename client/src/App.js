import React, { Component } from 'react';
import { render } from 'react-dom';
import {BrowserRouter, Route, Switch} from 'react-router-dom';

import Menu from './components/menu';
import PickUp from './components/pick_up';
import DropOff from './components/drop_off';
import DriverLogin from './components/driver/driver_login';
import './App.css';


class App extends React.Component {
  constructor() {
    super()
    this.state = {
      lat: 9.0089,
      lng: 38.7629,
      zoom: 16
    }
  }

  render() {
    const position = [this.state.lat, this.state.lng];
    const positionTwo = [9.0092, 38.7645];
    
    return (

      <div>
        <BrowserRouter>
          <div>
            <Switch>
                <Route path="/" component={PickUp} exact />
                <Route path="/dropoff" component={DropOff} exact/>

                <Route path="/driver" component={DriverLogin} exact/>
            </Switch>
          </div>
        </BrowserRouter>  
        
      </div>
      
    );
  }
}

export default App;