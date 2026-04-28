const express = require('express');
const {getAllUsers , createUser , getUser , updateUser , deleteUser} = require('./../controller/userController')
const {signup , Login} = require('./../controller/authController')
const router = express.Router()

router.route('/signup').post(signup)
router.route('/login').post(Login)

router.route('/').get(getAllUsers).post(createUser);
router.route('/:id').get(getUser).patch(updateUser).delete(deleteUser);

module.exports = router;