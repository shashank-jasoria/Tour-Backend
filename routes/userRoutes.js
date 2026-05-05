const express = require('express');
const {getAllUsers , createUser , getUser , updateUser , deleteUser , updateMe , deleteMe , getMe} = require('./../controller/userController')
const {signup , Login , forgotPassword , resetPassword , updatePassword , Protect ,restrictTo} = require('./../controller/authController')
const router = express.Router()

router.route('/signup').post(signup)
router.route('/login').post(Login)
router.post('/forgotPassword', forgotPassword);
router.patch('/resetPassword/:token', resetPassword);

router.use(Protect);
router.patch('/updateMyPassword',updatePassword);
router.patch('/updateMe', updateMe);
router.delete('/deleteMe', deleteMe);
router.get('/me',getMe, getUser);

router.use(restrictTo('admin'));

router.route('/').get(getAllUsers).post(createUser);
router.route('/:id').get(getUser).patch(updateUser).delete(deleteUser);

module.exports = router;