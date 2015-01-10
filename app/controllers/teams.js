var User = require('../models/user');
var Team = require('../models/team');

function getAll(next){
	Team.find(function (err, teams){
		if(err){
			return next({ status: 500, content: { code: 0, description: 'mongodb error', message: 'Server is busy, please try again later' } });
		}
		return next({ status: 200, content: teams });
	});
};

function getById(data, next){
	Team.findById(data.team.id, function (err, team){
		if(err){
			return next({ status: 500, content: { code: 0, description: 'mongodb error', message: 'Server is busy, please try again later' } });
		}
		return next({ status: 200, content: team });
	});
};

function getByName(data, next){
	Team.findOne({ 'name.lowerCase': data.name.toLowerCase() }, function (err, team){
		if(err){
			return next({ status: 500, content: { code: 0, description: 'mongodb error', message: 'Server is busy, please try again later' } });
		}
		return next({ status: 200, content: team });
	});
};

exports.getAll = getAll;
exports.getById = getById;
exports.getByName = getByName;