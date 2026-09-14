const mongoose = require('mongoose');
const {Schema, model} = mongoose;

// a short social comment left on a location (not a full post)
const CommentSchema = new Schema({
    location: {type: Schema.Types.ObjectId, ref: 'Location', required: true},
    author: {type: Schema.Types.ObjectId, ref: 'User', required: true},
    text: {type: String, required: true},
    reactions: [{
        emoji: String,
        user: {type: Schema.Types.ObjectId, ref: 'User'},
    }],
}, {
    timestamps: true,
});

const CommentModel = model('Comment', CommentSchema);

module.exports = CommentModel;
