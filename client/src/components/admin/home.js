import React, { Component } from 'react';
import L from 'leaflet';
import {NavLink, Redirect} from 'react-router-dom';
import { Grid, Card} from 'semantic-ui-react';

class Home extends Component {
    constructor() {
        super();
        this.state = {
            activeItem: 'home',
            payment : {
                amount : 1200000,
                charge : 700000,
                paid : 8000000,
                remain : 120000
            } 

        }
    }
    
    countUser = (users) => {
       const data = 
            <Card>
                <Card.Content header='Users' />
                <Card.Content description={users} />
            </Card>;
            return data;
    } 

    countDrivers = (drivers) => {
        const data = 
             <Card>
                 <Card.Content header='Drivers' />
                 <Card.Content description={drivers} />
             </Card>;
             return data;
     } 

     showPayment = (payment) => {
        const data = 
             <Card>
                 <Card.Content header='Payment' />
                 <Card.Content description={'amount : ' + payment.amount} />
                 <Card.Content description={'charge : ' + payment.charge} />
                 <Card.Content description={'amount : ' + payment.paid} />
                 <Card.Content description={'remain : ' + payment.remain} />

             </Card>;
             return data;
     } 
  
    render() {  
      return (
        <div>
          <Grid container columns={2}>
              <Grid.Row>
                  <Grid.Column>
                      {this.countUser(77000)}
                  </Grid.Column>
                  <Grid.Column>
                      {this.countDrivers(11000)}
                  </Grid.Column>
              </Grid.Row>

              <Grid.Row>
                  <Grid.Column>
                      {this.showPayment(this.state.payment)}
                  </Grid.Column>
              </Grid.Row>
          </Grid>
        </div>
      )
    }
}
export default Home;