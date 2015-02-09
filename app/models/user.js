'use strict';
var mongoose = require('mongoose');
var bcrypt   = require('bcrypt-nodejs');

var userSchema = mongoose.Schema({
    
    account: {
        username: {
            original: String,
            lowerCase: String
        },
        password: String,
        email: {
            original: String,
            lowerCase: String
        },
        recoveryCode: String,
        role: { type: String, default: 'user' }
    },
    game: {
        team: String,
        duty: { type: String, default: 'player' }
    }

});

userSchema.methods.generateHash = function (password){
    return bcrypt.hashSync(password);
};

userSchema.methods.validPassword = function (password){
    return bcrypt.compareSync(password, this.account.password);
};

userSchema.methods.genrateRecoveryCode = function (){
    var text = '';
    var possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_';

    for (var i=0; i < 5; i++){
        text += possible.charAt(Math.floor(Math.random() * possible.length));
    }

    return text;
};

module.exports = mongoose.model('User', userSchema);