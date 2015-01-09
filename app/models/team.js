var mongoose = require('mongoose');
//unfinished

var teamSchema = mongoose.Schema({
    
    name: {
        original: String,
        lowerCase: String
    },
    status: { type: String, default: 'free' },
    captain: String,
    players: [ String ], // name of players
    requests: [ String ] // name of players

});

module.exports = mongoose.model('Team', teamSchema);