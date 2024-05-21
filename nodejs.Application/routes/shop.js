const express=require('express');
const router=express.Router();

const shopController=require('../controllers/shop');
const isAuthenticated = require('../middlewares/isAuthenticated');
const locals = require('../middlewares/locals');

router.get('/',locals,shopController.getIndex);

router.get('/products',locals,shopController.getProducts);

router.get('/product/:productid',locals,shopController.getProduct);

router.get('/categories/:categoryid',locals,shopController.getProductsByCategoryId);

router.get('/details',locals,shopController.getProductDetail);

router.get('/cart',locals,isAuthenticated,shopController.getCart);

router.post('/cart',locals,shopController.postCart);

router.post('/delete-cartitem',locals,shopController.postCartItemDelete);



// router.post('/create-order',locals,shopController.postOrder);

router.get('/checkout',locals,isAuthenticated,shopController.getCheckout);

router.post('/checkout',locals,isAuthenticated,shopController.postCheckout);

router.get('/payment',locals,isAuthenticated,shopController.getPayment);

router.post('/payment',locals,isAuthenticated,shopController.postPayment);

router.get('/payment-success',shopController.getPaymentSuccess);

router.get('/blogs',shopController.getBlogs);

router.get('/blog/:blogid',locals,shopController.getBlog);

router.get('/gallery',shopController.getGallery);

router.get('/sikca-sorulan-sorular',shopController.getFAQ);


module.exports=router;