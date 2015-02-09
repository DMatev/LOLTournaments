'use strict';
var mongoose = require('mongoose');

var teamSchema = mongoose.Schema({
    
    name: {
        original: String,
        lowerCase: String
    },
    status: { type: String, default: 'free' },
    currentTournament: String,
    captain: String,
    players: [ String ], // name of players
    requests: [ String ] // name of players

});

module.exports = mongoose.model('Team', teamSchema);