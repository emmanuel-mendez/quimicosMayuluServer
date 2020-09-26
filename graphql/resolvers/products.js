const { AuthenticationError, UserInputError } = require('apollo-server')

const Product = require('../../models/Product')

module.exports = {
    Query: {
        async getProducts(){
            try{
                const products = await Product.find().sort({ createdAt: -1 })
                return products
            }catch(errors){
                throw new UserInputError('Bad input', { errors })
            }
        },

        async getProduct(_, {productId}){
            try{
                const product = await Product.findById(productId)
                if (product) {
                    return product
                }else{
                    throw new Error('Product not found')
                }

            } catch(errors){
                throw new UserInputError('Bad input', { errors })
            }
        }
    },

    Mutation: {
        async createProduct(_, { body, price }, {user}){

            try {

                let errors = {}

                if (user) {

                    const regEx = /^[0-9]+$/

                    const bodyQuery = await Product.findOne({body: body})
                    
                    if (user.admin != true) {
                        errors.user = 'Action not allowed'
                    }
    
                    if(body.trim() === ''){
                        errors.body = 'Body must not be empty'
                    }

                    if(price === ''){
                        errors.price = 'Price must not be empty'
                    }

                    else if (!price.match(regEx)) {
                        errors.price = 'Ingrese un precio válido'
                    }
    
                    else if (bodyQuery) {
                        errors.product = 'Product duplicated'
                    }
    
                    const newProduct = new Product({
                        body,
                        price,
                        user: user.id,
                        username: user.username,
                        createdAt: new Date().toISOString()
                    })
    
                    if (Object.keys(errors).length > 0) {
                        throw errors
                    }
    
                    const product = await newProduct.save()
    
                    return product
                }

                else{
                    throw new AuthenticationError('Invalid/Expired token')
                }


            } catch (errors) {
                throw new UserInputError('Bad input', { errors })
            }

        },

        async deleteProduct(_, { productId }, {user}){

            try {

                const product = await Product.findById(productId)


                if ( user.admin === true ) {
                    await product.delete()
                    return 'Product deleted successfully'
                } else {
                    throw new AuthenticationError('Action not allowed')
                }

            } catch (errors) {
                throw new UserInputError('Bad input', { errors })
            }
        },

        async likeProduct(_, { productId }, {user}){

            const product = await Product.findById(productId)

            if (product) {
                
                if (product.likes.find(like => like.username === user.username)) {
                    
                    // Product already liked, unlike it
                    product.likes = product.likes.filter(like => like.username !== user.username)

                } else{
                    // Product not liked, like it
                    product.likes.push({
                        username: user.username,
                        createdAt: new Date().toISOString()
                    })
                }

                await product.save()

                return product

            } else{
                throw new UserInputError('Product not found')
            }
        }
    },
}