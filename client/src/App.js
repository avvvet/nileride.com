import React, { Component, Suspense, lazy } from 'react';
import { render } from 'react-dom';
import {BrowserRouter, Route, Switch} from 'react-router-dom';
import {Image, Label} from 'semantic-ui-react'
import './App.css';
import './routing_machine.css';
// import PickUp from './components/pick_up';
// import DriverPage from './components/driver/driver_page';
// import DriverLogin from './components/driver/login';
// import RiderLogin from './components/rider/login';
// import AdminLogin from './components/admin/admin_login';
// import ControlPanel from './components/admin/control_panel';
// import Playground from './components/playground';
// import Notes from './components/driver/note';
// import Msg from './components/driver/msg';
const PickUp = lazy(() => import('./components/pick_up'));
const DriverPage = lazy(() => import('./components/driver/driver_page'));
const DriverLogin = lazy(() => import('./components/driver/login'));
const RiderLogin = lazy(() => import('./components/rider/login'));
const AdminLogin = lazy(() => import('./components/admin/admin_login'));
const ControlPanel = lazy(() => import('./components/admin/control_panel'));
const Playground = lazy(() => import('./components/playground'));
const Notes = lazy(() => import('./components/driver/note'));
const Msg = lazy(() => import('./components/driver/msg'));

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
          <Suspense fallback={<div id="div-boot" className="div-boot">
            <Image src='/assets/nile_ride_logo_blue.png' height={75} centered></Image> 
            <Label color="black" pointing="above">Loading...</Label>
          </div>}>
            <Switch>
                <Route path="/" component={PickUp} exact />
                <Route path="/user/login" component={RiderLogin} exact/>
                <Route path="/user" component={PickUp} exact/>
                <Route path="/driver" component={DriverPage} exact/>
                <Route path="/driver/login" component={DriverLogin} exact/>
                <Route path="/admin" component={AdminLogin} exact />
                <Route path="/admin/control_panel" component={ControlPanel} exact />
                <Route path="/playground" component={Playground} exact />
                <Route path="/notes" component={Notes} exact />
                <Route path="/msg" component={Msg} exact />
            </Switch>
            </Suspense>
          </div>
        </BrowserRouter>  
        
      </div>
    );
  }
}

export default App;