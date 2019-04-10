const models = require('./models');
const sharp = require('sharp');
const path = require('path');
const assets_path = path.join(__dirname, '../client/public/assets/profile');

    models.drivers.findAll({ 
        where: {verified: 1, hasProfile : 1},
        raw : true
      }).then(_drivers => {
        _drivers.map(driver => {
            let inputFile = assets_path + "/driver/" + driver.profile;
            let outputFile = assets_path + "/driver_img/" + driver.profile;
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