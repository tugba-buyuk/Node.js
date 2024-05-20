const Sequelize=require('sequelize');
const sequelize=require('../utility/database');

const City=sequelize.define('city',{
    id:{
        type:Sequelize.INTEGER,
        autoIncrement:true,
        allowNull:false,
        primaryKey:true
    },
    name:{
        type:Sequelize.STRING,
    }
});

module.exports=City;
