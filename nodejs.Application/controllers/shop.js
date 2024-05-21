const Product=require('../models/product');
const Category=require('../models/category');
const Blog=require('../models/blog');
const Gallery=require('../models/gallery');
const { Op } = require('sequelize');
const City = require('../models/city');
const stripe = require('stripe')('sk_test_51PGQYHP6uMYivj2gm0vygeGHdeL3MRrsVYC0WREGFQ0x2BzjITfSszizRIqbL5vi9xEjTHEBGmVNC4id9Mu2gqSQ00sK6VVQ84');
// const elements = stripe.elements();
const OrderInfo=require('../models/orderInfo');
const Order=require('../models/order');
const FAQ=require('../models/faq');
const { where } = require('underscore');
const Sequelize=require('sequelize');

exports.getIndex = async (req, res) => {
    try {
        // Random 4 blog al
        const blogs = await Blog.findAll({ order: Sequelize.literal('RAND()'), limit: 4 });
        
        // Diğer veritabanı sorgularını asenkron olarak çalıştır
        const products = await Product.findAll();
        const categories = await Category.findAll();

        console.log("kategoriiiiii",categories);
        categories.forEach(category => {
            console.log(category.name);
        });

        // Render işlemi
        res.render('shop/index', {
            title: 'Home Page',
            blogs: blogs,
            products: products,
            categories: categories,
            path: '/',
            // isAuthenticated: req.session.isAuthenticated,
            // isAdmin: req.user.isAdmin
        });
    } catch (error) {
        console.error("Error fetching data:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
}
exports.getProducts=(req,res)=> {
    Category.findAll().then((categories)=>{
        Product.findAll()
        .then(products =>{
            res.render('shop/products',
            {
                title:'Products',
                products:products,
                categories:categories,
                path:'/products',
                // isAuthenticated:req.session.isAuthenticated,
                // isAdmin:req.user.isAdmin
            });
        })
        .catch((err)=>{
            console.log(err);
        })
    }).catch((err)=>{
        console.log(err);
    })

}

exports.getProductsByCategoryId = (req, res) => {
    const categoryid = req.params.categoryid;
    const model = {};

    Category.findAll()
        .then(categories => {
            model.categories = categories;
            const category = categories.find(i => i.id == categoryid);
            model.selectedcategoryname = category.name; // Seçilen kategorinin adını model'e ekleyin
            return category.getProducts();
        })
        .then(products => {
            res.render('shop/products', {
                title: 'Products',
                products: products,
                categories: model.categories,
                selectedcategory: categoryid,
                selectedcategoryname: model.selectedcategoryname, // selectedcategoryname'i render edilecek veriler arasına ekleyin
                path: '/products'
            });
        })
        .catch((err) => {
            console.log(err);
        });
}



exports.getProduct=(req,res)=> {
    const productId=req.params.productid;
    Product.findByPk(productId)
        .then(product=>{
            res.render('shop/product-detail',
            {
                title:product.name,
                product:product,
                path:'/products',
                // isAuthenticated:req.session.isAuthenticated,
                // isAdmin:req.user.isAdmin
            });
        })
        .catch((err)=>{
            console.log(err);
        })
}

exports.getProductDetail=(req,res)=> {
    res.render('shop/details',
    {
        title:'Details',
        path:'/details',
        // isAuthenticated:req.session.isAuthenticated,
        // isAdmin:req.user.isAdmin
    });
}

exports.getCart=(req,res)=> {

    console.log(req.user);
    req.user
        .getCart()
            .then(cart=>{
                return cart.getProducts()
                    .then(products=>{
                        res.render('shop/cart.pug',
                            {
                                title:'Cart',
                                path:'/cart',
                                products:products,
                                // isAuthenticated:req.session.isAuthenticated,
                                // isAdmin:req.user.isAdmin
                            });
                    }).catch(err=>{console.log(err);})

            }).catch(err=>{
                console.log(err);
            });

}
exports.postCart = (req, res, next) => {

    const productId = req.body.productId;
    let quantity = 1;
    let userCart;

    req.user
        .getCart()
        .then(cart => {
            userCart = cart;
            return cart.getProducts({ where: { id: productId } });

        })
        .then(products => {
            let product;

            if (products.length > 0) {
                product = products[0];
            }

            if (product) {
                quantity += product.cartItem.quantity;
                return product;
            }
            return Product.findByPk(productId);

        })
        .then(product => {
            userCart.addProduct(product, {
                through: {
                    quantity: quantity
                }
            })
        })
        .then(() => {
            res.redirect('/cart');
        })
        .catch(err => {
            console.log(err);
        });
}

exports.postCartItemDelete=(req,res,next)=>{
    const productid=req.body.productid;
    console.log(productid);

    req.user.getCart()
        .then(cart=>{
            return cart.getProducts({where:{id:productid}});
        }).then(products=>{
            const product=products[0];
            return product.cartItem.destroy();
        }).then(()=>{
            res.redirect('/cart?action=deletecartItem');
        })

}


exports.getBlogs= async (req,res)=> {
    try {
        const blogs = await Blog.findAll();
        // Further processing or sending response
        res.render('shop/blogs',{
            title:'Blog',
            path:'/blogs',
            blogs:blogs
        })
    } catch (error) {
        // Handle errors
        console.error("Error fetching categories:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }

}


exports.getBlog = (req, res) => {
    const blogid = req.params.blogid;
    let relatedThreeBlogs;

    Blog.findAll({
        where: {
            id: {
                [Op.ne]: blogid // blogid ile uyuşmayanları al
            }
        },
        limit: 3 // İlk üç blogu al
    })
        .then(blogs => {
            relatedThreeBlogs = blogs;
            return Blog.findByPk(blogid);
        })
        .then(blog => {
            res.render('shop/blog-detail', {
                title: blog.title,
                blog: blog,
                relatedThreeBlogs: relatedThreeBlogs,
                path: '/blogs'
            });
        })
        .catch(err => {
            console.log(err);
        });
}

exports.getGallery=async (req,res,next)=>{
    try {
        const photos = await Gallery.findAll();
        // Further processing or sending response
        res.render('shop/gallery',{
            title:'Gallery',
            path:'/gallery',
            photos:photos
        })
    } catch (error) {
        // Handle errors
        console.error("Error fetching categories:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
}

exports.getCheckout = async (req, res, next) => {
    try {
        const cities = await City.findAll();
        res.render('shop/checkout', {
            title: 'Checkout',
            path: '/checkout',
            cities: cities
        });
    } catch (err) {
        console.error("Hata oluştu:", err);
    }
}




exports.getPayment=(req,res,next)=>{
    res.render('shop/payment',{
        title:'Payment',
        path:'/payment'
    })

}


exports.postCheckout=(req,res,next)=>{


    console.log("GELDİİİİİİİİİİ");
    const orderUserName=req.body.OrderName;
    const orderUserSurname=req.body.OrderSurname;
    const orderUserEmail=req.body.OrderEmail;
    const orderUserPhone=req.body.OrderPhone;
    const orderUserCity=req.body.OrderCityId;
    const orderUserDistrict=req.body.OrderDistrict;
    const orderUserFullAdress=req.body.OrderAddress;

    console.log("REEEEQQQ BODYYY",req.body);

    OrderInfo.create({
        orderUserName:orderUserName,
        orderUserSurname:orderUserSurname,
        orderUserEmail:orderUserEmail,
        orderUserPhone:orderUserPhone,
        orderUserCity:orderUserCity,
        orderUserDistrict:orderUserDistrict,
        orderUserFullAdress:orderUserFullAdress
    }).then(()=>{
        res.redirect('/payment')
    }).catch(err=>{
        console.log(err);
    })
}



exports.postPayment = async (req, res, next) => {
    try {
        const { description } = req.body;

        // Stripe API'si kullanarak ödeme işlemini gerçekleştir
        const paymentIntent = await stripe.paymentIntents.create({
            amount: 1500,
            currency: 'USD',
            description: description,
            payment_method_types: ['card'], // Kullanılacak ödeme yöntemi
            payment_method: 'pm_card_visa', // Test kartı
            confirm: true,
            return_url: 'http://localhost:3000/payment/success'
        });

        // Ödeme başarılı olduğunda postOrder fonksiyonunu çağır
        try {
            let userCart;
            const cart = await req.user.getCart();
            userCart = cart;
            const products = await cart.getProducts();
            
            const order = await req.user.createOrder();
            await order.addProducts(products.map(product => {
                product.orderItem = {
                    quantity: product.cartItem.quantity,
                    price: product.price
                }
                return product;
            }));
    
            await userCart.setProducts(null);
            const orderIdNumber = order.id;

            // findAll metodu bir Promise döndürdüğü için then fonksiyonunu kullanabilirsiniz
            OrderInfo.findAll().then(infos => {
                const lastOrder = infos[infos.length - 1];
                // lastOrder.set('orderIdNumber', String(orderIdNumber));
                lastOrder.update({ orderIdNumber: String(orderIdNumber) }).then(() => {
                    res.redirect('/');
                }).catch(err => {
                    console.error("orderIdNumber güncellenirken bir hata oluştu:", err);
                });
            });
               
        } catch (err) {
            console.log(err);
        }
        
    } catch (error) {
        // Hata durumunda hatayı konsola yaz ve kullanıcıya geri dön
        console.error(error);
        res.status(500).render('shop/payment-error', {
            title: 'Payment Error',
            path: '/payment/error',
            error: 'Ödeme işlemi sırasında bir hata oluştu.'
        });
    }
};

exports.getPaymentSuccess=(req,res,next)=>{
    res.render('shop/payment-success',{
        title:'Payment Success',
        path:'/payment-success'
    })
}

exports.getFAQ=(req,res,next)=>{
    FAQ.findAll()
        .then(faqs=>{
            res.render('shop/faq',{
                title:'Sıkça Sorulan Sorular',
                path:'/sikca-sorulan-sorular',
                faqs:faqs
            })
        }).catch(err=>{
            console.log(err);
        })

    
}
