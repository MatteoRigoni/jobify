import User from '../models/User.js'
import { StatusCodes } from 'http-status-codes'
import { BadRequestError,UnAuthenticatedError } from '../errors/index.js'

const register = async (req, res, next) => {
    try {
        const {name, email, password} = req.body

        if (!name || !email || !password) {
            throw new Error('Please provide all fields')
        }

        const userAlreadyExists = await User.findOne({email: email});
        if (userAlreadyExists) {
            throw new BadRequestError('Email already in use')
        }

        const user = await User.create(req.body)
        const token = user.createJWT()

        res.status(StatusCodes.OK).json({user:{email:user.email, name:user.name, location:user.location}, token})
    } catch (error) {
        next(error)
    }
}

const login = async (req, res, next) => {
    try {
        const {email,password} = req.body;    
        if (!email || !password) {
            throw new BadRequestError('Please provide all fields')
        }
        const user = await User.findOne( { email } ).select('+password')
        if (!user) {
            throw new UnAuthenticatedError('Invalid credentials');
        }
        const isPasswordCorrect = await user.comparePassword(password)
        if (!isPasswordCorrect) {
            throw new UnAuthenticatedError('Invalid credentials')
        }
        const token = user.createJWT()
        res.status(StatusCodes.OK).json({user, token})
    } catch (error) {
        next(error)
    }
}

const updateUser = async (req, res) => {
    try
    {
        const { email, name, lastName, location } = req.body
        if (!email || !name || !lastName || !location) {
        throw new BadRequestError('Please provide all values')
        }
    
        const user = await User.findOne({ _id: req.user.userId })
    
        user.email = email
        user.name = name
        user.lastName = lastName
        user.location = location
    
        await user.save()
    
        // various setups
        // in this case only id
        // if other properties included, must re-generate
    
        const token = user.createJWT()
        res.status(StatusCodes.OK).json({
        user,
        token,
        location: user.location,
        })
    } catch (error) {
        next(error)
    }
}

export { register, login, updateUser }