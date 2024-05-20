const Sequelize=require('sequelize');
const sequelize=require('../utility/database');

const User=sequelize.define('user',{
    id:{
        type:Sequelize.INTEGER,
        autoIncrement:true,
        allowNull:false,
        primaryKey:true
    },
    name:{
        type:Sequelize.STRING,
        allowNull:false
    },
    email:{
        type:Sequelize.STRING,
        allowNull:false,
    },
    password:{
        type:Sequelize.STRING,
        allowNull:true
    },
    resetToken:{
        type:Sequelize.STRING
    },
    resetTokenExpiration:{
        type:Sequelize.DATE
    },
    isAdmin:{
        type:Sequelize.BOOLEAN,
        default:false
    }
});

module.exports=User;