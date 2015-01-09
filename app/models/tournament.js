var mongoose = require('mongoose');
//unfinished
var tournamentSchema = mongoose.Schema({
    
	name: String,
    type: { type: String, default: 'Direct eleminations' },
    date: {
        start: Date,
        end: Date
    },
    phase: {
        start: Date,
        end: Date,
        name: String
    },
    bracket: []
});

module.exports = mongoose.model('Tournament', tournamentSchema);