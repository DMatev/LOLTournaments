var mongoose = require('mongoose');
//unfinished

var tournamentSchema = mongoose.Schema({
    
	name: {
        original: String,
        lowerCase: String
    },
    type: { type: String, default: 'Direct eleminations' },
    numberOfCompetitors: Number,
    stage: { type: String, default: 'signing' },
    teams: [{
        name: String,
        captain: String,
        players: [ String ]
    }],
    resultsFromCaptains:[{ 
        name: String,
        won: Boolean
    }],
    resultsFromAdmin:[]
});

module.exports = mongoose.model('Tournament', tournamentSchema);