import React, { Component } from 'react';
import L from 'leaflet';
import {NavLink, Redirect} from 'react-router-dom';
import {Header ,Grid, Card, Label} from 'semantic-ui-react';
import $ from 'jquery';

class Home extends Component {
    constructor() {
        super();
        this.state = {
            count_drivers : 0,
            count_users : 0,
            payment : {
                amount : 0,
                charge : 0,
                paid : 0,
                remain : 0
            } 

        }
    }

    componentDidMount(){
        this.getDriversCount();
        this.getUsersCount();
        this.getPaymentsCount();
    }

    getUsersCount = () => {
        //$('.btn_apply').addClass("loading");
        var data = {};
        $.ajax({ 
            type:"POST",
            url:"/admin/users/count",
            data: JSON.stringify(data), 
            contentType: "application/json",
            success: function(users, textStatus, jqXHR) {
              //$('.btn_apply').removeClass("loading");
              if(users.length > 0) {
                const data = users.map((user) => {
                    return user.total_users;
                });
                this.setState({
                  count_users : data[0]
                });  
              }
            }.bind(this),
            error: function(xhr, status, err) {
                //$('.btn_apply').removeClass("loading");
                console.error(xhr, status, err.toString());
            }.bind(this)
        });  
    }

    getDriversCount = () => {
        //$('.btn_apply').addClass("loading");
        var data = {};
        $.ajax({ 
            type:"POST",
            url:"/admin/drivers/count",
            data: JSON.stringify(data), 
            contentType: "application/json",
            success: function(drivers, textStatus, jqXHR) {
              //$('.btn_apply').removeClass("loading");
              if(drivers.length > 0) {
                const data = drivers.map((driver) => {
                    return driver.total_drivers;
              });
              this.setState({
                count_drivers : data[0]
              });  
              }
            }.bind(this),
            error: function(xhr, status, err) {
                //$('.btn_apply').removeClass("loading");
                console.error(xhr, status, err.toString());
            }.bind(this)
        });  
    }

    getPaymentsCount = () => {
        //$('.btn_apply').addClass("loading");
        var data = {};
        $.ajax({ 
            type:"POST",
            url:"/admin/payments/count",
            data: JSON.stringify(data), 
            contentType: "application/json",
            success: function(payments, textStatus, jqXHR) {
              //$('.btn_apply').removeClass("loading");
              if(payments.length > 0) {
                const data = payments.map((payment) => {
                   var payment = {
                        amount : payment.amount,
                        charge : payment.charge_cr,
                        paid : payment.charge_dr,
                        remain : payment.charge
                    } 
                    return payment;
              });
              console.log(data);
              this.setState({
                payment : data[0]
              });  
              }
            }.bind(this),
            error: function(xhr, status, err) {
                //$('.btn_apply').removeClass("loading");
                console.error(xhr, status, err.toString());
            }.bind(this)
        });  
    }
    
    countUsers = (count) => {
        const data = 
             <Card color="grey">
                 <Card.Content header='Users' />
                 <Card.Content description textAlign="center">
                   <Label size="huge" color="olive" circular>{count}</Label>
                 </Card.Content>
                 <Card.Content extra>
                   verifed : has profile
                 </Card.Content>
             </Card>;
             return data;
     } 

    countDrivers = (count) => {
        const data = 
             <Card>
                 <Card.Content header='Drivers' />
                 <Card.Content description textAlign="center"> 
                   <Label size="huge" color="orange" circular>{count}</Label>
                 </Card.Content>
                 <Card.Content extra>
                   verifed : has profile : car registered
                 </Card.Content>
             </Card>;
             return data;
     } 

     showPayment = (payment) => {
        const data = 
             <Card>
                 <Card.Content header='Payments' />
                 <Card.Content description>
                  <Label size="medium" color="orange" tag>{'Total Work : ' + payment.amount}</Label>
                 </Card.Content>
                 <Card.Content description textAlign='center'>
                  <Label size="medium" color="yellow" tag>{'charge : ' + payment.charge}</Label>
                 </Card.Content>
                 <Card.Content description>
                  <Label size="medium" color="green" tag>{'paid : ' + payment.paid}</Label>
                 </Card.Content>
                 <Card.Content description>
                  <Label size="medium" color="olive" tag>{'remain : ' + payment.remain}</Label>
                 </Card.Content>
                 <Card.Content extra>
                  all payment summary
                 </Card.Content>
             </Card>;
             return data;
    } 
  
    render() {  
      return (
        <div>
          <Grid container columns={3}>
              <Grid.Row>
                  <Grid.Column>
                      {this.countUsers(this.state.count_users)}
                  </Grid.Column>
                  <Grid.Column>
                      {this.countDrivers(this.state.count_drivers)}
                  </Grid.Column>
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