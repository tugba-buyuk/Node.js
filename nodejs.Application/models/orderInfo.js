const Sequelize=require('sequelize');
const sequelize=require('../utility/database');

const OrderInfo=sequelize.define('orderInfo',{
    id:{
        type:Sequelize.INTEGER,
        autoIncrement:true,
        allowNull:false,
        primaryKey:true
    },
    orderIdNumber:{
        type:Sequelize.STRING
    },
    orderUserName:{
        type:Sequelize.STRING
    },
    orderUserSurname:{
        type:Sequelize.STRING
    },
    orderUserEmail:{
        type:Sequelize.STRING
    },
    orderUserPhone:{
        type:Sequelize.STRING
    },
    orderUserCountry:{
        type:Sequelize.STRING
    },
    orderUserCity:{
        type:Sequelize.STRING
    },
    orderUserDistrict:{
        type:Sequelize.STRING
    },
    orderUserFullAdress:{
        type:Sequelize.STRING
    }
    
});
module.exports=OrderInfo;