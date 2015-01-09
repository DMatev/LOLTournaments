var mongoose = require('mongoose');
//unfinished
var bracketSchema = mongoose.Schema({
    
    date: {
        start: Date,
        end: Date
    },
    phase: {
        start: Date,
        end: Date,
        name: String
    },
    before: [],
    current: [],
    next: []
});

module.exports = mongoose.model('Bracket', bracketSchema);