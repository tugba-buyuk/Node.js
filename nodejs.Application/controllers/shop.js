const Product=require('../models/product');
const Category=require('../models/category');
const Blog=require('../models/blog');
const Gallery=require('../models/gallery');
const { Op } = require('sequelize');

exports.getIndex=(req,res)=> {
    Product.findAll().then((products)=>{
        Category.findAll().then((categories)=>{
            res.render('shop/index',
                {
                    title:'Home Page',
                    products:products,
                    categories:categories,
                    path:'/',
                    // isAuthenticated:req.session.isAuthenticated,
                    // isAdmin:req.user.isAdmin
                });
        }).catch((err)=>{
            console.log(err);
        })
    }).catch((err)=>{
        console.log(err);
    })
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

exports.getProductsByCategoryId=(req,res)=> {
    const categoryid=req.params.categoryid;
    const model=[];

    Category.findAll()
        .then(categories=>{
            model.categories=categories;
            const category=categories.find(i=>i.id==categoryid);
            return category.getProducts();
        })
        .then(products=>{
            res.render('shop/products',
                {
                    title:'Products',
                    products:products,
                    categories:model.categories,
                    selectedcategory:categoryid,
                    path:'/products'
                });
        })
        .catch((err)=>{
            console.log(err);
        })
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


exports.getOrders=(req,res)=> {

    req.user
        .getOrders({include:['products']})
        .then(orders=>{
            console.log("siparişler:",orders);
            res.render('shop/orders',
            {
                title:'Orders',
                path:'/orders',
                orders:orders,
                // isAuthenticated:req.session.isAuthenticated,
                // isAdmin:req.user.isAdmin
            });
        })
        .catch(err=>{
            console.log(err);
        })
}

exports.postOrder = (req, res, next) => {
    let userCart;
    req.user
        .getCart()
        .then(cart => {
            userCart = cart;
            return cart.getProducts();
        })
        .then(products => {
            return req.user.createOrder()
                .then(order => {
                    order.addProducts(products.map(product => {
                        product.orderItem = {
                            quantity: product.cartItem.quantity,
                            price: product.price
                        }
                        return product;
                    }));
                })
                .catch(err => { console.log(err); });
        })
        .then(() => {
            userCart.setProducts(null);
        })
        .then(() => {
            res.redirect('/orders');
        })
        .catch(err => {
            console.log(err);
        });
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