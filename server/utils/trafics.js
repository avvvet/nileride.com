const Sequelize = require('sequelize');
const models = require('../models');
var _ = require('lodash');
const env = require('../../env');

const add_trafic = (trafic_type) => {
    models.trafics.create(trafic_type).then( (trafic) => {
          if(trafic){
              console.log('trafic saved', trafic);
          }
    })
}

const get_trafic = async () => {
    models.trafics.findAll({
        attributes: ['trafic_type',
                     [Sequelize.literal(`DATE("createdAt")`), 'date'],
                    [Sequelize.fn('count', Sequelize.col('id')), 'trafic_count']
        ],
        raw: true,
        group: ['date', 'trafic_type']
    }).then(trafic => {
        console.log('Jesus', trafic);
        return trafic;
    })
}

module.exports = {add_trafic, get_trafic};