const models = require('./models');

const driver = models.drivers.build({
    fistName: 'Nati',
    middleName: 'Sahle',
    lastName: 'bashanka',
    email: 'natimancloud@gmail.com',
    mobile: '0911292929',
    plateNo: 'A78343'
});

driver.save().then(() => {
    console.log('saved');
})
