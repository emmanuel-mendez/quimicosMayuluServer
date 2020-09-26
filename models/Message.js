const { model, Schema } = require('mongoose');

const messageSchema = new Schema({
    body: String,
    from: String,
    to: String,
    createdAt: String,
    // reactions: [
    //     {
    //         body: String,
    //         username: String,
    //         createdAt: String
    //     }
    // ]
});

module.exports = model('Message', messageSchema, 'Messages')