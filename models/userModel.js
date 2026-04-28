const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
    name:{
        type: String,
        required:[true, "Name field is required"],
        maxLength :[20 , 'Name cannot be more then 20 character']
    },
    email:{
        type:String,
        required:[true, "Email field is required"],
        unique:true,
        lowercase : true,
        validate :[validator.isEmail , 'Please provde a valid Email']

    },
    photo:String,
    password:{
        type:String,
        required:[true, "password field is required"],
        minLength :[8 , 'Password must have atleast have 8 characters'],
        select:false
    },
    passwordConfirm:{
        type:String,
        validate:{
            validator : function(val){
                return this.password == val
            },
            message: 'password does not match'
        }
    }
    
})

userSchema.pre('save' , async function(next){
    if(!this.isModified('password')) return next();
    this.password = await bcrypt.hash(this.password,12);
    this.passwordConfirm = undefined;
    next();
})

userSchema.methods.correctPassword = async function(
  candidatePassword,
  userPassword
) {
  return await bcrypt.compare(candidatePassword, userPassword);
};


const Users = mongoose.model('users' , userSchema);
module.exports = Users;