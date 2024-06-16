const mongoose = require('mongoose')
const {Schema} = mongoose

const PostSchema = new Schema({
    title: String,
    summary: String,
    image: String,
    category: String,
    description: String,
    creator: {type: Schema.Types.ObjectId, ref:'User'},
    likes: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User', 
    }],
    likeCount: { type: Number, default: 0 },
    comments: [{ 
        text: String,
        creator: { type: Schema.Types.ObjectId, ref: 'User' },
        createdAt: { type: Date, default: Date.now }
    }]
}, {
    timestamps: true,
})

const PostModel = mongoose.model('Post', PostSchema)

module.exports = PostModel