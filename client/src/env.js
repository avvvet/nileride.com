'use strict';

const env = {
  ROUTING_SERVICE: 'https://nileride.com/route/v1',
  //ROUTING_SERVICE: 'http://localhost:5000/route/v1',
  LOCATION_ACCURACY: 3,
  RIDE_PER_KM: 10,
  RIDE_STARTING_PAYMENT: 50,
  DRIVER_PAYMENT_MIN_LIMIT : 100
};
module.exports = env;