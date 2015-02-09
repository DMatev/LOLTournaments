'use strict';
var mongoose = require('mongoose');
var commentSchema = require('./comment').schema;

var newsSchema = mongoose.Schema({
    
    author: { type: String, default: 'Tournaments' },
    createDate: Date,
    title: String,
    content: String,
    isVisible: { type: Boolean, default: true },
    comments: [commentSchema]
    
});

module.exports = mongoose.model('News', newsSchema);