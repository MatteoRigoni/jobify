import { StatusCodes } from 'http-status-codes'

const errorHanderMiddleware = (err, req, res, next) => {
    console.log('default: ' + err.statusCode );

    const defaultError = {
        statusCode: err.statusCode || StatusCodes.INTERNAL_SERVER_ERROR,
        msg: err.message || 'Something went wrong, try again later',
      }

    // validation errros...
    if (err.name == 'ValidationError') {
        defaultError.statusCode = StatusCodes.BAD_REQUEST
        defaultError.msg = Object.values(err.errors).map((item) => item.message).join(',')
    }

    // unique key constraints...
    if (err.code && err.code === 11000) {
        defaultError.statusCode = StatusCodes.BAD_REQUEST
        defaultError.msg = `Field '${Object.keys(err.keyValue)}' has to be unique`
    }

    res.status(defaultError.statusCode).json({msg: defaultError.msg})
}

export default errorHanderMiddleware