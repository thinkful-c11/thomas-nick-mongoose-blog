const mongoose = require('mongoose');

const blogSchema = mongoose.Schema({
    title: {type: String, required: true},
    author: {
        firstName: {type: String, required: true}, 
        lastName: {type: String, required: true}
    },
    content: {type: String, required: true},   
    updated: {type: Date, default: Date.now}
});

blogSchema.virtual('authorName').get(function() {
    return `${this.author.firstName} ${this.author.lastName}`.trim();
});

blogSchema.methods.apiRepr = function() {
    return {
        title: this.title,
        content: this.content,
        author: this.authorName,
        created: this.updated
    };
};


const BlogPost = mongoose.model('BlogPost', blogSchema, 'blogPosts');

module.exports = {BlogPost};
