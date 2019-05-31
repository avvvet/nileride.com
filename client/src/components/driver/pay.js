import React, { Component } from 'react';
import { render } from 'react-dom';
import { Grid, Message, Button} from 'semantic-ui-react'
import $ from 'jquery';

class Pay extends Component {

    _paid = (e) => {
        if (window.confirm('እርግጠኛ ከፍለዋል ?')) {
            var data = {
                amount : this.props.charge,
                driver_id : this.props.driver_id,
                first_name : this.props.first_name,
                mobile : this.props.mobile
            }
            $('.btn_pay').addClass("loading");
            $.ajax({ 
                type:"POST",
                url:"/driver/pay",
                data: JSON.stringify(data), 
                contentType: "application/json",
                success: function(data, textStatus, jqXHR) {
                    if(data){
                        document.getElementById('pay').style.visibility = 'hidden';
                        render('',document.getElementById('pay'));
                    } else {
                        $('.btn_pay').removeClass("loading");
                    }
                }.bind(this),
                error: function(xhr, status, err) {
                    $('.btn_pay').removeClass("loading");
                }.bind(this)
            });  
        } else {
            //$('.'+ride_id).removeClass("loading");
        }   
    }

    render(){
        return(
            <div>
                <Message positive>
                 <Message.Header> ክፍያ nileride.com</Message.Header>
                    <p>
                        እባኮትን <strong>{this.props.charge}</strong> ብር በሚከተለው ባንክ ቁጥር ይክፈሉ። 
                        United Bank , Ac.No 1200416150754010 - AWET TSEGAZEAB
                    </p>

                    <p>
                        <strong>እንደከፈሉ ከፍያለሁ የሚለውን ይጫኑ እናመሰግናለን !</strong>። እባኮትን ሳይከፍሉ እንዳይጫኑ
                    </p>
                    
                    <p>
                    <Grid container columns={1} centered>
                    <Grid.Row>
                      <Grid.Column mobile={16} tablet={16} computer={16}>
                       <Button  className="btn_pay" size="small"  content='ከፍያለሁ' color="green" onClick={(e) => this._paid(e)}  bsSize="large"  icon='right arrow' labelPosition='right' fluid/>
                      </Grid.Column>
                    </Grid.Row>
                    </Grid>   
                    </p>
                </Message>
            </div>
        );
    }
}
export default Pay;