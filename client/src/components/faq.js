import React, { Component } from 'react';
import { render } from 'react-dom';
import {Grid, Button, Accordion, Icon, Label} from 'semantic-ui-react';
import $ from 'jquery';

class Faq extends Component {
    constructor() {
       super();
       this.state = {
           activeIndex: null
       }
    }

    componentDidMount() {
      this.add_trafic('faq');
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

    handleClick = (e, titleProps) => {
      const { index } = titleProps
      const { activeIndex } = this.state
      const newIndex = activeIndex === index ? -1 : index
  
      this.setState({ activeIndex: newIndex })
    }

    _hide = (e) => {
      document.getElementById('user-info').style.visibility = 'visible';
      document.getElementById('user-manual').style.visibility = 'visible';
      document.getElementById('driver-page').style.visibility = 'visible';
      document.getElementById('div-logo-user').style.visibility = 'visible';
      document.getElementById('faq-page').style.visibility = 'visible';
      render('',document.getElementById('div-faq-txt'));
    }
    
    render() {
        const { activeIndex } = this.state
    
        return (
          <div>
          <Accordion fluid styled>
            <Accordion.Title active={activeIndex === 0} index={0} onClick={this.handleClick}>
              <Icon name='dropdown' />
              <Label>ናይል ራይድ ሥራ ምንድን ነው ?</Label>
            </Accordion.Title>
            <Accordion.Content active={activeIndex === 0}>
              <p>
              ተሳፍሪን እና የመኪና ሹፌርን በቀላሉ ካለ ሰው ጣልቃ ገብነት እንዲገናኙ የሚያደርግ ነው። 
              ይህም ምንም ዓይነት ሶፍትዌር መጫን ሳያስፈልግ   nileride.com ድረገጽን በስልኮ በመክፈት ብቻ ነው።
              ሲስተሙ የጉዞን ዋጋ በግልጽ ለተሳፋሪ አስቀድሞ የሚያሳውቅ እና ለተሳፋሪው የሚቀርበውን ሹፊር በራሱ ቅርበቱን 
              ለክቶ የጉዞ ጥያቄውን ያቀርባል።  
              </p>

              <p>
              የናይል ራይድ ሲስተም የሚያሰላው የጉዙ ዋጋ የ 33 % የዋጋ ቅናሽ  አለው። ሲስተሙ ላይ ያረጋግጡ። 
              ይህም በ ኪ/ሜ 10 ብር እና ትክክለኛ የጉዞ መንገድ ርዝመት በግልጽ ማስላት ሰለተቻለ ነው። 
              </p>
            </Accordion.Content>
    
            <Accordion.Title active={activeIndex === 1} index={1} onClick={this.handleClick}>
              <Icon name='dropdown' />
              <Label>የስራው ሂደት ምን ይመስላል ?</Label>
            </Accordion.Title>
            <Accordion.Content active={activeIndex === 1}>
              <p>
                ተሳፍሪን እና ሹፊርን የማገናኘት ስራው ሙሉ በሙሉ ካለ ሰው ጣልቃ ገብነት በሲስተሙ የሚሰራ ነው። 
                ተሳፍሪው የሚሄድበትን ቦታ መነሻውን እና መድረሻውን nileride.com ድረገጽ በሚያሳውቅበት ወቅት ፡ ሲስተሙ 
                አስቀድሞ መንገዱ በ ኪ/ሜ  ምን ያህል እንደሆነ ልክቶ በ ኪ/ሜ 10 ብር አባዝቶ ዋጋውን ለተሳፍሪው ይስውቀዋል።
                ተሳፍሪው ዋጋን አውቆ ውሳኒውን እንዳስወቀ ሲስተሙ አጠገቡ ላለ ሹፊር ጥያቄውን ይልክለታል። ሹፊሩም የመጣውን 
                የጉዞ ጥያቄ ዋጋውን ተመልክቶ ፡ ከተስማማ ለሲስተሙ መቀበሉን ይገልጻል።  ሲስተሙም በመቀጠል የተሳፋሪውን ስልክ እና
                የት እንዳለ ለሹፊሩ መረጃውን ያቀብላል ፡ ለተሳፍሪውም የሹፊሩ ስልክ እና ስም ይሳውቃል ። በዚህ መሰረት
                ሹፊሩ ተሳፈሪውን ወደ ጠየቀበት ቦታ ያደርሰዋል ፡ ተሳፍሪም አስቀድሞ ያወቀውን ዋጋ  ብቻ ይከፍላል። 
              </p>
            </Accordion.Content>

            <Accordion.Title active={activeIndex === 7} index={7} onClick={this.handleClick}>
              <Icon name='dropdown' />
              <Label color="green">በተሳፋሪነት የምጠቀመው እንዴት ነው ?</Label>
            </Accordion.Title>
            <Accordion.Content active={activeIndex === 7}>
              <p>
              nileride.com ድረገጽ በስልኮ መክፈት ፡ የሚጠቀሙበት ብራውዘር (chrom, firefox , safari ) የቅርብ ግዜ 
              መሆን አለበት ፡ ካልሆነ አንደገና ይጫኑት። በመቀጠል share location ለሚለው ጥያቄ allow ማለት። 
              "ወዴት መሄድ ይፈልጋሉ ?” የሚለው የቦታ መፈለግያ ሳጥን ውስጥ መሄድ የፈልጉበትን ቦታ ስም ፤ በአቅራብያው የሚገኝ የተዋቀ ስም 
              ወይም ተቀራራቢ የሚታውቅ ስም በአማርኛ ወይም በኢንግሊዘኛ መጻፉ። የቦታውን ስም የያዘ ዝርዝር ይመጣል ፡ ከዝርዝሩ ውስጥ ይምረጡ ።
              </p>
              
              <p> 
              እንደመረጡ ሲስተሙም በካርታው ላይ የመረጡት ቦታ የት እንዳለ ፤ የሚሂድበትን አጭር መንገድ እና የክፍያውን መጠን ይሳዮታል። 
              ካርታው ላይ የተቀመጠውን ምልክት በመግፋት የሚውርዱበትን ቦታ ማስተካከል። 
              </p>

              <p>
              ሲጨርሱ ፡ ሹፌር ጥራ የሚለውን መጫን ፡ ለመቀጠል አዲስ ከሆኑ አዲስ ተሳፋሪ የሚለውን መምረጥ እና አንዲ መመዝገብ። 
              ከዚህ በፊት ተጠቅመው ከነበር ፡ ሲመዘገቡ ያስገቡትን የምባይል ቁጥር እና የመረጡትን የሚስጢር ቁጥር በማስገባት መቀጠል። 
              አሁን ሹፊር ጥራ የሚለው በደጋሚ ይመጣል ይጫኑት ሲስተሙ አጠገቦ ያለ ሹፌር ወዳሉበት ቦታ ይመጣል ፡ ወደ መረጡትም 
              ቦታ አስቀድመው ባወቁት ዋጋ ብቻ ያድርሶታል። 
              </p>

            </Accordion.Content>
    
            <Accordion.Title active={activeIndex === 2} index={2} onClick={this.handleClick}>
              <Icon name='dropdown' />
              <Label color="teal">በሹፌርነት እንዴት እሰራለሁ ?</Label>
            </Accordion.Title>
            <Accordion.Content active={activeIndex === 2}>
              <p>            
                ባሉበት ቦታ ሆነው nileride.com ድረገጽን በስልኮ በቀላሉ በመክፈት > ሹፌር የሚለውን መምረጥ > 
                በመቀጠልም አዲስ ሹፌር ምዝገባ የሚለውን መምረጥ > የሚመጣውን ፎርም ለመጀመርያ ጊዜ አንዴ ብቻ በትክክል ይመዝገቡ።
              </p>
              <p> 
                በምዝገባ ወቅት ያሰገቡትን የሞባይል ቁጥር እና የሚስጢር ኮድ ያስታውሱ። ወደ ሲስተሙ ስራ ለመስራት የሚገቡት ባስመዘገቡት 
                የሞባይል ቁጥር ነው።
               </p> 

               <p>
                  ስራ ለማግኘት ወደ ሲስተሙ መግባት ፡ online በመሆን ሥራ መጠበቅ ። የምባይል ስልኮ ድምጽ አለመጥፋቱን ማረጋገጥ ፡ 
                  ስራ በሚጠብቁበት ወቀት ፡ ሞባይሎን መኪና ውስጥ ፡ ኪሶ ውስጥ ማስቀመጥ ወይም ሊላ ተግባር ማከናውን ይችላሉ ። 
                  ሲስተሙ ሥራ ሲመጣ ድምጽ ያስሞታል። በተውሰን ቆይታ አለመጥፋቱን ወይም online መሆኖን ማረጋገጥ። ሲራ የሚሰሩት
                  በፈለጉት ሥራ ሳዓት ብቻ ነው ። ስራ ካልፈልጉ online አለመሁን ነው።
               </p> 

               <p>
               ለ 9 ሴዓት ሙሉ online ለመሆን ከ 7 ብር ያነስ ፍጆታ ነው የሚኖረው። ነገር ግን ስልኩ ላይ ያሉ ሌሎች
               ሶፍትዌርች እንዳይጠቀሙ መዘጋታቻውን ያረጋግጡ። ስለዚህ online በመሆን ሥራ ይስሩ።
               </p>
               
            </Accordion.Content>

            <Accordion.Title active={activeIndex === 3} index={3} onClick={this.handleClick}>
              <Icon name='dropdown' />
              <Label>ከተመዘገብኩ ብኅላ ያለው ሂደት ምንድን ነው ?</Label>
            </Accordion.Title>
            <Accordion.Content active={activeIndex === 3}>
              <p>            
                በ  nileride.com ድረገጽ ተመዝግበው እንደጨረሱ ፡ ያስመዘገቡት መረጃ እና ስልክ ትክክለኛነት ለማረጋገጥ
                አጭር የጽሁፍ መልዕክት ወደ ስልኮ ይደርሶታል። የደረሶትን ባለ አምስት አሀዝ ቁጥር  nileride.com ድረገጽ
                በሚጠይቀው ቦታ ማስገባት። በቀጣይነት በስልኮ ፎቶ ተነስተው በማያያዝ ምዝገባውን መጨረስ።
              </p>
            </Accordion.Content>

            <Accordion.Title active={activeIndex === 9} index={9} onClick={this.handleClick}>
              <Icon name='dropdown' />
              <Label>ምን ዓይነት መኪና ነው የሚቻለው ?</Label>
            </Accordion.Title>
            <Accordion.Content active={activeIndex === 9}>
              <p>            
                የሚኪናው ዓይነት አራት ሰው ሊይዝ የሚችል መሆን አለበት። መኪኖች ካለሉዩነት መመዝገብ እና በ፣እኩልነት ሥራ ማገኘት ይችላሉ።
                ነገር ግን እንደኛ - አንድ ሹፌር ከተሳፍሪ የሚሰጠው አማካኝ የአስተያየት ኮከብ ነጥብ ከ 4 ካነሰ ሲስተሙ ከአገልግሎት ያስወጣዋል። 
                ሁለተኛ - ሲስተሙ አስልቶ የሚቀርበውን በ ኪ/ሜ 10 ብር ዋጋ መስማማት ። የተሳፋሪ አስተያየት ቅድምያ ይኖረዋል። 
              </p>
            </Accordion.Content>

            <Accordion.Title active={activeIndex === 4} index={4} onClick={this.handleClick}>
              <Icon name='dropdown' />
              <Label>ለመመዝገብ ክፍያ አለው ?</Label>
            </Accordion.Title>
            <Accordion.Content active={activeIndex === 4}>
              <p>            
              በሹፊርነት ወይም በተሳፋሪነት ተመዝግቦ ለመስራት ወይም ለመጠቀም በቅድምያ የሚከፈል ክፍያ የለም። 
              </p>
            </Accordion.Content>   

            <Accordion.Title active={activeIndex === 5} index={5} onClick={this.handleClick}>
              <Icon name='dropdown' />
              <Label>የጉዞ ደህንነት እና ጥራት እንዴት ይጠበቃል ?</Label>
            </Accordion.Title>
            <Accordion.Content active={activeIndex === 5}>
              <p>            
              ተሳፍሪ እና ሹፊር በምዝገባ ወቀት ስልካቸውን እና ፎቶ ለ nileride.com ያስመዘግባሉ። በዚህ መሰረት ሲስተሙ በተመዘገበው ስልክ
              እንደሚገኙ አስቀድሞ ያረጋግጣል። በጉዞ ወቅት ለሚደርስ ያለመከባበር ጥፍት ካለማስጥንቀቅያ nileride.com በፍጥነት ከሲተሙ ላይ ሹፊሩም ተሳፋሪውም
              በቀጣይነት እንዳይጥቀሙ ይሰርዛል።  
              </p>

              <p>
                አንድ ተሳፊሪ ፡ አገልግሎት አግኝቶ የሚፈልገው ቦታ እንደደረሰ ፡ ሲስተሙ  ከ 1 - 5 ነጥብ ያያዘ አስተያያት እንዲሰጥ ይጥይቀዋል። 
                በዚህ መሰረት አንድ ሹፌር በአማካኝ 4 ኮከብ ማግኝነት ካልቻለ ። ሲሰተሙ ያሰወጠዋል። 
              </p>
            </Accordion.Content>   

            <Accordion.Title active={activeIndex === 8} index={8} onClick={this.handleClick}>
              <Icon name='dropdown' />
              <Label>ለተጨማሪ ጥያቄ</Label>
            </Accordion.Title>
            <Accordion.Content active={activeIndex === 8}>
              <p>    
              በዚህ <Label color="purple">የቫይበር</Label> ቁጥር ላይ ያገኙናል ።   <Icon name="chat" color="purple"></Icon>+1 202 424 8308     
              </p>
            </Accordion.Content>            

          </Accordion>
         
          <div className="div-fag-cancel" id="div-fag-cancel"><Button color="green" onClick={(e) => this._hide(e)} fluid>ገጹን ዝጋ</Button></div>
          </div>
          
        )
      }
}
export default Faq;