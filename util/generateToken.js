const { JWT_KEY } = require('../config/env')
const jwt = require('jsonwebtoken')

exports.generateToken = ( user ) => {
    return jwt.sign({
        id: user.id,
        admin: user.admin,
        username: user.username,
        email: user.email
    }, 
    JWT_KEY, { expiresIn: '3h'}
    )
}