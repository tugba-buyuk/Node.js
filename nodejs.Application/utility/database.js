const Sequelize = require('sequelize');

const sequelize=new Sequelize('node-app','root','MySQL123', {
    dialect:'mysql',
    host:'localhost'
});

module.exports=sequelize;