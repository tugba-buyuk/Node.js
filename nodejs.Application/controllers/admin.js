
const User=require('../models/user');
const Product=require('../models/product');
const Category=require('../models/category');
const Blog=require('../models/blog');
const Gallery=require('../models/gallery');
const fs=require('fs');
const bcrypt=require('bcrypt')

exports.getProducts=(req,res)=> {
    Product.findAll()
    .then(products=>{
        Category.findAll()
        .then((categories)=>{
            res.render('admin/products',
                {
                    title:'Admin Products',
                    products:products,
                    categories:categories,
                    path:'/admin/products',
                    action:req.query.action,
                });
        })
        .catch((err)=>{
            consolelog(err);
        })
        
    })
    .catch((err)=>{
        console.log(err);
    })   
}

exports.getAddProduct=(req,res,next)=>{
    Category.findAll()
        .then((categories)=>{
            res.render('admin/add-product',{
                title:'New Product',
                path:'/admin/add-product',
                categories:categories,
            })
        })
        .catch((err)=>{
            consolelog(err);
        }) 
}

exports.postAddProduct=(req,res,next)=>{

    const name=req.body.name;
    const file=req.file;
    const price=req.body.price;
    const categoryid=req.body.categoryid;
    const description=req.body.description;
    const userid=req.user.id;
        
    Product.create({
        name:name,
        image:file.filename,
        price:price,
        description:description,
        categoryId:categoryid,
        userId:userid
    }).then((result)=>{
        console.log(result);
        res.redirect('/admin/products');
    }).catch((err)=>{
        console.log(err);
    });
}

exports.getEditProduct=(req,res,next)=>{
    Category.findAll()
    .then((categories)=>{
        Product.findByPk(req.params.productid)
        .then(product=>{
            res.render('admin/edit-product',
            {
                title:'Edit Product',
                product:product,
                categories:categories,
                path:'/admin/edit-product',
                isAuthenticated:req.session.isAuthenticated,
            }); 
        })
        .catch((err)=>{
            console.log(err);
        })
    })
    .catch((err)=>{
        console.log(err);
    });
      
}

exports.postEditProduct = (req, res, next) => {
    const id = req.body.id;
    const name = req.body.name;
    const image = req.file;
    const description = req.body.description;
    const price = req.body.price;
    const categoryid = req.body.categoryid;
    const userid = req.user.id;
  
    const edittedProduct = {
      id,
      name,
      description,
      price,
      categoryid,
      userid,
    };
  
    Product.findByPk(id)
      .then(async (product) => {
        if (image) {
          try {
            const oldImagePath = `public/img/${product.image}`;
            await fs.promises.unlink(oldImagePath);
          } catch (err) {
            console.error(`Error deleting old image: ${err}`);
          }
  
          edittedProduct.image = image.filename || image.originalname; 
        }
       
        return product.update(edittedProduct); 
      })
      .then(() => {
        res.redirect('/admin/products?action=edit');
      })
      .catch((err) => {
        console.error(err);
        
      });
  };
  

exports.postDeleteProduct=(req,res,next)=>{
    const id=req.body.productid;
    Product.findByPk(id).then((product)=>{
        return product.destroy();
    })
    .then(()=>{
        res.redirect('/admin/products?action=delete');
    })
    .catch((err)=>{
        console.log(err);
    });
    
}

exports.getAdminLogin=(req,res,next)=>{
    res.render('admin/login',{
        title:'Admin Login Page',
        path:'/admin/login'
    })
}


exports.postAdminLogin = (req, res, next) => {
    const email = req.body.email;
    const password = req.body.password;


    User.findOne({ where: { email } })
        .then(user => {
            if (!user || !user.isAdmin) {
                req.session.errorMessage = 'Bu mail adresi ile bir kayıt bulunamamıştır veya yetkiniz yok.';
                req.session.save((err) => {
                    console.log(err);
                    return res.redirect('admin/login');
                });
                return; 
            }
            bcrypt.compare(password, user.password)
                .then(isSuccess => {
                    if (isSuccess) {
                        //login
                        req.session.user = user;
                        req.session.isAuthenticated = true;
                        return req.session.save(function (err) {
                            var url = req.session.redirectTo || '/admin/dashboard';
                            delete req.session.redirecTo;
                            console.log(err);
                            res.redirect(url);
                        });
                    }
                    res.redirect('/login');
                })
                .catch(err => {
                    console.log(err);
                });
        })
        .catch(err => {
            console.log(err);
        });
};

exports.getDashboard=(req,res,next)=>{
    res.render('admin/dashboard',{
        title:'Admin  Page',
        path:'/admin/dashboard'
    })
}

exports.getCategories = async (req, res, next) => {
    try {
        const categories = await Category.findAll();
        // Further processing or sending response
        res.render('admin/categories',{
            title:'Categories',
            path:'/admin/categories',
            categories:categories
        })
    } catch (error) {
        // Handle errors
        console.error("Error fetching categories:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
};

exports.getAddCategory=(req,res,next)=>{
    res.render('admin/add-category',{
        title:'Add Category Page',
        path:'/admin/add-category'
    })
}

exports.postAddCategory=(req,res,next)=>{
    const Catname=req.body.name;
    const Catdescription=req.body.description;

    Category.create({
        name:Catname,
        description:Catdescription,
    }).then((result)=>{
        console.log(result);
        res.redirect('/admin/categories');
    }).catch((err)=>{
        console.log(err);
    });

}

exports.postDeleteCategory=(req,res,next)=>{
    const id=req.body.categoryid;
    Category.findByPk(id).then((category)=>{
        return category.destroy();
    })
    .then(()=>{
        res.redirect('/admin/categories?action=delete');
    })
    .catch((err)=>{
        console.log(err);
    });
    
}

exports.getEditCategory=(req,res,next)=>{
    const categoryid= req.params.categoryid;
    Category.findByPk(categoryid)
        .then(category=>{
            res.render('admin/edit-category',
            {
                title:'Edit Category',
                category:category,
                path:'/admin/edit-category',
            }); 
        }).catch(err=>{
            console.log(err);
        })
      
}

exports.postEditCategory = (req, res, next) => {
    const id=req.body.id;
    const name = req.body.name;
    const description = req.body.description;

    const edittedCategory = {
        id,
        name,
        description,
      };

      Category.findByPk(id)
      .then(async (category) => {
       
        return category.update(edittedCategory); 
      })
      .then(() => {
        res.redirect('/admin/categories?action=edit');
      })
      .catch((err) => {
        console.error(err);
        
      });
   
}

exports.getBlogs = async (req, res, next) => {
    try {
        const blogs = await Blog.findAll();
        // Further processing or sending response
        res.render('admin/blogs',{
            title:'Blog',
            path:'/admin/blogs',
            blogs:blogs
        })
    } catch (error) {
        // Handle errors
        console.error("Error fetching categories:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
};

exports.getAddBlog=(req,res,next)=>{
    res.render('admin/add-blog',{
        title:'Add Blog Page',
        path:'/admin/add-blog'
    })
}

exports.postAddBlog=(req,res,next)=>{
    const title = req.body.title;
    const image = req.file;
    const description = req.body.description;

    Blog.create({
        title:title,
        image:image.filename,
        description:description
    }).then((result)=>{
        console.log(result);
        res.redirect('/admin/blogs');
    }).catch((err)=>{
        console.log(err);
    });

}

exports.postDeleteBlog=(req,res,next)=>{
    const id=req.body.blogid;
    Blog.findByPk(id).then((blog)=>{
        return blog.destroy();
    })
    .then(()=>{
        res.redirect('/admin/blogs?action=delete');
    })
    .catch((err)=>{
        console.log(err);
    });
    
}

exports.getEditBlog=(req,res,next)=>{
    Blog.findByPk(req.params.blogid)
        .then(blog=>{
            res.render('admin/edit-blog',
            {
                title:'Edit Blog',
                blog:blog,
                path:'/admin/edit-blog',
            }); 
        })
        .catch((err)=>{
            console.log(err);
        })
      
}

exports.postEditBlog = (req, res, next) => {
    const id = req.body.id;
    const title = req.body.title;
    const image = req.file;
    const description = req.body.description;
  
    const edittedBlog = {
      id,
      title,
      description,
    };
  
    Blog.findByPk(id)
      .then(async (blog) => {
        if (image) {
          try {
            const oldImagePath = `public/img/${blog.image}`;
            await fs.promises.unlink(oldImagePath);
          } catch (err) {
            console.error(`Error deleting old image: ${err}`);
          }
  
          edittedBlog.image = image.filename || image.originalname; 
        }
       
        return blog.update(edittedBlog); 
      })
      .then(() => {
        res.redirect('/admin/blogs?action=edit');
      })
      .catch((err) => {
        console.error(err);
        
      });
  };


  exports.getGallery = async (req, res, next) => {
    try {
        const photos = await Gallery.findAll();
        // Further processing or sending response
        res.render('admin/gallery',{
            title:'Gallery',
            path:'/admin/gallery',
            photos:photos
        })
    } catch (error) {
        // Handle errors
        console.error("Error fetching categories:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
};

exports.getAddGallery=(req,res,next)=>{
    res.render('admin/add-gallery',{
        title:'Add Gallery Page',
        path:'/admin/add-gallery'
    })
}

exports.postAddGallery=(req,res,next)=>{
    const image = req.file;
    const description = req.body.description;

    Gallery.create({
        image:image.filename,
        description:description
    }).then((result)=>{
        console.log(result);
        res.redirect('/admin/gallery');
    }).catch((err)=>{
        console.log(err);
    });

}