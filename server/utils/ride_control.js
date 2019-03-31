const Sequelize = require('sequelize');
const models = require('../models');
var _ = require('lodash');
var {send_mail_ride_request} = require('./email');
const env = require('../../env');


const ride_control_auto = async () => {
    var sequelize = models.sequelize;
    const Op = Sequelize.Op;

    await sequelize.transaction( async t => {
        return models.riderequests.findAll(
            { 
                where: [sequelize.where(sequelize.fn('TIMESTAMPDIFF', sequelize.literal('SECOND'), sequelize.col('createdAt'), sequelize.fn("now")), {
                    [Op.gt] : env.MISSED_RIDE_DURATION
                }), {status : 1}], 
                transaction: t ,
                raw : true
            }
        ).then(async rides => {
            for(let ride of rides) {
                let body = _.pick(ride, ['user_id','driver_id', 'pickup_latlng', 'dropoff_latlng', 'route_distance', 'route_time', 'route_price', 'status']);
                var p1 = ride.pickup_latlng.coordinates;
                var p2 = ride.dropoff_latlng.coordinates;
                
                var pickup_latlng = `POINT(${p1[0]} ${p2[1]})`;
                var dropoff_latlng = `POINT(${p2[0]} ${p2[1]})`;

                let _pickup_latlng = Sequelize.fn('ST_GeomFromText', pickup_latlng);
                let _dropoff_latlng = Sequelize.fn('ST_GeomFromText', dropoff_latlng);

                body.pickup_latlng = _pickup_latlng;
                body.dropoff_latlng = _dropoff_latlng;
                
                const driver = await getNearestDrivers(body.pickup_latlng);
                if(driver.length > 0) {
                    console.log('$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$', driver);
                    body.driver_id = driver[0].token;
                    return models.riderequests.create(
                        body,
                       {transaction: t}
                     ).then((new_ride) => {
                        if(new_ride) {
                            return models.riderequests.update(
                                { status: 2 },
                                { where: {id : ride.id} , transaction: t} 
                             ).then(r1 => {
                                 //assign this nearest dirver  
                                 return models.drivers.update(
                                    { status: 1 },
                                    { where: {token: driver[0].token, status: 0} , transaction: t} 
                                 ).then(r2 => {
                                     //missed ride
                                    return models.drivers.update(
                                        { status: 2 },
                                        { where: {token: ride.driver_id, status: 1} , transaction: t} 
                                     ).then(r2 => {
                                         return r2;
                                     });
                                 });
                             });
                        } else {
                            throw new Error('t save err');
                        }
                    });
                } else {
                    //no driver for this user ride -> this will update all the user's request status = 22 
                    return models.riderequests.update(
                        { status: 2 },
                        { where: {id : ride.id} , transaction: t} 
                     ).then(r1 => {
                        return models.drivers.update(
                            { status: 2 },
                            { where: {token: ride.driver_id, status: 1} , transaction: t} 
                         ).then(r2 => {
                             return r2;
                         });
                     });
                }
            }
        });
    }).then(function (result) {
        console.log('t: commited');
        return result;
    }).catch(function (err) {
      console.log('t: error', err)
      return err;
    });  
}

const ride_request = async (body) => {
    var sequelize = models.sequelize;
    const Op = Sequelize.Op;
    await sequelize.transaction( async t => {
        const driver = await getNearestDrivers(body.pickup_latlng);
        if(driver.length > 0) {
            console.log('$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$', driver);
            body.driver_id = driver[0].token;
            return models.riderequests.create(
                body,
                {transaction: t}
                ).then((new_ride) => {
                    if(new_ride) {
                        //assign this nearest dirver  
                        return models.drivers.update(
                            { status: 1 },
                            { where: {token: driver[0].token, status: 0} , transaction: t} 
                        ).then(r1 => {
                            return r1
                        });
                    } else {
                        throw new Error('t save err');
                    }
            });
        } else {
            
        }
    }).then(function (result) {
        console.log('t: commited');
        send_mail_ride_request(null, null);
        return result;
    }).catch(function (err) {
      console.log('t: error', err)
      return err;
    });  
    
}

const ride_auto_cancel = () => {
    var sequelize = models.sequelize;
    const Op = Sequelize.Op;
    return sequelize.transaction(function (t) {
        return models.riderequests.findAll(
            { 
                where: [sequelize.where(sequelize.fn('TIMESTAMPDIFF', sequelize.literal('SECOND'), sequelize.Grid.Column('createdAt'), sequelize.fn("now")), {
                    [Op.gt] : 10
                }), {status : 1}], 
                transaction: t ,
                raw : true
            }
        ).then(_requests => {
            if(_requests.length > 0) {
                for(let _request of _requests) {
                    let body = _.pick(_request, ['user_id','driver_id', 'pickup_latlng', 'dropoff_latlng', 'route_distance', 'route_time', 'route_price', 'status']);
                    var p1 = _request.pickup_latlng.coordinates;
                    var p2 = _request.dropoff_latlng.coordinates;
                    
                    var pickup_latlng = `POINT(${p1[0]} ${p2[1]})`;
                    var dropoff_latlng = `POINT(${p2[0]} ${p2[1]})`;
    
                    let _pickup_latlng = Sequelize.fn('ST_GeomFromText', pickup_latlng);
                    let _dropoff_latlng = Sequelize.fn('ST_GeomFromText', dropoff_latlng);
    
                    body.pickup_latlng = _pickup_latlng;
                    body.dropoff_latlng = _dropoff_latlng;
                    
                    let _result = ride_request(body);
                }
            }
            
            return models.riderequests.update(
                { status: 2 },
                { 
                    where: [sequelize.where(sequelize.fn('TIMESTAMPDIFF', sequelize.literal('SECOND'), sequelize.col('createdAt'), sequelize.fn("now")), {
                        [Op.gt] : 10
                    }), {status : 1}], transaction: t
                }
             ).then(r => {
                 console.log('all will pass God is watching', r);
                 if(r){
                    return r;
                 } else {
                    throw new Error('transaction driver status not updated');
                 }
             }); 
        });
    }).then(function (result) {
        console.log('t ride_auto_cancel ok')
        return result;
    }).catch(function (err) {
      return err;
      console.log('trsancation varified rollback ', err);
    });  
}

//ride request my lord you are good 
const ride_request2 = async (user_request) => {
    const drivers = await getNearestDrivers(user_request.pickup_latlng);
    let _r = null;

    await processArray(drivers);
    async function processArray(drivers){
        for(let driver of drivers) {
            user_request.driver_id = driver.token;
            const  _ride = await save_request(driver.token, user_request);
            if(!_.isNull(_ride)) {
                _r =_ride;
                break;
            } 
        }
    }
    
    if(_.isNull(_r)){
       // update_this_request(user_request, 22);  // 2 -> 22 no driver could be assigned for this request
        return null;
    } else {
        return _r;
    }
}

const getNearestDrivers = async (_pickup_latlng) => {
    var sequelize = models.sequelize;
    let drivers = null;
    var distance = Sequelize.fn('ST_Distance_Sphere', Sequelize.literal('currentLocation'), _pickup_latlng);
    const Op = Sequelize.Op;
    await models.drivers.findAll({ 
       attributes: ['token','currentLocation', 'firstName',[Sequelize.fn('ST_Distance_Sphere', Sequelize.literal('currentLocation'), _pickup_latlng),'distance']],
       where: [sequelize.where(distance, {
        [Op.lt] : env.NEAREST_DRIVER_RADIUS
       }), {verified: 1, status: 0, currentLocation: {[Op.ne]: null} }], 
       order: distance,
       limit: 1,
       raw: true,
       logging: console.log
     }).then(_drivers => {
        drivers = _drivers;
     });
     console.log('bashnkaaaaaaaaaaaaaaaa', drivers);
   return drivers;
 }

 const save_request = (nearest_driver_token, user_request) => {  
    var sequelize = models.sequelize;
    return sequelize.transaction({
        isolationLevel: Sequelize.Transaction.ISOLATION_LEVELS.SERIALIZABLE
      },function (t) { 
        return models.riderequests.findOne({
            where : {driver_id: nearest_driver_token, status: 1}, transaction: t,
            order : [
                ['id', 'ASC']
            ]  
            }).then((_ride) => {
                if(_.isNull(_ride)){
                    return models.riderequests.create(
                           user_request,
                          {transaction: t}
                        ).then((ride) => {
                        if(ride) {
                            return models.drivers.update(
                                { status: 1 },
                                { where: {token: nearest_driver_token, status: 0} , transaction: t} 
                             ).then(r => {
                                 return r;
                             });
                        } else {
                            throw new Error('t save err');
                        }
                    })
                } else {
                    return null;
                }
            });
    }).then(function (result) {
        console.log('transaction commited   tttttttttttttttttttttttttttttt ', result);
        return result;
    }).catch(function (err) {
        console.log('transaction rollback ', err);
        return null ;
    });   
}

const update_this_request = (user_request, sts) => {
    var sequelize = models.sequelize;
    return sequelize.transaction(function (t) {
        return models.riderequests.findOne({
            where : {user_id: user_request.user_id, status: 2}, transaction: t 
        }).then( (ride) => {
            if(ride){
              return models.riderequests.update (
                    { status: sts },
                    { where: { user_id: user_request.user_id, status: 2}, transaction: t } ,
                  ).then(result => {
                     return result;
                  }).catch(err => {
                    return err;
                  });
            } else {
                throw new Error('ride not found');
            }
        });
      }).then(function (result) {
          console.log("t committed on no_availblae driver");
          return result;
      }).catch(function (err) {
        console.log("t error on no_available driver", err);
        return null;
      });
}

module.exports = {ride_control_auto, ride_request};
//lord my God thank you - please help me 