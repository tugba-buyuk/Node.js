const User=require('../models/user');
const bcrypt=require('bcrypt')
const nodemailer=require('nodemailer');
const crypto=require('crypto');

var transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: 'tugbabuyuk.mail@gmail.com',
      pass: 'wtzmgmqzcnjjbleo'
    }
  });
  
 

exports.getLogin=(req,res,next)=>{
    var errorMessage=req.session.errorMessage;
    delete req.session.errorMessage;

    res.render('account/login',{
        title:'Login Page',
        path:'/login',
        errorMessage:errorMessage
    })
}

exports.postLogin=(req,res,next)=>{
    const email=req.body.email;
    const password=req.body.password;

    User.findOne({where:{email}})
        .then(user=>{
            if(!user){
                req.session.errorMessage='Bu mail adresi ile bir kayıt bulunamamıştır.';
                req.session.save((err)=>{
                    console.log(err);
                    return res.redirect('/login');
                })
               
            }
            bcrypt.compare(password,user.password)
                .then(isSuccess=>{
                    if(isSuccess){
                        //login
                        req.session.user=user;
                        req.session.isAuthenticated=true;
                        return req.session.save(function(err){
                            var url=req.session.redirectTo || '/';
                            delete req.session.redirecTo;
                            console.log(err);
                            res.redirect(url);
                        })
                    }
                    res.redirect('/login');
                })
                .catch(err=>{
                    console.log(err);
                })

        }).catch(err=>{
            console.log(err);
        })
    
}

exports.getRegister=(req,res,next)=>{
    var errorMessage=req.session.errorMessage;
    res.render('account/register',{
        title:'Register Page',
        path:'/register',
        errorMessage:errorMessage
    })
}


exports.postRegister = async (req, res, next) => {
    try {
      const name = req.body.name;
      const email = req.body.email;
      const password = req.body.password;
  
      const existingUser = await User.findOne({ where: { email } });
      console.log("EXISTINGGGG", existingUser);
  
      if (existingUser) {
        // Handle existing user case (e.g., flash message)
        req.session.errorMessage = 'Bu mail adresi daha önce kullanılmıştır.';
        req.session.save(err => {
          console.log(err);
          return res.redirect('/register');
        });
      } else {
        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = new User({
          name,
          email,
          password: hashedPassword,
          cart: { items: [] }
        });
        console.log("NEEEWWWW USEERRR", newUser);
  
        // Save user and handle errors
        await newUser.save().catch(err => {
          console.error(err.message);
          res.status(500).send('Internal server error');
        });
  
        // Redirect after successful registration
        res.redirect('/login');
  
        // Asynchronously send email (optional)
        var mailOptions = {
          from: 'tugbaboyuk37@gmail.com',
          to: email,
          subject: 'Kayıt İşlemi',
          text: 'Kayıt başarıyla oluşturulmuştur.!'
        };
  
        transporter.sendMail(mailOptions, function(error, info) {
          if (error) {
            console.log(error);
          } else {
            console.log('Email sent successfully');
          }
        });
      }
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Internal server error');
    }
  };
  



exports.getReset=(req,res,next)=>{
    res.render('account/reset',{
        title:'Reset Password Page',
        path:'/reset-password',
    })
}

exports.postReset = async (req, res, next) => {
    try {
        const email = req.body.email;
        console.log('EMAİİİİİİLLL::',email);
        const buffer = await new Promise((resolve, reject) => {
            crypto.randomBytes(32, (err, buf) => {
                if (err) reject(err);
                resolve(buf);
            });
        });
        
        const token = buffer.toString('hex');
        const users = await User.findAll();
        const user = users.find(u => u.email === email); 
        

        if (!user) {
            req.session.errorMessage = 'Hatalı mail adresi';
            const errorMessage = req.session.errorMessage;
            req.session.save(err => {
                if (err) console.log(err);
                return res.render('account/reset',{
                    title:'Reset Password Page',
                    path:'/reset-password',
                    errorMessage:errorMessage
                })
            });
            return;
        }

        user.resetToken = token;
        user.resetTokenExpiration = new Date(Date.now() + 3600000);
        await user.save();

        res.redirect('/');
        
        const mailOptions = {
            from: 'tugbaboyuk37@gmail.com',
            to: email,
            subject: 'Şifre Sıfırlama',
            html: `
                <p>Parolanızı güncellemek için aşağıdaki linke tıklayınız<p>
                <a href='http://localhost:3000/reset-password/${token}'>Parola reset</a>
            `
        };

        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                console.log(error);
            }
        });
    } catch (error) {
        console.log(error);
        res.redirect('/reset-password');
    }
};


exports.getNewPassword = async (req, res, next) => {
    try {
        const token = req.params.token;
        const users = await User.findAll();
        const user = users.find(u => u.resetToken === token); 

        if (!user) {
            throw new Error('User not found');
        }

        res.render('account/new-password', {
            title: 'New Password',
            path: '/new-password',
            userId: user.id,
            passwordToken: token,
        });
    } catch (err) {
        console.error(err);
    }
}


exports.postNewPassword = async (req, res, next) => {
    try {
      const newPassword = req.body.password;
      const userId = req.body.userId;
      const token = req.body.passwordToken;
      const users = await User.findAll();

      const user = users.find(u => u.resetToken === token && u.id==userId); 

      console.log("USSSSEEEEERR:",user);
      
      if (!user) {
        throw new Error('Invalid or expired token');
      }
  
      const hashedPassword = await bcrypt.hash(newPassword, 10);
      console.log(hashedPassword);
      user.password = hashedPassword;
      user.resetToken = undefined;
      user.resetTokenExpiration = undefined;
      await user.save();

  
      res.redirect('/login');
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'An error occurred' });
    }
  };
  


exports.getLogout=(req,res,next)=>{
    req.session.destroy(err=>{
        console.log(err);
        res.redirect('/login');
    });
       
}

exports.getAccount=(req,res,next)=>{
  res.render('account/myaccount',{
    title:'Account',
    path:'/account'
  })
     
}