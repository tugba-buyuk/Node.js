const express=require('express');
const router=express.Router();
const adminController=require('../controllers/admin');
const isAdmin=require('../middlewares/isAdmin');
const locals=require('../middlewares/locals');


 router.get('/add-product',locals,isAdmin,adminController.getAddProduct);

 router.post('/add-product',locals,adminController.postAddProduct);

 router.get('/edit-product/:productid',locals,isAdmin,adminController.getEditProduct);

 router.post('/edit-product',locals,adminController.postEditProduct);

 router.get('/products',locals,isAdmin,adminController.getProducts);

 router.post('/delete-product',locals,adminController.postDeleteProduct);

 router.get('/login',locals,adminController.getAdminLogin);

 router.post('/login',locals,adminController.postAdminLogin);

 router.get('/dashboard',locals,adminController.getDashboard);

 router.get('/categories',locals,isAdmin,adminController.getCategories);

 router.get('/add-category',locals,isAdmin,adminController.getAddCategory);

 router.post('/add-category',locals,adminController.postAddCategory);

 router.post('/delete-category',locals,isAdmin,adminController.postDeleteCategory);

 router.get('/edit-category/:categoryid',locals,isAdmin,adminController.getEditCategory);

 router.post('/edit-category',locals,adminController.postEditCategory);

 router.get('/blogs',locals,isAdmin,adminController.getBlogs);

 router.get('/add-blog',locals,isAdmin,adminController.getAddBlog);

 router.post('/add-blog',locals,adminController.postAddBlog);

 router.post('/delete-blog',locals,isAdmin,adminController.postDeleteBlog);

 router.get('/edit-blog/:blogid',locals,isAdmin,adminController.getEditBlog);

 router.post('/edit-blog',locals,adminController.postEditBlog);

 router.get('/gallery',locals,isAdmin,adminController.getGallery);

 router.get('/add-gallery',locals,isAdmin,adminController.getAddGallery);

 router.post('/add-gallery',locals,adminController.postAddGallery);

 router.get('/orders',locals,adminController.getOrders);

router.get('/order/:orderid',adminController.getOrder);
 

 
module.exports=router;