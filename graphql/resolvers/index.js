const productsResolvers = require('./products')
const usersResolvers = require('./users')
const commentsResolvers = require('./comments')
const messagesResolvers = require('./messages')

module.exports = {
    Product: {
        likeCount: (parent) => parent.likes.length,
        commentCount: (parent) => parent.comments.length
    },
    // Message:{
    //     reactionCount: (parent) => parent.reactions.length
    // },
    Query: {
        ...usersResolvers.Query,
        ...messagesResolvers.Query,
        ...productsResolvers.Query
    },
    Mutation: {
        ...usersResolvers.Mutation,
        ...messagesResolvers.Mutation,
        ...productsResolvers.Mutation,
        ...commentsResolvers.Mutation
    },
    Subscription: {
        ...messagesResolvers.Subscription,
    }
}