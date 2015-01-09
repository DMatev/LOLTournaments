var mongoose = require('mongoose');

var commentSchema = mongoose.Schema({

    author: String,
    postDate: Date,
    content: String
    
});

module.exports.model = mongoose.model('Comment', commentSchema);
module.exports.schema = commentSchema;