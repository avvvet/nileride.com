const jwt = require('jsonwebtoken');
const models = require('../models');

var authUser = (req, res, next) => {
    var token = req.header('x-auth');
    var decoded;
    
    try {
         decoded = jwt.verify(token, 'JESUSMYHEALER');
         models.users.findOne({ where: {mobile: decoded} }).then(user => {
           if(!user) {
             res.send(401).send();
           }
           next();
         });
     } catch (e) {
       res.status(401).send();
     }
};
module.exports = {authUser};