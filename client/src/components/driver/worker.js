export default () => {
    self.addEventListener('message', e => { // eslint-disable-line no-restricted-globals
        if (!e) return;
        let msg = e.data;

    
        console.log('yello', msg);
        postMessage('Thank you jesus' + msg);
    })
}