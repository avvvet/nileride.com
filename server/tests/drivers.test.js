const expect = require('expect');

var Drivers = require('../models/drivers');

    describe('Drivers', () => {

        it('should add new driver', () => {
            var drivers = new Drivers();
            var driver = {
                id: '7070',
                firstName: 'Awet',
                middleName: 'Tsegazeab',
                lastName: 'Gebreamlak',
                dob: '1979'
            };
            var resDriver = drivers.addDriver(driver.id, driver.firstName, driver.middleName, driver.lastName, driver.dob);

            expect(drivers.drivers).toEqual([driver]);
    });

});