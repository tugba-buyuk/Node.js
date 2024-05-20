// const products = [
//     {id:12345, name:'Apple iPhone 12 128Gb Beyaz',image:'img1.webp', description:'Apple iPhone 12 128Gb Beyaz' , price:30.99900 , categoryid:'1' },
//     {id:12346, name:'Apple iPhone 13 128Gb Mavi',image:'img2.webp', description:'Apple iPhone 13 128Gb Mavi' , price:38.79900 , categoryid:'1' },
//     {id:12347, name:'Apple iPhone 15 128Gb Siyah',image:'img3.webp', description:'Apple iPhone 15 128Gb Siyah' , price:51.89900 , categoryid:'1'},
//     {id:12348, name:'Apple 16” Macbook Pro Apple M3 Pro Chip',image:'img4.webp', description:'Apple 16” Macbook Pro Apple M3 Pro Chip' , price:106.899 , categoryid:'2'},
//     {id:12349, name:'Apple 15” MacBook Air M3 8-Core CPU 10-Core',image:'img5.webp', description:'Apple 15” MacBook Air M3 8-Core CPU 10-Core' , price:66.999 , categoryid:'2'},
//     {id:12458, name:'Apple Macbook Air MGND3TU/A M1',image:'img6.webp', description:'Apple Macbook Air MGND3TU/A M1' , price:28.999 , categoryid:'2'},
//     {id:12459, name:'Siemens WG42A1Z0TR 9 KG 1200 Devir Çamaşır Makinesi',image:'img7.webp', description:'Siemens WG42A1Z0TR 9 KG 1200 Devir Çamaşır Makinesi' , price:22.921 , categoryid:'3'}
// ];

const Sequelize=require('sequelize');
const sequelize=require('../utility/database');

const Product=sequelize.define('products',{
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
    price:{
        type:Sequelize.INTEGER,
        allowNull:false
    },
    image:{
        type:Sequelize.STRING,
        allowNull:false
    },
    description:{
        type:Sequelize.STRING,
        allowNull:true
    }

});

module.exports = Product;

