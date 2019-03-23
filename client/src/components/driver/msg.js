import React, { Component } from 'react';
import $ from 'jquery';
import { Grid, Message, List, Label , Header, Button, Image} from 'semantic-ui-react'
import {NavLink, Redirect} from 'react-router-dom';

class Msg extends Component {
    componentDidMount(){
        this.add_trafic('Message');
    }

    add_trafic = (trafic_type) => {
        var data = {
            trafic_type : trafic_type, 
        };
    
        $.ajax({ 
            type:"POST",
            url:"/admin/add_trafic",
            data: JSON.stringify(data), 
            contentType: "application/json",
            success: function(data, textStatus, jqXHR) {
                console.log('trafic', data);
            }.bind(this),
            error: function(xhr, status, err) {
                console.error("erroorror", err.toString());
            }.bind(this)
        });  
    }

    traficLike = (e) => {
        this.add_trafic('Message-like');
    }
    render(){
        return(
            <div>
                <Grid container columns={1}>
                     <Grid.Row>     
                        <Grid.Column >
                            <Message>
                            <Header>ከመጀመራችን በፊት ፡ ሰኞ የሙከራ ግዜ ነው:: </Header> 
                            <p>
                            <List as='ol'>
                                <List.Item as='li' value='*'>
                                የዚህ ዓላማው ፡ ስራ ከመጀመሩ በፈት ሁሉም ሹፊሮችን አስቀድሞ በሲስተሙ ላይ ዝግጁ ለማድረግ ነው፡፡ 
                                </List.Item>
                                <List.Item as='li' value='*'>
                                የተለመደ ዕለተዊ እንቅስቃሴዎን እያደረጉ ሰኞ ፡ ከጥዋት 2 ሰዓት ጀምረው  
                                nileride.com በስልኮ በመክፈት ፡ የስልክ ቁጥሮን እና የሚሲጥር ኮዶን አስገብተው ፡ 
                                ወደ ሲስተሙ ይግቡ። በካርታው ላይ ፡ እርሶ ያሉበት ቦታ ጋር ፡ የመኪና ምልክት ካዩ ፡  
                                ሲስተሙ እንደተከፈተ ይተዎት። የስልኮ ድምጽ አለመጥፋቱን ያረጋግጡ። oneline ይሁኑ። 
                                (ሌላ ነገር መክፈት ይችላሉ ፡ ነገር ግን  የተከፈተውን nileride.com ግጽ እይዝጉት)
                                </List.Item>
                                <List.Item as='li' value='*'>
                                በዚህ የሙከራ ቀን ለሁሉም ሹፈሮች ተራ በተራ አንድ የሙከራ ሥራ እንደተሳፍሪ ሆነን እንልካለን ። ሥራውን ከተቀበሉ ሙከራውን ጨርሰዋል።  የሹፊር አጠቃቀም መመርይ እስካሁን ካላነበቡ ፡ እባኮትን ያንብቡ። 
                                </List.Item>
                                <List.Item as='li' value='*'>
                                አልፈው አልፈው  የተከፈተውን nileride.com ግጽ ይክፈቱ ፡ ቦታ ቀይረው ከሆነ 
                                የ እርሶን የመኪና ምልክት ካርታው ላይ ቦታ መቀየሩን ያረጋግጡ። 
                                ካስፈለገ ኢንተርኔት እየሰራ መሆኑን ለማረጋገጥ የተከፈተውን ግጽ Refresh ማድረግ። 
                                </List.Item>
                            </List>
                            </p>
                            
                            </Message>
                                
                            <Message>
                            <p>
                                <List as='ol'>
                                <List.Item as='li' value='*'>
                                ስልኮ ለ 8 ሰዓት online በሚሆንበት ወቀት ፡ ሌላ ነገር እስካልከፈቱ ድረስ ፡ ፍጆታው ከ 5 – 7 ብር መብለጥ የለበትም፡፡ ይህ ግን ካልሆነ እባኮትን ስልኮ ከበስተጀርባ ኢንተርኒት እየተጠቀመ በመሆኑ ፡ የማይጠቀሙባቸውን ሶፍትዎች ይጥፉ። 
                                </List.Item>

                                <List.Item as='li' value='*'>
                                በተጨማሪ ይህንን ያስተካክሉ settings > Apps > Mange Apps > All Apps > Software ወይም System Update > የሚለውን  ይፈልጉ > Force Stop ወይም Turn Off ወይም Disable ያድርጉት፡ 
                                </List.Item>
                                </List>
                                </p>
                                
                            </Message>
                        </Grid.Column>
                    </Grid.Row>
                    <Grid.Row>
                        <Grid.Column>
                        <Label color="olive">
                                በቀጣይነት ሥራ የሚጀመርበትን ቀን በአጭር የጽሁፍ መልዕክት ለሁላቹም እንልካለን ። ይጠብቁ ። 
                                </Label> 
                        </Grid.Column>
                    </Grid.Row>
                    <Grid.Row>
                        <Grid.Column>
                          <Button className="btn_like"  as={NavLink} to='/' content='አንብቢው ተረድቻለሁ' icon='like' labelPosition='right'  color='green' size='large' onClick={(e) => this.traficLike(e)} fluid></Button>
                        </Grid.Column>
                    </Grid.Row>
                    <Grid.Row>
                        <Grid.Column textAlign="center">
                        <Image src='/assets/nile_ride_logo_blue.png' height={75} centered></Image> 
                        <Label color="green" pointing="above">ከዓለም ረዥሙ ወንዝ</Label>
                        </Grid.Column>
                    </Grid.Row>
                </Grid>
                
            </div>
        );
    }
}
export default Msg;