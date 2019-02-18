import React, { Component } from 'react';
import { render } from 'react-dom';
import {Grid, Button, Accordion, Icon, Label} from 'semantic-ui-react';

class Faq extends Component {
    constructor() {
       super();
       this.state = {
           activeIndex: null
       }
    }

    handleClick = (e, titleProps) => {
      const { index } = titleProps
      const { activeIndex } = this.state
      const newIndex = activeIndex === index ? -1 : index
  
      this.setState({ activeIndex: newIndex })
    }

    _hide = (e) => {
        document.getElementById('div-branch').style.visibility = 'visible';
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
    
            <Accordion.Title active={activeIndex === 2} index={2} onClick={this.handleClick}>
              <Icon name='dropdown' />
              <Label>በሹፌርነት ለመስራት የት እመዘገባለሁ ?</Label>
            </Accordion.Title>
            <Accordion.Content active={activeIndex === 2}>
              <p>            
                ባሉበት ቦታ ሆነው nileride.com ድረገጽን በስልኮ በቀላሉ በመክፈት > ሹፌር የሚለውን መምረጥ > 
                በመቀጠልም አዲስ ሹፌር ምዝገባ የሚለውን መምረጥ > የሚመጣውን ፎርም መሙላት።
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

            <Accordion.Title active={activeIndex === 4} index={4} onClick={this.handleClick}>
              <Icon name='dropdown' />
              <Label>ለመመዝገብ ክፍያው ምን ያህል ነው ?</Label>
            </Accordion.Title>
            <Accordion.Content active={activeIndex === 4}>
              <p>            
              በሹፊርነት ተመዝግቦ ለመስራት በቅድምያ የሚከፈል ክፍያ የለም። 
              </p>
            </Accordion.Content>   

            <Accordion.Title active={activeIndex === 5} index={5} onClick={this.handleClick}>
              <Icon name='dropdown' />
              <Label>የጉዞ ደህንነት እንዴት ይጠበቃል ?</Label>
            </Accordion.Title>
            <Accordion.Content active={activeIndex === 5}>
              <p>            
              ተሳፍሪ እና ሹፊር በምዝገባ ወቀት ስልካቸውን እና ፎቶ ለ nileride.com ያስመዘግባሉ። በዚህ መሰረት ሲስተሙ በተመዘገበው ስልክ
              እንደሚኙ አስቀድሞ ያረጋግጣል። በጉዞ ወቅት ለሚደርስ ያለመከባበር ጥፍት ካለማስጥንቀቅያ nileride.com በፍጥነት ከሲተሙ ላይ ሹፊሩም ተሳፋሪውም
              በቀጣይነት እንዳይጥቀሙ ይሰርዛል።  
              </p>
            </Accordion.Content>          

          </Accordion>
         
          <div className="div-fag-cancel" id="div-fag-cancel"><Button color="green" onClick={(e) => this._hide(e)} fluid>CANCEL</Button></div>
          </div>
          
        )
      }
}
export default Faq;