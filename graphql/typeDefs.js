const { gql } = require('apollo-server')

module.exports = gql`

    type User{
        id: ID!
        admin: String!
        email: String!
        token: String
        username: String!
        createdAt: String!
        latestMessage: Message
    }

    type Message{
        id: ID!
        body: String!
        from: String!
        to: String!
        # reactions: [Reaction]!
        # reactionCount: Int!
        createdAt: String!
    }

    # type Reaction{
    #     id: ID!
    #     createdAt: String!
    #     username: String!
    #     body: String!
    # }

    type Product {
        id: ID!
        body: String!
        createdAt: String!
        username: String!
        comments: [Comment]!
        likes: [Like]!
        likeCount: Int!
        commentCount: Int!
    }

    type Comment{
        id: ID!
        createdAt: String!
        username: String!
        body: String!
    }

    type Like{
        id: ID!
        createdAt: String!
        username: String!
    }

    type Query {

        login (
            username: String!,
            password: String!
        ): User!

        getUser (
            userId: ID!
        ): User!

        getUsers: [User]!

        getMessages(
            chatWith: String!
        ): [Message]!

        getAllUsersMessages: [User]!

        getProduct (
            productId: ID!
        ): Product!

        getProducts: [Product]!
    }

    type Mutation {
        register (
            admin: String!
            username: String!, 
            email: String!, 
            password: String!, 
            confirmPassword: String!
        ): User!

        deleteUser (
            userId: ID!
        ): String

        sendMessage (
            to: String!,
            body: String!
        ): Message!

        # reactToMessage (
        #     messageId: ID!,
        #     body: String!
        # ): Message!

        createProduct (
            body: String!
        ): Product!

        deleteProduct (
            productId: ID!
        ): String!

        createComment (
            productId: String!,
            body: String!
        ): Product!

        deleteComment (
            productId: ID!,
            commentId: ID!
        ): Product!

        likeProduct (
            productId: ID!
        ): Product!
    }

    type Subscription{
        newMessage: Message!
        # newReaction: Message!
    }
`