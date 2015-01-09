var mongoose = require('mongoose');

var config = require('./app/config.js');

var Server = require('./app/models/server');

mongoose.connect(config.DB.url, function (err){
  if(err){
    console.log(err);
  } else {
    Server.findOne({ 'name': config.server.name }, function (err, server){
    	if(err){
    		console.log(err);
    		mongoose.connection.close();
    	}
    	if(!server){
    		var server = new Server();
    		server.name = config.server.name;
    		server.isSignUpOpen = true;
    		server.isLogInOpen = true;
    		server.save(function (){
    			if(err){
    				console.log(err);
    				mongoose.connection.close();
    			} else {
    				console.log('Successfully initializate app');
    				mongoose.connection.close();
    			}
    		})
    	} else {
    		console.log('App is already initializate');
    		mongoose.connection.close();
    	}
    });
  }
});