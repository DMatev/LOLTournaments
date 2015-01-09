var mongoose = require('mongoose');

var hallOfFameSchema = mongoose.Schema({

	team: String, //team name
    tournament: String //tournament name

});

module.exports = mongoose.model('HallOfFame', hallOfFameSchema);