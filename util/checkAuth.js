const { PubSub } = require('apollo-server')
const jwt = require('jsonwebtoken')
const { JWT_KEY } = require('../config/env.json')

const pubsub = new PubSub()

module.exports = (context) => {

    let token

    if (context.req && context.req.headers.authorization) {
        token = context.req.headers.authorization.split('Bearer ')[1]
    }

    else if (context.connection && context.connection.context.Authorization) {
        token = context.connection.context.Authorization.split('Bearer ')[1]
    }

    if (token) {
        const user = jwt.verify(token, JWT_KEY)
        
        context.pubsub = pubsub

        const checkAuth = {user, context}
        return checkAuth
    } 
}