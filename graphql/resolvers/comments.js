const { UserInputError, AuthenticationError } = require('apollo-server')

const Product = require('../../models/Product')

module.exports = {

    Mutation: {
        
        createComment: async (_, { productId, body }, {user}) => {
            

            if (body.trim() === '') {
                throw new UserInputError ('Empty comment', {
                    errors: {
                        body: 'Comment body must not be empty'
                    }
                })
            }

            const product = await Product.findById(productId)

            if (product) {
                product.comments.unshift({
                    body,
                    username: user.username,
                    createdAt: new Date().toISOString()
                })

                await product.save()

                return product

            }else{
                throw new UserInputError('Product not found')
            }
        },

        async deleteComment (_, { productId, commentId }, {user}){
            
            const product = await Product.findById(productId)

            if (product) {

                const commentIndex = product.comments.findIndex(c => c.id === commentId)

                if(user.admin === true || product.comments[commentIndex].username === user.username){

                    product.comments.splice(commentIndex, 1)

                    await product.save()

                    return product

                }else{
                    throw new AuthenticationError('Action not allowed')
                }

            }else{
                throw new UserInputError('Post not found')
            }
        }
    }
}