const Sequelize=require('sequelize');
const sequelize=require('../utility/database');

const FAQ=sequelize.define('faq',{
    id:{
        type:Sequelize.INTEGER,
        autoIncrement:true,
        allowNull:false,
        primaryKey:true
    },
    question:{
        type:Sequelize.STRING,
        allowNull:false
    },
    answer:{
        type:Sequelize.STRING,
        allowNull:false
    }
});
module.exports=FAQ;