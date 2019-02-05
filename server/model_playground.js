const models = require('./models');
const a = () => {
    console.log(777);
}

const test = () => {
  //  var body = _.pick(req.body, ['ride_id','driver_id', 'rating']);
    var body = {
        ride_id : 3,
        driver_id : 7,
        rating: 5
    }
    console.log('tessssssssssssssssst', body);
    
    var sequelize = models.sequelize;
    
    return sequelize.transaction(function (t) {
        return models.riderequests.findOne({
             where: {id: body.ride_id, status: 7777 }, transaction: t}
        ).then(r => {
            if(r){
                return models.riderequests.update(
                    { status: 777 },
                    { where: { id: body.ride_id, status: 7777}, transaction: t } 
                  ).then(result => {
                     if(result[0]===1) {
                         console.log("restuuuuuuuu", result[0]);
                        return models.ratings.create(
                               body,
                              {transaction: t}
                            ).then((rating) => { 
                                console.log("yyyyyyyyyy", rating);
                               return rating;
                            });
                     } else {
                         throw new Error('ride not found after update');
                     }
                  }).catch(err => {
                    return err;
                  });
            } else {
                throw new Error('Transaction driver not updated');
            }
        })
      }).then(function (result) {
          res.send(result);
      }).catch(function (err) {

          console.log(err);
       
      });
}

test();
