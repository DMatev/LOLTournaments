var mongoose = require('mongoose');

var serverSchema = mongoose.Schema({
    
	name: String,
    isSignUpOpen: Boolean,
    isLogInOpen: Boolean
    
});

module.exports = mongoose.model('Server', serverSchema);