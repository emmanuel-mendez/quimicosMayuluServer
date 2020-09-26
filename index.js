const { ApolloServer } = require('apollo-server')
const mongoose = require('mongoose')

const typeDefs = require('./graphql/typeDefs')
const resolvers = require('./graphql/resolvers')
const { MONGODB } =require('./config/database')
const checkAuth = require('./util/checkAuth')


const server = new ApolloServer({
    typeDefs,
    resolvers,
    context: checkAuth
})

mongoose.connect(MONGODB, { 
    useNewUrlParser: true, 
    useUnifiedTopology: true 
})
    .then(() =>{
        app.listen(process.env.PORT || 5000, function(){
            console.log("Express server listening on port %d in %s mode", this.address().port, app.settings.env);
        });
    })
    .then(res => {
        console.log(`Server is running at ${res.url}`)
    })
    .catch(err => {
        console.log(err)
    })
