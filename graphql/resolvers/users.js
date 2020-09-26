const bcrypt = require('bcryptjs')
const { UserInputError, AuthenticationError } = require('apollo-server')
const  {generateToken}  = require('../../util/generateToken')

const User = require('../../models/User')

module.exports = {

    Query: {

        login: async (_, args) => {
            const { username, password } = args
            let errors = {}

        try{
            const user = await User.findOne({ username })

            if (username === '' && password === ''){ 
                errors.username = 'Usuario requerido'
                errors.password = 'Contraseña requerida'
                throw new UserInputError('Input error', { errors }
                    )
            }

            else if (username === '' && password ){
                errors.username = 'Usuario requerido'
                throw new UserInputError('Input error', { errors }
                    )
            }

            else if (username && password === ''){
                errors.password = 'Contraseña requerida'
                throw new UserInputError('Input error', { errors }
                    )
            }
            
            else {

                if (!user) {
                    errors.login = 'El usuario o contraseña son incorrectos'
                    throw new UserInputError('Input error', { errors })
                }

                const match = await bcrypt.compare(password, user.password)

                if (!match) {
                    errors.password = 'El usuario o contraseña son incorrectos'
                    throw new UserInputError(errors.password, { errors })
                }
            }

            const token = generateToken(user)

            if (Object.keys(errors).length > 0) {
                throw errors
            }

            return {
                ...user._doc,
                id: user._id,
                token
            }

            } catch (err) {
                throw err
            }
        },

        getUsers: async (_, __, {user}) => {

            let errors = {}

            try{

                if (user.admin === true) {
                    const users = await User.find({username: {$exists: true, $nin: user.username}}).sort({ createdAt: -1 })
                    return users

                } else{
                    errors.user = 'Access denied'
                    throw new UserInputError('Input error', { errors })
                }

            }catch(error){
                throw new UserInputError('Bad input', { errors })
            }
        },

        getUser: async (_, {userId}, {user}) => {

            let errors = {}

            try{

                if (user.id === userId || user.admin === true) {
                    const userQuery = await User.findById(userId)
                    if (userQuery) {
                        return userQuery
                    }else{
                        errors.user = 'User not found'
                        throw new UserInputError('Input error', { errors })
                    }

                }else{
                    errors.user = 'Access denied'
                    throw new UserInputError('Input error', { errors })
                }

            } catch(errors){
                throw new UserInputError('Bad input', { errors })
            }
        }
    },

    Mutation: {

        register: async (_, args) => {

            let {
                admin, 
                username, 
                email, 
                password, 
                confirmPassword
            } = args

            let errors = {}

            try{

            // VALIDATE INPUT DATA

                if(admin !== 'true' && admin !== 'false'){
                    errors.admin = 'Seleccione su tipo de usuario'
                }

                if(username.trim() === ''){
                    errors.username = 'Usuario requerido'
                }
            
                if(email.trim() === ''){
                    errors.email = 'Email requerido'
                } else {
                    const regEx = /^([0-9a-zA-Z]([-.\w]*[0-9a-zA-Z])*@([0-9a-zA-Z][-\w]*[0-9a-zA-Z]\.)+[a-zA-Z]{2,9})$/
            
                    if (!email.match(regEx)) {
                        errors.email = 'Ingrese una dirección de email válida'
                    }
                }
            
                if(password.trim() === ''){
                    errors.password = 'Contraseña requerida'
                }
                if (confirmPassword.trim() === ''){
                    errors.confirmPassword = 'Confirme contraseña'
                }
                if (password !== confirmPassword){
                    errors.confirmPassword = 'Contraseñas no coinciden'
                }

                //MAKE SURE USER DOESN'T ALREADY EXIST
                const userUsername = await User.findOne({username})
                if (userUsername) {
                    errors.username = 'Este usuario ya está registrado'
                }

                const userEmail = await User.findOne({email})
                if (userEmail) {
                    errors.email = 'Este email ya está registrado'
                }

                if (Object.keys(errors).length > 0) {
                    throw errors
                }

                //HASH PASSWORD AND CREATE AN AUTH TOKEN
                password = await bcrypt.hash(password, 12)


                //CREATE USER
                const newUser = new User({
                    admin,
                    email,
                    username,
                    password,
                    createdAt: new Date().toISOString()
                })
                const res = await newUser.save()

                return {
                    ...res._doc,
                    id: res._id,
                }

            } catch(errors){
                throw new UserInputError('Bad input', { errors })
            }
        },

        deleteUser: async (_, { userId }, {user})=> {

            let errors = {}

            try {

                const userQuery = await User.findById(userId)

                if(!userQuery){
                    errors.user = 'User not found'
                    throw new UserInputError('Input error', { errors })
                } 
                
                else if ( user.admin === true || userQuery.id === user.id) {
                    await userQuery.delete()
                    return 'User deleted successfully'
                }

                else{
                    errors.user = 'Action not allowed'
                    throw new UserInputError('Input error', { errors })
                }
                
    
            } catch (errors) {
                throw new UserInputError('Bad input', { errors })
            }
        }
    }
}
