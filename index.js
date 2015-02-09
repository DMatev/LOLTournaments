'use strict';
var express = require('express');
var bodyParser = require('body-parser');
var morgan = require('morgan');

var mongoose = require('mongoose');

var config = require('./app/config.js');
var port = process.env.PORT || 3000;
var app = express();


app.use(morgan('dev'));
app.use(bodyParser.json());
app.use('/', express.static(__dirname + '/public'));

require('./app/routes.js')(app);

mongoose.connect(config.DB.url, function (err){
  if(err){
    console.log(err);
  } else {
    app.listen(port, function (){
      console.log('Dido`s awsome site runes on http://localhost:' + port);
    });
  }
});