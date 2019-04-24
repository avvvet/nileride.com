import React, { Component } from 'react';
import { render } from 'react-dom';
import { Grid, Message, Button} from 'semantic-ui-react'

class EndRide extends Component {
    
    _yes = (e) => {
        document.getElementById('div-notification-1').style.visibility = 'hidden';
        render('',document.getElementById('div-notification-1'));
    }

    timeConvert = (n) => {
        var num = n;
        var hours = (num / 3600);
        var rhours = Math.floor(hours);
        var minutes = (hours - rhours) * 60;
        var rminutes = Math.round(minutes);
        
        var hDisplay = rhours > 0 ? rhours + " hr" : "";
        var mDisplay = rminutes > 0 ? rminutes + " min" : "";
        return hDisplay + mDisplay; 
    }

    render(){
        return(
            <div>
                <Message positive>
                 <Message.Header> ጉዞው አልቅዋል </Message.Header>
                    <p>
                        ማስታወሻ ፡ ተሳፋሪውን ያወረዱበት ቦታ online ሆነው 
                        ጉዞው አልቅዋል መመረጥ አለበት።
                    </p>

                    <p>
                    <Grid container columns={3} centered>
                    <Grid.Row>
                        <Grid.Column mobile={4} tablet={4} computer={4} textAlign="center">
                            <h3>{this.props.final_ride.final_price}</h3> ብር
                        </Grid.Column>
                        <Grid.Column mobile={4} tablet={4} computer={4} textAlign="center">
                           <h3>{this.props.final_ride.final_distance}</h3>ኪ/ሜ
                        </Grid.Column>
                        <Grid.Column mobile={4} tablet={4} computer={4} textAlign="center">
                          <h3>{this.timeConvert(Number.parseInt(this.props.final_ride.final_time))} </h3>
                        </Grid.Column>
                    </Grid.Row>
                    
                    <Grid.Row>
                      <Grid.Column mobile={16} tablet={16} computer={16}>
                       <Button className="btn_accept_ride" size="small" color="green" onClick={(e) => this._yes(e)}  bsSize="large" fluid>ቀጥል</Button>
                      </Grid.Column>
                    </Grid.Row>
                    </Grid>   
                    </p>
                </Message>
            </div>
        );
    }
}
export default EndRide;