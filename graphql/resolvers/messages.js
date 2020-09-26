const { 
    UserInputError, 
    AuthenticationError, 
    withFilter, 
    ForbiddenError 
} = require('apollo-server')

const User = require('../../models/User')
const Message = require('../../models/Message')
// const Reaction = require('../../models/Reaction')


module.exports = {

    Query:{

        getMessages: async (_, { chatWith }, {user}) => {

            try{

                if (user) {
                    
                    const otherUser = await User.findOne({username: chatWith})

                    if (!otherUser) {
                        throw new UserInputError('User not found')
                    }

                    const usernames = [user.username, otherUser.username]

                    const messages = await Message.find({
                        $and: [
                            { from: usernames },
                            { to: usernames }
                        ]

                    }).sort({ createdAt: -1 })

                    return messages

                }

                else{
                    throw new AuthenticationError('Invalid/Expired token')
                }
            }

            catch(err){
                throw err
            }
        },

        getAllUsersMessages: async(_, __, {user}) => {

            try{

                if (user) {
                    
                    let users = await User.find({username: {$exists: true, $nin: user.username}})


                    const allUsersMessages = await Message.find({
                        $and: [
                            { $or: [
                                {from: user.username}, {to: user.username}
                            ] }
                        ]

                    }).sort({ createdAt: -1 })

                    users = users.map(otherUser => {
                        const latestMessage = allUsersMessages.find(
                            m => m.from == otherUser.username || m.to == otherUser.username
                        )
                        otherUser.latestMessage = latestMessage
                        return otherUser
                    })

                    return users
                }

                else{
                    throw new AuthenticationError('Invalid/Expired token')
                }
            }

            catch(err){
                throw err
            }
        }
    },

    Mutation: {
        sendMessage: async (_, {to, body}, {user, context}) => {
            
            try{

                if (user) {

                    const recipient = await User.findOne({username: to})
                    

                    if (!recipient) {
                        throw new UserInputError('User not found')
                    } else if (recipient.username === user.username){
                        throw new UserInputError('You can not send a message to yourself')
                    }

                    if (body.trim() == '') {
                        throw new UserInputError('Message must not be empty')
                    }

                    const newMessage = new Message({
                        body,
                        from: user.username,
                        to: recipient.username,
                        createdAt: new Date().toISOString()
                    })

                    const message = await newMessage.save()

                    context.pubsub.publish('NEW_MESSAGE', { newMessage: message })

                    return message
                }

                else{
                    throw new AuthenticationError('Invalid/Expired token')
                }
            }

            catch(error){
                throw error
            }
        },

        // reactToMessage: async (_, {messageId, body}, {user, context}) => {

        //     let errors = {}

        //     const reactions = ['❤️', '😆', '😯', '😢', '😡', '👍', '👎']

        //     try {

        //         if (!reactions.includes(body)) {
        //             errors.reaction = 'Invalid reaction'
        //             throw new UserInputError('Input error', { errors })
        //         }

        //         const userQuery = await User.findOne({ username: user.username })
                
        //         if(!userQuery){
        //             errors.user = 'User not found'
        //             throw new AuthenticationError('Unauthenticated', { errors })
        //         }


        //         const message = await Message.findOne({_id: messageId})

        //         if (!message) {
        //             errors.message = 'Message not found'
        //             throw new UserInputError('Input error', { errors })
        //         }

        //         if (message.from !== user.username && message.to !== user.username) {
        //             errors.user = 'Action not allowed'
        //             throw new ForbiddenError('Input error', { errors })
        //         }

        //         if (message.reactions.find(reaction => reaction.username === userQuery.username)) {
                
        //             // Product already reactiond, unreaction it
        //             message.reactions = await message.reactions.filter(reaction => reaction.username !== userQuery.username)

        //             // Product not reactiond, reaction it
        //             await message.reactions.push({
        //                 body,
        //                 username: userQuery.username,
        //                 createdAt: new Date().toISOString()
        //             })

        //         } else{
        //             // Product not reactiond, reaction it
        //             await message.reactions.push({
        //                 body,
        //                 username: userQuery.username,
        //                 createdAt: new Date().toISOString()
        //             })
        //         }

        //         await message.save()

        //         context.pubsub.publish('NEW_REACTION', { newReaction: message })

        //         return message
        //     }
            
        //     catch (errors) {
        //         throw errors
        //     }
        // }
    },

    Subscription: {
        newMessage: {
            subscribe: withFilter(
                (_, __, {user, context}) => {

                if (!user) throw new AuthenticationError('Unauthenticated')

                return context.pubsub.asyncIterator('NEW_MESSAGE')
                }, ({ newMessage }, _, { user }) => {
                    if (
                        newMessage.from === user.username ||
                        newMessage.to === user.username
                    ) {
                        return true
                    }

                    return false
                }
            )
        },

        // newReaction: {
        //     subscribe: withFilter(
        //         (_, __, {user, context}) => {
    
        //         if (!user) throw new AuthenticationError('Unauthenticated')
    
        //         return context.pubsub.asyncIterator('NEW_REACTION')
        //         }, 
        //         ({ newReaction }, _, { user }) => {
    
        //             if (
        //                 newReaction.from === user.username ||
        //                 newReaction.to === user.username
        //             ) {
        //                 return true
        //             }
    
        //             return false
        //         }
        //     )
        // }
    }
}
