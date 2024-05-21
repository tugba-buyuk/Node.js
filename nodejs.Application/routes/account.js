const express=require('express');
const router=express.Router();

const accountController=require('../controllers/account');
const locals=require('../middlewares/locals');
const isAuthenticated=require('../middlewares/isAuthenticated');

router.get('/login',locals,accountController.getLogin);
router.post('/login',locals,accountController.postLogin);

router.get('/logout',locals,accountController.getLogout);

router.get('/register',locals,accountController.getRegister);
router.post('/register',locals,accountController.postRegister);

router.get('/reset-password',locals,accountController.getReset);
router.post('/reset-password',locals,accountController.postReset);

router.get('/reset-password/:token',locals,accountController.getNewPassword);
router.post('/new-password',locals,accountController.postNewPassword);

router.get('/account',locals,isAuthenticated,accountController.getAccount);

router.get('/account/order/:orderid',locals,isAuthenticated,accountController.getOrder)

module.exports=router;