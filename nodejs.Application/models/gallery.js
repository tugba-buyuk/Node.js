const Sequelize=require('sequelize');
const sequelize=require('../utility/database');

const Gallery=sequelize.define('gallery',{
    id:{
        type:Sequelize.INTEGER,
        autoIncrement:true,
        allowNull:false,
        primaryKey:true
    },
    image:{
        type:Sequelize.STRING,
        allowNull:false
    },
    description:{
        type:Sequelize.STRING,
        allowNull:false
    }
});
module.exports=Gallery;