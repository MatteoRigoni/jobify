import mongoose from 'mongoose'
import validator from 'validator'
import bcrypt from 'bcryptjs/dist/bcrypt.js'
import jwt from 'jsonwebtoken'

const UserSchema = new mongoose.Schema({
    name: {type:String, required:[true, 'Please provide a name'], minLength: 3, maxLength: 20, trim: true},
    email: {type:String, required:[true, 'Please provide a email'], unique: true, 
        validate:{
            validator: validator.isEmail,
            message:'Please provide valid email'
            }
    },
    password: {type:String, required:[true, 'Please provide a password'], minLength: 6, maxLength: 20, trim: true, select: false},
    lastName: {type:String, maxLength: 20, trim: true, default: 'Undefined'},
    location: {type:String, maxLength: 20, trim: true, default: 'My city'}
})

UserSchema.pre('save', async function() {
    if (!this.isModified('password')) return

    const salt = await bcrypt.genSalt(10)
    this.password = await bcrypt.hash(this.password, salt)
})

UserSchema.methods.createJWT = function() {
    return jwt.sign({userId:this._id}, process.env.JWT_SECRET, {expiresIn: process.env.JWT_EXPIRES})
}

UserSchema.methods.comparePassword = async function(candidatePassword) {
    const isMath = await bcrypt.compare(candidatePassword, this.password);
    return isMath
}

export default mongoose.model('User', UserSchema)