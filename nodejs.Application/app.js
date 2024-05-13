
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



let _user;
sequelize
// .sync({force:true})
.sync()
.then(() => {
    // Tüm kullanıcıları getir
    User.findAll()
        .then(users => {
            // Her bir kullanıcı için işlemleri gerçekleştir
            users.forEach(user => {
                user.getCart()
                    .then(cart => {
                        if (!cart) {
                            return user.createCart();
                        }
                        return cart;
                    })
                    .then(() => {
                        // Kullanıcının orders tablosunda siparişleri olup olmadığını kontrol et
                        return user.countOrders();
                    })
                    .then(orderCount => {
                        if (orderCount === 0) {
                            // Eğer sipariş yoksa örnek siparişler oluştur
                            return user.createOrder();
                        }
                    })
            });
        });
}).catch((err)=>{
    console.log(err);
});

app.listen(3000 , ()=>{
    console.log('listening on port 3000');
})