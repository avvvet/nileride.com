const models = require('../models');

var setUserVerify = (email,verify_type, user_type, status, callback) => {
    
    var data = {
        email : email,
        verify_type: verify_type,
        user_type: user_type,
        status: status
    }
    console.log('verifcation to be saved ', data);
    var sequelize = models.sequelize;
    return sequelize.transaction(function (t) {
        return models.verifications.update(
            { status: 0 },
            { where: { email: email, status: 1 } } ,
            {transaction: t}
        ).then((result) => {
            if(result){
               var verify = models.verifications.build(data);
               return verify.save().then((r)=> {
                    console.log('saved', r);
                    return r;
                  }, (err) => {
                     console.log('err', err);
                     throw new Error(err);
                  }).catch((e) => {
                      console.log('varification e', e);
                      throw new Error(e);
                  });
            } else {
                throw new Error('old varification update err');
            }
        });
      
      }).then(function (result) {
          console.log('variication trsancation commited   tttttttttttttttttttttttttttttt ', result.dataValues);
          callback(result.dataValues.verification_token);
      }).catch(function (err) {
        console.log('varification trsancation rollback ', err);
      });
};

module.exports = {setUserVerify};