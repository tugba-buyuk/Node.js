
const express = require('express');
const session = require('express-session');
const csurf=require('csurf');
const multer=require('multer');
const moment=require('moment');
const MySQLStore = require('express-mysql-session')(session)

const mysqlOptions = {
    host: 'localhost',
    user: 'root',
    password: 'MySQL123',
    database: 'node-app'
  };


const app=express();
const sessionStore = new MySQLStore(mysqlOptions);
const bodyParser=require('body-parser');
const path=require('path');

app.set('view engine','pug');
app.set('views','./views');



const sequelize=require('./utility/database');
const Category=require('./models/category');
const Product=require('./models/product');
const User=require('./models/user');
const Cart=require('./models/cart');
const CartItem=require('./models/cartitem');
const Order=require('./models/order');
const OrderItem=require('./models/orderitem');
const OrderInfo=require('./models/orderInfo');
const City=require('./models/city');
const FAQ=require('./models/faq');



const adminRoutes=require('./routes/admin');
const userRoutes=require('./routes/shop');
const accountRoutes=require('./routes/account');

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, './public/img/');
    },
    filename: function (req, file, cb) {
        cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
    }
});

app.use(bodyParser.urlencoded({extended:false}));
app.use(multer({storage:storage}).single('image'));

app.use(session({
    store: sessionStore,
    secret: 'keyboard cat', 
    resave: false,
    saveUninitialized: false,
    cookie: {
      maxAge: 3600000 
    }
  }));


app.use(express.static(path.join(__dirname,'public')));

app.use((req, res, next) => {
    if (req.session && req.session.user) { 
        const userid = req.session.user.id;
        User.findByPk(userid)
            .then(user => {
                req.user = user;
                next();
            })
            .catch(err => {
                console.error(err); 
            });
    } else {
        req.user = null; 
        next();
    }
});

app.use(csurf());

app.use('/admin',adminRoutes);
app.use(userRoutes);
app.use(accountRoutes);
app.locals.moment = moment;

app.use((req,res)=>{
    res.status(404).render('error-page',{title:'ERROR'});
});

Product.belongsTo(Category,{
    foreignKey:{
        allowNull:false
    }
});
Category.hasMany(Product);

Product.belongsTo(User);
User.hasMany(Product);

User.hasOne(Cart);
Cart.belongsTo(User);

Cart.belongsToMany(Product,{through:CartItem});
Product.belongsToMany(Cart,{through:CartItem});

Order.belongsTo(User);
User.hasMany(Order);

Order.belongsToMany(Product,{through:OrderItem});
Product.belongsToMany(Order,{through:OrderItem});




async function main() {
    let _user;
    try {
        // await sequelize.sync({force:true});
        await sequelize.sync();
        const users = await User.findAll();

        for (const user of users) {
            try {
                let cart = await user.getCart();
                if (!cart) {
                    await user.createCart();
                }

                const orderCount = await user.countOrders();
                if (orderCount === 0) {
                    await user.createOrder();
                }
            } catch (error) {
                console.log("Kullanıcı işlemleri sırasında bir hata oluştu:", error);
            }
        }
    } catch (error) {
        console.log("Veritabanı senkronizasyonu sırasında bir hata oluştu:", error);
    }
}

main();

app.listen(3000 , ()=>{
    console.log('listening on port 3000');
})