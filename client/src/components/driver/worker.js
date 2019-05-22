export default () => {
    self.addEventListener('message', e => { // eslint-disable-line no-restricted-globals
        if (!e) return;
        let msg = e.data;
        let current_latlng = e.current_latlng;
        
        
    
        console.log('yello', msg);
        postMessage('Thank you jesus' + msg);
    })
}