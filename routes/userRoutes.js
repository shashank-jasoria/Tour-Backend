const express = require('express');
const {getAllUsers , createUser , getUser , updateUser , deleteUser , updateMe , deleteMe} = require('./../controller/userController')
const {signup , Login , forgotPassword , resetPassword , updatePassword , Protect} = require('./../controller/authController')
const router = express.Router()

router.route('/signup').post(signup)
router.route('/login').post(Login)
router.post('/forgotPassword', forgotPassword);
router.patch('/resetPassword/:token', resetPassword);
router.patch('/updateMyPassword',Protect,updatePassword);
router.patch('/updateMe', Protect, updateMe);
router.delete('/deleteMe', Protect, deleteMe);


router.route('/').get(getAllUsers).post(createUser);
router.route('/:id').get(getUser).patch(updateUser).delete(deleteUser);

module.exports = router;