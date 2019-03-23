import React, { Component } from 'react';
import $ from 'jquery';
import { Message, List, Label , Header} from 'semantic-ui-react'

class Notes extends Component {
    componentDidMount(){
        this.add_trafic('GPS-note');
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
    render(){
        return(
            <div>
               <Message>
               <Header>በማፕ ላይ ያሉበት ቦታ ማይት እንዲቻል ፡ የሞባይሎን GPS ማብራት አለቦት።</Header> 
               <p>
               <List as='ol'>
                  <List.Item as='li' value='*'>
                  1. ስልኮ samsung  (አንድሮይድ) ከሆነ ፡ GPS  ለማብራት የሚከተለውን ይምረጡ። Settings > More > Location services > Use GPS satellites የሚለውን ራይት ማድረግ። 
                  </List.Item>
                  <List.Item as='li' value='*'>
                  2. ያሎትን ብራውዘር (Firefox , Chrome ወይም ሌላ ከሆነ) የግድ አዲስ እንዲሆን update ወይም install ያድርጉት።
                  </List.Item>
                  <List.Item as='li' value='*'>
                  3. nileride.com በምባይሎ በሚከፍቱበት ወቀት Share your location with nileride.com ? የሚል ተመሳሳይ ጥያቄ ይመጣል ፡ Share የሚለውን ይምረጡ። ካልመረጡ አይሰራሎትም። 
                  </List.Item>
                  <List.Item as='li' value='*'>
                  ተሳስተው Share your location with nileride.com ? ለሚለው ጥያቄ Don’t Share የሚለውን ከመረጡ ፡ የሚቀለው መፍትሄ ብራውዘሩን አንደገና  install ማድረግ ነው ። 
                  </List.Item>
               </List>
               </p>
               
               </Message>
                
               <Message>
               <p>
                <List as='ol'>
                  <List.Item as='li' value='*'>
                    1. ያሎት ስልክ iphone ከሆነ።  GPS  ለማብራት የሚከተለውን ይምረጡ ። Settings > Privacy > Location Services > ምልክቱን በመግፋት እንዲመረጥ ያድርጉት። 
                  </List.Item>

                  <List.Item as='li' value='*'>
                    2. Location Services > ከሚለው ከስር ዝርዝር ውስጥ ፡ Safari Websites የሚለውን ያገኛሉ While Using የሚለውን ይምረጡ።
                  </List.Item>

                  <List.Item as='li' value='*'>
                    3. nileride.com በምባይሎ በሚከፍቱበት ወቀት https://nileride.com Would Like To Use Your Current Location ? የሚል ተመሳሳይ ጥያቄ ይመጣል ፡ OK የሚለውን ይምረጡ። ካልመረጡ አይሰራሎትም።
                  </List.Item>
                </List>
                </p>

                <p>
                 <Label color="green">
                 የሞባይሎ GPS በርቶ ከሆነ ፡ nileride.com ከፍተው የተመዘገቡበትን የሞባይ ቁጥር እና የሚስጢር ኮድ አስገብተው ወደ ሲስተሙ ሲገቡ ፡ በማፖ ላይ የመኪና ምልክት ካዩ ፡ ጨርሰዋል።
                 </Label> 
               </p>
                
               </Message>
 
            </div>
        );
    }
}
export default Notes;