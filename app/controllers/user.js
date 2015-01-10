var User = require('../models/user');
var Team = require('../models/team');

function getInfo(data, next){
	User.findById(data.id, function (err, consumer){
		if(err){
			return next({ status: 500, content: { code: 0, description: 'mongodb error', message: 'Server is busy, please try again later' } });
		}
		if(!consumer){
			return next({ status: 500, content: { code: 10, description: 'user not found', message: 'You cant do this action right now, please try again later' } });
		} else {
			return next({ status: 200, content: { username: consumer.account.username.original, email: consumer.account.email.original, role: consumer.account.role, team: consumer.game.team, duty: consumer.game.duty } });
		}
	});
};

function makeRequestToJoinTeam(data, next){
	var found = false;
	User.findById(data.consumer.id, function (err, consumer){
		if(err){
			return next({ status: 500, content: { code: 0, description: 'mongodb error', message: 'Server is busy, please try again later' } });
		}
		if(!consumer){
			return next({ status: 500, content: { code: 10, description: 'user not found', message: 'You cant do this action right now, please try again later' } });
		} else {
			if(typeof consumer.game.team === 'string'){
				return next({ status: 400, content: { code: 18, description: 'user already have team', message: 'You already have a team' } });
			} else {
				Team.findOne({ 'name.lowerCase': data.team.name.toLowerCase() }, function (err, team){
					if(err){
						return next({ status: 500, content: { code: 0, description: 'mongodb error', message: 'Server is busy, please try again later' } });
					}
					if(!team){
						return next({ status: 500, content: { code: 14, description: 'team not found', message: 'Team not found' } });
					} else {
						for(var i=0; i<team.requests.length; i++){
							if(consumer.account.username.original === team.requests[i]){
								found = true;
								return next({ status: 400, content: { code: 19, description: 'user already send request to join this team', message: 'You already have send request to join this team' } });
							}
						}
						if(!found){
							team.requests.push(consumer.account.username.original);
			                team.save(function (err){
			                	if(err){
			                    	return next({ status: 500, content: { code: 0, description: 'mongodb error', message: 'Server is busy, please try again later' } });
			                  	} else {
			                    	return next({ status: 200, content: 'You successfully send request to join team' });
			                  	}
			                });	
						}       
					}
				});
			}	
		}
	});
};

exports.getInfo = getInfo;
exports.joinTeam = makeRequestToJoinTeam;