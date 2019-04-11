const models = require('./models');
const sharp = require('sharp');
const path = require('path');
const assets_path = path.join(__dirname, '../client/public/assets/profile');

    models.users.findAll({ 
        where: {verified: 1, hasProfile : 1},
        raw : true
      }).then(_users => {
        _users.map(user => {
            let inputFile = assets_path + "/user/" + user.profile;
            let outputFile = assets_path + "/user_img/" + user.profile;
            sharp(inputFile).resize({ height: 100, width: 100, fit : 'cover'}).toFile(outputFile)
            .then(function(newFileInfo) {
             // newFileInfo holds the output file properties
             console.log("Success", newFileInfo);
            })
            .catch(function(err) {
             console.log("Error occured",err);
            });
        });
    });